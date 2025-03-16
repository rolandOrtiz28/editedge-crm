import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Inbox, Send, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import DOMPurify from "dompurify";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_BASE_URL_DEV
    : import.meta.env.VITE_API_BASE_URL;

const BusinessEmails = () => {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [newEmailSubject, setNewEmailSubject] = useState("");
  const [newEmailRecipient, setNewEmailRecipient] = useState("");
  const [newEmailContent, setNewEmailContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newEmailsCount, setNewEmailsCount] = useState(0);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/business-email/inbox`, {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Business Emails Response:", data);
      if (response.ok) {
        // Sort emails by date in descending order (newest first)
        const sortedEmails = (data.emails || []).sort((a, b) => new Date(b.date) - new Date(a.date));
        setEmails(sortedEmails);
        setNewEmailsCount(data.newEmailsCount || 0);
      } else {
        toast({ title: "Error", description: "Failed to fetch business emails", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching business emails:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
    const interval = setInterval(fetchEmails, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (newEmailsCount > 0) {
      toast({
        title: "New Emails!",
        description: `${newEmailsCount} new email${newEmailsCount > 1 ? "s" : ""} received.`,
        variant: "default",
      });
    }
  }, [newEmailsCount]);

  const handleSendEmail = async () => {
    if (!newEmailSubject || !newEmailRecipient || !newEmailContent) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }

    const sanitizedHtml = DOMPurify.sanitize(newEmailContent);
    try {
      const response = await fetch(`${API_BASE_URL}/api/business-email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: newEmailRecipient,
          subject: newEmailSubject,
          html: sanitizedHtml,
          inReplyTo: selectedEmail?.messageId || "",
          messageId: selectedEmail?.messageId || "",
        }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Email sent successfully" });
        setNewEmailSubject("");
        setNewEmailRecipient("");
        setNewEmailContent("");
        setIsComposeDialogOpen(false);
        fetchEmails();
      } else {
        toast({ title: "Error", description: "Failed to send email", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error sending email:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-100 dark:bg-gray-900 p-4 border-r">
        <nav className="space-y-3">
          <Button className="w-full" onClick={() => setIsComposeDialogOpen(true)}>
            <Plus className="mr-2 h-5 w-5" /> Compose
          </Button>
        </nav>
      </aside>

      <main className="flex-1 w-50 flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h1 className="text-lg font-semibold">Business Inbox</h1>
          <Input
            placeholder="Search emails..."
            className="w-72"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-lg mt-10">Loading...</p>
          ) : (
            emails
              .filter((email) => email.subject.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((email) => (
                <Card
                  key={email.id}
                  className="p-4 cursor-pointer hover:bg-gray-200"
                  onClick={() => {
                    setSelectedEmail(email);
                    setIsEmailDialogOpen(true);
                  }}
                >
                  <CardContent className="p-0">
                    <h3 className="font-medium">{email.subject}</h3>
                    <p className="text-sm text-muted-foreground">From: {email.from}</p>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </main>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-3xl p-6 rounded-lg bg-white">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject || "No Subject"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-b pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">From: {selectedEmail?.from || "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">
                    Date: {selectedEmail?.date ? new Date(selectedEmail.date).toLocaleString() : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
            <div className="prose max-w-none max-h-[60vh] overflow-y-auto">
              {selectedEmail?.html ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(selectedEmail.html),
                  }}
                />
              ) : (
                <p className="whitespace-pre-wrap">{selectedEmail?.text || "No content available"}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => {
              setNewEmailRecipient(selectedEmail?.from || "");
              setNewEmailSubject(`Re: ${selectedEmail?.subject || ""}`);
              setNewEmailContent(`<p></p>`);
              setIsComposeDialogOpen(true);
              setIsEmailDialogOpen(false);
            }}
            className="mt-4 bg-blue-500 text-white"
          >
            Reply
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
        <DialogContent className="max-w-3xl p-6 rounded-lg bg-white">
          <DialogHeader>
            <DialogTitle>Compose Business Email</DialogTitle>
          </DialogHeader>
          <Input
            value={newEmailRecipient}
            onChange={(e) => setNewEmailRecipient(e.target.value)}
            placeholder="Recipient Email"
            className="mb-2"
          />
          <Input
            value={newEmailSubject}
            onChange={(e) => setNewEmailSubject(e.target.value)}
            placeholder="Subject"
            className="mb-2"
          />
          <ReactQuill value={newEmailContent} onChange={setNewEmailContent} className="mb-4" />
          <Button onClick={handleSendEmail} className="bg-blue-500 text-white">
            Send
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessEmails;