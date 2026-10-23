# Troubleshooting

## Bot does not reply
1. Confirm `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` are set in Vercel Production.
2. Redeploy after changing environment variables.
3. Run `node scripts/set-telegram-webhook.mjs` with the exact deployed URL in `APP_BASE_URL`.
4. Check Vercel function logs. A 401 usually means the webhook secret does not match; 503 means environment variables are missing.
5. Send `/start` directly to the bot, not to a group where privacy settings may affect commands.

## `/api/health` returns 404
Confirm the project was imported as a Vercel project and `api/health.js` is at the repository root under `api/`.

## Web page is blank
Confirm `public/index.html` was uploaded and deployment completed successfully. Review Vercel build/deployment logs.

## Webhook setup script fails
Check Node.js 20+, internet access, token/secret environment variables, and that the base URL starts with `https://`.
