import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowUpRight, Filter, Plus, Search, Target, Settings, Trash, FolderOpen, Loader2 } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import EntityDetailsSidebar from "@/components/lead/EntityDetailsSidebar";
import ViewSwitcher from "@/components/common/ViewSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

axios.defaults.withCredentials = true;

const getStatusBadge = (status) => {
  const progressingStatuses = ["Qualified", "Proposal", "Negotiation", "Won"];
  const initialStatuses = ["New", "Contacted"];

  if (progressingStatuses.includes(status)) {
    return "bg-brand-black text-white";
  } else if (initialStatuses.includes(status)) {
    return "bg-brand-black text-white";
  } else {
    return "bg-gray-500 text-white";
  }
};

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Leads = ({ setGroups }) => {
  const [leads, setLeads] = useState([]);
  const [groups, setLocalGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [view, setView] = useState("list");
  const [selectedLead, setSelectedLead] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newLeadName, setNewLeadName] = useState("");
  const [newLeadCompany, setNewLeadCompany] = useState("");
  const [newLeadEmail, setNewLeadEmail] = useState("");
  const [newLeadPhone, setNewLeadPhone] = useState("");
  const [newLeadStatus, setNewLeadStatus] = useState("New");
  const [newLeadValue, setNewLeadValue] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newLeadAddress, setNewLeadAddress] = useState("");
  const [newLeadWebsite, setNewLeadWebsite] = useState("");
  const [newLeadDescription, setNewLeadDescription] = useState("");
  const [newLeadChannel, setNewLeadChannel] = useState("");
  const [newLeadCompanySize, setNewLeadCompanySize] = useState("");
  const [newLeadNiche, setNewLeadNiche] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, { withCredentials: true });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchGroups();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/leads`);
      setLeads(response.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({ title: "Error", description: "Failed to fetch leads", variant: "destructive" });
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`, { withCredentials: true });
      const leadGroups = response.data.filter(group =>
        group.members.every(member => member.type === "lead")
      );
      setLocalGroups(leadGroups);
      setGroups(leadGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const openSidebar = (lead) => {
    setSelectedLead(lead);
    setSelectedAssignee(lead.assignee || null);
    setIsSidebarOpen(true);
  };

  const updateLead = (updatedLead) => {
    setLeads(leads.map(lead => (lead._id === updatedLead._id ? updatedLead : lead)));
  };

  const handleAddLead = async () => {
    if (!newLeadName.trim() || !newLeadCompany.trim() || !newLeadEmail.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const newLead = {
      name: newLeadName,
      company: newLeadCompany,
      email: newLeadEmail,
      phone: newLeadPhone,
      address: newLeadAddress,
      website: newLeadWebsite,
      description: newLeadDescription,
      channel: newLeadChannel,
      companySize: newLeadCompanySize,
      niche: newLeadNiche,
      status: newLeadStatus,
      value: parseInt(newLeadValue) || 0,
      notes: [],
      reminders: [],
      assignee: selectedAssignee || null,
    };

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/leads`, newLead);
      setLeads([...leads, response.data]);
      setIsDialogOpen(false);
      resetNewLeadFields();
      toast({ title: "Lead added", description: "New lead has been added successfully" });
    } catch (error) {
      console.error("Error adding lead:", error);
      toast({ title: "Error", description: "Failed to add lead", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetNewLeadFields = () => {
    setNewLeadName("");
    setNewLeadCompany("");
    setNewLeadEmail("");
    setNewLeadPhone("");
    setNewLeadAddress("");
    setNewLeadWebsite("");
    setNewLeadDescription("");
    setNewLeadChannel("");
    setNewLeadCompanySize("");
    setNewLeadNiche("");
    setNewLeadStatus("New");
    setNewLeadValue("");
    setSelectedAssignee(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setIsGroupDialogOpen(true);
  };

  const handleCsvUploadWithChoice = async (createGroup) => {
    if (!csvFile) return;
    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("createGroup", createGroup ? "true" : "false");

    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/leads/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.leads) setLeads([...leads, ...response.data.leads]);
      toast({
        title: "CSV Uploaded",
        description: createGroup ? "Leads imported & grouped successfully!" : "Leads imported successfully!",
      });
      if (createGroup) await fetchGroups();
      setIsGroupDialogOpen(false);
      setCsvFile(null);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({ title: "Error", description: "Failed to upload CSV", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"];

  const filteredLeads = selectedGroup === "all"
    ? leads.filter(lead => {
        const matchesSearch =
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;
        return matchesSearch && matchesStatus;
      })
    : groups.find(group => group._id === selectedGroup)?.members
        .map(member => leads.find(lead => lead._id === member.memberId))
        .filter(lead => {
          if (!lead) return false;
          const matchesSearch =
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesStatus = selectedStatus === "All" || lead.status === selectedStatus;
          return matchesSearch && matchesStatus;
        }) || [];

  const handleUpdateLeadStatus = (leadId, newStatus) => {
    setLoading(true);
    axios
      .put(`${API_BASE_URL}/api/leads/${leadId}`, { status: newStatus })
      .then(() => {
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead._id === leadId ? { ...lead, status: newStatus } : lead
          )
        );
        toast({ title: "Lead Updated", description: `Lead status updated to ${newStatus}.` });
      })
      .catch(error => {
        console.error("Error updating lead status:", error);
        toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const handleAssignLead = (leadId, newAssignee) => {
    setLoading(true);
    axios
      .put(`${API_BASE_URL}/api/leads/${leadId}`, { assignee: newAssignee })
      .then(response => {
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead._id === leadId ? response.data : lead
          )
        );
        toast({ title: "Lead Assigned", description: "Lead assigned successfully." });
      })
      .catch(error => {
        console.error("Error assigning lead:", error);
        toast({ title: "Error", description: "Failed to assign lead", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteLead = (id) => {
    setLoading(true);
    axios
      .delete(`${API_BASE_URL}/api/leads/${id}`)
      .then(() => {
        setLeads(leads.filter(lead => lead._id !== id));
        toast({ title: "Lead deleted", description: "The lead was removed successfully." });
        setIsSidebarOpen(false);
      })
      .catch(error => {
        console.error("Error deleting lead:", error);
        toast({ title: "Error", description: "Failed to delete lead", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteAllLeads = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/leads/delete-all`);
      setLeads([]);
      toast({ title: "All Leads Deleted", description: "All leads have been removed successfully." });
      setIsDeleteAllDialogOpen(false);
    } catch (error) {
      console.error("Error deleting all leads:", error);
      toast({ title: "Error", description: "Failed to delete all leads", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (leadId, noteText) => {
    if (!noteText.trim()) return;
    setLoading(true);
    try {
      const lead = leads.find(l => l._id === leadId);
      const updatedNotes = [...(lead.notes || []), noteText];
      const response = await axios.put(`${API_BASE_URL}/api/leads/${leadId}`, {
        notes: updatedNotes,
      });
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead._id === leadId ? { ...lead, notes: response.data.notes } : lead
        )
      );
      if (selectedLead?._id === leadId) setSelectedLead(response.data);
      toast({ title: "Note Added", description: "Note added successfully." });
    } catch (error) {
      console.error("Error adding note:", error);
      toast({ title: "Error", description: "Failed to add note", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async (leadId, reminderText, reminderDate) => {
    if (!reminderText.trim() || !reminderDate) return;
    setLoading(true);
    try {
      const lead = leads.find(l => l._id === leadId);
      const updatedReminders = [
        ...(lead.reminders || []),
        { text: reminderText, date: new Date(reminderDate) },
      ];
      const response = await axios.put(`${API_BASE_URL}/api/leads/${leadId}`, {
        reminders: updatedReminders,
      });
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead._id === leadId ? { ...lead, reminders: response.data.reminders } : lead
        )
      );
      if (selectedLead?._id === leadId) setSelectedLead(response.data);
      toast({ title: "Reminder Added", description: "Reminder added successfully." });
    } catch (error) {
      console.error("Error adding reminder:", error);
      toast({ title: "Error", description: "Failed to add reminder", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const viewConfig = {
    columns: [
      { key: "name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
      { key: "assignee", label: "Assignee" },
    ],
    statusOptions,
    getStatusBadge,
    eventMapper: (data) =>
      data.flatMap(lead =>
        (lead.reminders || []).map(reminder => ({
          title: `${lead.name}: ${reminder.text}`,
          start: new Date(reminder.date),
          extendedProps: { item: lead },
        }))
      ),
  };

  return (
    <div className="p-4 sm:p-7">
      <PageHeader
        title="Leads"
        subtitle="Track and manage your sales leads in one place."
        icon={Target}
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              {groups.map(group => (
                <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-auto">
                <Filter className="mr-2 h-4" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                {["All", ...statusOptions].map(status => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csvUpload"
              disabled={loading}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("csvUpload").click()}
              disabled={loading}
            >
              <img src="/csv.svg" alt="CSV Icon" className="h-5 w-5" /> Upload CSV
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-2" disabled={loading}>
                  <Settings className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Lead
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteAllDialogOpen(true)}
                  className="text-red-500"
                >
                  <Trash className="mr-2 h-4 w-4" /> Delete All Leads
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FolderOpen className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">No leads found</p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add New Lead
          </Button>
        </div>
      ) : (
        <>
          <ViewSwitcher
            view={view}
            setView={setView}
            data={filteredLeads || []}
            viewConfig={viewConfig}
            onItemClick={openSidebar}
            onUpdateStatus={handleUpdateLeadStatus}
            onAssignLead={handleAssignLead}
          />

          <Card className="mt-6 animate-fade-in">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Lead Value by Status</h3>
              <div className="space-y-4">
                {statusOptions.map(status => {
                  const totalValue = (selectedGroup === "all" ? leads : filteredLeads)
                    .filter(lead => lead.status === status)
                    .reduce((sum, lead) => sum + (lead.value || 0), 0);
                  const percentage = Math.round((totalValue / 200000) * 100);
                  return (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{status}</span>
                        <span className="text-sm text-muted-foreground">${totalValue.toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} className={`h-2 ${getStatusBadge(status)}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="w-full max-w-[95vw] sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Add New Lead</DialogTitle>
      <DialogDescription>Enter the details of your new sales lead.</DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Required Fields Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Required Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name*</Label>
            <Input
              id="name"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
              placeholder="Full name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company*</Label>
            <Input
              id="company"
              value={newLeadCompany}
              onChange={(e) => setNewLeadCompany(e.target.value)}
              placeholder="Company name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              value={newLeadEmail}
              onChange={(e) => setNewLeadEmail(e.target.value)}
              placeholder="Email address"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={newLeadPhone}
              onChange={(e) => setNewLeadPhone(e.target.value)}
              placeholder="Phone number"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Status and Value Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={newLeadStatus} onValueChange={setNewLeadStatus} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(status => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Value ($)</Label>
          <Input
            id="value"
            type="number"
            value={newLeadValue}
            onChange={(e) => setNewLeadValue(e.target.value)}
            placeholder="Estimated value"
            disabled={loading}
          />
        </div>
      </div>

      {/* Assignee Section */}
      <div className="space-y-2">
        <Label htmlFor="assignee">Assignee</Label>
        <Select value={selectedAssignee} onValueChange={setSelectedAssignee} disabled={loading}>
          <SelectTrigger>
            <SelectValue placeholder="Select assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Unassigned</SelectItem>
            {users.map(user => (
              <SelectItem key={user._id} value={user._id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Additional Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={newLeadAddress}
              onChange={(e) => setNewLeadAddress(e.target.value)}
              placeholder="Company address"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={newLeadWebsite}
              onChange={(e) => setNewLeadWebsite(e.target.value)}
              placeholder="Company website"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel">Channel</Label>
            <Input
              id="channel"
              value={newLeadChannel}
              onChange={(e) => setNewLeadChannel(e.target.value)}
              placeholder="e.g., LinkedIn, Referral"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companySize">Company Size</Label>
            <Select value={newLeadCompanySize} onValueChange={setNewLeadCompanySize} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-10">1-10</SelectItem>
                <SelectItem value="11-50">11-50</SelectItem>
                <SelectItem value="51-200">51-200</SelectItem>
                <SelectItem value="201-500">201-500</SelectItem>
                <SelectItem value="500+">500+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={newLeadDescription}
            onChange={(e) => setNewLeadDescription(e.target.value)}
            placeholder="Short description"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="niche">Niche</Label>
          <Input
            id="niche"
            value={newLeadNiche}
            onChange={(e) => setNewLeadNiche(e.target.value)}
            placeholder="e.g., SaaS, Healthcare"
            disabled={loading}
          />
        </div>
      </div>
    </div>
    <DialogFooter>
      <Button onClick={handleAddLead} disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {loading ? "Adding..." : "Add Lead"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      <EntityDetailsSidebar
        entity={selectedLead}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onUpdate={updateLead}
        onDelete={handleDeleteLead}
        onAddNote={handleAddNote}
        onAddReminder={handleAddReminder}
        onAssign={handleAssignLead}
        assignee={selectedAssignee}
        setAssignee={setSelectedAssignee}
        users={users}
        entityType="lead"
      />

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="p-6 max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Create a Group?
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">
            Do you want to create a group for this CSV file?
          </p>
          <div className="flex justify-end space-x-3 mt-4">
            <Button
              variant="outline"
              onClick={() => handleCsvUploadWithChoice(false)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Processing..." : "No"}
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleCsvUploadWithChoice(true)}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Processing..." : "Yes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all leads? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteAllDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAllLeads}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;