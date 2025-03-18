import axios from "axios";
import { useEffect, useState } from "react";
import { ArrowUpRight, Filter, Plus, Search, Target, Settings, Trash } from "lucide-react";
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
  DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import EntityDetailsSidebar from "@/components/lead/EntityDetailsSidebar";
import ViewSwitcher from "@/components/common/ViewSwitcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

axios.defaults.withCredentials = true;

const getStatusBadge = (status) => {
  switch (status) {
    case "New": return "bg-blue-900 text-white";
    case "Contacted": return "bg-pink-900 text-white";
    case "Qualified": return "bg-yellow-400 text-white";
    case "Proposal": return "bg-orange-500 text-white";
    case "Negotiation": return "bg-sky-600 text-white";
    case "Won": return "bg-lime-700 text-white";
    default: return "bg-gray-500 text-white";
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
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false); // New state for delete all dialog
  const [loading, setLoading] = useState(false); // New state for loading

  useEffect(() => {
    fetchLeads();
    fetchGroups();
  }, []);

  const fetchLeads = () => {
    axios.get(`${API_BASE_URL}/api/leads`)
      .then(response => setLeads(response.data))
      .catch(error => console.error("Error fetching leads:", error));
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
    setIsSidebarOpen(true);
  };

  const updateLead = (updatedLead) => {
    setLeads(leads.map(lead => (lead._id === updatedLead._id ? updatedLead : lead)));
  };

  const handleAddLead = () => {
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
      value: parseInt(newLeadValue) || 0
    };

    axios.post(`${API_BASE_URL}/api/leads`, newLead)
      .then(response => {
        setLeads([...leads, response.data]);
        setIsDialogOpen(false);
        resetNewLeadFields();
        toast({ title: "Lead added", description: "New lead has been added successfully" });
      })
      .catch(error => console.error("Error adding lead:", error));
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

    try {
      const response = await axios.post(`${API_BASE_URL}/api/leads/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.leads) setLeads([...leads, ...response.data.leads]);
      toast({
        title: "CSV Uploaded",
        description: createGroup ? "Leads imported & grouped successfully!" : "Leads imported successfully!"
      });
      if (createGroup) await fetchGroups();
      setIsGroupDialogOpen(false);
      setCsvFile(null);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({ title: "Error", description: "Failed to upload CSV", variant: "destructive" });
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
    axios.put(`${API_BASE_URL}/api/leads/${leadId}`, { status: newStatus })
      .then(() => {
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead._id === leadId ? { ...lead, status: newStatus } : lead
          )
        );
        toast({ title: "Lead Updated", description: `Lead status updated to ${newStatus}.` });
      })
      .catch(error => console.error("Error updating lead status:", error));
  };

  const handleDeleteLead = (id) => {
    axios.delete(`${API_BASE_URL}/api/leads/${id}`)
      .then(() => {
        setLeads(leads.filter(lead => lead._id !== id));
        toast({ title: "Lead deleted", description: "The lead was removed successfully." });
        setIsSidebarOpen(false);
      })
      .catch(error => console.error("Error deleting lead:", error));
  };

  const handleDeleteAllLeads = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/leads/delete-all`);
      setLeads([]); // Clear UI after deletion
      toast({ title: "All Leads Deleted", description: "All leads have been removed successfully." });
      setIsDeleteAllDialogOpen(false); // Close dialog after deletion
    } catch (error) {
      console.error("Error deleting all leads:", error);
      toast({ title: "Error", description: "Failed to delete all leads", variant: "destructive" });
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
    ],
    statusOptions,
    getStatusBadge,
    eventMapper: (data) => data.flatMap(lead =>
      (lead.reminders || []).map(reminder => ({
        title: `${lead.name}: ${reminder.text}`,
        start: new Date(reminder.date),
        extendedProps: { item: lead },
      }))
    ),
  };

  return (
    <div className="p-7">
      <PageHeader 
        title="Leads" 
        subtitle="Track and manage your sales leads in one place."
        icon={Target}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
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
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csvUpload" disabled={loading} />
            <Button variant="outline" onClick={() => document.getElementById("csvUpload").click()} disabled={loading}>
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
                <DropdownMenuItem onClick={() => setIsDeleteAllDialogOpen(true)} className="text-red-500">
                  <Trash className="mr-2 h-4 w-4" /> Delete All Leads
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Lead</DialogTitle>
                  <DialogDescription>Enter the details of your new sales lead.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name*</Label>
                    <Input id="name" value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} placeholder="Full name" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">Company*</Label>
                    <Input id="company" value={newLeadCompany} onChange={(e) => setNewLeadCompany(e.target.value)} placeholder="Company name" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email*</Label>
                    <Input id="email" type="email" value={newLeadEmail} onChange={(e) => setNewLeadEmail(e.target.value)} placeholder="Email address" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">Phone</Label>
                    <Input id="phone" value={newLeadPhone} onChange={(e) => setNewLeadPhone(e.target.value)} placeholder="Phone number" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={newLeadStatus} onValueChange={setNewLeadStatus} disabled={loading}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(status => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">Value ($)</Label>
                    <Input id="value" type="number" value={newLeadValue} onChange={(e) => setNewLeadValue(e.target.value)} placeholder="Estimated value" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="address" className="text-right">Address</Label>
                    <Input id="address" value={newLeadAddress} onChange={(e) => setNewLeadAddress(e.target.value)} placeholder="Company address" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="text-right">Website</Label>
                    <Input id="website" value={newLeadWebsite} onChange={(e) => setNewLeadWebsite(e.target.value)} placeholder="Company website" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Input id="description" value={newLeadDescription} onChange={(e) => setNewLeadDescription(e.target.value)} placeholder="Short description" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="channel" className="text-right">Channel</Label>
                    <Input id="channel" value={newLeadChannel} onChange={(e) => setNewLeadChannel(e.target.value)} placeholder="e.g., LinkedIn, Referral" className="col-span-3" disabled={loading} />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="companySize" className="text-right">Company Size</Label>
                    <Select value={newLeadCompanySize} onValueChange={setNewLeadCompanySize} disabled={loading}>
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="niche" className="text-right">Niche</Label>
                    <Input id="niche" value={newLeadNiche} onChange={(e) => setNewLeadNiche(e.target.value)} placeholder="e.g., SaaS, Healthcare" className="col-span-3" disabled={loading} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddLead} disabled={loading}>
                    {loading ? "Adding..." : "Add Lead"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ViewSwitcher
        view={view}
        setView={setView}
        data={filteredLeads || []}
        viewConfig={viewConfig}
        onItemClick={openSidebar}
        onUpdateStatus={handleUpdateLeadStatus}
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

      <EntityDetailsSidebar
        entity={selectedLead}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onUpdate={updateLead}
        onDelete={handleDeleteLead}
        entityType="lead"
      />

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="p-6 max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">Create a Group?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700 dark:text-gray-300">Do you want to create a group for this CSV file?</p>
          <div className="flex justify-end space-x-3 mt-4">
            <Button variant="outline" onClick={() => handleCsvUploadWithChoice(false)} disabled={loading}>
              {loading ? "Processing..." : "No"}
            </Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleCsvUploadWithChoice(true)} disabled={loading}>
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
            <Button variant="outline" onClick={() => setIsDeleteAllDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAllLeads} disabled={loading}>
              {loading ? "Deleting..." : "Delete All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;