import { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import DOMPurify from "dompurify";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [newTemplateSubject, setNewTemplateSubject] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  // Fetch templates from backend
  const fetchTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setTemplates(data.templates);
      } else {
        console.error("Failed to fetch templates:", data.error);
        toast({ title: "Error", description: "Failed to fetch templates", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Save new template
  const handleSaveTemplate = async () => {
    if (!newTemplateSubject.trim() || !newTemplateContent.trim()) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const sanitizedHtml = DOMPurify.sanitize(newTemplateContent);
    const plainText = newTemplateContent.replace(/<[^>]+>/g, ""); // Convert HTML to raw text
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newTemplateSubject,
          text: plainText,
          html: sanitizedHtml,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Template saved successfully!" });
        setNewTemplateSubject("");
        setNewTemplateContent("");
        setIsTemplateDialogOpen(false);
        fetchTemplates();
      } else {
        toast({ title: "Error", description: data.error || "Failed to save template", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Delete template
  const handleDeleteTemplate = async (templateId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        toast({ title: "Success", description: "Template deleted successfully!" });
        fetchTemplates();
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete template", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({ title: "Error", description: "Something went wrong!", variant: "destructive" });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Email Templates</h1>
        <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand-black hover:bg-brand-black text-white">
              + New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-full max-h-screen p-6 bg-white dark:bg-gray-900 flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Create New Template
              </DialogTitle>
              <button
                onClick={() => setIsTemplateDialogOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
        
              </button>
            </DialogHeader>
            <div className="flex-1 flex flex-col space-y-6 overflow-y-auto">
              <div>
                <label htmlFor="template-subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Input
                  id="template-subject"
                  placeholder="Enter template subject"
                  value={newTemplateSubject}
                  onChange={(e) => setNewTemplateSubject(e.target.value)}
                  className="w-full border-gray-300 p-3"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="template-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <ReactQuill
                  id="template-content"
                  value={newTemplateContent}
                  onChange={setNewTemplateContent}
                  modules={quillModules}
                  className="bg-white border border-gray-300 rounded-md h-full"
                  theme="snow"
                  style={{ height: "calc(100vh - 200px)" }} // Adjust height to fill most of the page
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsTemplateDialogOpen(false)}
                className="border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={isSaving}
                className="bg-brand-black hover:bg-brand-black text-white"
              >
                {isSaving ? "Saving..." : "Save Template"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template List */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template._id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="border-b border-gray-200">
                <CardTitle className="text-lg font-medium text-gray-800 line-clamp-1">
                  {template.subject}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div
                  className="text-sm text-gray-600 max-h-32 overflow-y-auto whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(template.html) }}
                />
                <div className="flex justify-end mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template._id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No templates available. Create one to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Templates;