"use client";

import { Card } from "@/components/ui/card";
import { MessageWithFragment } from "@/lib/types/project";
import { cn } from "@/lib/utils";
import { Fragment, MessageType } from "@prisma/client";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

type Props = {
  message: MessageWithFragment;
  isActiveFragment: boolean;
  onFragmentSelect: (fragment: Fragment) => void;
};

export default function MessageCard({
  message,
  isActiveFragment,
  onFragmentSelect,
}: Props) {
  if (message.role === "USER") {
    return <UserMessage content={message.content} />;
  }

  return (
    <AssistantMessage
      content={message.content}
      createdAt={message.createdAt}
      fragment={message.fragment}
      isActiveFragment={isActiveFragment}
      messageType={message.type}
      onFragmentSelect={onFragmentSelect}
    />
  );
}

type UserMessageProps = {
  content: string;
};

function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
        <p className="text-sm">{content}</p>
      </Card>
    </div>
  );
}

type AssistantMessageProps = {
  messageType: MessageType;
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentSelect: (fragment: Fragment) => void;
};

function AssistantMessage({
  messageType,
  content,
  fragment,
  createdAt,
  isActiveFragment,
  onFragmentSelect,
}: AssistantMessageProps) {
  const isError = messageType === "ERROR";

  return (
    <div className={cn("flex flex-col group px-2 pb-4")}>
      {/* Header */}
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src="/unlovable-logo.png"
          width={18}
          height={18}
          alt="Logo"
          className="shrink-0"
        />
        <span className="text-sm font-medium">Unlovable</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>

      <div className="pl-8.5 flex flex-col gap-y-4">
        <p
          className={cn("text-sm leading-relaxed", {
            "text-red-500": isError,
          })}
        >
          {content}
        </p>

        {/* Fragment Preview */}
        {fragment && messageType === "RESULT" && (
          <button
            className={cn(
              "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 transition-colors cursor-pointer group",
              {
                "bg-primary text-primary-foreground border-primary hover:bg-primary":
                  isActiveFragment,
              }
            )}
            onClick={() => onFragmentSelect(fragment)}
            aria-label={`View ${fragment.title} preview`}
          >
            <Code2Icon className="size-4 mt-0.5 shrink-0" />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-medium line-clamp-1">
                {fragment.title}
              </span>
              <span className="text-xs opacity-70">Click to preview</span>
            </div>
            <ChevronRightIcon className="size-4 mt-0.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>
    </div>
  );
}
