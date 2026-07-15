import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { FileText, Loader2, Sparkles, CheckSquare, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { summarizeMeeting } from "@/lib/ai.functions";

export const Route = createFileRoute("/meetings")({
  component: MeetingsPage,
});

function MeetingsPage() {
  const [notes, setNotes] = useState("");
  const fn = useServerFn(summarizeMeeting);
  const mut = useMutation({
    mutationFn: (input: { notes: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });

  const result = mut.data;

  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summarizer"
        description="Key points, action items, and deadlines"
      />
      <div className="space-y-6">
        <div className="card-surface p-5">
          <Label htmlFor="notes">Paste Meeting Notes</Label>
          <Textarea
            id="notes"
            rows={14}
            className="mt-1.5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste transcript or shorthand notes..."
          />
          <Button
            className="mt-4 w-full"
            onClick={() => notes.trim() && mut.mutate({ notes })}
            disabled={!notes.trim() || mut.isPending}
          >
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Summarizing…</> : "Summarize"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <SummaryCard
            icon={Sparkles}
            title="Key Points"
            content={result?.keyPoints}
            isLoading={mut.isPending}
          />
          <SummaryCard
            icon={CheckSquare}
            title="Action Items"
            content={result?.actionItems}
            isLoading={mut.isPending}
          />
          <SummaryCard
            icon={CalendarClock}
            title="Deadlines"
            content={result?.deadlines}
            isLoading={mut.isPending}
          />
        </div>
      </div>
    </AppShell>
  );
}

function SummaryCard({
  icon: Icon,
  title,
  content,
  isLoading,
}: {
  icon: LucideIcon;
  title: string;
  content?: string;
  isLoading: boolean;
}) {
  return (
    <div className="card-surface p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Extracting…</p>
      ) : content ? (
        <MarkdownView text={content} />
      ) : (
        <p className="text-sm text-muted-foreground">Results will appear here.</p>
      )}
    </div>
  );
}
