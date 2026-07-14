import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Mail, FileText, ListChecks, Search, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const features = [
  {
    to: "/email",
    icon: Mail,
    title: "Smart Email Generator",
    desc: "Draft emails tuned to any tone and audience in seconds.",
  },
  {
    to: "/meetings",
    icon: FileText,
    title: "Meeting Notes Summarizer",
    desc: "Extract key points, action items, and deadlines from raw notes.",
  },
  {
    to: "/tasks",
    icon: ListChecks,
    title: "AI Task Planner",
    desc: "Prioritize your workload and generate a realistic schedule.",
  },
  {
    to: "/research",
    icon: Search,
    title: "AI Research Assistant",
    desc: "Get clear insights, risks, and next steps on any topic.",
  },
  {
    to: "/chat",
    icon: MessageSquare,
    title: "AI Chat",
    desc: "A conversational copilot for anything work-related.",
  },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <section className="mb-10 rounded-2xl border bg-card p-8 shadow-[var(--shadow-card)] sm:p-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-accent/40 px-3 py-1 text-xs font-medium text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by Lovable AI
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your AI copilot for <span className="gradient-text">focused, faster work.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Draft emails, summarize meetings, plan tasks, research topics, and chat — all from one
          modern workspace.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.to}
            to={f.to}
            className="group card-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl [background:var(--gradient-primary)]">
              <f.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="text-base font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
