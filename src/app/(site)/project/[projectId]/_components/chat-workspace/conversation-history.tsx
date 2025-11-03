import { MessageWithFragment } from "@/lib/types/project";
import { Fragment } from "@prisma/client";
import MessageCard from "./message-card";

type Props = {
  messages: MessageWithFragment[];
  activeFragment: Fragment | null;
  onFragmentSelect: (fragment: Fragment | null) => void;
};

export default function ConversationHistory({
  messages,
  activeFragment,
  onFragmentSelect,
}: Props) {
  return (
    <>
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          isActiveFragment={activeFragment?.id === message.fragment?.id}
          onFragmentSelect={onFragmentSelect}
        />
      ))}
    </>
  );
}
