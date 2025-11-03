import { ChevronRight } from "lucide-react";

type Props = {
  filepath: string;
};

export default function FileBreadcrumb({ filepath }: Props) {
  const segments = filepath.split("/");

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground min-w-0">
      {segments.map((segment, index) => (
        <div key={index} className="flex items-center gap-1 min-w-0">
          {index > 0 && <ChevronRight className="size-3 shrink-0" />}
          <span
            className={`truncate ${
              index === segments.length - 1 ? "text-foreground font-medium" : ""
            }`}
          >
            {segment}
          </span>
        </div>
      ))}
    </div>
  );
}
