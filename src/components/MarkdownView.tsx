import ReactMarkdown from "react-markdown";

export function MarkdownView({ text }: { text: string }) {
  return (
    <div className="prose-chat text-sm text-foreground">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
