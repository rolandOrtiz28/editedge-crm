import { useState, useEffect } from "react";
import axios from "axios";
import { Contact, Plus, Search } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import ViewSwitcher from "@/components/common/ViewSwitcher";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings, Trash } from "lucide-react";
import EntityDetailsSidebar from "@/components/lead/EntityDetailsSidebar";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";


    const getStatusBadge = (status) => {
      switch (status) {
        case "New": return "bg-blue-500 text-white";
        case "Contacted": return "bg-yellow-500 text-white";
        case "Qualified": return "bg-purple-500 text-white";
        case "Proposal": return "bg-indigo-500 text-white";
        case "Negotiation": return "bg-orange-500 text-white";
        case "Won": return "bg-green-500 text-white";
        default: return "bg-gray-500 text-white";
      }
    };

const Contacts = ({ setGroups }) => {
  const [contacts, setContacts] = useState([]);
  const [groups, setLocalGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [newContact, setNewContact] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "Active",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editContact, setEditContact] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("list");
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [updateContact, setIsUpdateContact] = useState(false);




  useEffect(() => {
    fetchContacts();
    fetchGroups();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast({ title: "Error", description: "Failed to fetch contacts", variant: "destructive" });
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/groups`, { withCredentials: true });
      const contactGroups = response.data.filter(group => 
        group.members.every(member => member.type === "contact")
      );
      setLocalGroups(contactGroups);
      setGroups(contactGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleEditContact = (contact) => {
    setEditContact(contact);
    setIsEditDialogOpen(true);
  };

  const handleDeleteContact = (id) => {
    axios.delete(`${API_BASE_URL}/api/contacts/${id}`)
      .then(() => {
        setContacts(contacts.filter(contact => contact._id !== id));
        toast({ title: "Contact Deleted", description: "The contact was removed successfully." });
        setIsSidebarOpen(false); // Close sidebar after deletion
      })
      .catch(error => {
        console.error("Error deleting contact:", error);
        toast({ title: "Error", description: "Failed to delete contact", variant: "destructive" });
      });
  };
  

  const handleUpdateContact = () => {
    setLoading(true);
    axios.put(`${API_BASE_URL}/api/contacts/${editContact._id}`, editContact)
      .then((res) => {
        setContacts(contacts.map((c) => (c._id === res.data._id ? res.data : c)));
        toast({ title: "Contact Updated", description: "Contact details updated successfully." });
        setIsEditDialogOpen(false);
      })
      .catch((err) => {
        console.error("Error updating contact:", err);
        toast({ title: "Error", description: "Failed to update contact", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  const handleDeleteAllContacts = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/contacts/delete-all`);
      setContacts([]); // Clear UI after deletion
      toast({ title: "All Contacts Deleted", description: "All contacts have been removed successfully." });
      setIsDeleteAllDialogOpen(false); // Close dialog after deletion
    } catch (error) {
      console.error("Error deleting all contacts:", error);
      toast({ title: "Error", description: "Failed to delete all contacts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.email.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/contacts`, newContact);
      await fetchContacts();
      setNewContact({ name: "", company: "", email: "", phone: "", status: "New" });
      setIsDialogOpen(false);
      toast({ title: "Contact added", description: "New contact has been added successfully" });
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({ title: "Error", description: "Failed to add contact", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setCsvFile(file);
    setIsGroupDialogOpen(true);
  };

  const handleCsvUploadWithChoice = async (createGroup) => {
    if (!csvFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", csvFile);
    formData.append("createGroup", createGroup ? "true" : "false");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/contacts/upload-csv`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (response.data.added) await fetchContacts();
      toast({
        title: "CSV Uploaded",
        description: createGroup ? "Contacts imported & grouped successfully!" : "Contacts imported successfully!"
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

  const filteredContacts = selectedGroup === "all"
    ? contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : groups.find(group => group._id === selectedGroup)?.members
        .map(member => contacts.find(contact => contact._id === member.memberId))
        .filter(contact => contact && (
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase())
        )) || [];

        const viewConfig = {
          columns: [
            { key: "name", label: "Name" },
            { key: "company", label: "Company" },
            { key: "email", label: "Email" },
            { key: "phone", label: "Phone" },
            { key: "status", label: "Status" },
            { key: "actions", label: "Actions" }, // ✅ Add Actions column
          ],
          statusOptions: ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"],
          getStatusBadge,
          eventMapper: (data) =>
            data.map((contact) => ({
              title: contact.name,
              start: new Date(contact.createdAt || Date.now()),
              extendedProps: { item: contact },
            })),
        };

        const openSidebar = (contact) => {
          setSelectedContact(contact);
          setIsSidebarOpen(true);
        };
        
        
  return (
    <div>
      <PageHeader title="Contacts" subtitle="Manage your contacts and stay connected with your network." icon={Contact} />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
       
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Select Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Contacts</SelectItem>
              {groups.map(group => (
                <SelectItem key={group._id} value={group._id}>{group.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" id="csvUpload" disabled={loading} />
            <Button variant="outline" onClick={() => document.getElementById("csvUpload").click()} disabled={loading}>
              {loading ? "Uploading..." : <><img src="/csv.svg" alt="CSV Icon" className="h-5 w-5" /> Upload CSV</>}
            </Button>
           
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="p-2">
      <Settings className="h-5 w-5" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    <DropdownMenuItem onClick={() => setIsDialogOpen(true)}><Plus className="mr-2 h-4 w-4" />Add New Contact</DropdownMenuItem>
    <DropdownMenuItem onClick={() => setIsDeleteAllDialogOpen(true)} className="text-red-500"><Trash className="mr-2 h-4 w-4" /> Delete All Contacts</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>Enter the details of your new contact.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label>Name*</Label>
                  <Input value={newContact.name} onChange={(e) => setNewContact({ ...newContact, name: e.target.value })} placeholder="Full name" disabled={loading} />
                  <Label>Company*</Label>
                  <Input value={newContact.company} onChange={(e) => setNewContact({ ...newContact, company: e.target.value })} placeholder="Company" disabled={loading} />
                  <Label>Email*</Label>
                  <Input type="email" value={newContact.email} onChange={(e) => setNewContact({ ...newContact, email: e.target.value })} placeholder="Email address" disabled={loading} />
                  <Label>Phone</Label>
                  <Input value={newContact.phone} onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone number" disabled={loading} />
                  <Label>Status</Label>
<Select value={newContact.status} onValueChange={(value) => setNewContact({ ...newContact, status: value })} disabled={loading}>
  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
  <SelectContent>
    <SelectItem value="New">New</SelectItem>
    <SelectItem value="Contacted">Contacted</SelectItem>
    <SelectItem value="Qualified">Qualified</SelectItem>
    <SelectItem value="Proposal">Proposal</SelectItem>
    <SelectItem value="Negotiation">Negotiation</SelectItem>
    <SelectItem value="Won">Won</SelectItem>
  </SelectContent>
</Select>

                </div>
                <DialogFooter>
                  <Button onClick={handleAddContact} disabled={loading}>
                    {loading ? "Adding..." : "Add Contact"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <ViewSwitcher
  view="list"
  setView={() => {}}
  data={filteredContacts}
  viewConfig={{
    columns: [
      {
        key: "name",
        label: "Name",
        render: (contact) => (
          <button
            className="text-pink-500 font-medium hover:underline"
            onClick={() => openSidebar(contact)}
          >
            {contact.name}
          </button>
        ),
      },
      { key: "company", label: "Company" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "status", label: "Status" },
    ],
  }}
  onItemClick={openSidebar} // ✅ Ensures sidebar opens on row click
/>




      
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete all contacts? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => setIsDeleteAllDialogOpen(false)}>Cancel</Button>
      <Button variant="destructive" onClick={handleDeleteAllContacts} disabled={loading}>
        {loading ? "Deleting..." : "Delete All"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
<EntityDetailsSidebar
        entity={selectedContact}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onUpdate={updateContact}
        onDelete={handleDeleteContact}
        entityType="contact"
      />

    </div>
  );
};

export default Contacts;