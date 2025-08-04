import { CODE_AGENT_PROMPT } from "@/lib/prompts";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
} from "@inngest/agent-kit";
import z from "zod";
import { inngest } from "./client";
import { connectSandbox, lastAssistantMessageContent } from "./utils";

export const helloWorld = inngest.createFunction(
  { id: "test" },
  { event: "test" },

  async ({ event, step }) => {
    const sandboxId = await step.run("get-sandbox-id", async () => {
      const sandbox = await Sandbox.create("unlovable-nextjs");
      return sandbox.sandboxId;
    });

    const codeAgent = createAgent({
      name: "code-agent",
      description: "An expert coding agent",
      system: CODE_AGENT_PROMPT,
      model: openai({
        model: "gpt-4.1",
        defaultParameters: {
          temperature: 0.1,
        },
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "User terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandbox = await connectSandbox({ sandboxId });
                const result = await sandbox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                return result.stdout;
              } catch (err) {
                const causes = `Command failed: ${err}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}\n`;
                // console.error(causes);
                return causes;
              }
            });
          },
        }),

        createTool({
          name: "create-or-update-files",
          description: "Create or update file on sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              })
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "create-or-update-files",
              async () => {
                try {
                  const updatedFiles = network.state.data.file ?? {};
                  const sandbox = await connectSandbox({ sandboxId });
                  for (const file of files) {
                    await sandbox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (err) {
                  const causes = `Create or update files failed: ${err}`;
                  return causes;
                }
              }
            );

            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),

        createTool({
          name: "read-files",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("read-files", async () => {
              try {
                const sandbox = await connectSandbox({ sandboxId });

                const contents: string[] = [];

                for (const file of files) {
                  const content = await sandbox.files.read(file);
                  contents.push(content);
                }
                return JSON.stringify(contents);
              } catch (err) {
                const causes = `Read file failed: ${err}`;
                return causes;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: ({ result, network }) => {
          const lastAssistantMessageText = lastAssistantMessageContent(result);
          if (lastAssistantMessageText?.includes("<task_summary>") && network) {
            network.state.data.summary = lastAssistantMessageText;
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) return;
        return codeAgent;
      },
    });

    const result = await network.run(event.data.value);

    const sandboxUrl = await step.run("get-sandbox-url", async () => {
      const sandbox = await connectSandbox({ sandboxId });
      const host = sandbox.getHost(3000);
      return `https://${host}`;
    });

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);
