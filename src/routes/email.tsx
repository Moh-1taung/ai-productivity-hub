import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail, Loader2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { AppShell, PageHeader } from "@/components/AppShell";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateEmail } from "@/lib/ai.functions";

export const Route = createFileRoute("/email")({
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Persuasive", "Formal", "Casual", "Apologetic", "Enthusiastic"];
const AUDIENCES = ["Client", "Manager", "Team", "Investor", "Vendor", "Customer", "Recruiter"];

function EmailPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Client");
  const [copied, setCopied] = useState(false);

  const fn = useServerFn(generateEmail);
  const mut = useMutation({
    mutationFn: (input: { topic: string; tone: string; audience: string }) =>
      fn({ data: input }),
    onError: (e: Error) => toast.error(e.message || "Failed to generate"),
  });

  const copy = async () => {
    if (!mut.data?.text) return;
    await navigator.clipboard.writeText(mut.data.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Tone + audience-aware email drafts"
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">What's the email about?</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g. Follow up on last week's proposal and propose a call next Tuesday..."
                rows={6}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={() => topic.trim() && mut.mutate({ topic, tone, audience })}
              disabled={!topic.trim() || mut.isPending}
              className="w-full"
            >
              {mut.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</> : "Generate email"}
            </Button>
          </div>
        </div>
        <div className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Draft</h3>
            {mut.data?.text && (
              <Button variant="ghost" size="sm" onClick={copy}>
                {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>
          {mut.isPending ? (
            <p className="text-sm text-muted-foreground">Writing your email…</p>
          ) : mut.data?.text ? (
            <MarkdownView text={mut.data.text} />
          ) : (
            <p className="text-sm text-muted-foreground">Your generated email will appear here.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
