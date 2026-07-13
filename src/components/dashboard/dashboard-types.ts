import type { ElementType, ReactNode } from "react";

export type DashboardRole = "ADMIN" | "SELLER";

export type DashboardUser = {
  name: string;
  email: string;
  image?: string | null;
  role: DashboardRole;
};

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ElementType;
  exact?: boolean;
};

export type DashboardBreadcrumb = {
  label: string;
  href?: string;
};

export type DashboardAction = {
  label: string;
  href?: string;
  icon?: ElementType;
  variant?: "primary" | "outline";
  onClick?: () => void;
};

export type DashboardShellProps = {
  children: ReactNode;
  user: DashboardUser;
  label: string;
  navigation: DashboardNavItem[];
  onLogout: () => void;
};
