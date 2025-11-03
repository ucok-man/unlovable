"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@prisma/client";
import { ChevronDownIcon } from "lucide-react";
import Image from "next/image";
import DropdownItemNavigation from "./dropdown-item-navigation";
import DropdownItemSetting from "./dropdown-item-setting";

type Props = {
  project: Project | null; // Replace with your actual project type
  theme: string | undefined;
  setTheme: (theme: string) => void;
};

export default function Dropdown({ project, theme, setTheme }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="focus-visible:ring-0 hover:bg-transparent hover:opacity-75 transition-opacity gap-2"
        >
          <Logo />
          <Title name={project?.name} />
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent side="bottom" align="start" className="w-56">
        <DropdownItemNavigation />
        <DropdownMenuSeparator />
        <DropdownItemSetting theme={theme} setTheme={setTheme} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Logo() {
  return (
    <Image
      src="/unlovable-logo.png"
      alt="Project Logo"
      width={18}
      height={18}
      className="shrink-0"
    />
  );
}

function Title({ name }: { name?: string }) {
  return (
    <span className="text-sm font-medium truncate max-w-[200px]">
      {name || "Untitled Project"}
    </span>
  );
}
