import { useLocation, NavLink, useNavigate } from "react-router-dom";
import { BarChart3, Upload, TrendingUp, Activity, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LOGO_SIMPLE_URL } from "@/lib/assets";
const navigationItems = [{
  title: "Upload de Dados",
  url: "/dashboard/upload",
  icon: Upload
}, {
  title: "Dashboard Geral",
  url: "/dashboard",
  icon: BarChart3
}, {
  title: "Previsão de Fluxo",
  url: "/dashboard/previsao",
  icon: TrendingUp
}, {
  title: "Simulação de Cenários",
  url: "/dashboard/simulacao",
  icon: Activity
}];
export function AppSidebar() {
  const sidebar = useSidebar();
  const collapsed = sidebar.open === false;
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  return <Sidebar className={`${collapsed ? "w-14" : "w-60"} bg-sidebar transition-all duration-300`}>
      {/* Header with Logo - Remove border to make it seamless */}
      <div className="p-4 bg-sidebar">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden bg-sidebar-accent/20">
            <img src={LOGO_SIMPLE_URL} alt="Simple Logo" className="w-full h-full object-contain" />
          </div>
          {!collapsed && <span className="text-xl font-bold text-sidebar-foreground">Simple</span>}
        </div>
      </div>
      

      <SidebarContent className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-t border-amber-400/20 shadow-inner">
        <SidebarGroup className="mx-0 my-0 px-[22px] rounded-none">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => <div key={item.title}>
                  <SidebarMenuItem>
                    <NavLink to={item.url} end={item.url === "/dashboard"} className={({
                  isActive
                }) => `flex items-center gap-3 px-4 py-2 transition-colors duration-200 ${isActive ? "text-amber-400" : "text-white hover:text-amber-400"}`}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuItem>
                  
                  {/* Separator between items (except for the last one) */}
                  {index < navigationItems.length - 1 && <div className="mx-6 my-2 h-px bg-sidebar-accent/20"></div>}
                </div>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && user && (
        <div className="mt-auto p-4 border-t border-sidebar-accent/20">
          <p className="text-xs text-sidebar-foreground/70 truncate mb-2">{user.name}</p>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground hover:text-amber-400"
            onClick={() => {
              logout();
              navigate("/auth");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      )}
    </Sidebar>;
}