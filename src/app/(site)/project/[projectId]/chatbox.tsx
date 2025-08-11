"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/client";
import { Fragment } from "@prisma/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import ChatForm from "./chat-form";
import MessageCard from "./message-card";
import MessageLoading from "./message-loading";

type Props = {
  projectId: string;
  activeFragment: Fragment | null;
  setActiveFragment: (fragment: Fragment | null) => void;
};

export default function Chatbox({
  projectId,
  activeFragment,
  setActiveFragment,
}: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const trpc = useTRPC();
  const messages = useSuspenseQuery(
    trpc.message.getAll.queryOptions(
      { projectId },
      {
        refetchInterval: 5000,
      }
    )
  );

  // TODO:
  // useEffect(() => {
  //   const lastAssistantMessageWithFragment = messages.data.findLast(
  //     (msg) => msg.role === "ASSISTANT" && !!msg.fragment
  //   );

  //   if (lastAssistantMessageWithFragment) {
  //     setActiveFragment(lastAssistantMessageWithFragment.fragment);
  //   }
  // }, [messages.data, setActiveFragment]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.data.length]);

  const lastMessage = messages.data[messages.data.length - 1];
  const isLastMessageUser = lastMessage.role === "USER";

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="pt-2 pr-1">
          {messages.data.map((msg) => (
            <MessageCard
              key={msg.id}
              item={msg}
              isActiveFragment={activeFragment?.id === msg.fragment?.id}
              onFragmentClick={(fragment) => setActiveFragment(fragment)}
            />
          ))}
          {isLastMessageUser && <MessageLoading />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="relative p-3 pt-1">
        <div className="absolute -top-6 left-0 right-0 h-6 bg-gradient-to-b from-transparent to-background/70 pointer-events-none" />
        <ChatForm projectId={projectId} />
      </div>
    </div>
  );
}
