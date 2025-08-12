"use client";

import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import { useEffect } from "react";
import "./prism-theme.css";

type Props = {
  code: string;
  lang: string;
};

export default function CodeView({ code, lang }: Props) {
  useEffect(() => {
    Prism.highlightAll();
  }, [code]);

  console.log({ lang });
  return (
    <pre className="p-2 bg-transparent border-none rounded-none m-0 text-xs">
      <code className={`language-${lang}`}>{code}</code>
    </pre>
  );
}
