import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Search, Loader2, Lightbulb, Zap, TrendingUp } from "lucide-react";
import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

const INSIGHT_ICONS: LucideIcon[] = [Lightbulb, Zap, TrendingUp];

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const fn = useServerFn(researchTopic);
  const mut = useMutation({
    mutationFn: (input: { topic: string }) => fn({ data: input }),
  });

  const result = mut.data;

  return (
    <AppShell>
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Insights, summaries, and next steps"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <Label htmlFor="topic">Research Topic</Label>
          <Textarea
            id="topic"
            rows={8}
            className="mt-1.5"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="E.g. Market landscape for AI-powered legal research tools in 2026"
          />
          <Button
            className="mt-4 w-full"
            onClick={() => topic.trim() && mut.mutate({ topic })}
            disabled={!topic.trim() || mut.isPending}
          >
            {mut.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating insights…</>
            ) : (
              "Generate Insights"
            )}
          </Button>
        </div>

        <div className="space-y-6">
          <div className="card-surface p-5">
            <h3 className="mb-3 text-sm font-semibold">Summary</h3>
            {mut.isPending && !result?.summary ? (
              <p className="text-sm text-muted-foreground">Generating summary…</p>
            ) : result?.summary ? (
              <div className="prose-chat text-sm text-foreground">
                <p>{result.summary}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Your research summary will appear here.</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {result?.insights.map((insight, i) => {
              const Icon = INSIGHT_ICONS[i % INSIGHT_ICONS.length];
              return (
              <div key={i} className="card-surface p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-semibold">Insight {i + 1}</h3>
                  </div>
                  <div className="prose-chat text-sm text-foreground">
                    <p><strong>{insight.title.replace(/\*\*/g, "")}</strong></p>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{insight.explanation}</p>
                </div>
              );
            })}
            {!result && !mut.isPending && (
              <div className="card-surface p-5 md:col-span-3">
                <p className="text-sm text-muted-foreground">Three insight cards will appear here.</p>
              </div>
            )}
          </div>

          {mut.isPending && (
            <p className="text-center text-sm text-muted-foreground">Generating....</p>
          )}
          {mut.error && !mut.isPending && (
            <p className="text-center text-sm text-destructive">Please try a different topic</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
