# Google Sheets form connection

1. Create a Google Sheet and rename its first tab to `Enquiries`.
2. Add these headers in row 1: `Submitted At`, `Name`, `Email`, `Phone`, `Website`, `Brief`, `Services`, `Budget`, `Referrals`.
3. Open **Extensions → Apps Script** and replace the editor contents with:

```js
const SHEET_NAME = "Enquiries";
const WEBHOOK_SECRET = "replace-with-a-long-random-secret";

function doPost(event) {
  const data = JSON.parse(event.postData.contents);

  if (data.secret !== WEBHOOK_SECRET) {
    return ContentService.createTextOutput("Unauthorized");
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  sheet.appendRow([
    data.submittedAt,
    data.name,
    data.email,
    data.phone,
    data.website,
    data.brief,
    (data.services || []).join(", "),
    data.budget,
    (data.referrals || []).join(", "),
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Select **Deploy → New deployment → Web app**. Execute as yourself and allow access to **Anyone**.
5. Copy the deployed `/exec` URL into `GOOGLE_SHEETS_WEBHOOK_URL` in `.env.local` and use the same random secret for `GOOGLE_SHEETS_WEBHOOK_SECRET` and `WEBHOOK_SECRET` in Apps Script.
6. Restart the local Next.js server after changing `.env.local`. Add the same two server-side environment variables to the production host before deploying.

The browser posts only to `/api/contact`; the Apps Script URL and secret stay on the server and are not included in the client bundle.
