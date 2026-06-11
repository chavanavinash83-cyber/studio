
"use client";

import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  ClipboardCheck,
  Wrench,
  Settings,
  ShieldCheck,
  Building2
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Asset Inventory",
    url: "/inventory",
    icon: Package,
  },
  {
    title: "Branch Transfers",
    url: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    title: "Maintenance Ledger",
    url: "/repairs",
    icon: Wrench,
  },
  {
    title: "AI Audit Analyst",
    url: "/audit",
    icon: ShieldCheck,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold tracking-tight text-white">
              SampattiPro
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Enterprise Assets
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 font-medium px-4 py-2 uppercase text-[10px] tracking-widest">
            Main Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      "mx-2 rounded-lg py-6 transition-all",
                      pathname === item.url 
                        ? "bg-sidebar-primary text-white shadow-md" 
                        : "hover:bg-sidebar-accent text-sidebar-foreground/80 hover:text-white"
                    )}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-sidebar-foreground/60 mb-2">Branches</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
            <div className="bg-sidebar-background rounded px-2 py-1 text-center">KHO</div>
            <div className="bg-sidebar-background rounded px-2 py-1 text-center">MNJ</div>
            <div className="bg-sidebar-background rounded px-2 py-1 text-center">SLT</div>
            <div className="bg-sidebar-background rounded px-2 py-1 text-center">GHO</div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
