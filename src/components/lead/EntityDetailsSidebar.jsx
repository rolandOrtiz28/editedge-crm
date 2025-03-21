import { X, Pencil, Save, Trash, Plus, Bell, Mail, PhoneCall, MessageCircle, UserCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const statusOptions = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"];

const EntityDetailsSidebar = ({ entity, isOpen, onClose, onUpdate, onDelete, onAddNote, onAddReminder, entityType, users, assignee, setAssignee, onAssign }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntity, setEditedEntity] = useState(entity ? { ...entity } : {});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newReminderText, setNewReminderText] = useState("");
  const [newReminderDate, setNewReminderDate] = useState(null);

  useEffect(() => {
    if (entity) {
      setEditedEntity({ ...entity });
    }
  }, [entity]);

  if (!entity) return null;

  const handleUpdate = () => {
    axios
      .put(`${API_BASE_URL}/api/${entityType}s/${entity._id}`, editedEntity)
      .then((response) => {
        onUpdate(response.data);
        toast({ title: `${entityType} Updated`, description: "Changes saved successfully." });
        setIsEditing(false);
      })
      .catch((error) => {
        console.error(`Error updating ${entityType}:`, error);
        toast({ title: "Error", description: `Failed to update ${entityType}`, variant: "destructive" });
      });
  };

  const handleStatusChange = (newStatus) => {
    const updatedEntity = { ...editedEntity, status: newStatus };
    setEditedEntity(updatedEntity);
    axios
      .put(`${API_BASE_URL}/api/${entityType}s/${entity._id}`, updatedEntity)
      .then((response) => {
        onUpdate(response.data);
        toast({ title: "Status Updated", description: `${entityType} status changed to ${newStatus}.` });
      })
      .catch((error) => {
        console.error(`Error updating status:`, error);
        toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
      });
  };

  const handleAssign = () => {
    if (assignee !== entity.assignee) {
      onAssign(entity._id, assignee);
      // Optionally update editedEntity if you want to reflect the change immediately
      setEditedEntity({ ...editedEntity, assignee });
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    onAddNote(entity._id, newNote);
    setNewNote("");
  };

  const handleAddReminder = () => {
    if (!newReminderText.trim() || !newReminderDate) return;
    onAddReminder(entity._id, newReminderText, newReminderDate.toISOString());
    setNewReminderText("");
    setNewReminderDate(null);
  };

  const fields = {
    lead: [
      { key: "name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "email", label: "Email", actionIcon: <Mail className="h-4 w-4" /> },
      { key: "phone", label: "Phone", actionIcon: <PhoneCall className="h-4 w-4" /> },
      { key: "address", label: "Address" },
      { key: "website", label: "Website" },
      { key: "description", label: "Description" },
      { key: "channel", label: "Channel" },
      { key: "companySize", label: "Company Size" },
      { key: "niche", label: "Niche" },
      { key: "value", label: "Lead Value ($)" },
      { key: "assignee", label: "Assignee", customRender: true }, // Add custom render for assignee
    ],
    contact: [
      { key: "name", label: "Name" },
      { key: "company", label: "Company" },
      { key: "email", label: "Email", actionIcon: <Mail className="h-4 w-4" /> },
      { key: "phone", label: "Phone", actionIcon: <PhoneCall className="h-4 w-4" /> },
      { key: "status", label: "Status" },
    ],
  };

  return (
    <div
      className={`fixed right-0 top-[60px] h-[calc(100vh-60px)] w-[450px] bg-[#303030] text-[#f0f0f0] shadow-xl transition-transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } overflow-y-auto flex flex-col p-5 z-50`}
    >
      {/* Close Button */}
      <div className="flex justify-between items-center border-b pb-3 mb-3">
        <h2 className="text-sm font-semibold">{entityType.charAt(0).toUpperCase() + entityType.slice(1)} Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5 text-[#f0f0f0]" />
        </Button>
      </div>

      {/* Profile Section */}
      <div className="flex items-center gap-4 pb-3 border-b mb-4">
        <div className="w-12 h-12 bg-[#404040] rounded-full flex items-center justify-center">
          <UserCircle className="h-10 w-10 text-[#f0f0f0]" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium">{editedEntity.name || "Unknown"}</h3>
          <p className="text-sm text-gray-400">{editedEntity.company || "No Company"}</p>
        </div>
      </div>

      {/* Information Fields */}
      <div className="space-y-3">
        {fields[entityType].map((field) => (
          <div key={field.key} className="relative">
            <Label className="text-xs text-[#f0f0f0]">{field.label}</Label>
            {field.customRender ? (
              <div className="flex items-center justify-between p-3 rounded-md bg-[#ff077f] bg-opacity-0 hover:bg-opacity-10 group">
                <p className="text-sm text-[#f0f0f0] font-medium">
                  {users.find(u => u._id === entity.assignee)?.name || "Unassigned"}
                </p>
                {isEditing && (
                  <div className="flex items-center gap-2">
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger className="text-sm bg-[#404040] text-[#f0f0f0] border-none focus:ring-0 w-40">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Unassigned</SelectItem>
                        {users.map(user => (
                          <SelectItem key={user._id} value={user._id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssign}
                      className="bg-[#ff077f] text-white hover:bg-[#ff005f] px-2 py-1 text-sm"
                      disabled={!assignee || assignee === entity.assignee}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </div>
            ) : isEditing ? (
              <Input
                value={editedEntity[field.key] || ""}
                onChange={(e) => setEditedEntity({ ...editedEntity, [field.key]: e.target.value })}
                className="text-sm bg-[#404040] text-[#f0f0f0] border-none focus:ring-0"
              />
            ) : (
              <div className="flex items-center justify-between p-3 rounded-md bg-[#ff077f] bg-opacity-0 hover:bg-opacity-10 group">
                <p className="text-sm text-[#f0f0f0] font-medium">{entity[field.key] || "N/A"}</p>
                {field.actionIcon && (
                  <button className="hidden group-hover:flex items-center justify-center hover:bg-[#ff005f] text-white rounded-full p-2 transition">
                    {field.actionIcon}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Status (for Leads) */}
        {entityType === "lead" && (
          <div>
            <Label className="text-xs text-[#f0f0f0]">Status</Label>
            <Select value={editedEntity?.status || "New"} onValueChange={handleStatusChange}>
              <SelectTrigger className="text-sm bg-[#404040] text-[#f0f0f0] border-none focus:ring-0">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes Section (for Leads) */}
        {entityType === "lead" && (
          <div className="mt-4">
            <Label className="text-xs text-[#f0f0f0]">Notes</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {entity.notes && entity.notes.length > 0 ? (
                entity.notes.map((note, index) => (
                  <div key={index} className="p-2 bg-[#404040] rounded-md text-sm">
                    {note}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No notes yet.</p>
              )}
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="text-sm bg-[#404040] text-[#f0f0f0] border-none focus:ring-0"
              />
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="bg-[#ff077f] text-white hover:bg-[#ff005f]"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Reminders Section (for Leads) */}
        {entityType === "lead" && (
          <div className="mt-4">
            <Label className="text-xs text-[#f0f0f0]">Reminders</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {entity.reminders && entity.reminders.length > 0 ? (
                entity.reminders.map((reminder, index) => (
                  <div key={index} className="p-2 bg-[#404040] rounded-md text-sm flex justify-between">
                    <span>{reminder.text}</span>
                    <span>{new Date(reminder.date).toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No reminders yet.</p>
              )}
            </div>
            <div className="mt-2 space-y-2">
              <Input
                value={newReminderText}
                onChange={(e) => setNewReminderText(e.target.value)}
                placeholder="Reminder text..."
                className="text-sm bg-[#404040] text-[#f0f0f0] border-none focus:ring-0"
              />
              <DatePicker
                selected={newReminderDate}
                onChange={(date) => setNewReminderDate(date)}
                showTimeSelect
                dateFormat="Pp"
                placeholderText="Select date and time"
                className="w-full text-sm bg-[#404040] text-[#f0f0f0] border-none rounded-md p-2"
              />
              <Button
                onClick={handleAddReminder}
                disabled={!newReminderText.trim() || !newReminderDate}
                className="w-full bg-[#ff077f] text-white hover:bg-[#ff005f]"
              >
                <Bell className="h-4 w-4 mr-1" /> Add Reminder
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-2 mt-4">
        <Button
          variant="outline"
          className="w-full text-[#f0f0f0] bg-[#333333]"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4 mr-1" />
          {isEditing ? "Cancel Edit" : "Edit"}
        </Button>
        {isEditing && (
          <Button
            className="w-full bg-[#ff077f] text-white hover:bg-[#ff005f]"
            onClick={handleUpdate}
          >
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        )}
        <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="w-full bg-red-600 text-white hover:bg-red-500">
              <Trash className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {entityType}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="bg-red-600 text-white hover:bg-red-500"
                onClick={() => {
                  onDelete(entity._id);
                  setIsConfirmOpen(false);
                }}
              >
                Yes, Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EntityDetailsSidebar;