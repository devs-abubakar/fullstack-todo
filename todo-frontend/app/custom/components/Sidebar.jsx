"use client"
import { useEffect, useState } from "react"
import { LayoutDashboard, Users, Hash, LogOut } from "lucide-react"
import { 
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, 
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter 
} from "@/components/ui/sidebar"
import api from "../../lib/api" // Your axios instance

export function AppSidebar() {
const [groups, setGroups] = useState([]) // Initialize as empty array (MANDATORY)

useEffect(() => {
  const fetchGroups = async () => {
    // 🚨 CHECK: Don't call the API if there is no token yet
    const token = localStorage.getItem("accessToken");
    if (!token) return; 

    try {
      const res = await api.get("/groups/")
      if (res.data && Array.isArray(res.data.results)) {
        setGroups(res.data.results); 
      } else if (Array.isArray(res.data)) {
        setGroups(res.data);
      } 
    } catch (err) {
      console.error("Failed to fetch groups", err);
    }
  }

  fetchGroups()
}, [])
const handleLogout=()=>{
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.clear()
  window.location.href='/login'
}

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        {/* SECTION 1: PERSONAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <LayoutDashboard />
                  <span>My Private Tasks</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* SECTION 2: COLLABORATIVE GROUPS */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarMenu>
            {groups?.map((group) => (
              <SidebarMenuItem key={group.id}>
                <SidebarMenuButton asChild>
                  {/* We will use this ID to filter tasks later */}
                  <button onClick={() => window.location.href = `/dashboard?group=${group.id}`}>
                    <Hash className="text-blue-500" />
                    <span>{group.name}</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
         {/* LOGOUT BUTTON HERE */}
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                    <LogOut className="text-red-500" />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}