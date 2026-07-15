import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Mail, Loader2, Copy, Check, RefreshCw, Pencil, Eye } from "lucide-react";
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

const TONES = [
  "Professional",
  "Friendly",
  "Persuasive",
  "Formal",
  "Casual",
  "Apologetic",
  "Enthusiastic",
  "Assertive",
  "Empathetic",
  "Concise",
];
const AUDIENCES = [
  "Client",
  "Prospect",
  "Manager",
  "Direct Report",
  "Team",
  "Executive",
  "Investor",
  "Vendor",
  "Customer",
  "Recruiter",
  "Candidate",
];
const LENGTHS = ["Short", "Medium", "Long"] as const;
type Length = (typeof LENGTHS)[number];

type EmailInput = {
  topic: string;
  tone: string;
  audience: string;
  length: Length;
  subject?: string;
  keyPoints?: string;
};

function EmailPage() {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [audience, setAudience] = useState("Client");
  const [length, setLength] = useState<Length>("Medium");
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);

  const fn = useServerFn(generateEmail);
  const mut = useMutation({
    mutationFn: (input: EmailInput) => fn({ data: input }),
    onSuccess: (res) => setDraft(res.text),
    onError: (e: Error) => toast.error(e.message || "Failed to generate"),
  });

  useEffect(() => {
    if (mut.data?.text && !editing) setDraft(mut.data.text);
  }, [mut.data?.text, editing]);

  const payload = useMemo<EmailInput>(
    () => ({
      topic,
      tone,
      audience,
      length,
      subject: subject.trim() || undefined,
      keyPoints: keyPoints.trim() || undefined,
    }),
    [topic, tone, audience, length, subject, keyPoints],
  );

  const submit = () => {
    if (!topic.trim()) return;
    setEditing(false);
    mut.mutate(payload);
  };

  const copy = async () => {
    if (!draft) return;
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <AppShell>
      <PageHeader
        icon={Mail}
        title="Smart Email Generator"
        description="Tone, audience, and length-aware email drafts"
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
                rows={5}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="subject">Preferred subject (optional)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Leave blank to let AI write one"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="keypoints">Key points to cover (optional)</Label>
              <Textarea
                id="keypoints"
                value={keyPoints}
                onChange={(e) => setKeyPoints(e.target.value)}
                placeholder="One per line — dates, numbers, links to include"
                rows={3}
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
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
              <div>
                <Label>Length</Label>
                <Select value={length} onValueChange={(v) => setLength(v as Length)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LENGTHS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={submit}
                disabled={!topic.trim() || mut.isPending}
                className="flex-1"
              >
                {mut.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating…</>
                ) : draft ? (
                  "Generate new draft"
                ) : (
                  "Generate email"
                )}
              </Button>
              {draft && (
                <Button
                  variant="outline"
                  onClick={submit}
                  disabled={mut.isPending}
                  title="Regenerate with the same inputs"
                >
                  <RefreshCw className={`h-4 w-4 ${mut.isPending ? "animate-spin" : ""}`} />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="card-surface p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Draft</h3>
            {draft && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing((e) => !e)}>
                  {editing ? (
                    <><Eye className="mr-1.5 h-4 w-4" />Preview</>
                  ) : (
                    <><Pencil className="mr-1.5 h-4 w-4" />Edit</>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={copy}>
                  {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            )}
          </div>
          {mut.isPending && !draft ? (
            <p className="text-sm text-muted-foreground">Writing your email…</p>
          ) : draft ? (
            editing ? (
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={16}
                className="font-mono text-sm"
              />
            ) : (
              <MarkdownView text={draft} />
            )
          ) : (
            <p className="text-sm text-muted-foreground">Your generated email will appear here.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
