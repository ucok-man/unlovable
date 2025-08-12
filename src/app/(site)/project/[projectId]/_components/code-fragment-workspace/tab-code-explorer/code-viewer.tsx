"use client";

import Hint from "@/components/hint";
import { Button } from "@/components/ui/button";
import { CopyCheck, CopyIcon } from "lucide-react";
import Prism from "prismjs";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { useEffect } from "react";
import FileBreadcrumb from "./file-breadcump";
import "./prism-theme.css";

type Props = {
  code: string;
  language: string;
  filepath: string;
  onCopy: () => void;
  copied: boolean;
};

export default function CodeViewer({
  code,
  language,
  filepath,
  onCopy,
  copied,
}: Props) {
  useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  return (
    <>
      <div className="overflow-auto">
        <div className="flex items-center justify-between p-3 border-b bg-sidebar">
          <FileBreadcrumb filepath={filepath} />
          <Hint text={copied ? "Copied!" : "Copy code"}>
            <Button
              size="sm"
              variant="outline"
              onClick={onCopy}
              disabled={copied}
            >
              {copied ? (
                <CopyCheck className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </Button>
          </Hint>
        </div>
      </div>

      <div className="flex-1 relative overflow-auto">
        <pre className="p-4 bg-transparent border-none rounded-none m-0 text-xs leading-relaxed">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </>
  );
}
