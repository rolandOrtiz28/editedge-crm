import { useState, useEffect } from "react";
import { User, Clock, CheckCircle, Target, Pencil } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import TaskDetailsSidebar from "@/components/lead/TaskDetailsSidebar";
import EntityDetailsSidebar from "@/components/lead/EntityDetailsSidebar";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";


const Profile = () => {
  const [userData, setUserData] = useState({
    name: "",
    company: "",
    email: "",
    profilePicture: "/default-avatar.png",
    role: "sales",
    timezone: "Pacific Time (PT)",
    createdAt: "",
  });
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isTaskSidebarOpen, setIsTaskSidebarOpen] = useState(false);
  const [isLeadSidebarOpen, setIsLeadSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Toggle edit mode
  const [editedUser, setEditedUser] = useState({ ...userData }); // State for edited data
  const [profilePictureFile, setProfilePictureFile] = useState(null); // State for file upload

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userRes = await fetch(`${API_BASE_URL}/api/profile/me`, {
          credentials: "include",
        });
        if (!userRes.ok) throw new Error("Failed to fetch user data");
        const userData = await userRes.json();
        setUserData({
          name: userData.name || "User",
          company: userData.company || "",
          email: userData.email || "",
          profilePicture: userData.profilePicture || "/default-avatar.png",
          role: userData.role || "sales",
          timezone: userData.timezone || "Pacific Time (PT)",
          createdAt: userData.createdAt || new Date().toISOString(),
        });
        setEditedUser({
          name: userData.name || "User",
          company: userData.company || "",
          email: userData.email || "",
          profilePicture: userData.profilePicture || "/default-avatar.png",
          role: userData.role || "sales",
          timezone: userData.timezone || "Pacific Time (PT)",
        });

        const tasksRes = await fetch(`${API_BASE_URL}/api/profile/tasks`, {
          credentials: "include",
        });
        if (!tasksRes.ok) throw new Error("Failed to fetch tasks");
        const tasksData = await tasksRes.json();
        setTasks(tasksData);

        const leadsRes = await fetch(`${API_BASE_URL}/api/profile/leads`, {
          credentials: "include",
        });
        if (!leadsRes.ok) throw new Error("Failed to fetch leads");
        const leadsData = await leadsRes.json();
        setLeads(leadsData);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, []);

  // Handlers for opening sidebars
  const openTaskSidebar = (task) => {
    setSelectedTask(task);
    setIsTaskSidebarOpen(true);
  };

  const openLeadSidebar = (lead) => {
    setSelectedLead(lead);
    setIsLeadSidebarOpen(true);
  };

  // Handlers for updating tasks and leads
  const updateTask = (updatedTask) => {
    setTasks(tasks.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
    fetchTasks();
  };

  const updateLead = (updatedLead) => {
    setLeads(leads.map((lead) => (lead._id === updatedLead._id ? updatedLead : lead)));
  };

  // Handlers for deleting tasks and leads
  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`, {
        withCredentials: true,
      });
      setTasks(tasks.filter((task) => task._id !== taskId));
      setIsTaskSidebarOpen(false);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const deleteLead = async (leadId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/leads/${leadId}`, {
        withCredentials: true,
      });
      setLeads(leads.filter((lead) => lead._id !== leadId));
      setIsLeadSidebarOpen(false);
    } catch (error) {
      console.error("Error deleting lead:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/tasks`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const tasksData = await response.json();
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append("name", editedUser.name);
    formData.append("email", editedUser.email);
    formData.append("company", editedUser.company);
    formData.append("role", editedUser.role);
    formData.append("timezone", editedUser.timezone);
    if (profilePictureFile) {
      formData.append("profilePicture", profilePictureFile);
    }
  
    try {
      const response = await axios.put(`${API_BASE_URL}/api/profile/update-profile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // Keep this if your auth middleware requires it
      });
      setUserData(response.data.user);
      setEditedUser(response.data.user);
      setProfilePictureFile(null);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: "Your profile has been updated successfully." });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <PageHeader
        title="Profile"
        subtitle={`What is up, ${userData.name}! Manage your profile and view your assignments.`}
        icon={User}
      />

      {/* User Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="User Details" className="lg:col-span-1">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 border-2 border-solid rounded-full">
              <AvatarImage className=" rounded-full" src={userData.profilePicture} alt={userData.name} />
              <AvatarFallback className="bg-brand-black text-white w-full h-full flex items-center justify-center rounded-full border-2 border-solid">
                {userData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isEditing ? (
              <div className="w-full space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={editedUser.email}
                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={editedUser.company}
                    onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={editedUser.role}
                    onValueChange={(value) => setEditedUser({ ...editedUser, role: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Select
                    value={editedUser.timezone}
                    onValueChange={(value) => setEditedUser({ ...editedUser, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Eastern Time (ET)">Eastern Time (ET)</SelectItem>
                      <SelectItem value="Central Time (CT)">Central Time (CT)</SelectItem>
                      <SelectItem value="Mountain Time (MT)">Mountain Time (MT)</SelectItem>
                      <SelectItem value="Pacific Time (PT)">Pacific Time (PT)</SelectItem>
                      <SelectItem value="Greenwich Mean Time (GMT)">Greenwich Mean Time (GMT)</SelectItem>
                      <SelectItem value="Central European Time (CET)">Central European Time (CET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Profile Picture</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) => setProfilePictureFile(e.target.files[0])}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateProfile}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
                {userData.company && (
                  <p className="text-sm text-muted-foreground">Company: {userData.company}</p>
                )}
                <Badge variant="secondary" className="mt-2">
                  {userData.role}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Timezone: {userData.timezone}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Joined: {new Date(userData.createdAt).toLocaleDateString()}
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Assigned Leads Section */}
        <DashboardCard title="Assigned Leads" className="lg:col-span-2">
          <div className="space-y-4">
            {leads.length > 0 ? (
              leads.map((lead, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-muted/20 flex items-center gap-3 cursor-pointer hover:bg-muted/30"
                  onClick={() => openLeadSidebar(lead)}
                >
                  <Target className="h-5 w-5 text-brand-neon" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{lead.name || "Unnamed Lead"}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.company || "No company"} | {lead.status}
                    </p>
                  </div>
                  <Badge variant="outline">{lead.status}</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No assigned leads.</p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Assigned Tasks Section */}
      <DashboardCard title="Assigned Tasks">
        <div className="space-y-4">
          {tasks.length > 0 ? (
            tasks.map((task, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 rounded-lg bg-muted/20 cursor-pointer hover:bg-muted/30"
                onClick={() => openTaskSidebar(task)}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle
                    className={`h-5 w-5 ${
                      task.status === "Completed"
                        ? "text-emerald-500"
                        : "text-muted-foreground"
                    }`}
                  />
                  <div>
                    <span className="text-sm font-medium">{task.title}</span>
                    <p className="text-xs text-muted-foreground">
                      Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    task.status === "Completed"
                      ? "success"
                      : task.status === "In Progress"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {task.status}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No assigned tasks.</p>
          )}
        </div>
      </DashboardCard>

      {/* Sidebars */}
      <TaskDetailsSidebar
        task={selectedTask}
        isOpen={isTaskSidebarOpen}
        onClose={() => setIsTaskSidebarOpen(false)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
      <EntityDetailsSidebar
        lead={selectedLead}
        isOpen={isLeadSidebarOpen}
        onClose={() => setIsLeadSidebarOpen(false)}
        onUpdate={updateLead}
        onDelete={deleteLead}
      />
    </div>
  );
};

export default Profile;