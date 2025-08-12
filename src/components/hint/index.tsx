import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

type Props = {
  children: React.ReactNode;
  text: string;
  side?: "top" | "right" | "left" | "bottom";
  align?: "start" | "center" | "end";
};

export default function Hint({
  children,
  text,
  side = "top",
  align = "center",
}: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
