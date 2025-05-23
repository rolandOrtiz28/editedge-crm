import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";
import { Mail, Plus, Search, Inbox, Send, Star, Trash2, Tag, FileText, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import DOMPurify from "dompurify";
import Template from "../pages/Templates";
import BusinessEmails from "./BusinessEmails";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Emails = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailRecipient, setNewEmailRecipient] = useState("");
  const [newEmailContent, setNewEmailContent] = useState("");
  const [currentCategory, setCurrentCategory] = useState("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [isContactsDialogOpen, setIsContactsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [activeTab, setActiveTab] = useState("contact");
  const [attachments, setAttachments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [emailTab, setEmailTab] = useState("emails");
  const [lastEmailCount, setLastEmailCount] = useState(0); // Track the last email count for notifications
  const [unreadEmails, setUnreadEmails] = useState(new Set()); // Track unread emails
  const [senderEmail, setSenderEmail] = useState("editedgemultimedia@gmail.com");


  // Request notification permission on component mount
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted.");
        } else {
          console.log("Notification permission denied.");
        }
      });
    }
  }, []);

  const checkLoginMethod = (authData) => {
    if (!authData.authenticated) {
      toast({
        title: "Access Denied",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      navigate("/login");
      return false;
    }
    return true;
  };

  const fetchEmails = async (category) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/emails?category=${category}`, {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        const newEmails = data.emails || [];
        // Sort emails by date (newest first)
        newEmails.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Check for new emails by comparing the count
        if (lastEmailCount > 0 && newEmails.length > lastEmailCount && category === "inbox") {
          const newCount = newEmails.length - lastEmailCount;
          const newArrivals = newEmails.slice(0, newCount);

          // Mark new emails as unread
          newArrivals.forEach((email) => {
            if (!email.isRead) {
              setUnreadEmails((prev) => new Set(prev).add(email.id));
            }
          });

          // Show notification for new emails
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Personal Emails", {
              body: `You have ${newCount} new email${newCount > 1 ? "s" : ""} in your inbox.`,
              icon: "/path/to/icon.png",
            });
          }

          toast({
            title: "New Emails!",
            description: `You have ${newCount} new email${newCount > 1 ? "s" : ""} in your inbox.`,
          });
        }

        setEmails(newEmails);
        setFilteredEmails(newEmails);
        setLastEmailCount(newEmails.length);
      } else {
        console.error("Failed to fetch emails:", data.error);
        toast({ title: "Error", description: "Failed to fetch emails", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching emails:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleEmail = async (emailId) => {
    try {
      console.log("🟢 Fetching single email with ID:", emailId);
      const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}`, {
        credentials: "include",
      });
      console.log("🔹 Server Response Status:", response.status);
      const data = await response.json();
      console.log("🔹 Response Data:", data);
      if (response.ok && data.email) {
        setSelectedEmail(data.email);
        setIsEmailDialogOpen(true);

        // Mark the email as read when opened
        setUnreadEmails((prev) => {
          const updated = new Set(prev);
          updated.delete(emailId);
          return updated;
        });

        // Optionally, update the backend to mark the email as read
        await fetch(`${API_BASE_URL}/api/emails/read/${emailId}`, {
          method: "PUT",
          credentials: "include",
        });
      } else {
        toast({ title: "Error", description: "Email not found or doesn't exist", variant: "destructive" });
      }
    } catch (error) {
      console.error("❌ Error fetching email:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };

  useEffect(() => {
    const checkAuthAndFetchEmails = async () => {
      try {
        const authResponse = await fetch(`${API_BASE_URL}/api/auth/check-google-session`, {
          credentials: "include",
        });
        const authData = await authResponse.json();
        console.log("🔹 Auth Response:", authData);
        if (!checkLoginMethod(authData)) {
          if (!window.location.search.includes("code=")) {
            return;
          }
        } else {
          setIsAuthenticated(true);
          setIsGoogleLogin(authData.isGoogleLogin);
          await fetchEmails(currentCategory);
          // Set up polling every 30 seconds
          const interval = setInterval(() => fetchEmails(currentCategory), 7200000);
          return () => clearInterval(interval);
        }
      } catch (error) {
        console.error("Error during authentication or fetching emails:", error);
        if (!window.location.search.includes("code=")) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetchEmails();
  }, [navigate, currentCategory]);

  useEffect(() => {
    console.log("🔄 Rendering selectedEmail:", selectedEmail);
  }, [selectedEmail]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/subscribers`, {
          credentials: "include",
        });
        const data = await response.json();
        console.log("🔍 Subscribers Data:", data);
        if (response.ok) {
          setContacts(data.subscribers);
        } else {
          console.error("Failed to fetch subscribers:", data.error);
        }
      } catch (error) {
        console.error("Error fetching subscribers:", error);
      }
    };
    fetchSubscribers();
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCategoryChange = async (category) => {
    setCurrentCategory(category);
    setSelectedEmail(null);
    await fetchEmails(category);
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = emails.filter(
      (email) =>
        email.subject.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.to.toLowerCase().includes(query) ||
        email.snippet.toLowerCase().includes(query)
    );
    setFilteredEmails(filtered);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = async () => {
    if (!newEmailSubject.trim() || !newEmailRecipient.trim() || !newEmailContent.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsSending(true);

    const sanitizedHtml = DOMPurify.sanitize(newEmailContent);
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
        ${sanitizedHtml}
      </body>
      </html>
    `;
    const plainText = newEmailContent.replace(/<[^>]+>/g, "");

    const formData = new FormData();
    formData.append("from", senderEmail);
    formData.append("to", newEmailRecipient);
    formData.append("subject", newEmailSubject);
    formData.append("html", htmlContent);
    formData.append("text", plainText);
    attachments.forEach((file) => formData.append("attachments", file));

    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/send`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Email sent successfully!" });
        setNewEmailSubject("");
        setNewEmailRecipient("");
        setNewEmailContent("");
        setAttachments([]);
        setIsComposeDialogOpen(false);
      } else {
        toast({ title: "Error", description: data.error || "Failed to send email", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const handleStarEmail = async (emailId, isStarred) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/star/${emailId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ star: !isStarred }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: isStarred ? "Email unstarred" : "Email starred",
        });
        setEmails((prevEmails) =>
          prevEmails.map((email) =>
            email.id === emailId ? { ...email, isStarred: !isStarred } : email
          )
        );
        setFilteredEmails((prevEmails) =>
          prevEmails.map((email) =>
            email.id === emailId ? { ...email, isStarred: !isStarred } : email
          )
        );
        if (selectedEmail && selectedEmail.id === emailId) {
          setSelectedEmail((prev) => ({ ...prev, isStarred: !isStarred }));
        }
        if (currentCategory === "starred") {
          await fetchEmails("starred");
        }
      } else {
        toast({ title: "Error", description: data.error || "Failed to update email", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error starring/unstarring email:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`, { credentials: "include" });
      const data = await response.json();
      console.log("Fetched Templates:", data);
      if (response.ok) {
        setTemplates(data.templates || []);
      } else {
        toast({ title: "Error", description: "Failed to fetch templates", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };

  const handleTemplateSelect = (template) => {
    setNewEmailSubject(template.subject);
    setNewEmailContent(template.html);
  };

  const handleTrashEmail = async (emailId, isTrashed) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/trash/${emailId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ trash: !isTrashed }),
      });
      const data = await response.json();
      if (response.ok) {
        toast({
          title: "Success",
          description: isTrashed ? "Email restored" : "Email moved to trash",
        });
        setEmails((prevEmails) =>
          prevEmails.map((email) =>
            email.id === emailId ? { ...email, isTrashed: !isTrashed } : email
          )
        );
        setFilteredEmails((prevEmails) =>
          prevEmails.map((email) =>
            email.id === emailId ? { ...email, isTrashed: !isTrashed } : email
          )
        );
        if (selectedEmail && selectedEmail.id === emailId) {
          setSelectedEmail((prev) => ({ ...prev, isTrashed: !isTrashed }));
        }
        if (currentCategory === "trash") {
          await fetchEmails("trash");
        } else if (!isTrashed) {
          setFilteredEmails((prevEmails) => prevEmails.filter((email) => email.id !== emailId));
          setSelectedEmail(null);
        }
      } else {
        toast({ title: "Error", description: data.error || "Failed to update email", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error trashing/untrashing email:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };

  if (loading) {
    return <p className="text-center text-lg mt-10">Loading Emails...</p>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 border-r">
        <nav className="space-y-3">
          <Button
            variant={emailTab === "emails" ? "default" : "ghost"}
            className="w-full flex items-center justify-start"
            onClick={() => setEmailTab("emails")}
          >
            <Inbox className="mr-2 h-5 w-5" /> Emails
          </Button>
          <Button
            variant={emailTab === "templates" ? "default" : "ghost"}
            className="w-full flex items-center justify-start"
            onClick={() => setEmailTab("templates")}
          >
            <FileText className="mr-2 h-5 w-5" /> Templates
          </Button>
          <Button
            variant={emailTab === "business" ? "default" : "ghost"}
            className="w-full flex items-center justify-start"
            onClick={() => setEmailTab("business")}
          >
            <Briefcase className="mr-2 h-5 w-5" /> Business Emails
          </Button>
        </nav>
        {emailTab === "emails" && (
          <nav className="space-y-3 mt-4">
            <Button className="w-full mb-4" onClick={() => setIsComposeDialogOpen(true)}>
              <Plus className="mr-2 h-5 w-5" /> Compose
            </Button>
            <Button
              variant={currentCategory === "inbox" ? "default" : "ghost"}
              className="w-full flex items-center justify-start"
              onClick={() => handleCategoryChange("inbox")}
            >
              <Inbox className="mr-2 h-5 w-5" /> Inbox
            </Button>
            <Button
              variant={currentCategory === "sent" ? "default" : "ghost"}
              className="w-full flex items-center justify-start"
              onClick={() => handleCategoryChange("sent")}
            >
              <Send className="mr-2 h-5 w-5" /> Sent
            </Button>
            <Button
              variant={currentCategory === "starred" ? "default" : "ghost"}
              className="w-full flex items-center justify-start"
              onClick={() => handleCategoryChange("starred")}
            >
              <Star className="mr-2 h-5 w-5" /> Starred
            </Button>
            <Button
              variant={currentCategory === "trash" ? "default" : "ghost"}
              className="w-full flex items-center justify-start"
              onClick={() => handleCategoryChange("trash")}
            >
              <Trash2 className="mr-2 h-5 w-5" /> Trash
            </Button>
          </nav>
        )}
      </aside>

      {/* Email List Panel */}
      <main className="flex-1 w-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-semibold">
            {emailTab === "emails"
              ? currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)
              : emailTab === "templates"
              ? "Email Templates"
              : "Business Emails"}
          </h1>
          {emailTab === "emails" && (
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search emails..." className="pl-8" value={searchQuery} onChange={handleSearch} />
            </div>
          )}
        </div>

        {/* Emails Tab */}
        {emailTab === "emails" && (
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onClick={() => {
                  console.log("🟢 Fetching email ID:", email.id);
                  fetchSingleEmail(email.id);
                }}
                onStar={() => handleStarEmail(email.id, email.isStarred)}
                onTrash={() => handleTrashEmail(email.id, email.isTrashed)}
                currentCategory={currentCategory}
                isUnread={unreadEmails.has(email.id)}
              />
            ))}
          </div>
        )}

        {/* Templates Tab */}
        {emailTab === "templates" && <Template onTemplateSelect={handleTemplateSelect} />}

        {/* Business Emails Tab */}
        {emailTab === "business" && <BusinessEmails />}
      </main>

      {/* Email Detail Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-3xl p-6 rounded-lg shadow-lg bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {selectedEmail?.subject || "No Subject"}
            </DialogTitle>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="flex flex-col border-b pb-2 text-gray-700 dark:text-gray-300">
                <p className="text-sm">
                  <span className="font-semibold">From:</span> {selectedEmail.from || "Unknown"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">To:</span> {selectedEmail.to || "Unknown"}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Date:</span> {selectedEmail.date || "Unknown"}
                </p>
              </div>
              <div
                className="text-sm leading-relaxed overflow-y-auto max-h-[400px] p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                style={{ wordBreak: "break-word" }}
              >
                {selectedEmail.fullBody ? (
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedEmail.fullBody) }} />
                ) : (
                  <p>No content available</p>
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Compose Email Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
  <DialogTrigger asChild>
    <Button className="hidden">Compose Email</Button>
  </DialogTrigger>
  <DialogContent className="max-w-3xl p-6 rounded-xl shadow-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
    <DialogHeader>
      <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
        Compose New Email
      </DialogTitle>
    </DialogHeader>
    <div className="space-y-6">
      {/* 🆕 FROM FIELD */}
      <div className="space-y-2">
        <Label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
          From:
        </Label>
        <select
          value={senderEmail}
          onChange={(e) => setSenderEmail(e.target.value)}
          className="w-full p-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none"
        >
          <option value="editedgemultimedia@gmail.com">editedgemultimedia@gmail.com</option>
          <option value="info@editedgemultimedia.com">info@editedgemultimedia.com</option>
        </select>
      </div>

      {/* TO FIELD */}
      <div className="space-y-2">
        <Label htmlFor="recipient" className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
          To:
        </Label>
        <div className="flex items-center gap-3">
          <Input
            id="recipient"
            value={newEmailRecipient}
            onChange={(e) => setNewEmailRecipient(e.target.value)}
            placeholder="Enter recipient's email"
            className="flex-1 p-3 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
          />
          <Button variant="outline" onClick={() => setIsContactsDialogOpen(true)} className="hover:bg-gray-100 dark:hover:bg-gray-800">
            Select Contact
          </Button>
        </div>
      </div>

      {/* TEMPLATE SELECT */}
      <div className="space-y-2">
        <Label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
          Use Template:
        </Label>
        <select
          className="w-full p-2 border rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all appearance-none"
          value=""
          onChange={(e) => {
            const selectedTemplate = templates.find((t) => t._id === e.target.value);
            if (selectedTemplate) handleTemplateSelect(selectedTemplate);
          }}
        >
          <option value="" disabled className="text-gray-400 text-sm">
            Select a Template
          </option>
          {templates.length > 0 ? (
            templates.map((template) => (
              <option key={template._id} value={template._id} className="text-gray-900 dark:text-gray-100 text-sm">
                {template.subject}
              </option>
            ))
          ) : (
            <option disabled className="text-gray-400 text-sm">
              No templates available
            </option>
          )}
        </select>
      </div>

      {/* SUBJECT FIELD */}
      <div className="space-y-2">
        <Label htmlFor="subject" className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
          Subject:
        </Label>
        <Input
          id="subject"
          value={newEmailSubject}
          onChange={(e) => setNewEmailSubject(e.target.value)}
          placeholder="Enter email subject"
          className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
        />
      </div>

      {/* MESSAGE */}
      <div className="space-y-2">
        <Label htmlFor="editor" className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
          Message:
        </Label>
        <div className="border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 overflow-auto">
        <ReactQuill
  id="editor"
  value={newEmailContent}
  onChange={setNewEmailContent}
  modules={{
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }], // Headers (H1 to H6)
      [{ size: ["small", false, "large", "huge"] }], // Font sizes
      [{ font: [] }], // Font family dropdown
      ["bold", "italic", "underline", "strike"], // Basic formatting
      [{ color: [] }, { background: [] }], // Text and background color
      [{ script: "sub" }, { script: "super" }], // Subscript and superscript
      [{ align: [] }], // Text alignment (left, center, right, justify)
      [{ indent: "-1" }, { indent: "+1" }], // Indentation
      [{ list: "ordered" }, { list: "bullet" }], // Ordered and unordered lists
      ["blockquote", "code-block"], // Blockquote and code block
      [{ direction: "rtl" }], // Text direction (right-to-left)
      ["link", "image", "video"], // Insert link, image, and video
      ["clean"], // Clear formatting
    ],
  }}
  className="h-64 min-h-[200px] p-3 text-base text-gray-900 dark:text-gray-100"
  style={{ maxHeight: "400px", overflowY: "auto" }}
/>
        </div>
      </div>

      {/* ATTACHMENTS */}
      <div className="space-y-2">
        <Label className="block text-gray-700 dark:text-gray-300 text-sm font-medium">
          Attachments:
        </Label>
        <div className="mt-2">
          <input
            type="file"
            multiple
            id="file-upload"
            onChange={(e) => setAttachments([...attachments, ...e.target.files])}
            className="hidden"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center px-4 py-2 bg-brand-black text-white rounded-md hover:bg-brand-neon cursor-pointer transition-colors duration-200"
          >
            Choose Files
          </label>
          <span className="ml-4 text-gray-500 dark:text-gray-400">
            {attachments.length > 0 ? attachments.map((file) => file.name).join(", ") : "No file chosen"}
          </span>
        </div>
        {attachments.length > 0 && (
          <ul className="mt-4 text-sm text-gray-600 dark:text-gray-400 space-y-2">
            {attachments.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="truncate max-w-xs">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>

    {/* FOOTER BUTTONS */}
    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
      <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)} className="hover:bg-gray-100 dark:hover:bg-gray-800">
        Cancel
      </Button>
      <Button onClick={handleSendEmail} disabled={isSending} className="bg-brand-black hover:bg-brand-neon text-white disabled:opacity-50">
        {isSending ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Sending...
          </>
        ) : (
          "Send Email"
        )}
      </Button>
    </div>
  </DialogContent>
</Dialog>


      {/* Select Recipient Dialog */}
      <Dialog open={isContactsDialogOpen} onOpenChange={setIsContactsDialogOpen}>
        <DialogContent className="max-w-3xl p-6 rounded-lg shadow-lg bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Select Recipient</DialogTitle>
          </DialogHeader>
          {(() => {
            const filteredContacts = contacts
              .filter((c) => c.source === activeTab.toLowerCase())
              .filter(
                (c) =>
                  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  c.email.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .sort((a, b) => {
                if (sortOrder === "alphabetical") {
                  return a.name.localeCompare(b.name);
                } else {
                  return parseInt(b._id.toString().substring(0, 8), 16) - parseInt(a._id.toString().substring(0, 8), 16);
                }
              });
            return (
              <>
                <div className="flex border-b pb-2 mb-4">
                  <Button
                    variant={activeTab === "contact" ? "default" : "ghost"}
                    className="flex-1"
                    onClick={() => setActiveTab("contact")}
                  >
                    Contacts
                  </Button>
                  <Button
                    variant={activeTab === "lead" ? "default" : "ghost"}
                    className="flex-1"
                    onClick={() => setActiveTab("lead")}
                  >
                    Leads
                  </Button>
                </div>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search contacts..."
                    className="flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <select
                    className="border p-2 rounded-md"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="latest">Latest First</option>
                    <option value="alphabetical">A-Z</option>
                  </select>
                </div>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <Button
                        key={contact.email}
                        variant="ghost"
                        className="text-left w-full justify-start"
                        onClick={() => {
                          setNewEmailRecipient(contact.email);
                          setIsContactsDialogOpen(false);
                        }}
                      >
                        {contact.name} ({contact.email})
                      </Button>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center">No {activeTab} found.</p>
                  )}
                </div>
              </>
            );
          })()}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => setIsContactsDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EmailCard = ({ email, onClick, onStar, onTrash, currentCategory, isUnread }) => (
  <Card
    className={`p-4 cursor-pointer hover:bg-gray-200 flex justify-between items-center w-50 ${
      isUnread ? "bg-blue-50" : ""
    }`}
  >
    <div onClick={onClick} className="flex-1 flex items-center">
      <CardContent className="p-0 flex-1">
        <div className="flex items-center">
          <h3 className={`font-medium ${isUnread ? "text-blue-600" : ""}`}>{email.subject}</h3>
          {isUnread && <span className="ml-2 w-3 h-3 bg-blue-500 rounded-full"></span>}
        </div>
        <p className="text-sm text-muted-foreground">
          {currentCategory === "sent" ? `To: ${email.to}` : `From: ${email.from}`}
        </p>
      </CardContent>
    </div>
    <div className="flex space-x-2">
      <Button variant="ghost" size="sm" onClick={onStar}>
        <Star className={`h-5 w-5 ${email.isStarred ? "text-yellow-400" : "text-gray-400"}`} />
      </Button>
      <Button variant="ghost" size="sm" onClick={onTrash}>
        <Trash2 className={`h-5 w-5 ${email.isTrashed ? "text-green-400" : "text-red-400"}`} />
      </Button>
    </div>
  </Card>
);

export default Emails;