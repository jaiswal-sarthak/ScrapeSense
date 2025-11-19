# Telegram Notifications Setup Guide

Get instant alerts when changes are detected on your monitored websites!

## Step 1: Create Your Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Start a conversation and send `/newbot`
3. Follow the prompts:
   - Give your bot a name (e.g., "My AI Monitor")
   - Give your bot a username (must end in 'bot', e.g., "myaimonitor_bot")
4. **Copy the Bot Token** you receive (looks like `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

## Step 2: Get Your Chat ID

### Method 1: Using @userinfobot (Easiest)
1. Search for **@userinfobot** in Telegram
2. Start a conversation with the bot
3. It will automatically send you your Chat ID
4. Copy the number (e.g., `123456789`)

### Method 2: Manual Method
1. Start a conversation with **your bot** (the one you just created)
2. Send any message to your bot
3. Open this URL in your browser (replace `YOUR_BOT_TOKEN`):
   ```
   https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates
   ```
4. Look for `"chat":{"id":123456789}` in the response
5. Copy that ID number

## Step 3: Configure Your Application

### Add Environment Variable

Add this to your `.env.local` file:

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
```

Replace with your actual bot token from Step 1.

### Restart Your Application

```bash
npm run dev
```

## Step 4: Configure in Dashboard

1. Go to **Dashboard → Settings**
2. Enter your **Chat ID** (from Step 2)
3. Click **Test** to verify it works
4. You should receive a test message in Telegram!
5. Click **Save All Settings**

## What You'll Receive

When changes are detected, you'll get messages like:

```
🔔 Change Detected!

Site: Product Hunt
Changes: 5 new items
Instruction: Fetch innovative projects with >50 upvotes

🔗 View Site

⏰ 11/19/2025, 3:45:12 PM
```

## Troubleshooting

### "Failed to send message"
- Make sure you've started a conversation with your bot
- Verify your Chat ID is correct
- Check that your bot token is valid

### "Bot token not configured"
- Add `TELEGRAM_BOT_TOKEN` to your `.env.local` file
- Restart your development server

### "Chat not found"
- Start a conversation with your bot first
- Send at least one message to the bot
- Use @userinfobot to double-check your Chat ID

## For Group Chats

Want notifications in a Telegram group?

1. Add your bot to the group
2. Make the bot an admin (for full permissions)
3. Get the group Chat ID (will be negative, like `-1001234567890`)
4. Use that negative number in your settings

## Security Note

Your Telegram bot token is sensitive! Never commit it to version control or share it publicly.

## Need Help?

- Telegram Bot API Docs: https://core.telegram.org/bots/api
- Test your bot token: `https://api.telegram.org/bot<YOUR_TOKEN>/getMe`

