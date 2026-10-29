import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  ImageUp,
  LifeBuoy,
  Mail,
  Sparkles,
  Sigma,
} from "lucide-react";

export const metadata = {
  title: "Help Center · JEROME",
};

const topics = [
  {
    icon: GraduationCap,
    title: "Using the AI tutor",
    body: "Ask a question in plain English and the tutor walks you through it step by step. Follow-ups keep the same subject, so you can say “why?” or “show another example” without repeating yourself.",
  },
  {
    icon: ImageUp,
    title: "Solving from a photo",
    body: "Use the paperclip button to attach up to three photos of a problem. Images are compressed on your device before they are sent, and you can send photos without typing anything.",
  },
  {
    icon: Sigma,
    title: "Maths and formulas",
    body: "Formulas are typeset with KaTeX. Hover a formula to copy its LaTeX, or use the download button to save it as an image for your notes.",
  },
  {
    icon: Sparkles,
    title: "Diagrams and quizzes",
    body: "Ask the tutor to “draw the unit circle” for an inline diagram, or “generate a quiz for domain and range” for an interactive quiz with hints, scoring, and a final review.",
  },
];

const faqs = [
  {
    question: "The tutor says my question is outside the subject — why?",
    answer:
      "Each chat is locked to the subject you started it in so answers stay focused. Open a new chat and pick the right subject if you want to switch.",
  },
  {
    question: "Are my conversations saved?",
    answer:
      "Yes. Chats are stored with your account, including attached photos, so you can reopen them later from the AI tutor sidebar.",
  },
  {
    question: "Can I practise without an internet connection?",
    answer:
      "No. The tutor needs a connection to reach the model, though the demo account can still run the built-in example replies.",
  },
  {
    question: "How do I reset my progress?",
    answer:
      "Open Preferences to adjust your study settings. Progress is tied to your account, so contact support if you need a full reset.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">SUPPORT · HELP CENTER</p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-green-950">
          How can we help?
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-text-muted">
          Quick answers about the tutor, your saved chats, and the study tools.
          If something is still unclear, send us a note.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {topics.map((topic) => (
          <article key={topic.title} className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-lime-100 text-green-900">
              <topic.icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-lg font-semibold text-green-950">
              {topic.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-text-muted">
              {topic.body}
            </p>
          </article>
        ))}
      </section>

      <section className="card p-6 lg:p-8">
        <div className="mb-5">
          <p className="eyebrow mb-0.5">Common questions</p>
          <h2 className="font-serif text-xl font-semibold text-green-950">
            Frequently asked
          </h2>
        </div>
        <dl className="divide-y divide-green-950/10">
          {faqs.map((faq) => (
            <div key={faq.question} className="py-4 first:pt-0 last:pb-0">
              <dt className="text-sm font-semibold text-green-950">
                {faq.question}
              </dt>
              <dd className="mt-1 text-sm leading-relaxed text-text-muted">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-950 text-lime-400">
            <LifeBuoy className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold text-green-950">
              Still stuck?
            </p>
            <p className="text-xs text-text-muted">
              Email support and we will get back to you within one school day.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:support@jerome.local"
            className="inline-flex items-center gap-2 rounded-full bg-green-950 px-4 py-2 text-sm font-medium text-cream-50 transition hover:bg-green-900"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            support@jerome.local
          </a>
          <Link
            href="/ai-tutor"
            className="inline-flex items-center gap-2 rounded-full border border-green-950/15 px-4 py-2 text-sm font-medium text-green-950 transition hover:border-green-950/30"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Back to the tutor
          </Link>
        </div>
      </section>
    </div>
  );
}
