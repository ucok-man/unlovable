import { createAgent, openai } from "@inngest/agent-kit";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "test" },
  { event: "test" },

  async ({ event, step }) => {
    const summarizer = createAgent({
      name: "summarizer",
      system:
        "You are an expert summarizer. You summarize in just one sentence short!",
      model: openai({ model: "gpt-4o-mini" }),
    });

    const { output } = await summarizer.run(
      `Summarize this: ${event.data.value}`
    );

    return { output };
  }
);
