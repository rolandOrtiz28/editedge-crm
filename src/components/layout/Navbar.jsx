import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Settings, User, LogOut, LogIn, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { toast } from "@/components/ui/use-toast";
import moment from "moment";

const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_API_BASE_URL_DEV
    : import.meta.env.VITE_API_BASE_URL;

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/profile/me`, {
          withCredentials: true,
        });
        console.log("🔍 User Data Response:", response.data);
        setUser(response.data);
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        console.log("⚠️ User not logged in, skipping notifications fetch.");
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
          withCredentials: true,
        });
        const notificationsData = Array.isArray(response.data) ? response.data : [];
        setNotifications(notificationsData);

        if (notificationsData.length > 0) {
          notificationsData.forEach((notif) => {
            toast({
              title: notif.type === "task" ? "New Task Assigned" : "New Lead Assigned",
              description: notif.message,
            });
          });
        }
      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        setNotifications([]);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Memoized search handler
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/search`, {
        params: { q: searchQuery },
        withCredentials: true,
      });
      const results = Array.isArray(response.data) ? response.data : [];
      setSearchResults(results);
      setIsSearchOpen(true);
    } catch (error) {
      console.error("❌ Error searching:", error);
      toast({ title: "Search Error", description: "Failed to perform search", variant: "destructive" });
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch();
    }, 300); // 300ms debounce delay
    return () => clearTimeout(timeout);
  }, [searchQuery, handleSearch]); // Runs when searchQuery or handleSearch changes

  // Handle logout
  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notif) => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/notifications/${notif._id}/read`,
        {},
        { withCredentials: true }
      );
      setNotifications((prev) => prev.filter((n) => n._id !== notif._id));
      navigate("/profile");
    } catch (error) {
      console.error("❌ Error marking notification as read:", error);
    }
  };

  // Handle search result click
  const handleResultClick = (result) => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchOpen(false);
    navigate(`/${result.type}s/${result._id}`); // Navigate to specific entity detail page
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="ml-auto flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search leads, tasks, contacts..."
              className="w-[200px] lg:w-[300px] pl-8 rounded-full bg-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearchOpen && (
              <div className="absolute top-12 w-full bg-white shadow-lg rounded-lg border z-50 max-h-80 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-3 text-center text-gray-500">No results found</div>
                ) : (
                  searchResults.map((result) => (
                    <div
                      key={result._id}
                      onClick={() => handleResultClick(result)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <p className="text-sm font-medium">
                        {result.name || result.title} ({result.type})
                      </p>
                      <p className="text-xs text-gray-500">
                        {result.company || result.description || "No additional info"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 shadow-lg rounded-lg bg-white border">
              <DropdownMenuLabel className="font-medium text-lg p-3 border-b">
                Notifications ({notifications.length})
              </DropdownMenuLabel>
              {notifications.length === 0 ? (
                <DropdownMenuItem className="p-4 text-center text-gray-500" disabled>
                  No new notifications
                </DropdownMenuItem>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className="flex flex-col p-3 border-b hover:bg-gray-100 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {moment(notif.createdAt).fromNow()}
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage
                      src={user.profilePicture || ""}
                      alt={user.name || "User"}
                      className="object-cover h-full w-full rounded-full"
                    />
                    <AvatarFallback className="bg-brand-black text-white flex items-center justify-center h-full w-full rounded-full">
                      {user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" onClick={() => navigate("/login")} className="text-brand-black">
              <LogIn className="mr-2 h-5 w-5" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}