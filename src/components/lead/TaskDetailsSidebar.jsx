import { useState, useEffect } from "react";
import axios from "axios";
import { X, Pencil, Save, Trash, Calendar, User, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TaskDetailsSidebar = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task ? { ...task } : {});
  const [assignees, setAssignees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [selectedRelatedModel, setSelectedRelatedModel] = useState("");

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setSelectedRelatedModel(task.relatedModel || "");
    }
  }, [task, isEditing]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, leadsRes, contactsRes, dealsRes] = await Promise.all([
          axios.get("http://localhost:3000/api/users"),
          axios.get("http://localhost:3000/api/leads"),
          axios.get("http://localhost:3000/api/contacts"),
          axios.get("http://localhost:3000/api/deals"),
        ]);

        setAssignees(usersRes.data || []);
        setLeads(leadsRes.data || []);
        setContacts(contactsRes.data || []);
        setDeals(dealsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  if (!task) return null;

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:3000/api/tasks/${task._id}`, editedTask);
      onUpdate(response.data);
      setEditedTask(response.data);
      setSelectedRelatedModel(response.data.relatedModel || "");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditedTask({ ...task });
      setSelectedRelatedModel(task.relatedModel || "");
    }
  };

  return (
    <div
      className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-[450px] bg-gradient-to-b from-[#2a2a2a] to-[#303030] text-[#f0f0f0] shadow-2xl transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } overflow-y-auto flex flex-col`}
      style={{ zIndex: 50 }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-6 pb-4 border-b border-[#404040]">
        <h2 className="text-xl font-bold tracking-tight">Task Details</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="hover:bg-[#404040] rounded-full"
        >
          <X className="h-5 w-5 text-[#f0f0f0]" />
        </Button>
      </div>

      {/* Task Information */}
      <div className="flex-grow px-6 py-4 space-y-6">
        {/* Task Title */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#d0d0d0]">Title</Label>
          {isEditing ? (
            <Input
              value={editedTask.title || ""}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full p-3 bg-[#383838] border-[#505050] text-[#f0f0f0] rounded-lg focus:ring-2 focus:ring-[#ff077f] focus:border-transparent transition-all"
            />
          ) : (
            <p className="p-3 bg-[#383838] rounded-lg text-[#f0f0f0]">{editedTask.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#d0d0d0]">Description</Label>
          {isEditing ? (
            <textarea
              value={editedTask.description || ""}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full p-3 bg-[#383838] border-[#505050] text-[#f0f0f0] rounded-lg focus:ring-2 focus:ring-[#ff077f] focus:border-transparent transition-all min-h-[100px] resize-y"
            />
          ) : (
            <p className="p-3 bg-[#383838] rounded-lg text-[#f0f0f0]">
              {editedTask.description || "No description provided"}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#d0d0d0] flex items-center gap-2">
            <Calendar className="h-4 w-4" /> Due Date
          </Label>
          {isEditing ? (
            <Input
              type="date"
              value={editedTask.dueDate ? new Date(editedTask.dueDate).toISOString().split("T")[0] : ""}
              onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
              className="w-full p-3 bg-[#383838] border-[#505050] text-[#f0f0f0] rounded-lg focus:ring-2 focus:ring-[#ff077f] focus:border-transparent transition-all"
            />
          ) : (
            <p className="p-3 bg-[#383838] rounded-lg text-[#f0f0f0]">
              {editedTask.dueDate ? new Date(editedTask.dueDate).toLocaleDateString() : "No due date"}
            </p>
          )}
        </div>

        {/* Related Model Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#d0d0d0]">Related To</Label>
          {isEditing ? (
            <div className="space-y-3">
              <Select
                value={selectedRelatedModel}
                onValueChange={(val) => {
                  setSelectedRelatedModel(val);
                  setEditedTask({ ...editedTask, relatedModel: val, relatedTo: "" });
                }}
              >
                <SelectTrigger className="w-full p-3 bg-[#383838] text-[#f0f0f0] border-[#505050] rounded-lg hover:bg-[#404040] transition-all">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#383838] text-[#f0f0f0] border-[#505050]">
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Contact">Contact</SelectItem>
                  <SelectItem value="Deal">Deal</SelectItem>
                </SelectContent>
              </Select>

              {selectedRelatedModel && (
                <Select
                  value={editedTask.relatedTo || ""}
                  onValueChange={(val) => setEditedTask({ ...editedTask, relatedTo: val })}
                >
                  <SelectTrigger className="w-full p-3 bg-[#383838] text-[#f0f0f0] border-[#505050] rounded-lg hover:bg-[#404040] transition-all">
                    <SelectValue>
                      {editedTask.relatedTo
                        ? (selectedRelatedModel === "Lead" ? leads : selectedRelatedModel === "Contact" ? contacts : deals)
                            .find((item) => item._id === editedTask.relatedTo)?.name || "Select related item"
                        : "Select related item"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-[#383838] text-[#f0f0f0] border-[#505050]">
                    {(selectedRelatedModel === "Lead" ? leads : selectedRelatedModel === "Contact" ? contacts : deals).map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <p className="p-3 bg-[#383838] rounded-lg text-[#f0f0f0]">
              {editedTask.relatedModel ? `${editedTask.relatedModel}: ${(selectedRelatedModel === "Lead" ? leads : selectedRelatedModel === "Contact" ? contacts : deals).find((item) => item._id === editedTask.relatedTo)?.name || "N/A"}` : "Not linked"}
            </p>
          )}
        </div>

        {/* Assigned To */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-[#d0d0d0] flex items-center gap-2">
            <User className="h-4 w-4" /> Assigned To
          </Label>
          {isEditing ? (
            <Select
              value={editedTask.assignedTo || ""}
              onValueChange={(val) => setEditedTask({ ...editedTask, assignedTo: val })}
            >
              <SelectTrigger className="w-full p-3 bg-[#383838] text-[#f0f0f0] border-[#505050] rounded-lg hover:bg-[#404040] transition-all">
                <SelectValue>
                  {editedTask.assignedTo
                    ? assignees.find((user) => user._id === editedTask.assignedTo)?.name || "Select assignee"
                    : "Select assignee"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#383838] text-[#f0f0f0] border-[#505050]">
                {assignees.map((user) => (
                  <SelectItem key={user._id} value={user._id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="p-3 bg-[#383838] rounded-lg text-[#f0f0f0]">
              {assignees.find((user) => user._id === editedTask.assignedTo)?.name || "Unassigned"}
            </p>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-6 pt-4 border-t border-[#404040] bg-[#2a2a2a] flex gap-3">
        <Button
          variant="outline"
          className="w-full bg-[#383838] text-[#f0f0f0] border-[#505050] hover:bg-[#404040] rounded-lg transition-all"
          onClick={handleEditToggle}
        >
          <Pencil className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit"}
        </Button>
        {isEditing && (
          <Button
            className="w-full bg-[#ff077f] text-white hover:bg-[#e00670] rounded-lg transition-all"
            onClick={handleUpdate}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        )}
        <Button
          variant="destructive"
          className="w-full bg-red-700 text-white hover:bg-red-800 rounded-lg transition-all"
          onClick={() => onDelete(task._id)}
        >
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
};

export default TaskDetailsSidebar;