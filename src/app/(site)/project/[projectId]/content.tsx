"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Fragment } from "@prisma/client";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ChatWorkspace from "./_components/chat-workspace";
import CodeFragmentWorkspace from "./_components/code-fragment-workspace";
import { ErrorFallback, LoadingFallback } from "./_components/feedback";
import ProjectHeader from "./_components/project-header";

type Props = {
  projectId: string;
};

export default function Content({ projectId }: Props) {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);

  return (
    <div className="h-screen overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          defaultSize={40}
          minSize={20}
          className="flex flex-col min-h-0"
        >
          <ErrorBoundary fallback={<ErrorFallback />}>
            <Suspense fallback={<LoadingFallback message="Please wait..." />}>
              <ProjectHeader projectId={projectId} />
              <ChatWorkspace
                projectId={projectId}
                activeFragment={activeFragment}
                onFragmentSelect={setActiveFragment}
              />
            </Suspense>
          </ErrorBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle key={"root"} />

        <ResizablePanel defaultSize={60} minSize={50}>
          <CodeFragmentWorkspace
            fragment={activeFragment}
            onFragmentChange={setActiveFragment}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
