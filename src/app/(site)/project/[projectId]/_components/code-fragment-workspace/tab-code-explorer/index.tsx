"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useClipboard } from "@/hooks/use-clipboard";
import { FileCollection } from "@/lib/types/project";
import { convertFilesToTreeItem, getLanguageFromExtension } from "@/lib/utils";
import { Code2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import CodeViewer from "./code-viewer";
import FileTree from "./file-tree";

type Props = {
  files: FileCollection;
};

export default function TabCodeExplorer({ files }: Props) {
  const fileKeys = Object.keys(files);
  const [selectedFile, setSelectedFile] = useState(() =>
    fileKeys.length > 0 ? fileKeys[0] : null
  );

  const { copied, copyToClipboard } = useClipboard();
  const treeData = useMemo(() => convertFilesToTreeItem(files), [files]);

  const handleFileSelect = useCallback(
    (filepath: string) => {
      if (files[filepath]) {
        setSelectedFile(filepath);
      }
    },
    [files]
  );

  const handleCopyCode = () => {
    if (selectedFile && files[selectedFile]) {
      copyToClipboard(files[selectedFile]);
    }
  };

  const selectedFileContent = selectedFile ? files[selectedFile] : null;
  const selectedFileLanguage = selectedFile
    ? getLanguageFromExtension(selectedFile)
    : "text";

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={25} minSize={25} className="bg-sidebar">
        <FileTree
          data={treeData}
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
        />
      </ResizablePanel>

      <ResizableHandle className="hover:bg-primary/20 transition-colors" />

      <ResizablePanel defaultSize={75} minSize={50} className="bg-sidebar">
        {selectedFileContent ? (
          <div className="flex flex-col h-full">
            <CodeViewer
              code={selectedFileContent}
              filepath={selectedFile!}
              onCopy={handleCopyCode}
              copied={copied}
              language={selectedFileLanguage}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Code2 className="size-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a file to view its contents</p>
            </div>
          </div>
        )}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
