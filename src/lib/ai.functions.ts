import { createServerFn } from "@tanstack/react-start";
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "openai/gpt-5.5";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key, undefined, { structuredOutputs: true })(MODEL);
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z
      .object({
        topic: z.string().min(1),
        tone: z.string().min(1),
        audience: z.string().min(1),
        length: z.enum(["Short", "Medium", "Long"]).default("Medium"),
        subject: z.string().optional(),
        keyPoints: z.string().optional(),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const lengthGuide = {
      Short: "2-3 short sentences, under 80 words.",
      Medium: "3-5 sentences across 1-2 short paragraphs, 80-150 words.",
      Long: "2-3 paragraphs with detail and context, 150-250 words.",
    }[data.length];
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an expert business email writer. Write clear, well-structured emails in Markdown. The first line MUST be 'Subject: <subject>', then a blank line, then greeting, body paragraphs, and a sign-off ending with [Your Name]. Do not add commentary before or after the email.",
      prompt: `Write an email.\n\nTopic: ${data.topic}\nTone: ${data.tone}\nAudience: ${data.audience}\nLength: ${data.length} — ${lengthGuide}${data.subject ? `\nPreferred subject: ${data.subject}` : ""}${data.keyPoints ? `\nKey points to cover:\n${data.keyPoints}` : ""}`,
    });
    return { text };
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => z.object({ notes: z.string().min(1) }).parse(v))
  .handler(async ({ data }) => {
    const MeetingSummarySchema = z.object({
      keyPoints: z.string(),
      actionItems: z.string(),
      deadlines: z.string(),
    });
    const { output } = await generateText({
      model: getModel(),
      system:
        "You summarize meeting notes into three markdown sections. Return ONLY a JSON object with these exact keys: keyPoints (a markdown bulleted list of key takeaways), actionItems (a markdown bulleted list of tasks, with owners in bold when mentioned), and deadlines (a markdown bulleted list of deadlines with dates when present). Be concise and specific.",
      prompt: data.notes,
      output: Output.object({ schema: MeetingSummarySchema }),
    });
    return output;
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z.object({ tasks: z.string().min(1), context: z.string().optional() }).parse(v),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an AI task planner. Given a list of tasks, prioritize them using the Eisenhower matrix (Urgent+Important first), then propose a realistic schedule. Return Markdown with '## Prioritized Tasks' (numbered, each with a **Priority: High/Medium/Low** tag and a one-line rationale), and '## Suggested Schedule' (a day-by-day plan with time blocks).",
      prompt: `Tasks:\n${data.tasks}\n\nContext: ${data.context ?? "None"}`,
    });
    return { text };
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => z.object({ topic: z.string().min(1) }).parse(v))
  .handler(async ({ data }) => {
    const ResearchSchema = z.object({
      summary: z.string().describe("A concise 3-sentence executive summary of the topic."),
      insights: z.array(
        z.object({
          title: z.string().describe("A short, bold insight title (a few words)."),
          explanation: z.string().describe("One sentence explaining the insight."),
        }),
      ).describe("Exactly 3 key insights."),
    });
    try {
      const { output } = await generateText({
        model: getModel(),
        system:
          "You are an AI research assistant. Given a topic, return a JSON object with a concise 3-sentence executive summary and exactly 3 key insights. Each insight must have a short, bold title and a one-sentence explanation. Be concrete and specific.",
        prompt: data.topic,
        output: Output.object({ schema: ResearchSchema }),
      });
      return {
        summary: output.summary,
        insights: output.insights.slice(0, 3),
      };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return { summary: "", insights: [] };
      }
      throw error;
    }
  });

export const chat = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z
      .object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          }),
        ),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a helpful AI workplace productivity assistant. Be concise, friendly, and practical. Use Markdown formatting when helpful (lists, code blocks, bold).",
      messages: data.messages,
    });
    return { text };
  });
