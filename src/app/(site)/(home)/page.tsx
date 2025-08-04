"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const router = useRouter();
  const [isRedirecting, startTransition] = useTransition();

  const [input, setInput] = useState("");

  const trpc = useTRPC();

  const messages = useQuery(trpc.message.getAll.queryOptions());
  console.log({ messages: messages.data });

  const create = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: (project) => {
        setInput("");
        startTransition(() => {
          router.push(`/project/${project.id}`);
        });
      },
      onError: (err) => {
        toast.error(err.message ?? "Something went wrong!");
      },
    })
  );

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
            create.mutate({ prompt: input });
          }}
        >
          {create.isPending
            ? "Submiting..."
            : isRedirecting
            ? "Redirecting..."
            : "Submit"}
        </Button>
      </div>
    </div>
  );
}
