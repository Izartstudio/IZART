"use client";

import { useState, type FormEvent } from "react";

export function CareerApplicationForm({ role, slug }: { role: string; slug: string }) {
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setPending(true);
    setStatus("");
    setFailed(false);
    try {
      const response = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, role, slug }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to submit your application. Please try again.");
      form.reset();
      setStatus("Thank you! Your application has been submitted.");
    } catch (error) {
      setFailed(true);
      setStatus(error instanceof Error ? error.message : "Unable to submit your application. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <section id="apply" className="career-application" aria-label={`Apply for ${role}`}>
    <p className="career-application__intro">If this sounds like the kind of place you want to be, send us your portfolio at <a href="mailto:operations@izart.in">operations@izart.in</a> along with a short note on how you think about your work. The note matters as much as the portfolio. We look at how you approach problems more than anything else, and tools and formats matter less than clarity of intent.</p>
    <form className="career-application__panel" onSubmit={submit} aria-busy={pending}>
      <div className="career-application__fields">
        <label><span>What’s your name?</span><input name="name" autoComplete="name" required maxLength={150} /></label>
        <label><span>What’s your email address?</span><input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label className="career-application__wide"><span>Phone number</span><input name="phone" type="tel" autoComplete="tel" maxLength={50} /></label>
        <label className="career-application__wide"><span>*Portfolio link</span><input name="portfolio" type="url" required maxLength={2000} aria-label="Portfolio link (required)" /></label>
        <label className="career-application__wide"><span>*Resume</span><input name="resume" type="url" required maxLength={2000} aria-label="Resume link (required)" title="Add a public link to your résumé, such as Google Drive or Dropbox." /></label>
        <label className="career-application__wide career-application__note"><span>Why do you want to work with us?</span><textarea name="motivation" required maxLength={5000} /></label>
      </div>
      <label className="contact-form__honeypot" aria-hidden="true">Company<input name="company" tabIndex={-1} autoComplete="off" /></label>
      <button className="career-application__submit" type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit Application"}</button>
      <p className={`career-application__status${failed ? " is-error" : ""}`} role="status" aria-live="polite">{status}</p>
    </form>
  </section>;
}
