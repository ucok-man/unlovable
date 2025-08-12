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
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TreeItem } from "@/lib/utils";
import { ChevronRight, File, Folder } from "lucide-react";

type Props = {
  data: TreeItem[];
  value?: string | null;
  onSelect?: (filepath: string) => void;
};

export default function TreeView({ data, value, onSelect }: Props) {
  return (
    <SidebarProvider>
      <Sidebar className="w-full" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {data.map((item, idx) => (
                  <Tree
                    key={idx}
                    item={item}
                    selectedValue={value}
                    onSelect={onSelect}
                    parentPath=""
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  );
}

type TreeProps = {
  item: TreeItem;
  selectedValue?: string | null;
  onSelect?: (filepath: string) => void;
  parentPath: string;
};

function Tree(props: TreeProps) {
  const [name, ...items] = Array.isArray(props.item)
    ? props.item
    : [props.item];

  const currentPath = props.parentPath ? `${props.parentPath}/${name}` : name;

  if (!items.length) {
    const isSelected = props.selectedValue === currentPath;
    return (
      <SidebarMenuButton
        isActive={isSelected}
        className="data-[active=true]:bg-transparent"
        onClick={() => props.onSelect?.(currentPath)}
      >
        <File />
        <span className="truncate">{name}</span>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuItem>
      <Collapsible
        defaultOpen
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder /> <span className="truncate">{name}</span>
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((sub, index) => (
              <Tree
                key={index}
                item={sub}
                selectedValue={props.selectedValue}
                onSelect={props.onSelect}
                parentPath={currentPath}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
