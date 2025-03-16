import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react"; // 3-dot menu icon
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Trash,Plus } from "lucide-react";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_BASE_URL_DEV
    : import.meta.env.VITE_API_BASE_URL;

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [memberType, setMemberType] = useState("lead");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]); // ✅ New State
const [selectAll, setSelectAll] = useState(false); // ✅ Select All Checkbox State
const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchLeadsAndContacts();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, { credentials: "include" });
      const data = await response.json();

      if (Array.isArray(data)) {
        setGroups(data);
      }
    } catch (error) {
      console.error("❌ Error fetching groups:", error);
    }
  };

  const fetchLeadsAndContacts = async () => {
    try {
      const [leadsRes, contactsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/leads`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/contacts`, { credentials: "include" }),
      ]);

      const leadsData = await leadsRes.json();
      const contactsData = await contactsRes.json();

      setLeads(Array.isArray(leadsData.leads) ? leadsData.leads : leadsData);
      setContacts(Array.isArray(contactsData.contacts) ? contactsData.contacts : contactsData);
    } catch (error) {
      console.error("Error fetching leads/contacts:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast({ title: "Error", description: "Group name cannot be empty", variant: "destructive" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: groupName }),
      });

      const data = await response.json();
      if (response.ok) {
        setGroups((prevGroups) => [...prevGroups, data.group]);
        setGroupName("");
        setIsGroupDialogOpen(false);
        toast({ title: "Success", description: "Group created successfully!" });
      } else {
        toast({ title: "Error", description: data.error || "Failed to create group", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  

  const handleRemoveMember = async (groupId, memberId, type) => {
    if (!groupId || !memberId || !type) return;
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}/remove-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ memberId, type }),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Member removed successfully!" });
  
        // ✅ Update UI: Remove member from the group
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === groupId
              ? { ...group, members: group.members.filter((m) => m.memberId !== memberId) }
              : group
          )
        );
  
        // ✅ Remove from disabled members so it can be added again
        setSelectedMembers((prev) => prev.filter((id) => id !== memberId));
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      toast({ title: "Error", description: "Failed to remove member!", variant: "destructive" });
    }
  };
  
  
  const handleDeleteGroup = async (groupId) => {
    if (!groupId) return;
  
    if (!confirm("Are you sure you want to delete this group?")) return; // Confirmation prompt
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });
  
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Group deleted successfully!" });
  
        // Update UI: Remove the group from local state
        setGroups((prevGroups) => prevGroups.filter((group) => group._id !== groupId));
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({ title: "Error", description: "Failed to delete group!", variant: "destructive" });
    }
  };

  const handleBulkAddMembers = async () => {
    if (!selectedGroup || selectedMembers.length === 0) {
      toast({ title: "Error", description: "Please select a group and members", variant: "destructive" });
      return;
    }
  
    console.log("📌 Sending Members for Bulk Addition:", selectedMembers);
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${selectedGroup}/add-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ memberIds: selectedMembers, type: memberType }),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Members added successfully!" });
  
        // ✅ Update UI immediately
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === selectedGroup
              ? {
                  ...group,
                  members: [...group.members, ...data.addedMembers.map((m) => ({
                    memberId: m.memberId,
                    name: m.name,
                    email: m.email,
                    type: memberType
                  }))],
                }
              : group
          )
        );
  
        // ✅ Clear selected checkboxes after adding members
        setSelectedMembers([]);
  
        setIsAddMemberDialogOpen(false);
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (error) {
      console.error("❌ Error adding members:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };
  
  

  const filteredMembers = (memberType === "lead" ? leads : contacts)
  .filter((member) => {
    // ✅ Search Query Filter
    return searchQuery === "" || member.name.toLowerCase().includes(searchQuery.toLowerCase());
  })
  .filter((member) => {
    if (!showRecent) return true; // ✅ If "Show Recently Added" is OFF, return all

    if (!member.createdAt) {
      console.warn(`⚠️ Missing createdAt for:`, member);
      return false;
    }

    const memberDate = new Date(member.createdAt);
    const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // ✅ 24 hours ago

    // ✅ Debugging log
    

    return memberDate >= cutoffDate;
  });





  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Manage Groups</h1>
        <Button onClick={() => setIsGroupDialogOpen(true)} className="bg-brand-black hover:bg-brand-neon text-white">
          + Create Group
        </Button>
      </div>

      {/* Group List */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
  {groups.map((group) => (
    <Card
      key={group._id}
      className="p-6 w-full shadow-md rounded-lg bg-white dark:bg-gray-800 h-auto min-h-[500px]" // Increased min height
    >
      <CardContent className="flex flex-col justify-between h-full">
        {/* Group Name + Actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{group.name}</h2>

          {/* 3-dots dropdown menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  console.log("🟢 Setting Selected Group:", group._id);
                  setSelectedGroup(group._id);
                  setIsAddMemberDialogOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Member
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-100 dark:hover:bg-red-700"
                onClick={() => handleDeleteGroup(group._id)}
              >
                <Trash className="mr-2 h-4 w-4" /> Delete Group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Member List (Scrollable) */}
        <div className="mt-4 flex-1">
          {group.members.length > 0 ? (
            <div className="max-h-[300px] overflow-y-auto border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Members:</h3>
              <ul className="space-y-3">
                {group.members.map((member, index) => (
                  <li
                    key={member.memberId || member.email || index}
                    className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-400"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs text-gray-500">{member.email}</span>
                    </div>
                    <button
                      className="text-red-500 text-xs hover:underline px-2 py-1"
                      onClick={() => handleRemoveMember(group._id, member.memberId, member.type)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-4">No members yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  ))}
</div>



     
      {/* Create Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="p-6 max-w-2xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
              Create a New Group
            </DialogTitle>
          </DialogHeader>
          <Label className="text-gray-700 dark:text-gray-300">Group Name</Label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Enter group name"
            className="mt-2"
          />
          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateGroup}>
            Create
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="p-6 max-w-2xl w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Add Members to Group</DialogTitle>
          </DialogHeader>
          <Label className="mt-4 text-gray-700 dark:text-gray-300">Select Member Type</Label>
<select
  value={memberType}
  onChange={(e) => setMemberType(e.target.value)}
  className="mt-2 border rounded-md p-2 w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
>
  <option value="lead">Lead</option>
  <option value="contact">Contact</option>
</select>
          <Label>Search Members</Label>
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name" />

          <div className="flex items-center justify-between mt-2">
            <Label>Show Recently Added</Label>
            <Switch checked={showRecent} onCheckedChange={setShowRecent} />
          </div>

          {/* Select All Checkbox */}
<div className="mt-2 max-h-48 overflow-y-auto">
<div className="flex items-center mb-2">
  <Checkbox
    checked={selectedMembers.length === filteredMembers.length}
    onCheckedChange={(checked) =>
      setSelectedMembers(checked ? filteredMembers.map((m) => m._id) : [])
    }
  />
   <Label className="ml-2">Select All</Label>
   </div>
  {filteredMembers.map((member) => {
    const isAlreadyInGroup = groups
      .find((g) => g._id === selectedGroup)?.members
      .some((m) => m.memberId === member._id);

    return (
      <div key={member._id} className="flex items-center mt-2">
        <Checkbox
          checked={selectedMembers.includes(member._id)}
          onCheckedChange={(checked) =>
            setSelectedMembers((prev) =>
              checked ? [...prev, member._id] : prev.filter((id) => id !== member._id)
            )
          }
          disabled={isAlreadyInGroup} // ✅ Disable if already in group
        />
        <span className={`ml-2 ${isAlreadyInGroup ? "text-gray-400" : ""}`}>
          {member.name} ({member.email})
        </span>
      </div>
    );
  })}
</div>


          <Button className="mt-4" onClick={handleBulkAddMembers}>Add Members</Button>
        </DialogContent>
      </Dialog>


    </div>
  );
};

export default Groups;
