# Booking System Setup Guide

Complete guide for: **Website Form → n8n Webhook → Google Calendar → Email Confirmation → 1-Hour Reminder**

---

## 1. Frontend (Already Implemented)

The booking form is in `src/components/ScheduleModal.tsx` and the API route is in `src/app/api/schedule/route.ts`.

### What's included:
- Full booking form (Name, Email, Company, Budget, Date, Time, Description)
- Client-side validation
- Rate limiting (5 requests/hour per IP)
- Styled confirmation emails (to you and the user)
- Double-submit prevention
- Error handling

### Environment Variables

Add to your `.env.local`:

```env
# Email (already configured)
RESEND_API_KEY=your_resend_api_key

# n8n Webhook (add when ready)
N8N_WEBHOOK_URL=https://your-n8n-domain.com/webhook/book-meeting
```

---

## 2. n8n Workflow Setup

### Prerequisites
- n8n instance (self-hosted or n8n.cloud)
- Google Workspace account (for Calendar + Meet)

### Step 1: Import Workflow
1. Open n8n
2. Go to **Workflows** → **Import from File**
3. Select `docs/n8n-booking-workflow.json`

### Step 2: Configure Google Calendar OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing)
3. Enable **Google Calendar API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set Application Type: **Web application**
6. Add Authorized Redirect URI: `https://your-n8n-domain.com/rest/oauth2-credential/callback`
7. Copy **Client ID** and **Client Secret**

### Step 3: Add Credentials in n8n
1. In n8n, go to **Credentials**
2. Create new **Google Calendar OAuth2 API** credential
3. Paste Client ID and Client Secret
4. Click **Connect my account** and authorize

### Step 4: Configure Email Sending
- Option A: Use n8n's built-in **Send Email** node with SMTP
- Option B: Use **HTTP Request** node to call Resend API directly
- Option C: Let the Next.js API handle emails (current setup)

### Step 5: Activate Webhook
1. Open the workflow in n8n
2. Click **Active** toggle (top right)
3. Copy the webhook URL
4. Add it to `.env.local` as `N8N_WEBHOOK_URL`

---

## 3. Flow Architecture

```
User fills form on website
        ↓
POST /api/schedule (Next.js API)
        ↓
    ┌───────────────────┐
    │ Send emails via   │──→ Notification email to you
    │ Resend API        │──→ Confirmation email to user
    └───────────────────┘
        ↓ (if N8N_WEBHOOK_URL is set)
POST to n8n webhook
        ↓
Parse & convert datetime
        ↓
Create Google Calendar event
(with Google Meet link)
        ↓
    ┌────────────┐
    │ Wait node  │──→ 1 hour before meeting
    └────────────┘
        ↓
Send reminder emails
(to user + you)
```

---

## 4. Security & Spam Protection

### Already Implemented:
- **Rate limiting**: 5 requests per IP per hour
- **Server-side validation**: Required fields checked
- **Email validation**: Regex check on server

### Recommended Additions:
- **Honeypot field**: Add a hidden field to catch bots
- **reCAPTCHA v3**: Add Google reCAPTCHA for spam protection
- **CORS**: Restrict API to your domain only
- **Webhook secret**: Add a shared secret header between Next.js and n8n

---

## 5. Timezone Safety

- All times displayed as **Central Time (CT)**
- `America/Chicago` timezone used in Google Calendar
- Date picker enforces future dates only (tomorrow minimum)
- n8n Code node converts `date + time` → ISO datetime

---

## 6. Testing

1. Start your dev server: `npm run dev`
2. Click "Book Strategy Call" in the Hero section
3. Fill out the form and submit
4. Check:
   - Your email for the notification
   - The user's email for confirmation
   - Google Calendar for the event (if n8n is configured)

### Example Webhook Payload:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Corp",
  "budget": "$5k-$15k",
  "date": "2026-02-20",
  "time": "2:00 PM",
  "description": "Looking to build an AI-powered dashboard",
  "timezone": "America/Chicago",
  "submittedAt": "2026-02-12T21:38:00.000Z"
}
```

### Example Webhook Response:
```json
{
  "success": true,
  "message": "Booking confirmed",
  "meetLink": "https://meet.google.com/abc-defg-hij"
}
```
