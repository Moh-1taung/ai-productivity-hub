import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ListChecks, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

function TasksPage() {
  const [tasks, setTasks] = useState("");
  const [context, setContext] = useState("");
  const fn = useServerFn(planTasks);
  const mut = useMutation({
    mutationFn: (input: { tasks: string; context: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });

  return (
    <AppShell>
      <PageHeader
        icon={ListChecks}
        title="AI Task Planner"
        description="Prioritize and schedule your day"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5 space-y-4">
          <div>
            <Label htmlFor="tasks">Your tasks (one per line)</Label>
            <Textarea
              id="tasks"
              rows={10}
              className="mt-1.5"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              placeholder={"Prepare Q3 report\nCall supplier about invoice\nReview PR #482\nBook flight for conference"}
            />
          </div>
          <div>
            <Label htmlFor="ctx">Context / constraints (optional)</Label>
            <Input
              id="ctx"
              className="mt-1.5"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="E.g. 3 focus hours per day, board meeting Friday"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => tasks.trim() && mut.mutate({ tasks, context })}
            disabled={!tasks.trim() || mut.isPending}
          >
            {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Planning…</> : "Plan my week"}
          </Button>
        </div>
        <div className="card-surface p-5">
          <h3 className="mb-3 text-sm font-semibold">Plan</h3>
          {mut.isPending ? (
            <p className="text-sm text-muted-foreground">Prioritizing tasks…</p>
          ) : mut.data?.text ? (
            <MarkdownView text={mut.data.text} />
          ) : (
            <p className="text-sm text-muted-foreground">Your prioritized plan will appear here.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
