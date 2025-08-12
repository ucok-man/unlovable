import Sandbox from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function connectSandbox({ sandboxId }: { sandboxId: string }) {
  const sandbox = await Sandbox.connect(sandboxId);
  return sandbox;
}

export function extractLastAssistantMessageContent(result: AgentResult) {
  const lastAssistantMessageIndex = result.output.findLastIndex(
    (msg) => msg.role === "assistant"
  );

  const message = result.output[lastAssistantMessageIndex] as
    | TextMessage
    | undefined;

  if (message?.content) {
    return typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("");
  }

  return undefined;
}
