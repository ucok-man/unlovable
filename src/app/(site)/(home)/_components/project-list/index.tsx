"use client";

import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProjectList() {
  const trpc = useTRPC();
  const projects = useQuery(trpc.project.getAll.queryOptions());

  return (
    <div className="w-full flex flex-col gap-y-9">
      <h2 className="text-xl md:text-2xl font-semibold">My Workspace</h2>

      {!projects.data?.length ? (
        <EmptyState
          title="Oops! No projects found"
          description="Start creating new one"
          icon={<Package />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {projects.data.map((p) => (
            <Button
              key={p.id}
              variant={"outline"}
              className="font-normal h-auto justify-start w-full text-start p-4 rounded-lg hover:ring-2 hover:ring-primary/50"
              asChild
            >
              <Link href={`/project/${p.id}`}>
                <div className="flex items-center gap-x-4">
                  <Image
                    src={"/unlovable-logo.png"}
                    alt="User"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                  <div className="flex flex-col">
                    <h3 className="truncate font-medium">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNowStrict(p.updatedAt, {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
