import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TreeItem } from "@/lib/utils";
import { ChevronRight, File, Folder } from "lucide-react";

type Props = {
  data: TreeItem[];
  selectedFile?: string | null;
  onFileSelect?: (filepath: string) => void;
};

export default function FileTree({ data, selectedFile, onFileSelect }: Props) {
  return (
    <SidebarProvider>
      <Sidebar className="w-full border-0" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-2">
              Files
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, idx) => (
                  <TreeNode
                    key={idx}
                    item={item}
                    selectedFile={selectedFile}
                    onFileSelect={onFileSelect}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}

type TreeNodeProps = {
  item: TreeItem;
  selectedFile?: string | null;
  onFileSelect?: (filepath: string) => void;
  parentPath: string;
};

function TreeNode({
  item,
  selectedFile,
  onFileSelect,
  parentPath,
}: TreeNodeProps) {
  const [name, ...children] = Array.isArray(item) ? item : [item];
  const currentPath = parentPath ? `${parentPath}/${name}` : name;

  // Leaf node (file)
  if (!children.length) {
    const isSelected = selectedFile === currentPath;
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSelected}
          onClick={() => onFileSelect?.(currentPath)}
          className="text-sm"
        >
          <File className="size-4" />
          <span className="truncate">{name}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Directory node
  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="text-sm">
            <ChevronRight className="size-4 transition-transform" />
            <Folder className="size-4" />
            <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {children.map((child, index) => (
              <TreeNode
                key={index}
                item={child}
                selectedFile={selectedFile}
                onFileSelect={onFileSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
