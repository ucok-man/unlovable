"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, experimental__simple } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function AuthProvider({ children }: Props) {
  const { theme: currentTheme, systemTheme } = useTheme();

  const isLight =
    (currentTheme === "system" && systemTheme === "light") ||
    currentTheme === "light";

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: isLight ? "#c96442" : "#d97757",
        },
        theme: isLight ? experimental__simple : dark,
      }}
    >
      {children}
    </ClerkProvider>
  );
}
