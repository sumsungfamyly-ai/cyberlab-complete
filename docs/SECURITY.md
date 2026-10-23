# Security notes

- Never commit `.env`, bot tokens or webhook secrets.
- Rotate Telegram bot token via BotFather if exposed.
- Use a long random webhook secret; Telegram accepts letters, digits, `_`, `-`.
- The frontend password meter and passphrase generator run locally in the browser.
- URL analysis parses input but intentionally does not fetch the target.
- Do not use this project to impersonate services, collect credentials, or test systems without authorization.
- This project is educational and does not replace a professional security review.
