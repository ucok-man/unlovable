// components/project/ProjectHeader.tsx
"use client";

import { useProjectData } from "@/hooks/use-project";
import { useTheme } from "next-themes";
import Dropdown from "./dropdown";

type Props = {
  projectId: string;
};

export default function ProjectHeader({ projectId }: Props) {
  const { project } = useProjectData(projectId);
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex items-center justify-between p-3 border-b bg-sidebar/50 backdrop-blur-sm">
      <Dropdown project={project} theme={theme} setTheme={setTheme} />
    </header>
  );
}
