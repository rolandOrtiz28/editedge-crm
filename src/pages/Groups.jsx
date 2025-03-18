import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash, Plus, UserPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [memberType, setMemberType] = useState("lead");
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [isViewMembersDialogOpen, setIsViewMembersDialogOpen] = useState(false);
  const [selectedGroupForView, setSelectedGroupForView] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchLeadsAndContacts();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups`, { credentials: "include" });
      const data = await response.json();
      if (Array.isArray(data)) setGroups(data);
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
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === groupId
              ? { ...group, members: group.members.filter((m) => m.memberId !== memberId) }
              : group
          )
        );
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
    if (!groupId || !confirm("Are you sure you want to delete this group?")) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/groups/${groupId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Group deleted successfully!" });
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
        setGroups((prevGroups) =>
          prevGroups.map((group) =>
            group._id === selectedGroup
              ? {
                  ...group,
                  members: [
                    ...group.members,
                    ...data.addedMembers.map((m) => ({
                      memberId: m.memberId,
                      name: m.name,
                      email: m.email,
                      type: memberType,
                    })),
                  ],
                }
              : group
          )
        );
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
    .filter((member) =>
      searchQuery === "" || member.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((member) => {
      if (!showRecent) return true;
      if (!member.createdAt) return false;
      const memberDate = new Date(member.createdAt);
      const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return memberDate >= cutoffDate;
    });

  const handleViewMembers = (group) => {
    setSelectedGroupForView(group);
    setIsViewMembersDialogOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Groups Management</h1>
        <Button
          onClick={() => setIsGroupDialogOpen(true)}
          className="bg-brand-black hover:bg-blue-700 text-white flex items-center gap-2"
          aria-label="Create a new group"
        >
          <Plus className="h-5 w-5" /> New Group
        </Button>
      </div>

      {/* Group Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card
            key={group._id}
            className="shadow-lg rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 cursor-pointer"
            onClick={() => handleViewMembers(group)}
          >
            <CardHeader className="flex flex-row justify-between items-center border-b p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">{group.name}</h2>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          setSelectedGroup(group._id);
                          setIsAddMemberDialogOpen(true);
                        }}
                        aria-label={`Add members to ${group.name}`}
                      >
                        <UserPlus className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Add Members</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleDeleteGroup(group._id);
                        }}
                        aria-label={`Delete ${group.name}`}
                      >
                        <Trash className="h-5 w-5 text-red-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete Group</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {group.members.length > 0 ? (
                <ul className="space-y-2">
                  {group.members.slice(0, 3).map((member, index) => (
                    <li
                      key={member.memberId || member.email || index}
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {member.name} ({member.email})
                    </li>
                  ))}
                  {group.members.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      +{group.members.length - 3} more...
                    </p>
                  )}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-2">No members in this group.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View All Members Dialog */}
      <Dialog open={isViewMembersDialogOpen} onOpenChange={setIsViewMembersDialogOpen}>
        <DialogContent className="p-6 max-w-3xl bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Members of {selectedGroupForView?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedGroupForView && selectedGroupForView.members.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-600 dark:text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-600 dark:text-gray-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedGroupForView.members.map((member, index) => (
                    <TableRow key={member.memberId || member.email || index}>
                      <TableCell className="font-medium text-gray-800 dark:text-gray-200">
                        {member.name}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">{member.email}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveMember(selectedGroupForView._id, member.memberId, member.type)
                          }
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Remove ${member.name} from ${selectedGroupForView.name}`}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No members in this group.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Group Dialog */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent className="p-6 max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="groupName" className="text-gray-700 dark:text-gray-300">
                Group Name
              </Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="mt-1"
                aria-required="true"
              />
            </div>
            <Button
              onClick={handleCreateGroup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!groupName.trim()}
            >
              Create Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent className="p-6 max-w-lg bg-white dark:bg-gray-900 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Add Members to Group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="memberType" className="text-gray-700 dark:text-gray-300">
                Member Type
              </Label>
              <select
                id="memberType"
                value={memberType}
                onChange={(e) => setMemberType(e.target.value)}
                className="mt-1 w-full border rounded-md p-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="lead">Lead</option>
                <option value="contact">Contact</option>
              </select>
            </div>
            <div>
              <Label htmlFor="searchMembers" className="text-gray-700 dark:text-gray-300">
                Search Members
              </Label>
              <Input
                id="searchMembers"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name"
                className="mt-1"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="showRecent" className="text-gray-700 dark:text-gray-300">
                Show Recently Added
              </Label>
              <Switch id="showRecent" checked={showRecent} onCheckedChange={setShowRecent} />
            </div>
            <div className="max-h-48 overflow-y-auto border rounded-md p-2">
              {filteredMembers.map((member) => {
                const isAlreadyInGroup = groups
                  .find((g) => g._id === selectedGroup)?.members
                  .some((m) => m.memberId === member._id);
                return (
                  <div key={member._id} className="flex items-center py-1">
                    <Checkbox
                      id={`member-${member._id}`}
                      checked={selectedMembers.includes(member._id)}
                      onCheckedChange={(checked) =>
                        setSelectedMembers((prev) =>
                          checked ? [...prev, member._id] : prev.filter((id) => id !== member._id)
                        )
                      }
                      disabled={isAlreadyInGroup}
                    />
                    <Label
                      htmlFor={`member-${member._id}`}
                      className={`ml-2 ${isAlreadyInGroup ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {member.name} ({member.email})
                    </Label>
                  </div>
                );
              })}
            </div>
            <Button
              onClick={handleBulkAddMembers}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={selectedMembers.length === 0}
            >
              Add Selected Members
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Groups;