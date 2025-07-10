import { Header, Footer } from "../components";

const PrivacyPolicy = () => {
  return (
    <div className="page-wrapper">
      <Header />
      <div className="about-page">
        <h1>Privacy Policy</h1>

        <p>
          At SeaX, we are committed to protecting your privacy. This policy
          explains how we collect, use, and safeguard your personal information.
        </p>

        <h3>Use of Cookies</h3>
        <p>
          We use cookies and similar technologies to enhance your experience,
          analyze usage, and improve our services. Cookies help us remember your
          preferences and improve your interaction with the platform.
        </p>
        <p>
          By using SeaX, you consent to the use of cookies in accordance with
          this Privacy Policy. You can disable cookies in your browser settings
          at any time, though this may affect the functionality of some
          features.
        </p>

        <h3>Information Collection</h3>
        <p>
          We may collect limited personal information such as your name, email
          address, and usage data when you use our platform. This data helps us
          provide support and improve your experience.
        </p>

        <h3>Data Security</h3>
        <p>
          We take appropriate measures to protect your information from
          unauthorized access, alteration, or disclosure.
        </p>

        <h3>Changes to This Policy</h3>
        <p>
          This Privacy Policy may be updated occasionally. Any significant
          changes will be communicated through our platform or email, if
          applicable.
        </p>

        <p>If you have questions about this policy, feel free to contact us.</p>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
