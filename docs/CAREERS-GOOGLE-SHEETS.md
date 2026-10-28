# Career application connection

The form appears only on `/careers/[slug]`, before the footer. It posts to `/api/careers/apply`. Résumés and portfolios are public URLs, not uploads. Name, email, both links, and the short note are required; phone is optional.

Create a Google Sheet with a tab named `Applications`. In Extensions → Apps Script, paste the code below. Replace the secret with a long random value.

```js
const WEBHOOK_SECRET = "replace-with-a-long-random-secret";

function doPost(event) {
  const data = JSON.parse(event.postData.contents);
  const reply = (value) => ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
  if (data.secret !== WEBHOOK_SECRET) return reply({ ok: false });
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Applications");
  if (!sheet) return reply({ ok: false });
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Submitted At", "Role", "Slug", "Name", "Email", "Phone", "Portfolio", "Resume", "Motivation"]);
  }
  // Keep applicant input as text rather than spreadsheet formulas.
  const cell = (value) => /^[=+\-@\t\r\n]/.test(String(value || ""))
    ? "'" + String(value) : String(value || "");
  sheet.appendRow([
    data.submittedAt, data.role, data.slug, data.name, data.email,
    data.phone, data.portfolio, data.resume, data.motivation,
  ].map(cell));
  return reply({ ok: true });
}
```

Deploy as a Web app, executing as yourself, with access set to Anyone. Put the deployed `/exec` URL and matching secret in `.env.local`:

```env
CAREERS_GOOGLE_SHEETS_WEBHOOK_URL=
CAREERS_GOOGLE_SHEETS_WEBHOOK_SECRET=
```

Restart the development server after configuring these values. Add the same variables to your production host. The webhook URL and secret remain on the server. This connection is separate from the homepage enquiry form.

Until configured, submissions display an email fallback and are not marked successful. The endpoint requires a JSON `{ "ok": true }` acknowledgement from Apps Script before showing success.
