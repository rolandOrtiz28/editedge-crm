import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Assuming this exists
import { useQuery } from "@tanstack/react-query"; // For checking auth status

// Simulate an auth check (replace with your actual auth logic)
const fetchAuthStatus = async () => {
  const response = await fetch("/api/auth/status", { credentials: "include" });
  if (!response.ok) throw new Error("Not authenticated");
  return response.json();
};

const Index = () => {
  const navigate = useNavigate();

  // Check if the user is authenticated
  const { data: isAuthenticated, isLoading } = useQuery({
    queryKey: ["authStatus"],
    queryFn: fetchAuthStatus,
    retry: false,
    staleTime: Infinity,
  });

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking auth
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Render homepage for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-50 animate-gradient-bg"></div>
        <div className="relative z-10">
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
            <div className="text-2xl font-bold text-brand-neon">EditEdge CRM</div>
            <nav className="space-x-4">
              <Link to="/login">
                <Button variant="outline" className="text-brand-neon border-brand-neon hover:bg-gray-100">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-brand-black text-white hover:bg-gray-800">
                  Get Started
                </Button>
              </Link>
            </nav>
          </header>

          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center py-20 px-6">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Streamline Your Business with{" "}
              <span className="text-brand-neon">EditEdge CRM</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8">
              A powerful, all-in-one Customer Relationship Management solution designed to manage leads, contacts, sales pipelines, and communications effortlessly.
            </p>
            <div className="space-x-4">
              <Link to="/register">
                <Button size="lg" className="bg-brand-black text-white hover:bg-gray-800">
                  Try it Free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-brand-neon border-brand-neon hover:bg-gray-100">
                  Sign In
                </Button>
              </Link>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 px-6 bg-white relative z-10">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-4xl font-bold text-center mb-12">Why Choose EditEdge CRM?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard
                  title="Lead Management"
                  description="Capture, track, and nurture leads with ease to convert them into loyal customers."
                  icon="📈"
                />
                <FeatureCard
                  title="Sales Pipeline"
                  description="Visualize your sales process and close deals faster with an intuitive pipeline."
                  icon="🚀"
                />
                <FeatureCard
                  title="Communication Hub"
                  description="Centralize emails, messages, and meetings to stay connected with your team and clients."
                  icon="💬"
                />
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 px-6 text-center bg-brand-black text-white relative z-10">
            <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-lg max-w-xl mx-auto mb-8">
              Join thousands of businesses using EditEdge CRM to simplify their operations and boost productivity.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-brand-neon text-brand-black hover:bg-gray-200">
                Get Started Now
              </Button>
            </Link>
          </section>

          {/* Footer */}
          <footer className="py-6 px-6 bg-brand-black text-white text-center relative z-10">
            <p>© 2025 EditEdge CRM. All rights reserved.</p>
            <div className="mt-2 space-x-4">
              <Link to="/policy" className="hover:underline">Privacy Policy</Link>
              <Link to="/terms-of-service" className="hover:underline">Terms of Service</Link>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // Fallback for authenticated users (though redirect should handle this)
  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarWrapper />
    </div>
  );
};

// Feature Card Component with Floating Animation
const FeatureCard = ({ title, description, icon }) => (
  <div className="p-6 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow animate-float">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default Index;