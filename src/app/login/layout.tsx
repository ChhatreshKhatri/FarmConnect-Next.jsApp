import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your FarmConnect account to access farm management tools and connect with suppliers.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
