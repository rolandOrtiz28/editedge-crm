import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/Pipeline";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import Emails from "./pages/Emails";
import BulkEmails from "./pages/BulkEmails";
import Tasks from "./pages/Tasks";
import Meetings from "./pages/Meetings";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import PrivacyPolicy from "./pages/PrivacyPolicy";  // New import
import TermsOfService from "./pages/TermsOfService";  // New import
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarWrapper from "./components/layout/Sidebar";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

const App = () => {
  // ✅ Define groups state at the top level
  const [groups, setGroups] = useState([]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider> {/* Ensure SidebarProvider is used */}
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <div className="flex flex-col w-full">
              <div className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<LayoutWrapper><Dashboard /></LayoutWrapper>} />
              <Route path="/leads" element={<LayoutWrapper><Leads setGroups={setGroups} /></LayoutWrapper>} />
              <Route path="/contacts" element={<LayoutWrapper><Contacts setGroups={setGroups} /></LayoutWrapper>} />
              <Route path="/pipeline" element={<LayoutWrapper><Pipeline /></LayoutWrapper>} />
              <Route path="/tasks" element={<LayoutWrapper><Tasks /></LayoutWrapper>} />
              <Route path="/analytics" element={<LayoutWrapper><Analytics /></LayoutWrapper>} />
              <Route path="/messages" element={<LayoutWrapper><Messages /></LayoutWrapper>} />
              <Route path="/emails" element={<LayoutWrapper><Emails /></LayoutWrapper>} />
              <Route path="/bulkEmails" element={<LayoutWrapper><BulkEmails /></LayoutWrapper>} />
              <Route path="/groups" element={<LayoutWrapper><Groups setGroups={setGroups} /> </LayoutWrapper>} />
              <Route path="/meetings" element={<LayoutWrapper><Meetings /></LayoutWrapper>} />
              <Route path="/settings" element={<LayoutWrapper><Settings /></LayoutWrapper>} />
              <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />  
              <Route path="/terms-of-service" element={<TermsOfService />} />  
              <Route path="*" element={<NotFound />} />
            </Routes>
            </div>
              <Footer />  
            </div>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

// Reusable Layout Wrapper with Sidebar
const LayoutWrapper = ({ children }) => (
  <div className="flex min-h-screen w-full bg-background">
    <SidebarWrapper>
      {children}
    </SidebarWrapper>
  </div>
);

export default App;
