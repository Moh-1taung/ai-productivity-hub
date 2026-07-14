import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { researchTopic } from "@/lib/ai.functions";

export const Route = createFileRoute("/research")({
  component: ResearchPage,
});

function ResearchPage() {
  const [topic, setTopic] = useState("");
  const fn = useServerFn(researchTopic);
  const mut = useMutation({
    mutationFn: (input: { topic: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });

  return (
    <AppShell>
      <PageHeader
        icon={Search}
        title="AI Research Assistant"
        description="Insights, summaries, and next steps"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <Label htmlFor="topic">Research topic or question</Label>
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
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Researching…</> : "Run research"}
          </Button>
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Insights</h3>
          {mut.isPending ? (
            <p className="text-sm text-muted-foreground">Gathering insights…</p>
          ) : mut.data?.text ? (
            <MarkdownView text={mut.data.text} />
          ) : (
            <p className="text-sm text-muted-foreground">Your research briefing will appear here.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
