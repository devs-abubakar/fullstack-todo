"use client"
import "./globals.css";
import { usePathname } from "next/navigation"
import { Sidebar,SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./custom/components/Sidebar"
export default function RootLayout({ children }) {
  const pathname = usePathname()
  const isPublicPage = pathname === "/login" || pathname === "/signup"

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
              <AppSidebar />
              <main className="flex-1">{children}</main>
            </div>
          </SidebarProvider>
        )}
      </body>
    </html>
  )
}