// ui/sidebar.jsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

const SidebarContext = React.createContext(null);

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
};

const SidebarProvider = ({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }) => {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [sidebarLayout, setSidebarLayout] = React.useState(localStorage.getItem("sidebarLayout") || "default");
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = openProp ?? openState;

  const setOpen = (value) => {
    const newState = typeof value === "function" ? value(open) : value;
    setOpenProp ? setOpenProp(newState) : setOpenState(newState);
  };

  const toggleSidebar = () => {
    isMobile ? setOpenMobile((prev) => !prev) : setOpen((prev) => !prev);
  };

  React.useEffect(() => {
    const handleLayoutChange = (event) => {
      setSidebarLayout(event.detail);
    };
    window.addEventListener("sidebarLayoutChange", handleLayoutChange);
    return () => window.removeEventListener("sidebarLayoutChange", handleLayoutChange);
  }, []);

  React.useEffect(() => {
    const layout = localStorage.getItem("sidebarLayout") || "default";
    setSidebarLayout(layout);
  }, []);

  const isCollapsed = sidebarLayout === "collapsed";
  const isHidden = sidebarLayout === "hidden";

  const state = isHidden ? "hidden" : (isCollapsed || !open) ? "collapsed" : "expanded";
  const contextValue = { state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, sidebarLayout };

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{ "--sidebar-width": "16rem", "--sidebar-width-icon": "3rem", ...style }}
          className={cn("group/sidebar-wrapper flex min-h-screen w-full", className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};

const Sidebar = ({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }) => {
  const { isMobile, state, openMobile, setOpenMobile, sidebarLayout } = useSidebar();

  if (sidebarLayout === "hidden") {
    return null;
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden">
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-brand-black border-r border-brand-black transition-all duration-300",
        sidebarLayout === "collapsed" ? "w-[3rem]" : "w-[14rem]", // Adjust sidebar width here
        "p-0"
      )}
      {...props}
    >
      <div className="flex h-full w-full flex-col">{children}</div>
    </aside>
  );
};

const SidebarTrigger = React.forwardRef(({ className, ...props }, ref) => {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", className)}
      onClick={() => setOpenMobile(!openMobile)}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
});
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarRail = React.forwardRef(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      ref={ref}
      data-sidebar="rail"
      className={cn("absolute inset-y-0 z-20 hidden w-4", className)}
      onClick={toggleSidebar}
      {...props}
    />
  );
});
SidebarRail.displayName = "SidebarRail";

const SidebarContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto", className)} {...props} />
));
SidebarContent.displayName = "SidebarContent";

const SidebarMenu = React.forwardRef(({ className, ...props }, ref) => (
  <ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
));
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
));
SidebarMenuItem.displayName = "SidebarMenuItem";

const SidebarMenuButton = React.forwardRef(({ asChild = false, isActive = false, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn("flex w-full items-center gap-2 rounded-md p-2 text-sm", className)}
      {...props}
    />
  );
});
SidebarMenuButton.displayName = "SidebarMenuButton";

const SidebarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <Separator ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props} />
));
SidebarSeparator.displayName = "SidebarSeparator";

export {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};