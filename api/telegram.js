const TOOL_NAMES = [
  "url-inspector — разбор URL без открытия сайта",
  "password-strength — локальная оценка пароля в веб-панели",
  "passphrase-generator — генератор парольной фразы в браузере",
  "hash-demo — SHA-256 через Web Crypto",
  "jwt-inspector — просмотр payload без проверки подписи",
  "phishing-signs — чек-лист признаков фишинга",
  "incident-checklist — первые действия при инциденте",
  "telegram-hardening — защита аккаунта Telegram",
  "security-headers-guide — справка по HTTP security headers",
  "risk-matrix — простая матрица риска",
  "json-formatter — форматирование JSON",
  "regex-playground — проверка регулярных выражений",
  "uuid-generator — UUID в браузере",
  "awareness-quiz — учебный квиз по фишингу"
];

function escapeHtml(s = "") {
  return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[c]));
}
async function sendMessage(token, chatId, text, extra = {}) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, ...extra })
  });
  if (!response.ok) throw new Error(`Telegram API returned ${response.status}`);
}
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method not allowed");
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !secret) return res.status(503).send("Bot is not configured");
  const supplied = req.headers["x-telegram-bot-api-secret-token"];
  if (supplied !== secret) return res.status(401).send("Unauthorized");
  const update = req.body || {};
  const msg = update.message || update.edited_message;
  if (!msg?.chat?.id || typeof msg.text !== "string") return res.status(200).json({ ok: true, ignored: true });
  const text = msg.text.trim();
  const chatId = msg.chat.id;
  const first = text.split(/\s+/)[0].toLowerCase();
  let reply;
  if (first === "/start" || first === "/help") {
    reply = "🛡 CyberLab — Defensive Toolkit\\n\\nКоманды:\\n/start — приветствие\\n/help — помощь\\n/tools — список учебных инструментов\\n/status — состояние сервиса\\n/url <ссылка> — безопасный разбор структуры URL (без открытия сайта)\\n\\nНе отправляйте боту пароли, коды подтверждения, токены или приватные данные. Бот не собирает учётные данные.";
  } else if (first === "/tools") {
    reply = "🧰 Инструменты CyberLab:\\n\\n" + TOOL_NAMES.map((t, i) => `${i + 1}. ${t}`).join("\\n") + "\\n\\nПолный каталог доступен в веб-панели.";
  } else if (first === "/status") {
    reply = "✅ Telegram webhook отвечает. Для проверки веб-части откройте /api/health. Это подтверждает работу API-обработчика, но не проверяет сторонние сервисы.";
  } else if (first === "/url") {
    const raw = text.replace(/^\/url(?:@\w+)?\s*/i, "").trim();
    if (!raw) {
      reply = "Использование: /url https://example.com/path\\n\\nПроверяется только структура URL; сайт не открывается.";
    } else {
      try {
        const u = new URL(raw);
        if (!["http:", "https:"].includes(u.protocol)) throw new Error("protocol");
        const warnings = [];
        if (u.protocol !== "https:") warnings.push("Используется HTTP.");
        if (u.username || u.password) warnings.push("Есть user-info перед @ — это может вводить в заблуждение.");
        if (u.hostname.toLowerCase().split(".").some(x => x.startsWith("xn--"))) warnings.push("Есть Punycode-метка — проверьте похожие символы.");
        if (u.hostname.split(".").length > 5) warnings.push("Много поддоменов.");
        if (u.port && !["80","443"].includes(u.port)) warnings.push("Нестандартный порт.");
        reply = `🔎 Разбор URL\\nДомен: ${u.hostname}\\nПротокол: ${u.protocol}\\nПуть: ${u.pathname || "/"}\\nПараметров: ${[...u.searchParams.keys()].length}\\n\\n` +
          (warnings.length ? "⚠️ Признаки для проверки:\\n• " + warnings.join("\\n• ") : "Автоматические эвристики не нашли очевидных признаков из короткого списка.") +
          "\\n\\nВажно: это не проверка репутации и не гарантия безопасности. Сайт не открывался.";
      } catch {
        reply = "Не удалось разобрать URL. Укажите полный адрес с http:// или https://.";
      }
    }
  } else {
    reply = "Неизвестная команда. Используйте /help. Не отправляйте пароли, коды, токены или данные сессии.";
  }
  try {
    await sendMessage(token, chatId, reply);
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: "Could not send Telegram reply" });
  }
}
