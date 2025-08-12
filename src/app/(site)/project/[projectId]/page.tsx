import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { Metadata } from "next";
import Content from "./content";

interface ProjectPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { projectId } = await params;

  // You could fetch project name here for dynamic metadata
  return {
    title: `Project ${projectId} | Your App Name`,
    description: "AI-powered code generation workspace",
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  // Prefetch data for better UX
  await Promise.all([
    prefetch(trpc.message.getAll.queryOptions({ projectId })),
    prefetch(trpc.project.getById.queryOptions({ projectId })),
  ]);

  return (
    <HydrateClient>
      <Content projectId={projectId} />
    </HydrateClient>
  );
}
