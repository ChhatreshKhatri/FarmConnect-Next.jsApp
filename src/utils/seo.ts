import { Metadata } from "next";

interface SEOProps {
  title: string;
  description: string;
  path?: string;
}

export function generatePageMetadata({ title, description, path = "/" }: SEOProps): Metadata {
  const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${path}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | FarmConnect`,
      description,
      url,
    },
    twitter: {
      title: `${title} | FarmConnect`,
      description,
    },
  };
}

// Common page metadata
export const pageMetadata = {
  login: generatePageMetadata({
    title: "Login",
    description: "Sign in to your FarmConnect account to access farm management tools and connect with suppliers.",
    path: "/login",
  }),

  register: generatePageMetadata({
    title: "Register",
    description: "Create your FarmConnect account to start managing livestock and connecting with suppliers.",
    path: "/register",
  }),

  ownerDashboard: generatePageMetadata({
    title: "Farm Owner Dashboard",
    description: "Manage your livestock, track medicine and feed inventory, and connect with suppliers.",
    path: "/owner",
  }),

  supplierDashboard: generatePageMetadata({
    title: "Supplier Dashboard",
    description: "Manage your inventory, fulfill farmer requests, and expand your reach to livestock owners.",
    path: "/supplier",
  }),

  livestock: generatePageMetadata({
    title: "Livestock Management",
    description: "Track and manage your livestock inventory and monitor animal health records.",
    path: "/owner/livestock",
  }),

  medicine: generatePageMetadata({
    title: "Medicine Management",
    description: "Track livestock medicine inventory and manage veterinary supplies.",
    path: "/owner/medicine",
  }),

  feed: generatePageMetadata({
    title: "Feed Management",
    description: "Monitor feed inventory and ensure optimal nutrition for your livestock.",
    path: "/owner/feed",
  }),
};
