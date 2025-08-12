/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getLanguageFromExtension(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ?? "text";
}

export type TreeItem = string | [string, ...TreeItem[]];
export function convertFilesToTreeItem(files: {
  [path: string]: string;
}): TreeItem[] {
  const tree: Record<string, any> = {};
  const sortedPaths = Object.keys(files).sort();

  for (const filepath of sortedPaths) {
    const parts = filepath.split("/");
    let current = tree;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    const filename = parts[parts.length - 1];
    current[filename] = null;
  }

  const convertNode = (
    node: Record<string, any>,
    name?: string
  ): TreeItem[] | TreeItem => {
    const entries = Object.entries(node);
    if (!entries.length) {
      return name || "";
    }

    const children: TreeItem[] = [];
    for (const [key, value] of entries) {
      if (value === null) {
        children.push(key);
      } else {
        const subtree = convertNode(value, key);
        if (Array.isArray(subtree)) {
          children.push([key, ...subtree]);
        } else {
          children.push([key, subtree]);
        }
      }
    }

    return children;
  };

  const result = convertNode(tree);
  return Array.isArray(result) ? result : [result];
}
