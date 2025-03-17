// Meetings.jsx
import { Calendar, Plus, Search } from "lucide-react";
import { useState, useEffect } from "react";
import PageHeader from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MeetingCard from "@/components/ui/MeetingCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import axios from "axios";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";


const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [newMeetingContact, setNewMeetingContact] = useState("");
  const [newMeetingCompany, setNewMeetingCompany] = useState("");
  const [newMeetingDate, setNewMeetingDate] = useState("");
  const [newMeetingTime, setNewMeetingTime] = useState("");
  const [newMeetingDuration, setNewMeetingDuration] = useState("15 min");
  const [newMeetingType, setNewMeetingType] = useState("Scheduled");
  const [newMeetingNotes, setNewMeetingNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/meetings`, { withCredentials: true });
      setMeetings(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch meetings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeeting = async () => {
    if (!newMeetingContact.trim() || !newMeetingCompany.trim() || !newMeetingDate.trim() || !newMeetingTime.trim()) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const newMeeting = {
      contact: newMeetingContact,
      company: newMeetingCompany,
      date: newMeetingDate,
      time: newMeetingTime,
      duration: newMeetingDuration,
      type: newMeetingType,
      notes: newMeetingNotes,
      status: "Pending",
    };

    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/meetings`, newMeeting, { withCredentials: true });
      setMeetings([response.data, ...meetings]);
      resetForm();
      setIsDialogOpen(false);
      toast({ title: "Meeting scheduled", description: "Your meeting has been scheduled successfully" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule meeting",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewMeetingContact("");
    setNewMeetingCompany("");
    setNewMeetingDate("");
    setNewMeetingTime("");
    setNewMeetingDuration("15 min");
    setNewMeetingType("Scheduled");
    setNewMeetingNotes("");
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Meetings"
        subtitle="Schedule and manage your meetings with clients and leads."
        icon={Calendar}
        className="mb-6"
      />

      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 items-start sm:items-center justify-between mb-6">
        <div className="relative w-full sm:w-64 lg:w-72">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search meetings..." className="pl-8 w-full" />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto" disabled={loading}>
              <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-lg md:max-w-[525px]">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Schedule New Meeting</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Schedule a new meeting with your contact.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="contact" className="text-right sm:col-span-1">Contact Name</Label>
                <Input
                  id="contact"
                  value={newMeetingContact}
                  onChange={(e) => setNewMeetingContact(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right sm:col-span-1">Company</Label>
                <Input
                  id="company"
                  value={newMeetingCompany}
                  onChange={(e) => setNewMeetingCompany(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right sm:col-span-1">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newMeetingDate}
                  onChange={(e) => setNewMeetingDate(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="time" className="text-right sm:col-span-1">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newMeetingTime}
                  onChange={(e) => setNewMeetingTime(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right sm:col-span-1">Duration</Label>
                <Select value={newMeetingDuration} onValueChange={setNewMeetingDuration}>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15 min">15 minutes</SelectItem>
                    <SelectItem value="30 min">30 minutes</SelectItem>
                    <SelectItem value="45 min">45 minutes</SelectItem>
                    <SelectItem value="60 min">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right sm:col-span-1">Meeting Type</Label>
                <Select value={newMeetingType} onValueChange={setNewMeetingType}>
                  <SelectTrigger className="col-span-1 sm:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In-person">In-person</SelectItem>
                    <SelectItem value="Virtual">Virtual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right sm:col-span-1">Notes</Label>
                <Textarea
                  id="notes"
                  value={newMeetingNotes}
                  onChange={(e) => setNewMeetingNotes(e.target.value)}
                  className="col-span-1 sm:col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMeeting} disabled={loading} className="w-full sm:w-auto">
                {loading ? "Scheduling..." : "Schedule Meeting"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="animate-fade-in">
        <TabsList className="mb-6 flex justify-start overflow-x-auto">
          <TabsTrigger value="all">All Meetings</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading ? (
              <p className="col-span-full text-center">Loading meetings...</p>
            ) : meetings.length > 0 ? (
              meetings.map((meeting) => (
                <MeetingCard key={meeting._id} meeting={meeting} />
              ))
            ) : (
              <p className="col-span-full text-center">No meetings scheduled yet.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Meetings;