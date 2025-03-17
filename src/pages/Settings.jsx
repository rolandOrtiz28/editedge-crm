// Settings.jsx
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Bell, Moon, Layout } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";


const Settings = () => {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    taskReminders: true,
    leadAssignments: true,
    systemAnnouncements: false,
  });

  const [theme, setTheme] = useState({
    darkMode: false,
    sidebarLayout: "default",
    dashboardView: "grid",
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/settings`, { withCredentials: true })
      .then((response) => {
        if (response.data.theme) {
          setTheme(response.data.theme);
          if (response.data.theme.darkMode) {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          // Apply sidebar layout immediately
          localStorage.setItem("sidebarLayout", response.data.theme.sidebarLayout);
        }
      })
      .catch((error) => console.error("Error fetching settings:", error));
  }, []);

  const handleNotificationToggle = (key) => {
    const updatedSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(updatedSettings);

    axios.put(`${API_BASE_URL}/api/settings`, { notifications: updatedSettings }, { withCredentials: true })
      .then(() => {
        toast({
          title: "Notification Preferences Updated",
          description: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} ${notifications[key] ? 'disabled' : 'enabled'}.`,
        });
      })
      .catch((error) => console.error("Error updating settings:", error));
  };

  const handleThemeToggle = (key, value) => {
    const updatedTheme = { ...theme, [key]: value };
    setTheme(updatedTheme);

    if (key === "darkMode") {
      document.documentElement.classList.toggle("dark", value);
    }

    if (key === "sidebarLayout") {
      localStorage.setItem("sidebarLayout", value); // Save to localStorage
      // Dispatch a custom event to notify sidebar of layout change
      window.dispatchEvent(new CustomEvent("sidebarLayoutChange", { detail: value }));
    }

    axios
      .put(`${API_BASE_URL}/api/settings`, { theme: updatedTheme }, { withCredentials: true })
      .then(() => {
        toast({
          title: "Appearance Settings Updated",
          description: `${key} set to ${value}.`,
        });
      })
      .catch((error) => console.error("Error updating theme settings:", error));
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your preferences and appearance settings." icon={SettingsIcon} />
      <Tabs defaultValue="notifications" className="animate-fade-in">
        <TabsList className="mb-6">
          <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1" /> Notifications</TabsTrigger>
          <TabsTrigger value="theme"><Moon className="h-4 w-4 mr-1" /> Theme & Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Customize how you receive alerts.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <p className="capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    <Switch checked={value} onCheckedChange={() => handleNotificationToggle(key)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p>Dark Mode</p>
                  <Switch checked={theme.darkMode} onCheckedChange={() => handleThemeToggle("darkMode", !theme.darkMode)} />
                </div>
                <div className="flex items-center justify-between">
                  <p>Sidebar Layout</p>
                  <select
                    className="p-2 border rounded"
                    value={theme.sidebarLayout}
                    onChange={(e) => handleThemeToggle("sidebarLayout", e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="collapsed">Collapsed</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <p>Dashboard View</p>
                  <select
                    className="p-2 border rounded"
                    value={theme.dashboardView}
                    onChange={(e) => handleThemeToggle("dashboardView", e.target.value)}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                    <option value="compact">Compact View</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;