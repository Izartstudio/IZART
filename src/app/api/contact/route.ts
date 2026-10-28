type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  website?: unknown;
  brief?: unknown;
  services?: unknown;
  budget?: unknown;
  referrals?: unknown;
  company?: unknown;
};

const text = (value: unknown, limit = 2000) => typeof value === "string" ? value.trim().slice(0, limit) : "";
const list = (value: unknown) => Array.isArray(value) ? value.map(item => text(item, 100)).filter(Boolean).slice(0, 10) : [];

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = await request.json() as ContactPayload;
  } catch {
    return Response.json({ message: "Invalid form submission." }, { status: 400 });
  }

  // Silently accept submissions caught by the hidden bot field.
  if (text(body.company)) return Response.json({ ok: true });

  const submission = {
    submittedAt: new Date().toISOString(),
    name: text(body.name, 150),
    email: text(body.email, 254).toLowerCase(),
    phone: text(body.phone, 50),
    website: text(body.website, 500),
    brief: text(body.brief, 5000),
    services: list(body.services),
    budget: text(body.budget, 100),
    referrals: list(body.referrals),
  };

  if (!submission.name || !submission.brief || !/^\S+@\S+\.\S+$/.test(submission.email)) {
    return Response.json({ message: "Please complete your name, email, and project brief." }, { status: 422 });
  }

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) {
    return Response.json({ message: "The enquiry form has not been connected yet." }, { status: 503 });
  }

  try {
    const sheetsResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submission, secret: process.env.GOOGLE_SHEETS_WEBHOOK_SECRET || "" }),
      cache: "no-store",
    });

    if (!sheetsResponse.ok) throw new Error(`Google Sheets returned ${sheetsResponse.status}`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact form delivery failed", error);
    return Response.json({ message: "We couldn’t send your enquiry. Please try again." }, { status: 502 });
  }
}
