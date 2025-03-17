// pages/TermsOfService.jsx
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-full bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="heading-1 mb-6">Terms of Service</h1>
          <div className="prose prose-sm text-foreground">
            <p className="mb-4">Last updated: 2025</p>

            <h2 className="heading-2 mt-6 mb-2">Acceptance of Terms</h2>
            <p className="mb-4">
              Welcome to Editedge Multimedia ("we," "our," or "us"). By accessing or using our website{" "}
              <a href="https://editedgemultimedia.com/" className="text-primary hover:underline">
                https://editedgemultimedia.com/
              </a>{" "}
              (the "Site"), you agree to comply with and be bound by these Terms of Service ("Terms"). If you do not agree, please do not use the Site.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Changes to Terms</h2>
            <p className="mb-4">
              We may update these Terms from time to time. Continued use of the Site after changes constitutes acceptance of the new Terms.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Use of the Site</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>You must be at least 13 years old to use our Site.</li>
              <li>You agree to use the Site for lawful purposes only.</li>
              <li>You shall not engage in activities that disrupt or harm the Site or its users.</li>
            </ul>

            <h2 className="heading-2 mt-6 mb-2">Intellectual Property</h2>
            <p className="mb-4">
              All content on the Site, including text, graphics, logos, and software, is the property of Editedge Multimedia or its content suppliers and is protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our permission.
            </p>

            <h2 className="heading-2 mt-6 mb-2">User Content</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>You retain ownership of any content you submit to the Site.</li>
              <li>By submitting content, you grant us a non-exclusive, royalty-free license to use, reproduce, and display it on the Site.</li>
              <li>You are responsible for ensuring your content does not violate any laws or third-party rights.</li>
            </ul>

            <h2 className="heading-2 mt-6 mb-2">Disclaimers</h2>
            <ul className="list-disc pl-5 mb-4">
              <li>The Site is provided "as is" without warranties of any kind, either express or implied.</li>
              <li>We do not guarantee the Site will be error-free or uninterrupted.</li>
              <li>We are not responsible for third-party content linked on the Site.</li>
            </ul>

            <h2 className="heading-2 mt-6 mb-2">Limitation of Liability</h2>
            <p className="mb-4">
              To the fullest extent permitted by law, Editedge Multimedia shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Site.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Indemnification</h2>
            <p className="mb-4">
              You agree to indemnify and hold Editedge Multimedia harmless from any claims, damages, or expenses arising from your use of the Site or violation of these Terms.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Governing Law</h2>
            <p className="mb-4">
              These Terms are governed by the laws of [Insert Jurisdiction], without regard to its conflict of law principles.
            </p>

            <h2 className="heading-2 mt-6 mb-2">Contact Us</h2>
            <p className="mb-4">
              If you have questions about these Terms, please contact us:
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

export default TermsOfService;