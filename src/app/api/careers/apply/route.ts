const text = (value: unknown, limit: number) => typeof value === "string" ? value.trim().slice(0, limit) : "";
const validLink = (value: string) => {
  try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid body");
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ message: "Invalid application." }, { status: 400 });
  }
  if (text(body.company, 150)) return Response.json({ ok: true });
  const submission = {
    submittedAt: new Date().toISOString(),
    role: text(body.role, 200),
    slug: text(body.slug, 200),
    name: text(body.name, 150),
    email: text(body.email, 254).toLowerCase(),
    phone: text(body.phone, 50),
    portfolio: text(body.portfolio, 2000),
    resume: text(body.resume, 2000),
    motivation: text(body.motivation, 5000),
  };
  if (!submission.name || !submission.role || !submission.slug || !/^\S+@\S+\.\S+$/.test(submission.email) || !validLink(submission.portfolio) || !validLink(submission.resume) || !submission.motivation) {
    return Response.json({ message: "Please complete your name, email, portfolio link, résumé link, and short note." }, { status: 422 });
  }
  const webhookUrl = process.env.CAREERS_GOOGLE_SHEETS_WEBHOOK_URL;
  if (!webhookUrl) return Response.json({ message: "Applications are not connected yet. Please email operations@izart.in." }, { status: 503 });
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submission, secret: process.env.CAREERS_GOOGLE_SHEETS_WEBHOOK_SECRET || "" }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Webhook failed");
    const result = await response.json();
    if (result?.ok !== true) throw new Error("Application was not acknowledged");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ message: "We couldn’t send your application. Please try again or email operations@izart.in." }, { status: 502 });
  }
}
