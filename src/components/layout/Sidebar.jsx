// Sidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart4, 
  Calendar, 
  Contact, 
  Layers, 
  Mail, 
  MessageSquare, 
  Phone, 
  PieChart, 
  Settings, 
  Target, 
  Users,
  Send,
  Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger, Sidebar, SidebarContent, useSidebar } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import Navbar from './Navbar';

function NavItem({ to, icon: Icon, label, active }) {
  const { sidebarLayout } = useSidebar();
  const isCollapsed = sidebarLayout === "collapsed";

  return (
    <Link to={to} className="w-full">
      <div 
        className={cn(
          "nav-link group flex items-center px-2 py-2 rounded-md transition-all duration-200",
          active ? "bg-brand-neon text-white" : "text-white hover:bg-gray-800",
          isCollapsed ? "justify-center" : "justify-start"
        )}
      >
        {/* Ensure icon is always visible */}
        <Icon className="h-5 w-5 text-white" />

        {/* Hide text when collapsed */}
        {!isCollapsed && <span className="ml-2 text-sm">{label}</span>}
      </div>
    </Link>
  );
}

function SidebarContents() {
  const location = useLocation();
  const pathname = location.pathname;
  const { sidebarLayout } = useSidebar();
  const isCollapsed = sidebarLayout === "collapsed";

  const routes = [
    { path: '/', label: 'Dashboard', icon: Layers },
    { path: '/leads', label: 'Leads', icon: Target },
    { path: '/contacts', label: 'Contacts', icon: Users },
    { path: '/pipeline', label: 'Pipeline', icon: BarChart4 },
    { path: '/tasks', label: 'Tasks', icon: Calendar },
    { path: '/analytics', label: 'Analytics', icon: PieChart },
  ];

  return (
    <div className="flex flex-col z-40 h-full">
      <div className={cn("py-4 px-3 flex items-center", isCollapsed ? "justify-center" : "justify-start")}>
        <div className="flex items-center">
        <div className="h-8 w-8 z-40 rounded-md  flex items-center justify-center">
  <img src="/logo.png" alt="Company Logo" className="h-full w-full object-contain" />
</div>
          {!isCollapsed && (
            <span className="ml-2 text-lg font-semibold text-white">EditEdge CRM</span>
          )}
        </div>
        <div className="ml-auto lg:hidden">
          <SidebarTrigger />
        </div>
      </div>
      
      <Separator className="bg-sidebar-border" />
      
      <div className="mt-4 px-2">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-sidebar-foreground/60 px-4 mb-2">
            MAIN MENU
          </div>
        )}
        <nav className="space-y-1 text-xs">
          {routes.map((route) => (
            <NavItem
              key={route.path}
              to={route.path}
              icon={route.icon}
              label={route.label}
              active={pathname === route.path}
            />
          ))}
        </nav>
      </div>
      
      <Separator className="bg-sidebar-border my-4" />
      
      <div className="px-2">
        {!isCollapsed && (
          <div className="text-xs font-semibold text-sidebar-foreground/60 px-4 mb-2">
            COMMUNICATION
          </div>
        )}
        <nav className="space-y-1 text-xs">
          <NavItem to="/messages" icon={MessageSquare} label="Messages" active={pathname === '/messages'} />
          <NavItem to="/emails" icon={Mail} label="Emails" active={pathname === '/emails'} />
          <NavItem to="/bulkEmails" icon={Send} label="Bulk Emails" active={pathname === '/bulkEmails'} />
          <NavItem to="/meetings" icon={Presentation} label="Meetings" active={pathname === '/meetings'} />
          <NavItem to="/groups" icon={Users} label="Groups" active={pathname === "/groups"} />
        </nav>
      </div>
      
      <div className="mt-auto px-2 mb-4">
        <NavItem to="/settings" icon={Settings} label="Settings" active={pathname === '/settings'} />
      </div>
    </div>
  );
}

export default function SidebarWrapper({ children }) {
  const isMobile = useIsMobile();
  const { sidebarLayout } = useSidebar();
  
  const sidebarWidth = sidebarLayout === "collapsed" ? "3rem" : "2rem";

  return (
    <SidebarProvider>
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <Sidebar className="bg-brand-black border-r border-brand-neon fixed left-0 top-0 h-full">
        <SidebarContent>
          <SidebarContents />
        </SidebarContent>
      </Sidebar>

      {/* Main Content */}
      <div
        className="flex-1 flex flex-col transition-all duration-300"
        style={{
          marginLeft: isMobile || sidebarLayout === "hidden" ? "0" : sidebarWidth,
          padding: "0 4rem",
        }}
      >
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="page-transition">{children}</div>
        </main>
      </div>
    </div>
  </SidebarProvider>
  );
}