import Navbar from "@/components/navbar";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
