"use client"
import { useEffect, useState } from "react"
import { LayoutDashboard, Hash, LogOut, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation" // 🔥 THE MODERN WAY
import { 
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, 
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter 
} from "@/components/ui/sidebar"
import api from "../../lib/api"

export function AppSidebar() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeGroupId = searchParams.get('group') // To highlight the active group

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups/")
        console.log(res)
        // Handle both paginated and non-paginated DRF responses
        const data = res.data.results || res.data
        setGroups(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Failed to fetch groups", err)
      } finally {
        setLoading(false)
      }
    }
    fetchGroups()
  }, [])

  const handleLogout = () => {
    localStorage.clear() // Clean sweep
    router.push('/login') // Smooth redirect
  }

  // 🔥 This function changes the URL WITHOUT reloading the page
  const navigateToGroup = (id) => {
    if (id) {
      router.push(`/dashboard?group=${id}`)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        {/* SECTION 1: PERSONAL */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigateToGroup(null)}
                isActive={!activeGroupId} // Highlight if no group is selected
              >
                <LayoutDashboard />
                <span>My Private Tasks</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* SECTION 2: WORKSPACES */}
        <SidebarGroup>
          <SidebarGroupLabel>Workspaces</SidebarGroupLabel>
          <SidebarMenu>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
            ) : (
              groups.map((group) => (
                <SidebarMenuItem key={group.id}>
                  <SidebarMenuButton 
                    onClick={() => navigateToGroup(group.id)}
                    isActive={activeGroupId === String(group.id)} // Visual feedback
                  >
                    <Hash className={activeGroupId === String(group.id) ? "text-blue-500" : "text-gray-400"} />
                    <span>{group.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="hover:bg-red-50 hover:text-red-600">
              <LogOut className="text-red-500" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}