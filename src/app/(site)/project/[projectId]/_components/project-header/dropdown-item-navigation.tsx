"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronLeft, Home } from "lucide-react";
import Link from "next/link";

export default function DropdownItemNavigation() {
  return (
    <>
      <DropdownMenuItem asChild>
        <Link href="/" className="flex items-center gap-2">
          <Home className="size-4" />
          <span>Dashboard</span>
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild>
        <Link href="/" className="flex items-center gap-2">
          <ChevronLeft className="size-4" />
          <span>Back to Projects</span>
        </Link>
      </DropdownMenuItem>
    </>
  );
}
