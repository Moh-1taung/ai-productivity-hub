import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText, Loader2 } from "lucide-react";
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

  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="Meeting Notes Summarizer"
        description="Key points, action items, and deadlines"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <Label htmlFor="notes">Paste your raw meeting notes or transcript</Label>
          <Textarea
            id="notes"
            rows={16}
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
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Summarizing…</> : "Summarize meeting"}
          </Button>
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Summary</h3>
          {mut.isPending ? (
            <p className="text-sm text-muted-foreground">Extracting insights…</p>
          ) : mut.data?.text ? (
            <MarkdownView text={mut.data.text} />
          ) : (
            <p className="text-sm text-muted-foreground">Your summary will appear here.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
