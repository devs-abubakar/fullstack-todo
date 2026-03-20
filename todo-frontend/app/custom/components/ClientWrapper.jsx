"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { SWRConfig } from "swr";
import fetcher from "@/app/lib/api";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger // <--- Import this
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/app/custom/components/Sidebar";
import CreateGroupModal from "@/app/custom/components/CreateGroupModal";

export default function ClientWrapper({ children }) {
  const pathname = usePathname();
  const isPublicPage = pathname === "/login" || pathname === "/signup";
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const swrOptions = {
    fetcher,
    revalidateOnFocus: true,
    refreshInterval: 60000,
    dedupingInterval: 2000,
  };

  if (isPublicPage) return <main>{children}</main>;

  return (
    <SWRConfig value={swrOptions}>
      <SidebarProvider>
        <AppSidebar onOpenModal={() => setIsCreateGroupOpen(true)} />

        <SidebarInset className="flex flex-col min-h-screen bg-slate-50">
          
          {/* MOBILE NAV BAR: This is the missing piece */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <span className="font-bold text-indigo-600 text-sm">TaskMaster</span>
          </header>

          {/* Main Page Content */}
          <div className="flex-1 overflow-y-auto">
             {children}
          </div>
          
        </SidebarInset>

        <CreateGroupModal
          isOpen={isCreateGroupOpen}
          onClose={() => setIsCreateGroupOpen(false)}
        />
      </SidebarProvider>
    </SWRConfig>
  );
}