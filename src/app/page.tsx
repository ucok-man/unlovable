"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const [input, setInput] = useState("");

  const trpc = useTRPC();

  const messages = useQuery(trpc.message.getAll.queryOptions());

  const create = useMutation(
    trpc.message.create.mutationOptions({
      onSuccess: () => {
        setInput("");
        toast.success("OK");
      },
      onError: (err) => {
        toast.error(err.message ?? "Something went wrong!");
      },
    })
  );

  console.log({ messages: messages.data });

  return (
    <div className="w-full flex justify-center items-center min-h-screen bg-stone-100">
      <div className="max-w-lg w-full mx-auto space-y-4">
        <Textarea
          className="outline-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button
          onClick={() => {
            create.mutate({ value: input });
          }}
        >
          Send
        </Button>
      </div>
    </div>
  );
}
