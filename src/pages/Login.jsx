import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Mail, LogIn } from "lucide-react"; // Import icons for the Google button
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import { login } from "../components/utils/auth"; // Import the login function from auth.js

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password); // Use the login function from auth.js
      toast({ title: "Success", description: "Login successful!" });
      navigate("/dashboard"); // Redirect to dashboard on success
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    }
  };

  // Function to handle Google login redirect
  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`; // Redirect to Google OAuth endpoint
  };

  return (
    <div className="flex h-screen w-full bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat">
      {/* Left Pane */}
      <div className="hidden lg:flex items-center justify-center flex-1 text-black">
        <div className="max-w-xlg text-center">
          <img src="/login.png" alt="Welcome" className="w-[900px] h-auto" />
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h1 className="text-3xl font-semibold mb-6 text-black text-center">Login</h1>
          <h1 className="text-sm font-semibold mb-6 text-gray-500 text-center">
            Welcome back! Please login to continue.
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                className="text-black bg-white"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                className="text-black bg-white"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#ff077f] hover:bg-[#ff005f]"
            >
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
            >
              <FcGoogle className="mr-2 h-5 w-5" /> {/* Google icon */}
              Login with Google
            </Button>

            {/* Register Redirect */}
            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#ff077f]">
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;