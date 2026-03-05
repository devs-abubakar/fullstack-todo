"use client"
import "./globals.css";
import { useState } from "react";
import { usePathname } from "next/navigation"
import { Sidebar,SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./custom/components/Sidebar"
import CreateGroupModal from "./custom/components/CreateGroupModal";
export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isPublicPage = pathname === "/login" || pathname === "/signup"
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        {isPublicPage ? (
          // Public pages get a simple container (No Sidebar!)
          <main>{children}</main>
        ) : (
          // Protected pages get the full Workspace
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar onOpenModal={() => setIsCreateGroupOpen(true)}/>
              <main className="flex-1">{children}</main>
              <CreateGroupModal isOpen={isCreateGroupOpen} onClose={()=>{setIsCreateGroupOpen(false)}}/>
            </div>
          </SidebarProvider>
        )}
      </body>
    </html>
  )
}