import { useEffect, useState } from "react";
import { BarChart3, PieChart } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart as ReLineChart, Line, PieChart as RePieChart, Pie, Cell } from "recharts";
import axios from "axios";
import { Progress } from "@/components/ui/progress";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const getStatusBadge = (status) => {
  switch (status) {
    case "New":
      return "bg-blue-500";
    case "Contacted":
      return "bg-green-500";
    case "Qualified":
      return "bg-yellow-500";
    case "Proposal":
      return "bg-orange-500";
    case "Negotiation":
      return "bg-purple-500";
    case "Won":
      return "bg-teal-500";
    default:
      return "bg-gray-300";
  }
};

const Analytics = () => {
  const [revenue, setRevenue] = useState(0);
  const [conversionData, setConversionData] = useState({});
  const [dealStages, setDealStages] = useState([]);
  const [salesPerformance, setSalesPerformance] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [leadStatus, setLeadStatus] = useState([]); 
  const [pipelineStages, setpipelineStages] = useState([]); 
  const [leads, setLeads] = useState([]); 

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const [revenueRes, conversionRes, dealStagesRes, performanceRes, leadStatusRes, leadsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/sales/revenue`),
        axios.get(`${API_BASE_URL}/api/sales/conversion-rate`),
        axios.get(`${API_BASE_URL}/api/sales/deal-stages`),
        axios.get(`${API_BASE_URL}/api/sales/performance`),
        axios.get(`${API_BASE_URL}/api/sales/lead-status`), 
        axios.get(`${API_BASE_URL}/api/leads`),
      ]);
  
      setRevenue(revenueRes.data.totalRevenue);
      setConversionData(conversionRes.data);
      setDealStages(dealStagesRes.data);
      setSalesPerformance(performanceRes.data);
      setLeadStatus(leadStatusRes.data);
      setLeads(leadsRes.data);
    } catch (error) {
      console.error("Error fetching sales analytics data:", error);
    }
  };
  
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Analyze your sales data and track your performance." icon={PieChart} />

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>
         {/* Overview Tab */}
         <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            
            {/* Revenue Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueTrend}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

             {/* 📊 Lead Status Distribution */}
    <Card>
      <CardHeader>
        <CardTitle>Lead Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RePieChart>
              <Pie data={leadStatus} cx="50%" cy="50%" outerRadius={100} dataKey="count">
                {leadStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} leads`, "Count"]} />
            </RePieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

      {/* 📈 Pipeline Analysis */}
      <Card>
      <CardHeader>
        <CardTitle>Pipeline Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pipelineStages.map(stage => ({
              name: stage,
              value: deals.filter(d => d.stage === stage).length
            }))}>
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

    {/* 💰 Lead Value by Status */}
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Lead Value by Status</h3>
        <div className="space-y-4">
          {["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Won"].map((status) => {
            const totalValue = leads.filter(lead => lead.status === status)
                                   .reduce((sum, lead) => sum + lead.value, 0);
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

            {/* Lead Conversion Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Rate</CardTitle>
                <CardDescription>Comparison of total leads vs converted leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={[conversionData]}>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="leads" stroke="#8884d8" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="converted" stroke="#82ca9d" />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Deal Stage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Stage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={dealStages} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="count">
                        {dealStages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} deals`, "Count"]} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance by User */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesPerformance}>
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalSales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Revenue */}
            <Card>
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
                <CardDescription>Sum of all closed deals</CardDescription>
              </CardHeader>
              <CardContent>
                <h2 className="text-3xl font-bold">${revenue.toLocaleString()}</h2>
              </CardContent>
            </Card>

            {/* Lead Conversion Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Lead Conversion Rate</CardTitle>
                <CardDescription>Percentage of leads converted to deals</CardDescription>
              </CardHeader>
              <CardContent>
                <h2 className="text-3xl font-bold">{conversionData.conversionRate?.toFixed(2)}%</h2>
                <p className="text-muted-foreground text-sm">
                  {conversionData.convertedLeads} out of {conversionData.totalLeads} leads converted.
                </p>
              </CardContent>
            </Card>

            {/* Deal Stage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Deal Stage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie data={dealStages} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="count">
                        {dealStages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} deals`, "Count"]} />
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Sales Performance by User */}
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesPerformance}>
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="totalSales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
