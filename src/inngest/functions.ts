import { db } from "@/lib/db";
import { CODE_AGENT_PROMPT } from "@/lib/prompts";
import { Sandbox } from "@e2b/code-interpreter";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  Tool,
} from "@inngest/agent-kit";
import z from "zod";
import { inngest } from "./client";
import { connectSandbox, extractLastAssistantMessageContent } from "./utils";

// Type definition for the agent's internal state
type AgentState = {
  summary: string;
  files: { [path: string]: string };
};

// Configuration constants
const SANDBOX_TEMPLATE = "unlovable-nextjs";
const DEFAULT_PORT = 3000;
const MAX_NETWORK_ITERATIONS = 15;
const MODEL_TEMPERATURE = 0.1;

/**
 * Main generator function that creates and manages a coding agent
 * This function:
 * 1. Creates a sandbox environment for code execution
 * 2. Sets up a coding agent with terminal and file manipulation tools
 * 3. Runs the agent to complete coding tasks
 * 4. Saves results to database and returns sandbox URL
 */
export const generator = inngest.createFunction(
  { id: "generator" },
  { event: "generator/run" },

  async ({ event, step }) => {
    // Step 1: Initialize sandbox environment
    const sandboxId = await createSandbox(step);

    // Step 2: Create and configure the coding agent
    const codeAgent = createCodingAgent(sandboxId);

    // Step 3: Set up agent network with routing logic
    const network = createAgentNetwork(codeAgent);

    // Step 4: Execute the agent with user input
    const result = await network.run(event.data.value);

    // Step 5: Get sandbox URL for user access
    const sandboxUrl = await getSandboxUrl(step, sandboxId);

    // Step 6: Save results to database
    await saveResults(step, result, sandboxUrl, event.data.projectId);

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

/**
 * Creates a new sandbox instance for code execution
 */
async function createSandbox(step: any): Promise<string> {
  return await step.run("get-sandbox-id", async () => {
    const sandbox = await Sandbox.create(SANDBOX_TEMPLATE);
    return sandbox.sandboxId;
  });
}

/**
 * Creates the main coding agent with all necessary tools
 */
function createCodingAgent(sandboxId: string) {
  return createAgent<AgentState>({
    name: "code-agent",
    description:
      "An expert coding agent capable of running terminal commands and managing files",
    system: CODE_AGENT_PROMPT,
    model: openai({
      model: "gpt-4.1",
      defaultParameters: {
        temperature: MODEL_TEMPERATURE,
      },
    }),
    tools: [
      createTerminalTool(sandboxId),
      createFileManagementTool(sandboxId),
      createFileReadingTool(sandboxId),
    ],
    lifecycle: {
      onResponse: handleAgentResponse,
    },
  });
}

/**
 * Creates the terminal tool for executing shell commands
 */
function createTerminalTool(sandboxId: string) {
  return createTool({
    name: "terminal",
    description: "Execute terminal commands in the sandbox environment",
    parameters: z.object({
      command: z.string().describe("The shell command to execute"),
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
          const errorMessage = `Command failed: ${err}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
          console.error(errorMessage);
          return errorMessage;
        }
      });
    },
  });
}

/**
 * Creates the file management tool for creating/updating files
 */
function createFileManagementTool(sandboxId: string) {
  return createTool({
    name: "create-or-update-files",
    description: "Create new files or update existing files in the sandbox",
    parameters: z.object({
      files: z
        .array(
          z.object({
            path: z.string().describe("File path relative to sandbox root"),
            content: z.string().describe("File content to write"),
          })
        )
        .describe("Array of files to create or update"),
    }),
    handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
      const updatedFiles = await step?.run(
        "create-or-update-files",
        async () => {
          try {
            const currentFiles = network.state.data.files ?? {};
            const sandbox = await connectSandbox({ sandboxId });

            // Write each file to sandbox and update state
            for (const file of files) {
              await sandbox.files.write(file.path, file.content);
              currentFiles[file.path] = file.content;
            }

            return currentFiles;
          } catch (err) {
            const errorMessage = `File operation failed: ${err}`;
            console.error(errorMessage);
            return errorMessage;
          }
        }
      );

      // Update network state with new files if operation succeeded
      if (updatedFiles && typeof updatedFiles === "object") {
        network.state.data.files = updatedFiles;
      }
    },
  });
}

/**
 * Creates the file reading tool for accessing existing files
 */
function createFileReadingTool(sandboxId: string) {
  return createTool({
    name: "read-files",
    description: "Read the contents of specified files from the sandbox",
    parameters: z.object({
      files: z.array(z.string()).describe("Array of file paths to read"),
    }),
    handler: async ({ files }, { step }) => {
      return await step?.run("read-files", async () => {
        try {
          const sandbox = await connectSandbox({ sandboxId });
          const contents: string[] = [];

          // Read each requested file
          for (const filePath of files) {
            const content = await sandbox.files.read(filePath);
            contents.push(content);
          }

          return JSON.stringify(contents);
        } catch (err) {
          const errorMessage = `File reading failed: ${err}`;
          console.error(errorMessage);
          return errorMessage;
        }
      });
    },
  });
}

/**
 * Handles agent responses and extracts task summaries
 */
function handleAgentResponse(args: any) {
  const { result, network } = args;
  const lastMessage = extractLastAssistantMessageContent(result);

  // Extract task summary from agent response if present
  if (lastMessage?.includes("<task_summary>") && network) {
    const summary = lastMessage
      .replace(/<task_summary>/g, "")
      .replace(/<\/task_summary>/g, "")
      .trim();

    network.state.data.summary = summary;
  }

  return result;
}

/**
 * Creates the agent network with routing logic
 */
function createAgentNetwork(codeAgent: any) {
  return createNetwork({
    name: "coding-agent-network",
    agents: [codeAgent],
    maxIter: MAX_NETWORK_ITERATIONS,
    router: async ({ network }) => {
      // If task is complete (has summary), stop routing
      const summary = network.state.data.summary;
      if (summary) {
        return; // No more routing needed
      }

      // Continue with code agent
      return codeAgent;
    },
  });
}

/**
 * Retrieves the public URL for the sandbox
 */
async function getSandboxUrl(step: any, sandboxId: string): Promise<string> {
  return await step.run("get-sandbox-url", async () => {
    const sandbox = await connectSandbox({ sandboxId });
    const host = sandbox.getHost(DEFAULT_PORT);
    return `https://${host}`;
  });
}

/**
 * Saves the execution results to the database
 */
async function saveResults(
  step: any,
  result: any,
  sandboxUrl: string,
  projectId: string
): Promise<any> {
  return await step.run("save-result", async () => {
    const summary = result.state.data.summary;
    const nofiles = Object.keys(result.state.data.files || {}).length === 0;

    if (!summary || nofiles) {
      // Save error message if execution failed
      return await db.message.create({
        data: {
          content: "Something went wrong. Please try again.",
          role: "ASSISTANT",
          type: "ERROR",
          projectId: projectId,
        },
      });
    }

    // Save successful result with fragment
    return await db.message.create({
      data: {
        content: summary,
        role: "ASSISTANT",
        type: "RESULT",
        projectId: projectId,
        fragment: {
          create: {
            sandboxUrl: sandboxUrl,
            title: "Fragment",
            files: result.state.data.files,
          },
        },
      },
    });
  });
}
