
"use client";

import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Wrench,
  Settings,
  Building2,
  Tags,
  MapPin,
  Briefcase,
  Store,
  Users,
  ChevronRight,
  Calculator,
  FileText,
  Database,
  LogOut,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "./ui/button";

const mainItems = [
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
    title: "Depreciation Engine",
    url: "/depreciation",
    icon: Calculator,
  },
  {
    title: "Asset Transfer",
    url: "/transfers",
    icon: ArrowLeftRight,
  },
  {
    title: "Repair Module",
    url: "/repairs",
    icon: Wrench,
  },
  {
    title: "System Reports",
    url: "/reports",
    icon: FileText,
  },
  {
    title: "Data Backup",
    url: "/backup",
    icon: Database,
  },
];

const masterItems = [
  {
    title: "Asset Categories",
    url: "/master/categories",
    icon: Tags,
  },
  {
    title: "Branches",
    url: "/master/branches",
    icon: MapPin,
  },
  {
    title: "Departments",
    url: "/master/departments",
    icon: Briefcase,
  },
  {
    title: "Vendors",
    url: "/master/vendors",
    icon: Store,
  },
  {
    title: "System Users",
    url: "/master/users",
    icon: Users,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary shadow-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold tracking-tight text-white">
              AMBIKA AMS
            </h1>
            <p className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">
              Enterprise Assets
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-bold px-4 py-2 uppercase text-sm tracking-widest">
            MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      "mx-2 rounded-lg py-6 transition-all",
                      pathname === item.url 
                        ? "bg-sidebar-primary text-white shadow-md" 
                        : "hover:bg-sidebar-accent text-yellow-400 hover:text-white"
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

        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-bold px-4 py-2 uppercase text-sm tracking-widest">
            MASTERS
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="mx-2 rounded-lg py-6 text-yellow-400 hover:text-white hover:bg-sidebar-accent">
                      <Settings className="h-5 w-5" />
                      <span className="font-medium">Master Data</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="mt-1">
                      {masterItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={pathname === subItem.url}
                            className={cn(
                              "mx-4 rounded-lg py-5 transition-all",
                              pathname === subItem.url
                                ? "bg-sidebar-accent/50 text-white"
                                : "text-yellow-400/80 hover:text-white hover:bg-sidebar-accent/30"
                            )}
                          >
                            <Link href={subItem.url}>
                              <subItem.icon className="h-4 w-4" />
                              <span className="text-sm">{subItem.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-4">
        {user && (
          <div className="flex items-center gap-3 px-2">
             <UserCircle className="h-8 w-8 text-yellow-400" />
             <div className="flex flex-col">
               <span className="text-xs font-bold text-white truncate max-w-[120px]">{user.displayName || "Administrator"}</span>
               <span className="text-[10px] text-sidebar-foreground/60 truncate max-w-[120px]">{user.email}</span>
             </div>
          </div>
        )}
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start text-yellow-400 hover:text-white hover:bg-sidebar-accent gap-3 px-2 py-6"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </Button>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <p className="text-xs text-sidebar-foreground/60 mb-2">System Status</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-white uppercase tracking-tight">Active Node: IND-WEST-1</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
