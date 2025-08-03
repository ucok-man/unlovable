"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function HomePage() {
  const [input, setInput] = useState("");

  const trpc = useTRPC();
  const invoke = useMutation(
    trpc.invoke.mutationOptions({
      onSuccess: () => {
        setInput("");
        toast.success("OK");
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
            invoke.mutate({ value: input });
          }}
        >
          Invoke
        </Button>
      </div>
    </div>
  );
}
