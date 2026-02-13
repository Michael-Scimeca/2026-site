# Booking System n8n Workflow

This workflow handles incoming bookings from the website, schedules them in Google Calendar, and manages email confirmations and reminders.

## Workflow Overview
1.  **Webhook Trigger**: Receives booking data (Name, Email, Date, Time, Description) from the Next.js API.
2.  **Date/Time Formatting**: Converts the incoming date string into a proper format for Google Calendar.
3.  **Google Calendar**: Creates a calendar event and generates a Google Meet link.
4.  **Confirmation Email**: Sends an immediate email to the user with the Google Meet link.
5.  **Wait Node**: Pauses the workflow until 1 hour before the meeting.
6.  **Reminder Email**: Sends a final reminder with the link.

## Step-by-Step Implementation

### 1. Webhook Node (Trigger)
-   **Method**: `POST`
-   **Path**: `/webhook/book-meeting`
-   **Authentication**: None (or Header Auth if you want extra security)
-   **Test Output**:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "date": "2024-03-20",
      "time": "14:00",
      "description": "Project discussion",
      "timezone": "America/Chicago"
    }
    ```

### 2. Date & Time Node
-   **Action**: Convert incoming date/time to ISO format for Google Calendar (Start Time & End Time).
-   **Formula**:
    -   Start: `{{ $json.date }}T{{ $json.time }}:00`
    -   End: `{{ $json.date }}T{{ $json.time + 30 minutes }}:00` (assuming 30 min slots)

### 3. Google Calendar Node
-   **Resource**: Event
-   **Operation**: Create
-   **Calendar**: Primary (or specific ID)
-   **Summary**: `Discovery Call: {{ $json.name }} <> Michael Scimeca`
-   **Description**: `Project: {{ $json.description }}`
-   **Start Time**: `{{ $node["Date & Time"].json["startTime"] }}`
-   **End Time**: `{{ $node["Date & Time"].json["endTime"] }}`
-   **Attendees**: `{{ $json.email }}`
-   **Conference Data**: `Create new Hangouts Meet` (This generates the link)

### 4. Gmail / Email Node (Confirmation)
-   **To**: `{{ $json.email }}`
-   **Subject**: `Confirmed: Discovery Call with Michael Scimeca`
-   **Body**: "Thanks for booking! Here is your Google Meet link: {{ $node["Google Calendar"].json["htmlLink"] }}"

### 5. Wait Node
-   **Resume**: At a specific time
-   **Date**: `{{ $node["Date & Time"].json["startTime"] }}`
-   **Offset**: -1 Hours (Wait until 1 hour before start)

### 6. Gmail / Email Node (Reminder)
-   **To**: `{{ $json.email }}`
-   **Subject**: `Reminder: Discovery Call in 1 Hour`
-   **Body**: "Just a heads up, our call is in 1 hour. Link: {{ $node["Google Calendar"].json["htmlLink"] }}"

## Next Steps
1.  Create this workflow in your n8n instance.
2.  Copy the **Production URL** from the Webhook node.
3.  Add that URL to your `.env.local` file as `N8N_WEBHOOK_URL`.
