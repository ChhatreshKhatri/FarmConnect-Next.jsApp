import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create your FarmConnect account to start managing livestock and connecting with suppliers.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
