# Google Sheets Form Setup Guide

The contact form on the New Gen FC site sends submissions directly to a Google Sheet — free forever, no third-party services.

## Setup (5 minutes, one time)

### Step 1: Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it **"New Gen FC — Inquiries"**
3. In **Row 1**, add these headers (exact spelling matters):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | Name | Email | Phone | Program | Message |

### Step 2: Add the Apps Script

1. In your spreadsheet, go to **Extensions > Apps Script**
2. Delete any code in the editor
3. Paste this entire script:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Append row to spreadsheet
  sheet.appendRow([
    data.submitted || new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
    data.name || '',
    data.email || '',
    data.phone || '',
    data.program || '',
    data.message || ''
  ]);

  // Optional: Send email notification to yourself
  try {
    MailApp.sendEmail({
      to: 'sfnewgensocceracademy@gmail.com',
      subject: 'New Inquiry: ' + (data.name || 'Unknown') + ' — ' + (data.program || 'General'),
      htmlBody:
        '<h2>New Website Inquiry</h2>' +
        '<p><strong>Name:</strong> ' + (data.name || 'N/A') + '</p>' +
        '<p><strong>Email:</strong> ' + (data.email || 'N/A') + '</p>' +
        '<p><strong>Phone:</strong> ' + (data.phone || 'N/A') + '</p>' +
        '<p><strong>Program:</strong> ' + (data.program || 'N/A') + '</p>' +
        '<p><strong>Message:</strong> ' + (data.message || 'N/A') + '</p>' +
        '<hr><p style="color:#999;">Sent from newgenfc website form</p>'
    });
  } catch (emailErr) {
    // Email notification is optional — don't fail the whole request
  }

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Click **Save** (Ctrl+S / Cmd+S)
5. Name the project **"New Gen FC Form Handler"**

### Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon and select **Web app**
3. Set these options:
   - **Description:** "Form handler"
   - **Execute as:** "Me"
   - **Who has access:** "Anyone"
4. Click **Deploy**
5. **Authorize** when prompted (click through the "unsafe" warning — it's your own script)
6. **Copy the Web App URL** — it looks like:
   ```
   https://script.google.com/macros/s/AKfycbx.../exec
   ```

### Step 4: Paste the URL into the Website

Open `main.js` and find this line near the bottom:

```javascript
var GOOGLE_SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
```

Replace it with your actual URL:

```javascript
var GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbx.../exec';
```

Commit and push. Done!

---

## What You Get

- Every form submission creates a new row in your Google Sheet
- You also get an email notification for each submission (from your own Gmail)
- The spreadsheet is sortable, filterable, and exportable
- You can share the sheet with your team
- It's 100% free — Google Sheets and Apps Script have no usage limits for this volume

## Bonus: Get Mobile Notifications

To get push notifications on your phone when someone submits:
1. Install the **Google Sheets** app on your phone
2. In the spreadsheet, go to **Tools > Notification settings**
3. Set it to notify you when "A user submits a form" or "Any changes are made"

## Troubleshooting

- **Form says "Something went wrong":** Double-check the URL in `main.js` is correct and the Apps Script is deployed as "Anyone" access
- **No email notifications:** The Gmail account running the script needs to be the same as `sfnewgensocceracademy@gmail.com`, or change the `to:` address in the script
- **Need to update the script:** Go to Extensions > Apps Script, make changes, then Deploy > Manage deployments > Edit > New version > Deploy
