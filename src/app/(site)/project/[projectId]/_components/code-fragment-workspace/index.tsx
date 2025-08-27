"use client";

import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserButton } from "@clerk/nextjs";
import { Fragment } from "@prisma/client";
import { Code2, Crown, EyeIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TabCodeExplorer from "./tab-code-explorer";
import TabFragmentPreview from "./tab-fragment-preview";

type Props = {
  fragment: Fragment | null;
  onFragmentChange: (fragment: Fragment | null) => void;
};

export default function CodeFragmentWorkspace({ fragment }: Props) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");

  if (!fragment) {
    return (
      <EmptyState
        title="No fragment selected"
        description="Select a code fragment from the chat to preview it here"
        icon={<Code2 className="size-8" />}
      />
    );
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as "preview" | "code")}
      className="h-full flex flex-col gap-0"
    >
      <ViewerHeader />

      <TabsContent value="preview" className="flex-1 min-h-0 m-0">
        <TabFragmentPreview fragment={fragment} />
      </TabsContent>

      <TabsContent value="code" className="flex-1 min-h-0 m-0">
        <TabCodeExplorer files={fragment.files as Record<string, string>} />
      </TabsContent>
    </Tabs>
  );
}

function ViewerHeader() {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-sidebar">
      <TabsList className="grid grid-cols-2 w-auto">
        <TabsTrigger value="preview" className="flex items-center gap-2">
          <EyeIcon className="size-4" />
          <span>Preview</span>
        </TabsTrigger>
        <TabsTrigger value="code" className="flex items-center gap-2">
          <Code2 className="size-4" />
          <span>Code</span>
        </TabsTrigger>
      </TabsList>

      <div className="flex items-center gap-2">
        <Button asChild size="sm" variant="default">
          <Link href="/pricing" className="flex items-center gap-2">
            <Crown className="size-4" />
            <span>Upgrade</span>
          </Link>
        </Button>

        <UserButton
          showName={false}
          appearance={{
            elements: {
              userButtonBox: "rounded-md!",
              userButtonAvatarBox: "rounded-md! size-8!",
              userButtonTrigger: "rounded-md!",
            },
          }}
        />
      </div>
    </div>
  );
}
