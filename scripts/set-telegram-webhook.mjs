const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const baseUrl = process.env.APP_BASE_URL;
if (!token || !secret || !baseUrl) {
  console.error("Set TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET and APP_BASE_URL first.");
  process.exit(1);
}
const webhookUrl = `${baseUrl.replace(/\/$/, "")}/api/telegram`;
const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    url: webhookUrl,
    secret_token: secret,
    allowed_updates: ["message", "edited_message"],
    drop_pending_updates: false
  })
});
const data = await response.json();
console.log(JSON.stringify(data, null, 2));
if (!response.ok || !data.ok) process.exit(1);
