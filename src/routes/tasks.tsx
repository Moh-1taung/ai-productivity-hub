import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, ListChecks, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { planTasks } from "@/lib/ai.functions";

export const Route = createFileRoute("/tasks")({
  component: TasksPage,
});

type Priority = "High" | "Medium" | "Low";
type Task = { id: string; name: string; dueDate?: Date; priority: Priority };

const priorityStyles: Record<Priority, string> = {
  High: "bg-destructive/15 text-destructive border-destructive/30",
  Medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
};

function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<Priority>("Medium");
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  const fn = useServerFn(planTasks);
  const mut = useMutation({
    mutationFn: (input: { tasks: string; context: string }) => fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed"),
  });

  const addTask = () => {
    if (!name.trim()) return;
    setTasks((t) => [
      ...t,
      { id: crypto.randomUUID(), name: name.trim(), dueDate, priority },
    ]);
    setName("");
    setDueDate(undefined);
    setPriority("Medium");
  };

  const removeTask = (id: string) => setTasks((t) => t.filter((x) => x.id !== id));

  const prioritize = () => {
    if (!tasks.length) return;
    const serialized = tasks
      .map(
        (t) =>
          `- ${t.name} (priority: ${t.priority}${t.dueDate ? `, due ${format(t.dueDate, "PPP")}` : ""})`,
      )
      .join("\n");
    mut.mutate({ tasks: serialized, context: "" });
  };

  const dueDays = useMemo(
    () => tasks.filter((t) => t.dueDate).map((t) => t.dueDate!),
    [tasks],
  );
  const tasksForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, "yyyy-MM-dd");
    return tasks.filter((t) => t.dueDate && format(t.dueDate, "yyyy-MM-dd") === key);
  }, [tasks, selectedDay]);

  return (
    <AppShell>
      <PageHeader
        icon={ListChecks}
        title="AI Task Planner"
        description="Add tasks, then let AI prioritize and schedule them"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Add task form */}
        <div className="card-surface p-5 space-y-4">
          <h3 className="text-sm font-semibold">New task</h3>
          <div>
            <Label htmlFor="task-name">Task name</Label>
            <Input
              id="task-name"
              className="mt-1.5"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              placeholder="e.g. Prepare Q3 report"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-1.5 w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={addTask} disabled={!name.trim()} className="flex-1">
              <Plus className="mr-2 h-4 w-4" /> Add task
            </Button>
            <Button
              variant="secondary"
              onClick={prioritize}
              disabled={!tasks.length || mut.isPending}
              className="flex-1"
            >
              {mut.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Prioritizing…</>
              ) : (
                <><Sparkles className="mr-2 h-4 w-4" />AI Prioritize</>
              )}
            </Button>
          </div>
        </div>

        {/* Task list / calendar */}
        <div className="card-surface p-5">
          <Tabs defaultValue="list">
            <TabsList>
              <TabsTrigger value="list">Task list</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks yet. Add one to get started.</p>
              ) : (
                <ul className="space-y-2">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/40 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.dueDate ? format(t.dueDate, "PPP") : "No due date"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={priorityStyles[t.priority]}>
                          {t.priority}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeTask(t.id)}
                          aria-label="Remove task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>

            <TabsContent value="calendar" className="mt-4">
              <div className="grid gap-4 md:grid-cols-[auto_1fr]">
                <Calendar
                  mode="single"
                  selected={selectedDay}
                  onSelect={setSelectedDay}
                  modifiers={{ due: dueDays }}
                  modifiersClassNames={{ due: "bg-primary/20 text-primary font-semibold" }}
                  className={cn("rounded-md border p-3 pointer-events-auto")}
                />
                <div>
                  <h4 className="mb-2 text-sm font-semibold">
                    {selectedDay ? format(selectedDay, "PPP") : "Select a day"}
                  </h4>
                  {tasksForSelectedDay.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No tasks scheduled.</p>
                  ) : (
                    <ul className="space-y-2">
                      {tasksForSelectedDay.map((t) => (
                        <li
                          key={t.id}
                          className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 p-2.5"
                        >
                          <span className="text-sm">{t.name}</span>
                          <Badge variant="outline" className={priorityStyles[t.priority]}>
                            {t.priority}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* AI plan output */}
      {(mut.isPending || mut.data?.text) && (
        <div className="card-surface mt-6 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold">AI-suggested plan</h3>
          </div>
          {mut.isPending ? (
            <p className="text-sm text-muted-foreground">Prioritizing tasks…</p>
          ) : (
            <MarkdownView text={mut.data!.text} />
          )}
        </div>
      )}
    </AppShell>
  );
}
