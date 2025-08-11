"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useTRPC } from "@/trpc/client";
import { Fragment } from "@prisma/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Chatbox from "./chatbox";
import FragmentWeb from "./fragment-web";
import ProjectHeader from "./project-header";

type Props = {
  projectId: string;
};

export default function Content({ projectId }: Props) {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  const trpc = useTRPC();
  const project = useSuspenseQuery(
    trpc.project.getById.queryOptions({ projectId })
  );

  return (
    <div className="h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={40}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <ErrorBoundary fallback={<div>An Error occur...</div>}>
            <Suspense fallback={<div>Loading header...</div>}>
              <ProjectHeader projectId={projectId} />
            </Suspense>
          </ErrorBoundary>

          <ErrorBoundary fallback={<div>An Error occur...</div>}>
            <Suspense fallback={<div>Loading chatbox...</div>}>
              <Chatbox
                projectId={projectId}
                activeFragment={activeFragment}
                setActiveFragment={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={60} minSize={50}>
          {activeFragment && <FragmentWeb data={activeFragment} />}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
