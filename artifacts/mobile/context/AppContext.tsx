import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AccountStatus, Contact, Message, Template } from "@/types";

interface AppContextValue {
  contacts: Contact[];
  accountStatus: AccountStatus | null;
  selectedContact: Contact | null;
  messages: Message[];
  templates: Template[];
  isLoadingContacts: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  windowOpen: boolean;
  windowSecondsLeft: number;
  setSelectedContact: (c: Contact | null) => void;
  sendMessage: (content: string, type?: "text" | "template", templateName?: string) => Promise<void>;
  refreshContacts: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [selectedContact, setSelectedContactState] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [windowSecondsLeft, setWindowSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedContactRef = useRef<Contact | null>(null);

  const windowOpen = windowSecondsLeft > 0;

  const fetchContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (data) setContacts(data as Contact[]);
    setIsLoadingContacts(false);
  }, []);

  const fetchAccountStatus = useCallback(async () => {
    const { data } = await supabase
      .from("account_status")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();
    if (data) setAccountStatus(data as AccountStatus);
  }, []);

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase.from("templates").select("*");
    if (data) setTemplates(data as Template[]);
  }, []);

  const fetchMessages = useCallback(async (contactId: string) => {
    setIsLoadingMessages(true);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setMessages(data as Message[]);
    setIsLoadingMessages(false);
  }, []);

  const computeWindow = useCallback((msgs: Message[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const lastIncoming = msgs.find((m) => m.direction === "incoming");
    if (!lastIncoming) {
      setWindowSecondsLeft(0);
      return;
    }
    const lastTime = new Date(lastIncoming.created_at).getTime();
    const windowMs = 24 * 60 * 60 * 1000;
    const update = () => {
      const remaining = Math.max(0, Math.floor((lastTime + windowMs - Date.now()) / 1000));
      setWindowSecondsLeft(remaining);
    };
    update();
    timerRef.current = setInterval(update, 1000);
  }, []);

  const setSelectedContact = useCallback(
    async (c: Contact | null) => {
      setSelectedContactState(c);
      selectedContactRef.current = c;
      setMessages([]);
      if (timerRef.current) clearInterval(timerRef.current);
      if (!c) return;
      await fetchMessages(c.id);
    },
    [fetchMessages]
  );

  useEffect(() => {
    if (messages.length > 0 || isLoadingMessages) {
      computeWindow(messages);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [messages, isLoadingMessages, computeWindow]);

  const sendMessage = useCallback(
    async (content: string, type: "text" | "template" = "text", templateName?: string) => {
      if (!selectedContactRef.current) return;
      setIsSending(true);
      const newMsg: Partial<Message> = {
        contact_id: selectedContactRef.current.id,
        content,
        direction: "outgoing",
        type,
        template_name: templateName ?? null,
        status: "sent",
      };
      const { data } = await supabase.from("messages").insert(newMsg).select().single();
      if (data) {
        setMessages((prev) => [data as Message, ...prev]);
      }
      setIsSending(false);
    },
    []
  );

  useEffect(() => {
    fetchContacts();
    fetchAccountStatus();
    fetchTemplates();
  }, [fetchContacts, fetchAccountStatus, fetchTemplates]);

  useEffect(() => {
    const msgChannel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          const current = selectedContactRef.current;
          if (!current) return;
          if (payload.eventType === "INSERT") {
            const msg = payload.new as Message;
            if (msg.contact_id === current.id) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === msg.id)) return prev;
                return [msg, ...prev];
              });
            }
          }
        }
      )
      .subscribe();

    const statusChannel = supabase
      .channel("account-status-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "account_status" },
        (payload) => {
          if (payload.new) setAccountStatus(payload.new as AccountStatus);
        }
      )
      .subscribe();

    const contactsChannel = supabase
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        () => {
          fetchContacts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, [fetchContacts]);

  return (
    <AppContext.Provider
      value={{
        contacts,
        accountStatus,
        selectedContact,
        messages,
        templates,
        isLoadingContacts,
        isLoadingMessages,
        isSending,
        windowOpen,
        windowSecondsLeft,
        setSelectedContact,
        sendMessage,
        refreshContacts: fetchContacts,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
