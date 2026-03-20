"use client"
import { useRouter, useSearchParams } from "next/navigation"
import useSWR from "swr"
import { useGroups } from "@/hooks/useData"
import {
  LayoutDashboard, Plus, Hash, Loader2, Users, LogOut, User, Settings, ChevronUp
} from "lucide-react"

import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader
} from "@/components/ui/sidebar"

import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetcher } from "../../lib/api"

export function AppSidebar({ onOpenModal }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeGroupId = searchParams.get("group")

  const { groups, isLoading } = useGroups()
  const { data: user } = useSWR("/me/", fetcher)

  const navigateToGroup = (id) => {
    if (id) router.push(`/dashboard?group=${id}`)
    else router.push("/dashboard")
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/login")
  }

  const initials = user?.username?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-slate-200">
      
      {/* HEADER: Cleaned up for mobile/icon state */}
      <SidebarHeader className="h-16 border-b border-slate-100 flex items-center px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-100">
            T
          </div>
          <span className="font-bold text-slate-800 text-lg group-data-[collapsible=icon]:hidden">
            TaskMaster
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* NAVIGATION */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2">Menu</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => navigateToGroup(null)}
                isActive={!activeGroupId}
                tooltip="Dashboard"
                className="h-11"
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* WORKSPACES */}
        <SidebarGroup>
          <div className="flex items-center justify-between px-2 mb-2">
            <SidebarGroupLabel className="p-0">Workspaces</SidebarGroupLabel>
            
            {/* Action button for adding workspace */}
            <button 
              onClick={onOpenModal}
              className="p-1 hover:bg-slate-100 rounded-md text-slate-500 group-data-[collapsible=icon]:hidden"
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Quick Add Button (Icon State) */}
          <SidebarMenu className="mb-2">
             <SidebarMenuItem className="group-data-[collapsible=icon]:block hidden">
                <SidebarMenuButton onClick={onOpenModal} tooltip="New Workspace" className="text-indigo-600">
                  <Plus size={20} />
                </SidebarMenuButton>
             </SidebarMenuItem>
          </SidebarMenu>

          <SidebarMenu>
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-400" size={18} /></div>
            ) : groups?.length > 0 ? (
              groups.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton
                    onClick={() => navigateToGroup(group.id)}
                    isActive={activeGroupId === String(group.id)}
                    tooltip={group.name}
                    className="h-10"
                  >
                    <Hash size={18} className={activeGroupId === String(group.id) ? "text-indigo-600" : "text-slate-400"} />
                    <span className="truncate font-medium">{group.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="text-center py-4 group-data-[collapsible=icon]:hidden">
                <p className="text-xs text-slate-400">No workspaces yet</p>
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER: Improved Dropdown for Mobile */}
      <SidebarFooter className="p-2 border-t border-slate-100">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="bg-indigo-600 text-white rounded-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{user.username}</span>
                  <span className="truncate text-xs text-slate-500">{user.email || 'Pro Plan'}</span>
                </div>
                <ChevronUp className="ml-auto group-data-[collapsible=icon]:hidden" size={14} />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side="top" align="end" sideOffset={4}>
               {/* Dropdown Items... */}
               <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                 <LogOut size={16} className="mr-2" /> Logout
               </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}