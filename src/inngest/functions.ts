import { Sandbox } from "@e2b/code-interpreter";
// import { createAgent, openai } from "@inngest/agent-kit";
import { inngest } from "./client";
import { connectSandbox } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "test" },
  { event: "test" },

  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("unlovable-nextjs");
      return sandbox.sandboxId;
    });

    // const summarizer = createAgent({
    //   name: "summarizer",
    //   system:
    //     "You are an expert summarizer. You summarize in just one sentence short!",
    //   model: openai({ model: "gpt-4o-mini" }),
    // });

    // const { output } = await summarizer.run(
    //   `Summarize this: ${event.data.value}`
    // );

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await connectSandbox({ sandboxId });
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return { sandboxUrl };

    // return { output };
  }
);
