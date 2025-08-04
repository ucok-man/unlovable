"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import ChatForm from "./chat-form";
import MessageCard from "./message-card";

type Props = {
  projectId: string;
};

export default function Chatbox({ projectId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  const trpc = useTRPC();
  const messages = useSuspenseQuery(
    trpc.message.getAll.queryOptions({ projectId })
  );

  useEffect(() => {
    const lastAssistantMessage = messages.data.findLast(
      (msg) => msg.role === "ASSISTANT"
    );

    if (lastAssistantMessage) {
      // TODO: Set Active Fragment
    }
  }, [messages.data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, [messages.data.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ScrollArea className="flex-1 min-h-0">
        <div className="pt-2 pr-1">
          {messages.data.map((msg) => (
            <MessageCard
              key={msg.id}
              item={msg}
              isActiveFragment={false}
              onFragmentClick={() => {}}
            />
          ))}
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
