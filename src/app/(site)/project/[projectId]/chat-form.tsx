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
import z from "zod";

type Props = {
  projectId: string;
};

const formSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(1, { message: "Prompt message is required" })
    .max(1000, { message: "Prompt message is too long" }),
});

type FormData = z.infer<typeof formSchema>;

export default function ChatForm({ projectId }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const queryClient = useQueryClient();

  const trpc = useTRPC();
  const create = useMutation(
    trpc.message.create.mutationOptions({
      onSuccess: () => {
        form.reset();
        queryClient.refetchQueries(
          trpc.message.getAll.queryOptions({ projectId })
        );

        // TODO: Invalidate usage status
      },
      onError: (err) => {
        // TODO: If error on token, redirect to pricing page!
        toast.error(err.message ?? "Something went wrong!");
      },
    })
  );

  const onSubmit = async (data: FormData) => {
    create.mutate({
      prompt: data.prompt,
      projectId: projectId,
    });
  };

  const [isFocused, setIsFocused] = useState(false);
  const showUsage = false;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn(
          "relative border p-4 pt-1 rounded-xl bg-sidebar dark:bg-sidebar transition-all",
          {
            "": isFocused,
            "": showUsage,
          }
        )}
      >
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <TextAreaAutoResize
              {...field}
              disabled={create.isPending}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              minRows={2}
              maxRows={8}
              className="pt-4 resize-none border-none w-full outline-0 bg-transparent"
              placeholder="What would you like to build?"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)(e);
                }
              }}
            />
          )}
        />

        <div className="flex gap-x-2 items-end justify-between pt-2">
          <div className="text-[10px] text-muted-foreground font-mono">
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span>&#8984;</span> Enter
            </kbd>
            &nbsp;to submit
          </div>

          <Button
            disabled={!form.formState.isValid || create.isPending}
            className={cn("size-8 rounded-full transition-all", {
              "bg-muted-foreground":
                !form.formState.isValid || create.isPending,
            })}
          >
            {create.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUpIcon className="size-4" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
