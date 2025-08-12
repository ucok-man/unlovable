"use client";

import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { SunMoonIcon } from "lucide-react";

type Props = {
  theme: string | undefined;
  setTheme: (theme: string) => void;
};

export default function DropdownItemSetting({ theme, setTheme }: Props) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="flex items-center gap-2">
        <SunMoonIcon className="size-4 text-muted-foreground" />
        <span>Theme</span>
      </DropdownMenuSubTrigger>

      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <ThemeOption value="light" label="Light" />
            <ThemeOption value="dark" label="Dark" />
            <ThemeOption value="system" label="System" />
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}

type ThemeOptionProps = {
  value: string;
  label: string;
};

function ThemeOption({ value, label }: ThemeOptionProps) {
  return (
    <DropdownMenuRadioItem value={value} className="flex items-center gap-2">
      <ThemeIcon theme={value} />
      <span>{label}</span>
    </DropdownMenuRadioItem>
  );
}

type ThemeIconProps = {
  theme: string;
};

function ThemeIcon({ theme }: ThemeIconProps) {
  const iconClass = "size-4";

  switch (theme) {
    case "light":
      return <span className={`${iconClass} text-yellow-500`}>☀️</span>;
    case "dark":
      return <span className={`${iconClass} text-blue-400`}>🌙</span>;
    case "system":
      return <span className={`${iconClass} text-gray-500`}>💻</span>;
    default:
      return null;
  }
}
