const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// --- إعدادات واتساب (تم تحديثها من صفحة المطورين الخاصة بك) ---
const ACCESS_TOKEN = "EAAVTNwaZB4N0BRT2srjqLzhUfEjZAEzTzr5Bbu4ntQ0o42zI7hNYDKRyWfeGyQYWd934ukcJsGQtUjxsjfYWlZBiGh024dX7us65xj9ALgOZAyt9oVBQAqEIOx51ZA3hwdDYlIU621c8jHUqkfVO5HaypC4msMQHkW1uN0LO0MgZB80yEFEAoyF3fy0ZBDLLe1lltx166fwrvMIrcaWlOI8ZC1zov6ZCcwpaV76A1f1RZBpo8HbRnikq4AZANXFnVwTPFGKsNZB8hdkTRk6bLLZCAHxdEkQZDZD";
const PHONE_NUMBER_ID = "1091967034004383";
const WABA_ID = "1491482905958799"; // معرف حساب واتساب للأعمال
const VERIFY_TOKEN = "OMAR_WHATSAPP_TOKEN_2026"; // الكود السري للـ Webhook

// --- إعدادات Supabase (المستخرجة من مشروعك) ---
const SUPABASE_URL = "https://rixxshbiyahqogaythej.supabase.co"; 
const SUPABASE_KEY = "sb_publishable_QjBqHvACeiH5QMLjapsOWA_Gbkvlv_s";
const TABLE_API_URL = `${SUPABASE_URL}/rest/v1/whatsapp_messages`;

// 1. مسار التحقق (Webhook Verification)
app.get("/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook Verified!");
        return res.status(200).send(challenge);
    }
    res.sendStatus(403);
});

// 2. استقبال الرسائل وحفظها في Supabase
app.post("/webhook", async (req, res) => {
    const body = req.body;
    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (message) {
        const senderPhone = message.from;
        const messageText = message.text?.body || "[رسالة غير نصية]";

        console.log(`📩 رسالة من ${senderPhone}: ${messageText}`);

        // حفظ الرسالة في Supabase
        try {
            await fetch(TABLE_API_URL, {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify({
                    sender_phone: senderPhone,
                    message_body: messageText,
                    waba_id: WABA_ID // حفظ المعرف للتوثيق
                })
            });
            console.log("✅ تم الحفظ بنجاح في Supabase");
        } catch (err) {
            console.error("❌ خطأ في حفظ البيانات:", err.message);
        }

        // رد تلقائي بسيط (اختياري)
        await sendReply(senderPhone, "شكراً لتواصلك مع مؤسسة الوليد، سيتم الرد عليك قريباً.");
    }
    res.sendStatus(200);
});

async function sendReply(toPhone, text) {
    const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
    await fetch(url, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            messaging_product: "whatsapp",
            to: toPhone,
            type: "text",
            text: { body: text }
        })
    });
}

app.listen(3000, () => console.log("🚀 السيرفر يعمل الآن..."));
