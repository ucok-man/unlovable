"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
// import { useTRPC } from "@/trpc/client";
import { Fragment } from "@prisma/client";
// import { useSuspenseQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code2, Crown, EyeIcon } from "lucide-react";
import Link from "next/link";
import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import Chatbox from "./chatbox";
import FileExplorer from "./file-explorer";
import FragmentView from "./fragment-view";
import ProjectHeader from "./project-header";

type Props = {
  projectId: string;
};

export default function Content({ projectId }: Props) {
  const [activeFragment, setActiveFragment] = useState<Fragment | null>(null);
  const [tabState, setTabState] = useState<"fragment" | "code">("code");

  // const trpc = useTRPC();
  // const project = useSuspenseQuery(
  //   trpc.project.getById.queryOptions({ projectId })
  // );

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
          <Tabs
            defaultValue="fragment"
            value={tabState}
            onValueChange={(val) => setTabState(val as "fragment" | "code")}
            className="h-full gap-y-0"
          >
            <div className="w-full flex items-center p-2 border-b gap-x-2">
              <TabsList className="border rounded-md">
                <TabsTrigger value="fragment" className="rounded-md">
                  <EyeIcon /> <span>Demo</span>
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-md">
                  <Code2 /> <span>Code</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex ml-auto items-center gap-x-2">
                <Button asChild size={"sm"} variant={"default"}>
                  <Link href={"/pricing"}>
                    <Crown /> Upgrade
                  </Link>
                </Button>
              </div>
            </div>

            <TabsContent value="fragment">
              {activeFragment && <FragmentView data={activeFragment} />}
            </TabsContent>
            <TabsContent value="code" className="min-h-0">
              {activeFragment && (
                <FileExplorer
                  files={activeFragment.files as { [path: string]: string }}
                />
              )}
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
