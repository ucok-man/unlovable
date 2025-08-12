"use client";

import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { convertFilesToTreeItem, getLanguageFromExtension } from "@/lib/utils";
import { CopyCheck, CopyIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CodeView from "./code-view";
import TreeView from "./tree-view";

type FileCollection = { [path: string]: string };

type Props = {
  files: FileCollection;
};

export default function FileExplorer({ files }: Props) {
  const [selectedFiles, setSelectedFiles] = useState(() => {
    const filekeys = Object.keys(files);
    return filekeys.length > 0 ? filekeys[0] : null;
  });

  const [copied, setCopied] = useState(false);

  const treeData = useMemo(() => convertFilesToTreeItem(files), [files]);

  const handleFileSelect = useCallback(
    (filepath: string) => {
      if (files[filepath]) {
        setSelectedFiles(filepath);
      }
    },
    [files]
  );

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  console.log({
    selected: selectedFiles,
    content: files[selectedFiles ? selectedFiles : ""],
  });

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={30} minSize={30} className="bg-sidebar">
        <TreeView
          data={treeData}
          value={selectedFiles}
          onSelect={handleFileSelect}
        />
      </ResizablePanel>
      <ResizableHandle className="hover:bg-primary transition-colors" />
      <ResizablePanel defaultSize={70} minSize={50} className="bg-sidebar">
        {selectedFiles && files[selectedFiles] ? (
          <div className="size-full flex flex-col">
            <div className="border-b bg-sidebar px-4 py-2 flex justify-between items-center gap-x-2">
              <div> TODO:File Breadcump </div>

              <Hint text="Click to copy" side="bottom" align="start">
                <Button
                  size={"sm"}
                  variant={"outline"}
                  onClick={() => handleCopy(files[selectedFiles])}
                  disabled={copied}
                >
                  {copied ? <CopyCheck /> : <CopyIcon />}
                </Button>
              </Hint>
            </div>

            <div className="flex-1 overflow-auto">
              <CodeView
                code={files[selectedFiles]}
                lang={getLanguageFromExtension(selectedFiles)}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Select a file to view it&apos;s content</p>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
