// src/App.jsx
import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import Analytics from './pages/Analytics';
import Messages from './pages/Messages';
import Emails from './pages/Emails';
import BulkEmails from './pages/BulkEmails';
import Tasks from './pages/Tasks';
import Meetings from './pages/Meetings';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Policy from './pages/Policy';
import TermsOfService from './pages/TermsOfService';
import { SidebarProvider } from '@/components/ui/sidebar';
import SidebarWrapper from './components/layout/Sidebar';
import Footer from './components/layout/Footer';

const queryClient = new QueryClient();

const App = () => {
  const [groups, setGroups] = useState([]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col w-full">
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/policy" element={<Policy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route
                    path="/dashboard"
                    element={<PrivateRoute><LayoutWrapper><Dashboard /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/leads"
                    element={<PrivateRoute><LayoutWrapper><Leads setGroups={setGroups} /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/contacts"
                    element={<PrivateRoute><LayoutWrapper><Contacts setGroups={setGroups} /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/pipeline"
                    element={<PrivateRoute><LayoutWrapper><Pipeline /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/tasks"
                    element={<PrivateRoute><LayoutWrapper><Tasks /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/analytics"
                    element={<PrivateRoute><LayoutWrapper><Analytics /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/messages"
                    element={<PrivateRoute><LayoutWrapper><Messages /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/emails"
                    element={<PrivateRoute><LayoutWrapper><Emails /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/bulkEmails"
                    element={<PrivateRoute><LayoutWrapper><BulkEmails /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/groups"
                    element={<PrivateRoute><LayoutWrapper><Groups setGroups={setGroups} /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/meetings"
                    element={<PrivateRoute><LayoutWrapper><Meetings /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/settings"
                    element={<PrivateRoute><LayoutWrapper><Settings /></LayoutWrapper></PrivateRoute>}
                  />
                  <Route
                    path="/profile"
                    element={<PrivateRoute><LayoutWrapper><Profile /></LayoutWrapper></PrivateRoute>}
                  />
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

const LayoutWrapper = ({ children }) => (
  <div className="flex min-h-screen w-full bg-background">
    <SidebarWrapper>{children}</SidebarWrapper>
  </div>
);

export default App;