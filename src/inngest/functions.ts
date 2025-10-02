// import { db } from "@/lib/db";
// import { CODE_AGENT_PROMPT } from "@/lib/prompts";
// import { Sandbox } from "@e2b/code-interpreter";
// import {
//   createAgent,
//   createNetwork,
//   createTool,
//   openai,
//   Tool,
// } from "@inngest/agent-kit";
// import z from "zod";
// import { inngest } from "./client";
// import { connectSandbox, extractLastAssistantMessageContent } from "./utils";

// // Type definition for the agent's internal state
// type AgentState = {
//   summary: string;
//   files: { [path: string]: string };
// };

// // Configuration constants
// const SANDBOX_TEMPLATE = "unlovable-nextjs";
// const DEFAULT_PORT = 3000;
// const MAX_NETWORK_ITERATIONS = 15;
// const MODEL_TEMPERATURE = 0.1;

// /**
//  * Main generator function that creates and manages a coding agent
//  * This function:
//  * 1. Creates a sandbox environment for code execution
//  * 2. Sets up a coding agent with terminal and file manipulation tools
//  * 3. Runs the agent to complete coding tasks
//  * 4. Saves results to database and returns sandbox URL
//  */
// export const generator = inngest.createFunction(
//   { id: "generator" },
//   { event: "generator/run" },

//   async ({ event, step }) => {
//     // Step 1: Initialize sandbox environment
//     const sandboxId = await createSandbox(step);

//     // Step 2: Create and configure the coding agent
//     const codeAgent = createCodingAgent(sandboxId);

//     // Step 3: Set up agent network with routing logic
//     const network = createAgentNetwork(codeAgent);

//     // Step 4: Execute the agent with user input
//     const result = await network.run(event.data.value);

//     // Step 5: Get sandbox URL for user access
//     const sandboxUrl = await getSandboxUrl(step, sandboxId);

//     // Step 6: Save results to database
//     await saveResults(step, result, sandboxUrl, event.data.projectId);

//     // Step 7: Consume subscription credits
//     await consumeCredits(step, event.data.userId);

//     return {
//       url: sandboxUrl,
//       title: "Fragment",
//       files: result.state.data.files,
//       summary: result.state.data.summary,
//     };
//   }
// );

// /**
//  * Creates a new sandbox instance for code execution
//  */
// async function createSandbox(step: any): Promise<string> {
//   return await step.run("get-sandbox-id", async () => {
//     const sandbox = await Sandbox.create(SANDBOX_TEMPLATE);
//     return sandbox.sandboxId;
//   });
// }

// /**
//  * Creates the main coding agent with all necessary tools
//  */
// function createCodingAgent(sandboxId: string) {
//   return createAgent<AgentState>({
//     name: "code-agent",
//     description:
//       "An expert coding agent capable of running terminal commands and managing files",
//     system: CODE_AGENT_PROMPT,
//     model: openai({
//       model: "gpt-4.1",
//       defaultParameters: {
//         temperature: MODEL_TEMPERATURE,
//       },
//     }),
//     tools: [
//       createTerminalTool(sandboxId),
//       createFileManagementTool(sandboxId),
//       createFileReadingTool(sandboxId),
//     ],
//     lifecycle: {
//       onResponse: handleAgentResponse,
//     },
//   });
// }

// /**
//  * Creates the terminal tool for executing shell commands
//  */
// function createTerminalTool(sandboxId: string) {
//   return createTool({
//     name: "terminal",
//     description: "Execute terminal commands in the sandbox environment",
//     parameters: z.object({
//       command: z.string().describe("The shell command to execute"),
//     }),
//     handler: async ({ command }, { step }) => {
//       return step?.run("terminal", async () => {
//         const buffers = { stdout: "", stderr: "" };

//         try {
//           const sandbox = await connectSandbox({ sandboxId });
//           const result = await sandbox.commands.run(command, {
//             onStdout: (data: string) => {
//               buffers.stdout += data;
//             },
//             onStderr: (data: string) => {
//               buffers.stderr += data;
//             },
//           });
//           return result.stdout;
//         } catch (err) {
//           const errorMessage = `Command failed: ${err}\nstdout: ${buffers.stdout}\nstderr: ${buffers.stderr}`;
//           console.error(errorMessage);
//           return errorMessage;
//         }
//       });
//     },
//   });
// }

// /**
//  * Creates the file management tool for creating/updating files
//  */
// function createFileManagementTool(sandboxId: string) {
//   return createTool({
//     name: "create-or-update-files",
//     description: "Create new files or update existing files in the sandbox",
//     parameters: z.object({
//       files: z
//         .array(
//           z.object({
//             path: z.string().describe("File path relative to sandbox root"),
//             content: z.string().describe("File content to write"),
//           })
//         )
//         .describe("Array of files to create or update"),
//     }),
//     handler: async ({ files }, { step, network }: Tool.Options<AgentState>) => {
//       const updatedFiles = await step?.run(
//         "create-or-update-files",
//         async () => {
//           try {
//             const currentFiles = network.state.data.files ?? {};
//             const sandbox = await connectSandbox({ sandboxId });

//             // Write each file to sandbox and update state
//             for (const file of files) {
//               await sandbox.files.write(file.path, file.content);
//               currentFiles[file.path] = file.content;
//             }

//             return currentFiles;
//           } catch (err) {
//             const errorMessage = `File operation failed: ${err}`;
//             console.error(errorMessage);
//             return errorMessage;
//           }
//         }
//       );

//       // Update network state with new files if operation succeeded
//       if (updatedFiles && typeof updatedFiles === "object") {
//         network.state.data.files = updatedFiles;
//       }
//     },
//   });
// }

// /**
//  * Creates the file reading tool for accessing existing files
//  */
// function createFileReadingTool(sandboxId: string) {
//   return createTool({
//     name: "read-files",
//     description: "Read the contents of specified files from the sandbox",
//     parameters: z.object({
//       files: z.array(z.string()).describe("Array of file paths to read"),
//     }),
//     handler: async ({ files }, { step }) => {
//       return await step?.run("read-files", async () => {
//         try {
//           const sandbox = await connectSandbox({ sandboxId });
//           const contents: string[] = [];

//           // Read each requested file
//           for (const filePath of files) {
//             const content = await sandbox.files.read(filePath);
//             contents.push(content);
//           }

//           return JSON.stringify(contents);
//         } catch (err) {
//           const errorMessage = `File reading failed: ${err}`;
//           console.error(errorMessage);
//           return errorMessage;
//         }
//       });
//     },
//   });
// }

// /**
//  * Handles agent responses and extracts task summaries
//  */
// function handleAgentResponse(args: any) {
//   const { result, network } = args;
//   const lastMessage = extractLastAssistantMessageContent(result);

//   // Extract task summary from agent response if present
//   if (lastMessage?.includes("<task_summary>") && network) {
//     const summary = lastMessage
//       .replace(/<task_summary>/g, "")
//       .replace(/<\/task_summary>/g, "")
//       .trim();

//     network.state.data.summary = summary;
//   }

//   return result;
// }

// /**
//  * Creates the agent network with routing logic
//  */
// function createAgentNetwork(codeAgent: any) {
//   return createNetwork({
//     name: "coding-agent-network",
//     agents: [codeAgent],
//     maxIter: MAX_NETWORK_ITERATIONS,
//     router: async ({ network }) => {
//       // If task is complete (has summary), stop routing
//       const summary = network.state.data.summary;
//       if (summary) {
//         return; // No more routing needed
//       }

//       // Continue with code agent
//       return codeAgent;
//     },
//   });
// }

// /**
//  * Retrieves the public URL for the sandbox
//  */
// async function getSandboxUrl(step: any, sandboxId: string): Promise<string> {
//   return await step.run("get-sandbox-url", async () => {
//     const sandbox = await connectSandbox({ sandboxId });
//     const host = sandbox.getHost(DEFAULT_PORT);
//     return `https://${host}`;
//   });
// }

// /**
//  * Saves the execution results to the database
//  */
// async function saveResults(
//   step: any,
//   result: any,
//   sandboxUrl: string,
//   projectId: string
// ): Promise<any> {
//   return await step.run("save-result", async () => {
//     const summary = result.state.data.summary;
//     const nofiles = Object.keys(result.state.data.files || {}).length === 0;

//     if (!summary || nofiles) {
//       // Save error message if execution failed
//       return await db.message.create({
//         data: {
//           content: "Something went wrong. Please try again.",
//           role: "ASSISTANT",
//           type: "ERROR",
//           projectId: projectId,
//         },
//       });
//     }

//     // Save successful result with fragment
//     return await db.message.create({
//       data: {
//         content: summary,
//         role: "ASSISTANT",
//         type: "RESULT",
//         projectId: projectId,
//         fragment: {
//           create: {
//             sandboxUrl: sandboxUrl,
//             title: "Fragment",
//             files: result.state.data.files,
//           },
//         },
//       },
//     });
//   });
// }

// async function consumeCredits(step: any, uid: string) {
//   return await step.run("consume-credits", async () => {
//     const subscription = await db.subscription.findUnique({
//       where: {
//         userId: uid,
//       },
//     });

//     if (!subscription)
//       throw new Error(`No subscription found with accociated user id #${uid}`);

//     if (subscription.monthlyCreditRemaining) {
//       return await db.subscription.update({
//         where: {
//           id: subscription.id,
//         },
//         data: {
//           monthlyCreditRemaining: {
//             decrement: 1,
//           },
//           monthlyCreditConsumed: {
//             increment: 1,
//           },
//         },
//       });
//     }

//     if (subscription.dailyCreditRemaining) {
//       return await db.subscription.update({
//         where: {
//           id: subscription.id,
//         },
//         data: {
//           dailyCreditRemaining: {
//             decrement: 1,
//           },
//           dailyCreditConsumed: {
//             increment: 1,
//           },
//         },
//       });
//     }

//     throw new Error("Insufficient credits to create task");
//   });
// }

// async function getPreviousMessageg(step: any, pid: string) {
//   return await db.message.findMany({
//     where: {
//       projectId: pid,
//     },
//     include: {
//       fragment: true,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// }

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
    // Step 1: Get previous messages for context
    const previousMessages = await getPreviousMessages(
      step,
      event.data.projectId
    );

    // Step 2: Initialize or retrieve sandbox environment
    const sandboxId = await getOrCreateSandbox(step, previousMessages);

    // Step 3: Restore previous files to sandbox if they exist
    await restorePreviousFiles(step, sandboxId, previousMessages);

    // Step 4: Build context-aware prompt with conversation history
    const contextualPrompt = buildContextualPrompt(
      event.data.value,
      previousMessages
    );

    // Step 5: Create and configure the coding agent
    const codeAgent = createCodingAgent(sandboxId);

    // Step 6: Set up agent network with routing logic
    const network = createAgentNetwork(codeAgent);

    // Step 7: Execute the agent with contextual input
    const result = await network.run(contextualPrompt);

    // Step 8: Get sandbox URL for user access
    const sandboxUrl = await getSandboxUrl(step, sandboxId);

    // Step 9: Save results to database
    await saveResults(
      step,
      result,
      sandboxUrl,
      event.data.projectId,
      sandboxId
    );

    // Step 10: Consume subscription credits
    await consumeCredits(step, event.data.userId);

    return {
      url: sandboxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  }
);

/**
 * Retrieves previous messages from the database for context
 */
async function getPreviousMessages(step: any, projectId: string) {
  return await step.run("get-previous-messages", async () => {
    return await db.message.findMany({
      where: {
        projectId: projectId,
      },
      include: {
        fragment: true,
      },
      orderBy: {
        createdAt: "asc", // Changed to ascending to build context chronologically
      },
      take: 10, // Limit to last 10 messages to avoid context overflow
    });
  });
}

/**
 * Gets existing sandbox ID or creates a new one
 */
async function getOrCreateSandbox(
  step: any,
  previousMessages: any[]
): Promise<string> {
  return await step.run("get-or-create-sandbox", async () => {
    // Check if there's a previous message with a sandbox (search from end to start)
    const lastMessageWithFragment = [...previousMessages]
      .reverse()
      .find((msg) => msg.fragment?.sandboxUrl);

    if (lastMessageWithFragment?.fragment?.sandboxUrl) {
      // Extract sandbox ID from URL
      // Assuming URL format: https://{sandboxId}.something.domain
      const url = lastMessageWithFragment.fragment.sandboxUrl;
      const match = url.match(/https:\/\/([^.]+)/);

      if (match && match[1]) {
        try {
          // Try to connect to existing sandbox
          await connectSandbox({ sandboxId: match[1] });
          return match[1];
        } catch (err) {
          console.log("Previous sandbox not available, creating new one");
        }
      }
    }

    // Create new sandbox if no existing one found
    const sandbox = await Sandbox.create(SANDBOX_TEMPLATE);
    return sandbox.sandboxId;
  });
}

/**
 * Restores files from previous fragments to maintain state
 */
async function restorePreviousFiles(
  step: any,
  sandboxId: string,
  previousMessages: any[]
) {
  return await step.run("restore-previous-files", async () => {
    // Get the most recent fragment with files (search from end to start)
    const lastFragment = [...previousMessages]
      .reverse()
      .find((msg) => msg.fragment?.files)?.fragment;

    if (!lastFragment?.files) {
      return;
    }

    try {
      const sandbox = await connectSandbox({ sandboxId });
      const files = lastFragment.files as { [path: string]: string };

      // Restore all files from previous state
      for (const [path, content] of Object.entries(files)) {
        await sandbox.files.write(path, content);
      }

      console.log(
        `Restored ${Object.keys(files).length} files from previous state`
      );
    } catch (err) {
      console.error("Failed to restore previous files:", err);
    }
  });
}

/**
 * Builds a contextual prompt including conversation history
 */
function buildContextualPrompt(
  currentPrompt: string,
  previousMessages: any[]
): string {
  if (previousMessages.length === 0) {
    return currentPrompt;
  }

  // Filter to only include relevant previous messages
  const conversationHistory = previousMessages
    .filter((msg) => msg.type === "RESULT" || msg.role === "USER")
    .slice(-5) // Last 5 interactions to keep context manageable
    .map((msg) => {
      if (msg.role === "USER") {
        return `User: ${msg.content}`;
      } else {
        return `Assistant: ${msg.content}`;
      }
    })
    .join("\n");

  // Get list of existing files from last fragment
  const lastFragment = [...previousMessages]
    .reverse()
    .find((msg) => msg.fragment?.files)?.fragment;

  let existingFilesContext = "";
  if (lastFragment?.files) {
    const files = lastFragment.files as { [path: string]: string };
    const fileList = Object.keys(files).join(", ");
    existingFilesContext = `\n\nExisting files in the project: ${fileList}`;
  }

  return `
CONVERSATION CONTEXT:
${conversationHistory}
${existingFilesContext}

CURRENT REQUEST:
${currentPrompt}

IMPORTANT: This is a continuation of an existing project. The files listed above already exist in the sandbox. You should:
1. Read existing files to understand the current state
2. Modify and enhance the existing code based on the current request
3. Maintain consistency with the existing codebase
4. Do NOT create a brand new project from scratch unless explicitly asked to start over
`.trim();
}

// /**
//  * Creates a new sandbox instance for code execution
//  */
// async function createSandbox(step: any): Promise<string> {
//   return await step.run("get-sandbox-id", async () => {
//     const sandbox = await Sandbox.create(SANDBOX_TEMPLATE);
//     return sandbox.sandboxId;
//   });
// }

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
  projectId: string,
  sandboxId: string
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

async function consumeCredits(step: any, uid: string) {
  return await step.run("consume-credits", async () => {
    const subscription = await db.subscription.findUnique({
      where: {
        userId: uid,
      },
    });

    if (!subscription)
      throw new Error(`No subscription found with accociated user id #${uid}`);

    if (subscription.monthlyCreditRemaining) {
      return await db.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          monthlyCreditRemaining: {
            decrement: 1,
          },
          monthlyCreditConsumed: {
            increment: 1,
          },
        },
      });
    }

    if (subscription.dailyCreditRemaining) {
      return await db.subscription.update({
        where: {
          id: subscription.id,
        },
        data: {
          dailyCreditRemaining: {
            decrement: 1,
          },
          dailyCreditConsumed: {
            increment: 1,
          },
        },
      });
    }

    throw new Error("Insufficient credits to create task");
  });
}
