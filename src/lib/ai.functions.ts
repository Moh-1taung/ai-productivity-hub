import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const MODEL = "google/gemini-3.5-flash";

function getModel() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  return createLovableAiGatewayProvider(key)(MODEL);
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) =>
    z
      .object({
        topic: z.string().min(1),
        tone: z.string().min(1),
        audience: z.string().min(1),
      })
      .parse(v),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an expert business email writer. Write clear, well-structured emails in Markdown. Include a subject line prefixed with 'Subject:' on the first line, then a blank line, then the email body with greeting, body paragraphs, and sign-off placeholder [Your Name].",
      prompt: `Write an email.\n\nTopic: ${data.topic}\nTone: ${data.tone}\nAudience: ${data.audience}`,
    });
    return { text };
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => z.object({ notes: z.string().min(1) }).parse(v))
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You summarize meeting notes. Return Markdown with these exact sections: '## Summary', '## Key Points' (bulleted), '## Action Items' (bulleted, with owner in **bold** when mentioned), '## Deadlines' (bulleted, include dates when present). Be concise and specific.",
      prompt: data.notes,
    });
    return { text };
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
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are an AI research assistant. Given a topic, produce Markdown with '## Executive Summary' (2-3 sentences), '## Key Insights' (5-7 bullets), '## Considerations & Risks' (bullets), and '## Suggested Next Steps' (bullets). Be concrete and non-generic.",
      prompt: data.topic,
    });
    return { text };
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
