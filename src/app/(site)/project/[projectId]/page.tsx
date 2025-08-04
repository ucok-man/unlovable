import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import Content from "./content";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage(props: Props) {
  const params = await props.params;

  prefetch(trpc.message.getAll.queryOptions({ projectId: params.projectId }));
  prefetch(trpc.project.getById.queryOptions({ projectId: params.projectId }));

  return (
    <HydrateClient>
      {/* <ErrorBoundary fallback={<div>Error occurr...</div>}> */}
      {/* <Suspense fallback={<div>Loading content...</div>}> */}
      <Content projectId={params.projectId} />
      {/* </Suspense> */}
      {/* </ErrorBoundary> */}
    </HydrateClient>
  );
}
