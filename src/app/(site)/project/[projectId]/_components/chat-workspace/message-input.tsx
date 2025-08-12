import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUpIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import TextAreaAutoResize from "react-textarea-autosize";
import { toast } from "sonner";
import { z } from "zod";

const messageSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message is too long (max 1000 characters)" }),
});

type MessageFormData = z.infer<typeof messageSchema>;

type Props = {
  projectId: string;
};

export default function MessageInput({ projectId }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: { prompt: "" },
  });

  const sendMessage = useMutation(
    trpc.message.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.refetchQueries(
          trpc.message.getAll.queryOptions({ projectId })
        );
      },
      onError: (error) => {
        toast.error(error.message || "Failed to send message");
      },
    })
  );

  const handleSubmit = (data: MessageFormData) => {
    sendMessage.mutate({
      prompt: data.prompt,
      projectId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)(e);
    }
  };

  const isSubmitDisabled = !form.formState.isValid || sendMessage.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar transition-all",
          { "ring-2 ring-ring": isFocused }
        )}
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <TextAreaAutoResize
              {...field}
              disabled={sendMessage.isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-0 bg-transparent placeholder:text-muted-foreground"
              placeholder="What would you like to build?"
            />
          )}
        />

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <KeyboardShortcutHint />
          <SubmitButton
            disabled={isSubmitDisabled}
            isLoading={sendMessage.isPending}
          />
        </div>
      </form>
    </Form>
  );
}

function KeyboardShortcutHint() {
  return (
    <div className="text-[10px] text-muted-foreground font-mono">
      <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span>⌘</span> Enter
      </kbd>
      &nbsp;to send
    </div>
  );
}

interface SubmitButtonProps {
  disabled: boolean;
  isLoading: boolean;
}

function SubmitButton({ disabled, isLoading }: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      size="icon"
      className={cn("size-8 rounded-full transition-all", {
        "bg-muted-foreground": disabled,
      })}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ArrowUpIcon className="size-4" />
      )}
    </Button>
  );
}
