"use client"
import "./globals.css";
import { useState,Suspense } from "react";
import fetcher from "./lib/api";

import { SWRConfig } from "swr";
import { usePathname } from "next/navigation"
import { Sidebar,SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./custom/components/Sidebar"
import CreateGroupModal from "./custom/components/CreateGroupModal";
export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isPublicPage = pathname === "/login" || pathname === "/signup"
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const swrOptions = {
    fetcher,
    revalidateOnFocus: true,
    refreshInterval: 60000, // Global re-sync every 1 minute
    dedupingInterval: 2000, // Prevent multiple identical requests within 2 seconds
    errorRetryCount: 3,
  };

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <Suspense>
          
        {isPublicPage ? (
          // Public pages get a simple container (No Sidebar!)
          <main>{children}</main>
        ) : (
          // Protected pages get the full Workspace
          <SWRConfig value={swrOptions}>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar onOpenModal={() => setIsCreateGroupOpen(true)}/>
              <main className="flex-1">{children}</main>
              <CreateGroupModal isOpen={isCreateGroupOpen} onClose={()=>{setIsCreateGroupOpen(false)}}/>
            </div>
          </SidebarProvider>
          </SWRConfig>
        )}
        </Suspense>
      </body>
    </html>
  )
}