import axios from "axios";
import { useEffect, useState } from "react";
import { BarChart4, CalendarDays, Filter, Plus } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format } from "date-fns";

axios.defaults.withCredentials = true;
// Pipeline Stages
const pipelineStages = ["Lead In", "Qualification", "Proposal", "Negotiation", "Closed Won"];

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";


const getStageBadge = (stage) => {
  switch(stage) {
    case "Lead In": return "#3498db"; // Blue
    case "Qualification": return "#f1c40f"; // Yellow
    case "Proposal": return "#e67e22"; // Orange
    case "Negotiation": return "#9b59b6"; // Violet
    case "Closed Won": return "#2ecc71"; // Green
    default: return "#bdc3c7"; // Gray
  }
};

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: "",
    company: "",
    stage: "Lead In",
    value: "",
    probability: "",
    expectedCloseDate: ""
  });
  const [editDeal, setEditDeal] = useState(null);
const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/deals`)
      .then((res) => setDeals(res.data))
      .catch((err) => console.error("Error fetching deals:", err));
  }, []);

  const handleEditDeal = (deal) => {
    setEditDeal(deal);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateDeal = () => {
    axios.put(`${API_BASE_URL}/api/deals/${editDeal._id}`, editDeal)
      .then((res) => {
        setDeals(deals.map((deal) => (deal._id === res.data._id ? res.data : deal)));
        setIsEditDialogOpen(false);
        toast({ title: "Deal Updated", description: "Deal updated successfully!" });
      })
      .catch((err) => console.error("Error updating deal:", err));
  };

  const handleDeleteDeal = (id) => {
    axios.delete(`${API_BASE_URL}/api/deals/${id}`)
      .then(() => {
        setDeals(deals.filter((deal) => deal._id !== id));
        toast({ title: "Deal Deleted", description: "Deal removed successfully!" });
      })
      .catch((err) => console.error("Error deleting deal:", err));
  };
  const handleStageChange = (dealId, newStage) => {
    console.log(`Updating deal ${dealId} to stage: ${newStage}`);
  
    axios.put(`${API_BASE_URL}/api/deals/${dealId}`, { stage: newStage })
      .then((res) => {
        console.log("✅ Stage updated successfully:", res.data);
        setDeals(deals.map((deal) => 
          deal._id === dealId ? { ...deal, stage: newStage } : deal
        ));
        toast({ title: "Stage Updated", description: `Deal moved to ${newStage}` });
      })
      .catch((err) => {
        console.error("❌ Error updating stage:", err.response?.data || err);
      });
  };
  const handleAddDeal = () => {
    if (!newDeal.name || !newDeal.company || !newDeal.stage || !newDeal.value || !newDeal.probability || !newDeal.expectedCloseDate) {
      toast({ title: "Error", description: "All fields are required!", variant: "destructive" });
      return;
    }
  
    axios.post(`${API_BASE_URL}/api/deals`, newDeal)
      .then((res) => {
        setDeals([...deals, res.data]);
        setIsDialogOpen(false);
        toast({ title: "Deal Added", description: "New deal created successfully" });
  
        // Reset the form
        setNewDeal({
          name: "",
          company: "",
          stage: "Lead In",
          value: "",
          probability: "",
          expectedCloseDate: ""
        });
      })
      .catch((err) => console.error("Error adding deal:", err));
  };

  return (
    <div>
      <PageHeader title="Pipeline" subtitle="Track your sales pipeline" icon={BarChart4} />

      <Tabs defaultValue="overview" className="animate-fade-in">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineStages.map(stage => ({ name: stage, value: deals.filter(d => d.stage === stage).length }))}>
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Bar dataKey="value">
    {pipelineStages.map((stage, index) => (
      <Cell key={index} fill={getStageBadge(stage)} />
    ))}
  </Bar>
</BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deals">
        <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium">All Deals</h3>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="text-white hover:bg-[#ff005f]">
          <Plus className="mr-2 h-4 w-4" /> Add Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Deal</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Name</Label>
            <Input 
              value={newDeal.name} 
              onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })} 
              placeholder="Deal Name" 
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Company</Label>
            <Input 
              value={newDeal.company} 
              onChange={(e) => setNewDeal({ ...newDeal, company: e.target.value })} 
              placeholder="Company Name" 
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Probability (%)</Label>
            <Input 
              value={newDeal.probability} 
              onChange={(e) => setNewDeal({ ...newDeal, probability: e.target.value })} 
              placeholder="Probability" 
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Stage</Label>
            <Select 
              value={newDeal.stage} 
              onValueChange={(val) => setNewDeal({ ...newDeal, stage: val })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent>
                {pipelineStages.map((stage) => (
                  <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Value ($)</Label>
            <Input 
              type="number" 
              value={newDeal.value} 
              onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })} 
              placeholder="Estimated Value" 
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
  <Label className="text-right">Expected Close Date</Label>
  <Input
    type="date"
    value={newDeal.expectedCloseDate}
    onChange={(e) => setNewDeal({ ...newDeal, expectedCloseDate: e.target.value })}
    className="col-span-3"
  />
</div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddDeal} className="bg-[#ff077f] text-white hover:bg-[#ff005f]">
            Save Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>

  <Card>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deal Name</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Probability</TableHead>
            <TableHead>Stage</TableHead>
           
            <TableHead>Value</TableHead>
            <TableHead>Expected Close Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
        {deals.map((deal) => (
    <TableRow key={deal._id}>
      <TableCell>{deal.name}</TableCell>
      <TableCell>{deal.company}</TableCell>
      <TableCell>
        {/* ✅ Stage Dropdown */}
        <Select
       
          value={deal.stage}
          onValueChange={(newStage) => handleStageChange(deal._id, newStage)}
        >
          <SelectTrigger className="w-full border-none bg-transparent">
            <SelectValue placeholder="Select stage"/>
          </SelectTrigger>
          <SelectContent>
            {pipelineStages.map((stage) => (
              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>%{deal.probability}</TableCell>
      <TableCell>${deal.value}</TableCell>
      <TableCell>
        {deal.expectedCloseDate
          ? format(new Date(deal.expectedCloseDate), "MMM dd, yyyy")
          : "N/A"}
      </TableCell>
      <TableCell className="flex gap-2">
        <Button size="icon" variant="outline" onClick={() => handleEditDeal(deal)}>
          ✏️
        </Button>
        <Button size="icon" variant="destructive" onClick={() => handleDeleteDeal(deal._id)}>
          🗑️
        </Button>
      </TableCell>
    </TableRow>
  ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
        </TabsContent>
      </Tabs>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
      <DialogTitle>Edit Deal</DialogTitle>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Name</Label>
        <Input
          value={editDeal?.name || ""}
          onChange={(e) => setEditDeal({ ...editDeal, name: e.target.value })}
          placeholder="Deal Name"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Company</Label>
        <Input
          value={editDeal?.company || ""}
          onChange={(e) => setEditDeal({ ...editDeal, company: e.target.value })}
          placeholder="Company Name"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Probability (%)</Label>
        <Input
          type="number"
          value={editDeal?.probability || ""}
          onChange={(e) => setEditDeal({ ...editDeal, probability: e.target.value })}
          placeholder="Probability"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Stage</Label>
        <Select
          value={editDeal?.stage || "Lead In"}
          onValueChange={(val) => setEditDeal({ ...editDeal, stage: val })}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {pipelineStages.map((stage) => (
              <SelectItem key={stage} value={stage}>{stage}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Value ($)</Label>
        <Input
          type="number"
          value={editDeal?.value || ""}
          onChange={(e) => setEditDeal({ ...editDeal, value: e.target.value })}
          placeholder="Estimated Value"
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Expected Close Date</Label>
        <Input
          type="date"
          value={editDeal?.expectedCloseDate || ""}
          onChange={(e) => setEditDeal({ ...editDeal, expectedCloseDate: e.target.value })}
          className="col-span-3"
        />
      </div>
    </div>
    <DialogFooter>
      <Button onClick={handleUpdateDeal} className="bg-[#ff077f] text-white hover:bg-[#ff005f]">
        Update Deal
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

    </div>
  );
};

export default Pipeline;
