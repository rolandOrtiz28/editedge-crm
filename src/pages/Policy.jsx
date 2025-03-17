// pages/PrivacyPolicy.jsx
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-1 mb-6">Privacy Policy</h1>
          <div className="prose prose-sm text-foreground">
            <p className="mb-4">Last updated: 2025</p>

            <h2 className="heading-2 mt-6 mb-2">Overview</h2>
            <p className="mb-4">
              Editedge Multimedia ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{" "}
              <a href="https://editedgemultimedia.com/" className="text-primary hover:underline">
                https://editedgemultimedia.com/
              </a>{" "}
              (the "Site").
            </p>

            <h2 className="heading-2 mt-6 mb-2">Information Collection</h2>
            <p className="mb-4">We collect the following types of information:</p>
            <h3 className="heading-3 mt-4 mb-2">Personal Information</h3>
            <p className="mb-4">
              Name, email address, phone number, and other contact details provided through forms or communications.
            </p>
            <h3 className="heading-3 mt-4 mb-2">Usage Data</h3>
            <p className="mb-4">
              IP address, browser type, operating system, pages visited, time spent on pages, and referral links.
            </p>
            <h3 className="heading-3 mt-4 mb-2">Cookies and Tracking Technologies</h3>
            <p className="mb-4">
              We use cookies to enhance user experience, analyze site traffic, and serve personalized content.
            </p>

            <h2 className="heading-2 mt-6 mb-2">How We Use Your Information</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>To provide, operate, and maintain our services.</li>
              <li>To improve, personalize, and expand our website.</li>
              <li>To communicate with you, including sending updates, promotional materials, or responding to inquiries.</li>
              <li>To detect and prevent fraud or security issues.</li>
            </ul>

            <h2 className="heading-2 mt-6 mb-2">Information Sharing</h2>
            <p className="mb-4">
              We do not sell, trade, or rent your personal information to third parties. However, we may share your information with:
            </p>
            <ul className="list-disc pl-5 mb-4">
              <li>
                <strong>Service Providers:</strong> Third-party vendors who assist in website operations (e.g., hosting, analytics).
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law or to protect our rights and safety.
              </li>
            </ul>

            <h2 className="heading-2 mt-6 mb-2">Data Security</h2>
            <p className="mb-4">
              We implement security measures to protect your personal information from unauthorized access, disclosure, or destruction. However, no online transmission is 100% secure.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Your Rights and Choices</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>
                <strong>Access and Update:</strong> You can request access to or correction of your personal data.
              </li>
              <li>
                <strong>Opt-Out:</strong> You can opt out of receiving marketing emails by following the unsubscribe link.
              </li>
              <li>
                <strong>Cookie Preferences:</strong> Adjust your browser settings to manage cookies.
              </li>
            </ul>

            <h2 className="heading-2 mt-6 mb-2">Third-Party Links</h2>
            <p className="mb-4">
              Our website may contain links to third-party sites. We are not responsible for their privacy practices.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Children’s Privacy</h2>
            <p className="mb-4">
              Our services are not directed to individuals under 13. We do not knowingly collect personal information from children.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Policy Updates</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically. We encourage you to review it regularly.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy, please contact us:
            </p>
            <ul className="list-none pl-0 mb-4">
              <li>
                Email:{" "}
                <a href="mailto:editedgemultimedia@gmail.com" className="text-primary hover:underline">
                  editedgemultimedia@gmail.com
                </a>
              </li>
              <li>Phone: +63 919 432 1215</li>
              <li>Address: Tacloban City, Philippines</li>
            </ul>
          </div>
          <Link 
            to="/" 
            className="mt-6 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;