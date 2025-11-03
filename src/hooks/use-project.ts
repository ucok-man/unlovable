import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

export function useProjectData(projectId: string) {
  const trpc = useTRPC();

  const project = useSuspenseQuery(
    trpc.project.getById.queryOptions({ projectId })
  );

  const messages = useSuspenseQuery(
    trpc.message.getAll.queryOptions({ projectId }, { refetchInterval: 5000 })
  );

  return {
    project: project.data,
    messages: messages.data,
  };
}
