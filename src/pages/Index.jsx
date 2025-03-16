import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarWrapper from "@/components/layout/Sidebar";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarWrapper />
    </div>
  );
};

export default Index;
