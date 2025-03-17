import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { Activity, DollarSign, Target, Users, CheckCircle, Clock } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Chart } from "react-google-charts";
import { useCallback } from "react";
import { useMemo } from "react";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalContacts: 0,
    openDeals: 0,
    revenue: 0,
    lastMonth: { totalLeads: 0, totalContacts: 0, openDeals: 0, revenue: 0 },
  });
  const [pipeline, setPipeline] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [recentEmails, setRecentEmails] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate(); // Added for redirecting

  
  const fetchData = useCallback(async () => {
    try {
      const userUrl = `${API_BASE_URL}/api/auth/me`;
      const userRes = await fetch(userUrl, { credentials: "include" });
  
      if (userRes.status === 401) {
        navigate("/login"); // 🔹 Redirects to login if not authenticated
        return;
      }
      
      if (!userRes.ok) throw new Error(`Failed to fetch user: ${userRes.status}`);
  
      const userData = await userRes.json();
      setUserName(userData.user?.name || "User");
  
      // Fetch all dashboard data in parallel (Improvement)
      const [
        leadsRes, contactsRes, dealsRes, lastMonthRes, pipelineRes,
        leadsRecentRes, perfRes, emailsRes, messagesRes, tasksRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/leads/total`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/contacts/total`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/deals/open`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/stats/lastMonth`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/deals/pipeline`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/leads/recent`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/analytics/performance`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/emails/recent`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/messages/recent`, { credentials: "include" }),
        fetch(`${API_BASE_URL}/api/dashboard/tasks/overview`, { credentials: "include" })
      ]);
  
      // Parse JSON
      const [leadsData, contactsData, dealsData, lastMonthData, pipelineData,
        leadsRecentData, perfData, emailsData, messagesData, tasksData] =
        await Promise.all([
          leadsRes.json(), contactsRes.json(), dealsRes.json(), lastMonthRes.json(), pipelineRes.json(),
          leadsRecentRes.json(), perfRes.json(), emailsRes.json(), messagesRes.json(), tasksRes.json()
        ]);
  
      // Set state updates
      setStats({
        totalLeads: leadsData.totalLeads,
        totalContacts: contactsData.totalContacts,
        openDeals: dealsData.openDeals,
        revenue: dealsData.totalRevenue,
        lastMonth: lastMonthData,
      });
  
      setPipeline(pipelineData.map(stage => ({
        name: stage._id,
        count: stage.count,
        color: {
          "Lead In": "bg-blue-500",
          Qualification: "bg-yellow-500",
          Proposal: "bg-orange-500",
          Negotiation: "bg-violet-500",
          "Closed Won": "bg-emerald-500",
        }[stage._id],
      })));
  
      setRecentLeads(leadsRecentData);
      if (Array.isArray(perfData) && perfData.length > 0) setPerformance(perfData);
      setRecentEmails(emailsData);
      setRecentMessages(messagesData);
      setTasks(tasksData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setUserName("User");
    }
  }, [navigate]); // ✅ `useCallback` to avoid re-fetching on every render.
  
  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ Ensures fetch runs once, prevents unnecessary re-renders.

    

  const calculatePercentageChange = (current, previous) => {
    if (current === 0 && previous === 0) return 0;
    if (previous === 0) {
      return current > 0 ? 100 : -100;
    }
    return Math.round(((current - previous) / previous) * 100);
  };

  const funnelData = useMemo(() => [
    ["Stage", "Leads", { role: "style" }],
    ...pipeline
      .sort((a, b) => b.count - a.count)
      .map((stage, index) => [
        stage.name,
        stage.count,
        ["#1E40AF", "#EAB308", "#F97316", "#7C3AED", "#10B981"][index % 5],
      ]),
  ], [pipeline]);

  const funnelOptions = {
    title: "Sales Funnel",
    chartArea: { width: "60%" },
    hAxis: { title: "Number of Leads", minValue: 0 },
    vAxis: { title: "Pipeline Stage" },
    legend: "none",
    bars: "horizontal",
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back, ${userName || "User"}! Here's your app's performance overview.`}
        icon={Activity}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
        <StatCard
          title="Total Leads"
          value={stats.totalLeads}
          icon={Target}
          change={{
            value: calculatePercentageChange(stats.totalLeads, stats.lastMonth.totalLeads),
            isPositive: stats.totalLeads >= stats.lastMonth.totalLeads,
          }}
        />
        <StatCard
          title="Total Contacts"
          value={stats.totalContacts}
          icon={Users}
          change={{
            value: calculatePercentageChange(stats.totalContacts, stats.lastMonth.totalContacts),
            isPositive: stats.totalContacts >= stats.lastMonth.totalContacts,
          }}
        />
        <StatCard
          title="Open Deals"
          value={stats.openDeals}
          icon={Activity}
          change={{
            value: calculatePercentageChange(stats.openDeals, stats.lastMonth.openDeals),
            isPositive: stats.openDeals >= stats.lastMonth.openDeals,
          }}
        />
        <StatCard
          title="Revenue"
          value={`$${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          change={{
            value: calculatePercentageChange(stats.revenue, stats.lastMonth.revenue),
            isPositive: stats.revenue >= stats.lastMonth.revenue,
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
        <DashboardCard title="Sales Pipeline" className="lg:col-span-2 min-h-[300px]">
          <Chart
            chartType="BarChart"
            width="100%"
            height="100%"
            data={funnelData}
            options={funnelOptions}
          />
        </DashboardCard>

        <DashboardCard title="Recent Emails">
          <div className="space-y-4">
            {recentEmails.map((email, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-brand-neon/5 border border-brand-neon/10"
              >
                <div className="h-8 w-8 rounded-full bg-brand-neon/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-brand-neon" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{email.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{email.from}</p>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(email.date).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <DashboardCard title="Recent Leads" className="lg:col-span-2">
          <div className="border rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-4 p-3 border-b bg-muted/50">
              <div className="font-medium text-sm">Name</div>
              <div className="font-medium text-sm">Company</div>
              <div className="font-medium text-sm">Email</div>
              <div className="font-medium text-sm text-right">Status</div>
            </div>
            {recentLeads.map((lead, i) => (
              <div
                key={i}
                className="grid grid-cols-1 md:grid-cols-4 p-3 items-center border-b last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                <div className="font-medium">{lead.name}</div>
                <div className="text-sm text-muted-foreground">{lead.company}</div>
                <div className="text-sm text-muted-foreground truncate">{lead.email}</div>
                <div className="text-right">
                  <span className={`status-badge status-${lead.status.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Weekly Performance">
          <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
  {performance?.length > 0 ? (
    <BarChart data={performance}>
      <XAxis dataKey="week" axisLine={false} tickLine={false} />
      <YAxis axisLine={false} tickLine={false} />
      <Tooltip contentStyle={{
        backgroundColor: "white",
        border: "none",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}/>
      <Bar dataKey="deals" fill="#ff077f" radius={[4, 4, 0, 0]} name="Deals" />
      <Bar dataKey="revenue" fill="#007bff" radius={[4, 4, 0, 0]} name="Revenue" />
      <Bar dataKey="leads" fill="#28a745" radius={[4, 4, 0, 0]} name="Leads" />
      <Bar dataKey="contacts" fill="#fd7e14" radius={[4, 4, 0, 0]} name="Contacts" />
    </BarChart>
  ) : (
    <p className="text-center text-muted-foreground">No performance data available.</p>
  )}
</ResponsiveContainer>

          </div>
        </DashboardCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-8">
        <DashboardCard title="Recent Messages">
          <div className="space-y-4">
            {recentMessages.length > 0 ? (
              [...recentMessages]
                .sort((a, b) => new Date(b.created_time) - new Date(a.created_time))
                .slice(0, 5)
                .map((msg, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/20">
                    <p className="text-sm font-medium">{msg.message}</p>
                    <p className="text-xs text-muted-foreground">From: {msg.from.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(msg.created_time).toLocaleString()}
                    </p>
                  </div>
                ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent messages available.</p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Task Overview">
          <div className="space-y-2">
            {tasks.map((task, i) => {
              const statusColor = {
                "To Do": "bg-yellow-100 text-yellow-800",
                "In Progress": "bg-blue-100 text-blue-800",
                "Completed": "bg-green-100 text-green-800",
              }[task.status] || "bg-gray-100 text-gray-600";

              return (
                <div
                  key={i}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-lg font-semibold text-gray-900 truncate max-w-xs">
                      {task.title || "Untitled Task"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium ${statusColor} rounded-full`}>
                      {task.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
};

export default Dashboard;