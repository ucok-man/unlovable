"use client";

import { PricingTable } from "@clerk/nextjs";
import Image from "next/image";

export default function PricingPage() {
  return (
    <div className="flex flex-col max-w-3xl mx-auto size-full">
      <section className="space-y-6 flex flex-col h-[calc(100vh-1px)] justify-center items-center">
        <div className="flex flex-col items-center">
          <Image
            src={"/unlovable-logo.png"}
            alt="Logo"
            width={50}
            height={50}
            // className="hidden md:block"
          />
        </div>

        <h1 className="text-xl md:text-3xl font-bold text-center">Pricing</h1>
        <p className="text-muted-foreground text-center text-sm md:text-base">
          Choose the plan that fits your need
        </p>
        <PricingTable
          appearance={{
            elements: {
              pricingTableCard: "border! shadow-none! rounded-lg!",
            },
          }}
        />
      </section>
    </div>
  );
}
