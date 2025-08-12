"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useProjectData } from "@/hooks/use-project";
import { MessageWithFragment } from "@/lib/types/project";
import { Fragment } from "@prisma/client";
import ConversationHistory from "./conversation-history";
import LoadingIndicator from "./loading-indicator";
import MessageInput from "./message-input";

type Props = {
  projectId: string;
  activeFragment: Fragment | null;
  onFragmentSelect: (fragment: Fragment | null) => void;
};

export default function ChatWorkspace({
  projectId,
  activeFragment,
  onFragmentSelect,
}: Props) {
  const { messages } = useProjectData(projectId);
  const bottomRef = useAutoScroll<HTMLDivElement>(messages.length);

  const lastMessage = messages[messages.length - 1];
  const shouldShowLoading = lastMessage?.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="pt-2 pr-1">
          <ConversationHistory
            messages={messages as MessageWithFragment[]}
            activeFragment={activeFragment}
            onFragmentSelect={onFragmentSelect}
          />
          {shouldShowLoading && <LoadingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <MessageInput projectId={projectId} />
      </div>
    </div>
  );
}
