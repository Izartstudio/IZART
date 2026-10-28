"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useRef, useState } from "react";

const services = [
  "Branding & Strategy",
  "UI UX Design",
  "Web Design & Development",
  "E-Commerce",
  "Campaign Planning",
];

const budgets = ["0 - $2,000", "$2,000 - $6,000", "$6,000 - $8,000", "$8,000+"];
const referrals = ["Behance", "LinkedIn", "Instagram", "Google Search", "X / Twitter"];

const revealStyle = (order: number) => ({ "--reveal-order": order } as CSSProperties);

export function ContactForm() {
  const sectionRef = useRef<HTMLElement>(null);
  const [budgetIndex, setBudgetIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.classList.add("is-visible");
      observer.disconnect();
    }, { threshold: .12 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      website: String(data.get("website") || ""),
      brief: String(data.get("brief") || ""),
      services: data.getAll("services").map(String),
      budget: String(data.get("budget") || ""),
      referrals: data.getAll("referrals").map(String),
      company: String(data.get("company") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { message?: string };
      if (!response.ok) throw new Error(result.message || "Unable to send your enquiry.");

      form.reset();
      setBudgetIndex(0);
      setStatus("success");
      setMessage("Thank you — we’ll be in touch soon.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to send your enquiry.");
    }
  }

  return <section ref={sectionRef} id="Get-Quote" className="contact-form" aria-labelledby="contact-form-title">
    <div className="contact-form__panel">
      <h2 id="contact-form-title" className="contact-form__title contact-form__animate" style={revealStyle(0)}>
        Have a cool idea?<br />Let’s collaborate
      </h2>

      <form onSubmit={submitForm}>
        <div className="contact-form__fields">
          <input className="contact-form__field contact-form__animate" style={revealStyle(1)} name="name" type="text" placeholder="What’s your name?" aria-label="Your name" autoComplete="name" required />
          <input className="contact-form__field contact-form__animate" style={revealStyle(2)} name="email" type="email" placeholder="What’s your email address?" aria-label="Your email address" autoComplete="email" required />
          <input className="contact-form__field contact-form__animate" style={revealStyle(3)} name="phone" type="tel" placeholder="Phone number" aria-label="Phone number" autoComplete="tel" />
          <input className="contact-form__field contact-form__animate" style={revealStyle(4)} name="website" type="url" placeholder="Current website URL" aria-label="Current website URL" autoComplete="url" />
          <textarea className="contact-form__field contact-form__field--brief contact-form__animate" style={revealStyle(5)} name="brief" placeholder="What’s your brief?" aria-label="Project brief" required />
        </div>

        <fieldset className="contact-form__group contact-form__animate" style={revealStyle(6)}>
          <legend>What services do you need?</legend>
          <div className="contact-form__choices contact-form__choices--services">
            {services.map(service => <label className="contact-form__choice" key={service}>
              <input type="checkbox" name="services" value={service} />
              <span>{service}</span>
            </label>)}
          </div>
        </fieldset>

        <fieldset className="contact-form__group contact-form__budget contact-form__animate" style={{ ...revealStyle(7), "--budget-index": budgetIndex } as CSSProperties}>
          <legend>What’s your budget?</legend>
          <div className="contact-form__budget-track" aria-hidden="true"><i /></div>
          <div className="contact-form__budget-options">
            {budgets.map((budget, index) => <label key={budget}>
              <input type="radio" name="budget" value={budget} checked={budgetIndex === index} onChange={() => setBudgetIndex(index)} />
              <span>{budget}</span>
            </label>)}
          </div>
        </fieldset>

        <fieldset className="contact-form__group contact-form__animate" style={revealStyle(8)}>
          <legend>Where did you hear about us?</legend>
          <div className="contact-form__choices contact-form__choices--referrals">
            {referrals.map(referral => <label className="contact-form__choice" key={referral}>
              <input type="checkbox" name="referrals" value={referral} />
              <span>{referral}</span>
            </label>)}
          </div>
        </fieldset>

        <label className="contact-form__honeypot" aria-hidden="true">Company<input name="company" type="text" tabIndex={-1} autoComplete="off" /></label>

        <div className="contact-form__actions contact-form__animate" style={revealStyle(9)}>
          <button className="site-button contact-form__submit" type="submit" disabled={status === "sending"}>
            <span className="site-button__label">{status === "sending" ? "Sending…" : "Submit Form →"}</span>
          </button>
          <p className={`contact-form__status${status === "error" ? " is-error" : ""}`} aria-live="polite">{message}</p>
        </div>
      </form>
    </div>
  </section>;
}
