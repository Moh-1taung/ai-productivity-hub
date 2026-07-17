import { generateText, Output, NoObjectGeneratedError } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

async function main() {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    console.error("Missing LOVABLE_API_KEY");
    return;
  }

  const ResearchSchema = {
    summary: "A concise 3-sentence executive summary of the topic.",
    insights: [
      {
        title: "A short, bold insight title (a few words).",
        explanation: "One sentence explaining the insight.",
      },
    ],
  };

  try {
    const gateway = createLovableAiGatewayProvider(key, { structuredOutputs: true });
    const model = gateway("openai/gpt-5.5");
    const { output } = await generateText({
      model,
      system:
        "You are an AI research assistant. Given a topic, return a JSON object with a concise 3-sentence executive summary and exactly 3 key insights. Each insight must have a short, bold title and a one-sentence explanation. Be concrete and specific.",
      prompt: "The impact of generative AI on software development productivity in 2026",
      output: Output.object({
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["title", "explanation"],
                additionalProperties: false,
              },
            },
          },
          required: ["summary", "insights"],
          additionalProperties: false,
        } as any,
      }),
    });
    console.log("Output:", JSON.stringify(output, null, 2));
  } catch (error) {
    console.error("Error:", error);
    if (NoObjectGeneratedError.isInstance(error)) {
      console.error("Raw text:", error.text);
    }
  }
}

main();
