"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function Navbar() {
  return (
    <nav className="p-4 bg-transparent backdrop-blur-md fixed top-0 left-0 z-50 transition-all duration-200 border-b border-b-primary/10 w-full">
      <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
        <Link href={"/"} className="flex items-center gap-2">
          <Image
            src="/unlovable-logo.png"
            alt="Project Logo"
            width={28}
            height={28}
            className="shrink-0 relative bottom-0.5"
          />
          <span className="font-semibold text-lg">Unlovable</span>
        </Link>

        <SignedOut>
          <div className="flex gap-2">
            <SignUpButton>
              <Button variant={"outline"} size={"sm"}>
                Sign Up
              </Button>
            </SignUpButton>
            <SignInButton>
              <Button size={"sm"}>Sign In</Button>
            </SignInButton>
          </div>
        </SignedOut>

        <SignedIn>
          <UserButton
            showName={true}
            appearance={{
              elements: {
                userButtonAvatarBox: "size-[29px]!",
              },
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}
