import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MarkdownView } from "@/components/MarkdownView";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chat } from "@/lib/ai.functions";

type Msg = { role: "user" | "assistant"; content: string };

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fn = useServerFn(chat);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fn({ data: { messages: next } });
      setMessages([...next, { role: "assistant", content: res.text }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send");
      setMessages(messages);
      setInput(text);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <>
      {/* Floating bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full [background:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[32rem] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border bg-card shadow-[var(--shadow-glow)]">
          <div className="flex items-center justify-between border-b px-4 py-3 [background:var(--gradient-primary)]">
            <div className="flex items-center gap-2 text-primary-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-semibold">AI Assistant</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 text-primary-foreground/90 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Hi there 👋</p>
                  <p className="mt-1">Ask me anything to get started.</p>
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">
                    {m.content}
                  </div>
                ) : (
                  <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2">
                    <MarkdownView text={m.content} />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="typing-dot" />
                <span className="typing-dot [animation-delay:150ms]" />
                <span className="typing-dot [animation-delay:300ms]" />
                <span className="ml-1">typing...</span>
              </div>
            )}
          </div>

          <div className="border-t bg-background/50 p-2">
            <div className="flex items-end gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message…"
                rows={1}
                className="min-h-[40px] max-h-32 resize-none text-sm"
              />
              <Button onClick={send} disabled={!input.trim() || loading} size="sm" className="h-10 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (<><Send className="mr-1 h-4 w-4" />Send</>)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
