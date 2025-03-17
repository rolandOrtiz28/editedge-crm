import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const LinkGoogleAccount = () => {
  const [googleData, setGoogleData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch Google data from the session
    axios
      .get(`${API_BASE_URL}/api/auth/get-google-data`)
      .then((response) => {
        if (response.data.googleData) {
          setGoogleData(response.data.googleData);
        } else {
          navigate("/login"); // Redirect if no data found
        }
      })
      .catch((error) => {
        console.error("Error fetching Google data:", error);
        toast({ title: "Error", description: "Failed to load Google data", variant: "destructive" });
        navigate("/login");
      });
  }, [navigate]);

  const handleConfirm = (confirm) => {
    axios
      .post(
        `${API_BASE_URL}/api/auth/link-google-account`,
        { confirm },
        { withCredentials: true }
      )
      .then((response) => {
        toast({ title: "Success", description: response.data.message });
        navigate(response.data.redirect); // Use navigate instead of window.location
      })
      .catch((error) => {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to process request",
          variant: "destructive",
        });
        navigate("/login");
      });
  };

  if (!googleData) return <div className="text-center">Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat items-center justify-center">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-black text-center">Link Google Account</h2>
        <p className="mb-6 text-gray-600 text-center">
          The email <strong>{googleData.email}</strong> is already registered. Would you like to link
          your Google account to this existing account?
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => handleConfirm(true)} className="bg-[#ff077f] hover:bg-[#ff005f]">
            Yes, Link Accounts
          </Button>
          <Button onClick={() => handleConfirm(false)} variant="outline">
            No, Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LinkGoogleAccount;