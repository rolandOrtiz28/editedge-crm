import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Template from "../pages/Templates";



const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_BASE_URL_DEV
    : import.meta.env.VITE_API_BASE_URL;

const BulkEmails = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [activeTab, setActiveTab] = useState("sendEmails");
  const [refresh, setRefresh] = useState(false);

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image', 'video'],
      [{ 'direction': 'rtl' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      ['clean']
    ]
  };

  useEffect(() => {
    fetchGroups();
    fetchTemplates();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bulk-email/groups`, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      if (Array.isArray(data)) setGroups(data);
    } catch (error) {
      console.error("❌ Error fetching groups:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
        console.log("🔍 Fetching templates...");
        const response = await fetch(`${API_BASE_URL}/api/templates`, { credentials: "include" });

        console.log("📡 Response received:", response);
        const data = await response.json();

        console.log("📂 Data received:", data);
        if (data.templates && Array.isArray(data.templates)) {
            console.log("✅ Templates fetched:", data.templates);
            setTemplates(data.templates);
            setRefresh((prev) => !prev); // Force re-render
        } else {
            console.warn("⚠️ No templates found or invalid format.");
        }
    } catch (error) {
        console.error("❌ Error fetching templates:", error);
    }
};
useEffect(() => {
  if (templates.length) {
    console.log("🔄 Updating template dropdown");
    setRefresh((prev) => !prev);
  }
}, [templates]);

  const handleSelectGroup = async (groupId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bulk-email/groups/${groupId}`, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      console.log("Group Selected:", data);
      if (data.members && Array.isArray(data.members)) {
        const formattedRecipients = data.members.map((member) => ({
          email: member.memberId?.email || "No Email",
          name: member.memberId?.name || "Unnamed",
          company: member.memberId?.company || "No Company",
        }));
        setRecipients(formattedRecipients);
      }
    } catch (error) {
      console.error("❌ Error fetching group members:", error);
    }
  };

  const handleRemoveRecipient = (index) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSelectTemplate = (templateId) => {
    const selected = templates.find((t) => t._id === templateId);
    if (selected) {
      setSubject(selected.subject);
      setContent(selected.html);
    }
    setSelectedTemplate(templateId);
  };

  const handleSendEmails = async () => {
    if (!recipients.length) {
        toast({ title: "Error", description: "No recipients selected!", variant: "destructive" });
        return;
    }
    console.log("Recipients before processing:", recipients);
    const personalizedContent = recipients.map((recipient) => {
      
      let emailSubject = (subject || "No Subject")
      .replace(/&lt;name&gt;/g, recipient.name || "Customer")
            .replace(/<name>/g, recipient.name || "Customer")
            .replace(/&lt;company&gt;/g, recipient.company)
            .replace(/<company>/g, recipient.company);

      let emailContent = content
          .replace(/&lt;name&gt;/g, recipient.name || "Customer")
          .replace(/<name>/g, recipient.name || "Customer")
          .replace(/&lt;company&gt;/g, recipient.company || "Your Business")
          .replace(/<company>/g, recipient.company || "Your Business");
 
      // Check if content contains HTML tags
      const isHTML = /<\/?[a-z][\s\S]*>/i.test(emailContent);
  
      if (isHTML) {
          emailContent = `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <title>Email</title>
                  <style>
                      body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
                      a { color: #0066cc; text-decoration: none; }
                      .button { background-color: #0066cc; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; }
                  </style>
              </head>
              <body>${emailContent}</body>
              </html>
          `;
      }
  
      return {
          email: recipient.email,
          name: recipient.name,
          subject: emailSubject,
          content: emailContent,
      };
  });

    try {
        const response = await fetch(`${API_BASE_URL}/api/bulk-email/send-bulk`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ recipients: personalizedContent }),
        });

        if (!response.ok) throw new Error("Failed to send emails");
        
        toast({ title: "Success", description: "Emails sent successfully!" });

        // Reset form fields after successful email send
        setSelectedGroup("");
        setRecipients([]);
        setSelectedTemplate("");
        setSubject("");
        setContent("");
    } catch (error) {
        toast({ title: "Error", description: "Failed to send emails", variant: "destructive" });
        console.error("Error sending emails:", error);
    }
};


  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Bulk Email Management</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg p-1">
          <TabsTrigger 
            value="sendEmails" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2"
          >
            📩 Send Emails
          </TabsTrigger>
          <TabsTrigger 
            value="manageTemplates" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md py-2"
          >
            📑 Manage Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sendEmails" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Compose Bulk Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="group-select" className="text-sm font-medium text-gray-700">Select Group</Label>
                <Select value={selectedGroup} onValueChange={handleSelectGroup}>
                  <SelectTrigger id="group-select" className="w-full border-gray-300">
                    <SelectValue placeholder="Choose a group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <SelectItem key={group._id} value={group._id}>
                          {group.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem disabled>No groups available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Recipients</h3>
                {recipients.length > 0 ? (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    <ul className="divide-y divide-gray-200">
                      {recipients.map((recipient, index) => (
                        <li 
                          key={index} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{recipient.name}</span>
                            <span className="text-xs text-gray-500">{recipient.email}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemoveRecipient(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No recipients selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-select" className="text-sm font-medium text-gray-700">Select Template</Label>
                <Select key={templates.length} value={selectedTemplate} onValueChange={handleSelectTemplate}>
  <SelectTrigger id="template-select" className="w-full border-gray-300">
    <SelectValue placeholder="Choose a template" />
  </SelectTrigger>
  <SelectContent>
    {templates.length > 0 ? (
      templates.map((template) => (
        <SelectItem key={template._id} value={template._id}>
          {template.subject}
        </SelectItem>
      ))
    ) : (
      <SelectItem disabled>No templates available</SelectItem>
    )}
  </SelectContent>
</Select>

              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="w-full border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium text-gray-700">Message</Label>
                <ReactQuill
                  id="content"
                  value={content}
                  onChange={setContent}
                  modules={quillModules}
                  className="bg-white border border-gray-300 rounded-md"
                  theme="snow"
                />
              </div>

              <Button
                onClick={handleSendEmails}
                className="w-full bg-brand-black hover:bg-brand-black text-white font-medium py-2.5"
              >
                Send Emails
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manageTemplates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">Template Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Template />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BulkEmails;