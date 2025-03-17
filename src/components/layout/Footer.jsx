// components/layout/Footer.jsx
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="w-full bg-background border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex justify-center gap-6 text-sm text-muted-foreground">
          <Link 
            to="/policy" 
            className="hover:text-foreground transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms-of-service" 
            className="hover:text-foreground transition-colors duration-200"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;