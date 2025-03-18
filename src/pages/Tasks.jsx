import { Calendar, Filter, Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import TaskDetailsSidebar from "@/components/lead/TaskDetailsSidebar";
import ViewSwitcher from "@/components/common/ViewSwitcher";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "High": return "bg-red-500 text-white";
    case "Medium": return "bg-amber-500 text-white";
    case "Low": return "bg-blue-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Completed": return "bg-green-500 text-white";
    case "In Progress": return "bg-blue-500 text-white";
    case "To Do": return "bg-yellow-500 text-white";
    default: return "bg-gray-500 text-white";
  }
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("list");
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
      toast({ title: "Error", description: "Failed to fetch tasks", variant: "destructive" });
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/tasks/${taskId}`);
      fetchTasks(); // Refresh task list
      handleCloseSidebar(); // Close sidebar after deletion
      toast({ title: "Task deleted", description: "The task was removed successfully." });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" });
    }
  };

  const handleOpenSidebar = (task) => setSelectedTask(task);
  const handleCloseSidebar = () => setSelectedTask(null);

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const statuses = ["To Do", "In Progress", "Completed"];
      const currentIndex = statuses.indexOf(currentStatus);
      const newStatus = statuses[(currentIndex + 1) % statuses.length];
      await axios.put(`${API_BASE_URL}/api/tasks/${id}`, { status: newStatus });
      fetchTasks();
      toast({ title: "Task updated", description: `Task status changed to ${newStatus}.` });
    } catch (error) {
      console.error("Error updating task status:", error);
      toast({ title: "Error", description: "Failed to update task status", variant: "destructive" });
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const viewConfig = {
    columns: [
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "dueDate", label: "Due Date" },
      { key: "priority", label: "Priority" },
      { key: "status", label: "Status" },
    ],
    statusOptions: ["To Do", "In Progress", "Completed"],
    getStatusBadge,
    eventMapper: (data) =>
      data.map(task => ({
        title: task.title,
        start: new Date(task.dueDate || Date.now()),
        extendedProps: { item: task },
      })),
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Manage your tasks and stay on top of your to-do list."
        icon={Calendar}
      />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Fill in the details to create a new task.</DialogDescription>
              </DialogHeader>
              <TaskForm onTaskAdded={fetchTasks} onClose={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ViewSwitcher
        view={view}
        setView={setView}
        data={filteredTasks}
        viewConfig={viewConfig}
        onItemClick={handleOpenSidebar}
        onUpdateStatus={toggleTaskStatus}
      />

      <TaskDetailsSidebar
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseSidebar}
        onUpdate={fetchTasks}
        onDelete={deleteTask}
      />
    </div>
  );
};

// TaskForm (unchanged, included for completeness)
const TaskForm = ({ onTaskAdded, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [relatedModel, setRelatedModel] = useState("Lead");
  const [relatedTo, setRelatedTo] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignees, setAssignees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, leadsRes, contactsRes, dealsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/users`),
          axios.get(`${API_BASE_URL}/api/leads`),
          axios.get(`${API_BASE_URL}/api/contacts`),
          axios.get(`${API_BASE_URL}/api/deals`),
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newTask = {
        title,
        description,
        dueDate: dueDate || null,
        priority,
        relatedTo: relatedTo || null,
        relatedModel: relatedModel || null,
        assignedTo: assignedTo || null,
        status: "To Do",
      };
      await axios.post(`${API_BASE_URL}/api/tasks`, newTask);
      toast({ title: "Task created successfully!" });
      onTaskAdded();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error adding task:", error.response?.data || error.message);
      toast({ title: "Error", description: "Failed to create task", variant: "destructive" });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
      <h3 className="text-lg font-medium mb-3">Create New Task</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="font-medium mb-2">Task Title:</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
            className="p-3 border rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-2">Description:</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
            className="p-3 border rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-2">Due Date:</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="p-3 border rounded-md"
          />
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-2">Priority:</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-3 border rounded-md"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="font-medium mb-2">Related To:</label>
          <select
            value={relatedModel}
            onChange={(e) => setRelatedModel(e.target.value)}
            className="w-full p-3 border rounded-md"
          >
            <option value="Lead">Lead</option>
            <option value="Contact">Contact</option>
            <option value="Deal">Deal</option>
          </select>
        </div>
        {relatedModel === "Lead" && (
          <div className="flex flex-col">
            <label className="font-medium mb-2">Select Lead:</label>
            <select
              value={relatedTo}
              onChange={(e) => setRelatedTo(e.target.value)}
              className="w-full p-3 border rounded-md"
            >
              <option value="">Select Lead</option>
              {leads.map(lead => <option key={lead._id} value={lead._id}>{lead.name}</option>)}
            </select>
          </div>
        )}
        {relatedModel === "Contact" && (
          <div className="flex flex-col">
            <label className="font-medium mb-2">Select Contact:</label>
            <select
              value={relatedTo}
              onChange={(e) => setRelatedTo(e.target.value)}
              className="w-full p-3 border rounded-md"
            >
              <option value="">Select Contact</option>
              {contacts.map(contact => <option key={contact._id} value={contact._id}>{contact.name}</option>)}
            </select>
          </div>
        )}
        {relatedModel === "Deal" && (
          <div className="flex flex-col">
            <label className="font-medium mb-2">Select Deal:</label>
            <select
              value={relatedTo}
              onChange={(e) => setRelatedTo(e.target.value)}
              className="w-full p-3 border rounded-md"
            >
              <option value="">Select Deal</option>
              {deals.map(deal => <option key={deal._id} value={deal._id}>{deal.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex flex-col">
          <label className="font-medium mb-2">Assign To:</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full p-3 border rounded-md"
          >
            <option value="">Select Assignee</option>
            {assignees.map(user => <option key={user._id} value={user._id}>{user.name}</option>)}
          </select>
        </div>
        <Button type="submit" className="w-full mt-4 p-3 bg-black text-white rounded-md">
          Create Task
        </Button>
      </form>
    </div>
  );
};

export default Tasks;