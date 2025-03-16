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

const statusOptions = ["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"];

const EntityDetailsSidebar = ({ entity, isOpen, onClose, onUpdate, onDelete, entityType }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntity, setEditedEntity] = useState(entity ? { ...entity } : {});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [users, setUsers] = useState([]); // State for users/assignees

  useEffect(() => {
    if (entity) {
      setEditedEntity({ ...entity });
    }
  }, [entity]);

  if (!entity) return null;

  const handleUpdate = () => {
    axios
      .put(`http://localhost:3000/api/${entityType}s/${entity._id}`, editedEntity)
      .then((response) => {
        onUpdate(response.data);
        toast({ title: `${entityType} Updated`, description: "Changes saved successfully." });
        setIsEditing(false);
      })
      .catch((error) => console.error(`Error updating ${entityType}:`, error));
  };

  const handleStatusChange = (newStatus) => {
    const updatedEntity = { ...editedEntity, status: newStatus };
    setEditedEntity(updatedEntity);
    axios
      .put(`http://localhost:3000/api/${entityType}s/${entity._id}`, updatedEntity)
      .then((response) => {
        onUpdate(response.data);
        toast({ title: "Status Updated", description: `${entityType} status changed to ${newStatus}.` });
      })
      .catch((error) => console.error(`Error updating status:`, error));
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
      <div className="space-y-3 flex-grow">
        {fields[entityType].map((field) => (
          <div key={field.key} className="relative">
            <Label className="text-xs text-[#f0f0f0]">{field.label}</Label>
            {isEditing ? (
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

        {/* Status */}
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
      </div>

      {/* Action Buttons */}
      {/* Action Buttons */}
<div className="flex justify-between gap-2 mt-4">
  <Button variant="outline" className="w-full text-[#f0f0f0] bg-[#333333]" onClick={() => setIsEditing(!isEditing)}>
    <Pencil className="h-4 w-4 mr-1" />
    {isEditing ? "Cancel Edit" : "Edit"}
  </Button>
  {isEditing && (
    <Button className="w-full bg-[#ff077f] text-white hover:bg-[#ff005f]" onClick={handleUpdate}>
      <Save className="h-4 w-4 mr-1" />
      Save
    </Button>
  )}
  {/* Delete Button with Confirmation Dialog */}
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
