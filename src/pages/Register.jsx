import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://crmapi.editedgemultimedia.com";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    password: "",
    role: "sales", // Default role
    timezone: "Pacific Time (PT)", // Default timezone
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, form);
      toast({ title: "Success", description: "Registration successful!" });
      navigate("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat">
      {/* Left Pane */}
      <div className="hidden lg:flex items-center justify-center flex-1 text-black relative">
        <div className="max-w-full text-center">
          <img
            src="/register.png"
            alt="Welcome"
            className="w-full max-w-[600px] h-auto object-contain" // Adjusted for responsiveness
          />
        </div>
      </div>

      {/* Right Pane */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-black">Sign Up</h1>
            <p className="text-sm text-gray-500 mt-2">
              Join our community with lifetime access for free!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                className="text-black bg-white"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Company */}
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                className="text-black bg-white"
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                required
              />
            </div>

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

            {/* Role */}
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger className="text-black bg-white">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timezone */}
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={form.timezone}
                onValueChange={(value) => setForm({ ...form, timezone: value })}
              >
                <SelectTrigger className="text-black bg-white">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Eastern Time (ET)">Eastern Time (ET)</SelectItem>
                  <SelectItem value="Central Time (CT)">Central Time (CT)</SelectItem>
                  <SelectItem value="Mountain Time (MT)">Mountain Time (MT)</SelectItem>
                  <SelectItem value="Pacific Time (PT)">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Greenwich Mean Time (GMT)">Greenwich Mean Time (GMT)</SelectItem>
                  <SelectItem value="Central European Time (CET)">Central European Time (CET)</SelectItem>
                </SelectContent>
              </Select>
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
            <Button type="submit" className="w-full bg-[#ff077f] hover:bg-[#ff005f]">
              Register
            </Button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <hr className="flex-1 border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Google Register Button */}
            <Button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full bg-white text-black border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
            >
              <FcGoogle className="mr-2 h-5 w-5" />
              Register with Google
            </Button>

            {/* Login Redirect */}
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-[#ff077f]">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;