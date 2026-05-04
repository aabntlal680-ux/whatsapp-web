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
  realtimeConnected: boolean;
  statusLoaded: boolean;
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

const POLL_INTERVAL_MS = 30_000;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [selectedContact, setSelectedContactState] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [windowSecondsLeft, setWindowSecondsLeft] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const selectedContactRef = useRef<Contact | null>(null);

  const windowOpen = windowSecondsLeft > 0;

  // ─── Fetchers ────────────────────────────────────────────────────────────────

  const fetchContacts = useCallback(async () => {
    setIsLoadingContacts(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("last_message_at", { ascending: false, nullsFirst: false });
    if (data) setContacts(data as Contact[]);
    if (error) console.warn("[Supabase] contacts fetch error:", error.message);
    setIsLoadingContacts(false);
  }, []);

  const fetchAccountStatus = useCallback(async () => {
    // Try ordering by id desc (most tables have id), fall back to first row
    const { data, error } = await supabase
      .from("account_status")
      .select("*")
      .limit(1)
      .maybeSingle();
    if (data) setAccountStatus(data as AccountStatus);
    if (error) console.warn("[Supabase] account_status fetch error:", error.message);
    setStatusLoaded(true);
  }, []);

  const fetchTemplates = useCallback(async () => {
    const { data } = await supabase.from("templates").select("*");
    if (data && data.length > 0) setTemplates(data as Template[]);
    // Silently fall back to built-in default templates if table doesn't exist
  }, []);

  const fetchMessages = useCallback(async (contactId: string) => {
    setIsLoadingMessages(true);
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("contact_id", contactId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (data) setMessages(data as Message[]);
    if (error) console.warn("[Supabase] messages fetch error:", error.message);
    setIsLoadingMessages(false);
  }, []);

  // ─── 24-hour window countdown ─────────────────────────────────────────────

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

  // ─── sendMessage ─────────────────────────────────────────────────────────

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
      const { data, error } = await supabase
        .from("messages")
        .insert(newMsg)
        .select()
        .single();
      if (data) setMessages((prev) => [data as Message, ...prev]);
      if (error) console.warn("[Supabase] sendMessage error:", error.message);
      setIsSending(false);
    },
    []
  );

  // ─── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    fetchContacts();
    fetchAccountStatus();
    fetchTemplates();
  }, [fetchContacts, fetchAccountStatus, fetchTemplates]);

  // ─── Polling fallback (works even without Realtime enabled in Supabase) ───

  useEffect(() => {
    pollRef.current = setInterval(() => {
      fetchAccountStatus();
      fetchContacts();
    }, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchAccountStatus, fetchContacts]);

  // ─── Realtime subscriptions ───────────────────────────────────────────────

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
      .subscribe((status) => {
        console.log("[Realtime] messages channel:", status);
      });

    // account_status — primary channel for quality indicator
    const statusChannel = supabase
      .channel("account-status-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "account_status" },
        (payload) => {
          console.log("[Realtime] account_status INSERT:", payload.new);
          if (payload.new) setAccountStatus(payload.new as AccountStatus);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "account_status" },
        (payload) => {
          console.log("[Realtime] account_status UPDATE:", payload.new);
          if (payload.new) setAccountStatus(payload.new as AccountStatus);
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] account_status channel:", status);
        setRealtimeConnected(status === "SUBSCRIBED");
        // If realtime connects successfully, fetch fresh data immediately
        if (status === "SUBSCRIBED") {
          fetchAccountStatus();
        }
      });

    const contactsChannel = supabase
      .channel("contacts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        () => {
          fetchContacts();
        }
      )
      .subscribe((status) => {
        console.log("[Realtime] contacts channel:", status);
      });

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, [fetchContacts, fetchAccountStatus]);

  return (
    <AppContext.Provider
      value={{
        contacts,
        accountStatus,
        realtimeConnected,
        statusLoaded,
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
