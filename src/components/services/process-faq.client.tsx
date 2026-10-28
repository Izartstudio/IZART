"use client";

import { useState } from "react";

const items = [
  {
    question: "Do I need years of experience to apply?",
    answer: "The foundation of every brand system. We design logos and visual marks that are distinctive, scalable, and built to hold equity over time - not just look good in a pitch deck.",
  },
  { question: "What kind of people usually do well here?", answer: "Details for this question are coming soon." },
  { question: "Is the work fully remote?", answer: "Details for this question are coming soon." },
  { question: "What kind of projects would I work on?", answer: "Details for this question are coming soon." },
  { question: "What do you look for in portfolios?", answer: "Details for this question are coming soon." },
];

export function ProcessFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return <section className="process-faq" aria-labelledby="process-faq-title">
    <h2 id="process-faq-title" className="process-faq__heading">Frequently Asked<br />Questions</h2>
    <div className="process-faq__items">
      {items.map((item, index) => {
        const open = openIndex === index;
        const answerId = `process-faq-answer-${index}`;
        return <div className="process-faq__item" key={item.question}>
          <h3>
            <button type="button" aria-expanded={open} aria-controls={answerId} onClick={() => setOpenIndex(open ? null : index)}>
              <span>{item.question}</span><span className="process-faq__indicator" aria-hidden="true">[ {open ? "−" : "+"} ]</span>
            </button>
          </h3>
          <div id={answerId} className={`process-faq__answer${open ? " is-open" : ""}`} aria-hidden={!open}>
            <div className="process-faq__answer-inner"><p>{item.answer}</p></div>
          </div>
        </div>;
      })}
    </div>
  </section>;
}
