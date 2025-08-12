"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Fragment, Message, MessageType } from "@prisma/client";
import { format } from "date-fns";
import { ChevronRightIcon, Code2Icon } from "lucide-react";
import Image from "next/image";

type Props = {
  item: Message & { fragment: Fragment | null };
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
};

export default function MessageCard({
  item,
  isActiveFragment,
  onFragmentClick,
}: Props) {
  if (item.role === "ASSISTANT") {
    return (
      <AssistantMessage
        content={item.content}
        createdAt={item.createdAt}
        fragment={item.fragment}
        isActiveFragment={isActiveFragment}
        messageType={item.type}
        onFragmentClick={onFragmentClick}
      />
    );
  }

  return <UserMessage content={item.content} />;
}

type UserMessageProps = {
  content: string;
};

function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end pb-4 pr-2 pl-10">
      <Card className="rounded-lg bg-muted p-3 shadow-none border-none max-w-[80%] break-words">
        {content}
      </Card>
    </div>
  );
}

type AssistantMessageProp = {
  messageType: MessageType;
  content: string;
  fragment: Fragment | null;
  createdAt: Date;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
};

function AssistantMessage(props: AssistantMessageProp) {
  return (
    <div
      className={cn("flex flex-col group px-2 pb-4", {
        "text-red-700 dark:text-red-500": props.messageType === "ERROR",
      })}
    >
      <div className="flex items-center gap-2 pl-2 mb-2">
        <Image
          src={"/unlovable-logo.png"}
          width={18}
          height={18}
          alt="Unlovable Logo"
          className="shrink-0"
        />

        <span className="text-sm font-medium">Unlovable</span>
        <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
          {format(props.createdAt, "HH:mm 'on' MMM dd, yyyy")}
        </span>
      </div>

      <div className="pl-8.5 flex flex-col gap-y-4">
        <span>{props.content}</span>
        {props.fragment && props.messageType === "RESULT" && (
          <FragmentCard
            fragment={props.fragment}
            isActiveFragment={props.isActiveFragment}
            onFragmentClick={props.onFragmentClick}
          />
        )}
      </div>
    </div>
  );
}

type FragmentCardProp = {
  fragment: Fragment;
  isActiveFragment: boolean;
  onFragmentClick: (fragment: Fragment) => void;
};

function FragmentCard(props: FragmentCardProp) {
  return (
    <button
      className={cn(
        "flex items-start text-start gap-2 border rounded-lg bg-muted w-fit p-3 hover:bg-secondary transition-colors cursor-pointer",
        {
          "bg-primary text-primary-foreground border-primary hover:bg-primary":
            props.isActiveFragment,
        }
      )}
      onClick={() => props.onFragmentClick(props.fragment)}
    >
      <Code2Icon className="size-4 mt-0.5 " />
      <div className="flex flex-col flex-1">
        <span className="text-sm font-medium line-clamp-1">
          {props.fragment.title}
        </span>
        <span className="text-sm">Preview</span>
      </div>
      <div className="flex items-center justify-center mt-0.5">
        <ChevronRightIcon className="size-4" />
      </div>
    </button>
  );
}
