import { useAppContext } from "../appContext";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { axiosPostPublic } from "../api";
import { LoadingSpinner } from "../components";
import { Logo } from "../assets";

export default function Login() {
  const { login, checkAuth } = useAppContext();
  const navigate = useNavigate();

  // States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    async function verify() {
      const loggedIn = await checkAuth();
      if (loggedIn) {
        navigate("/");
      }
    }
    verify();
  }, [checkAuth, navigate]);


  // Handlers
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const clearError = () => setError("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (email.trim() === "" || password.trim() === "") {
      setError("You must fill in all the fields.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: email,
        password: password,
      };
      const response = await axiosPostPublic("login", payload);
      if (!response.success) throw new Error(response.error);

      const { token, role } = response.data;

      login({ token, role });

      navigate("/");
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  // Icon helpers
  const EmailIcon = () => (
    <svg
      className="auth-inputIcon"
      width="18"
      height="19"
      viewBox="0 0 18 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.25 2.75H15.75C16.1642 2.75 16.5 3.08579 16.5 3.5V15.5C16.5 15.9142 16.1642 16.25 15.75 16.25H2.25C1.83579 16.25 1.5 15.9142 1.5 15.5V3.5C1.5 3.08579 1.83579 2.75 2.25 2.75ZM9.04545 9.26218L4.23541 5.17828L3.26458 6.32172L9.05482 11.2378L14.7408 6.31712L13.7592 5.18288L9.04545 9.26218Z"
        fill="var(--very-dark-blue)"
      />
    </svg>
  );

  const PasswordToggleIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--very-dark-blue)"
      strokeWidth="1"
      strokeLinecap="round"
    >
      {showPassword ? (
        <path
          fill="var(--very-dark-blue)"
          d="M17.883 19.297A10.95 10.95 0 0 1 12 21c-5.392 0-9.878-3.88-10.818-9A11 11 0 0 1 4.52 5.935L1.394 2.808l1.414-1.414l19.799 19.798l-1.414 1.415zM5.936 7.35A8.97 8.97 0 0 0 3.223 12a9.005 9.005 0 0 0 13.201 5.838l-2.028-2.028A4.5 4.5 0 0 1 8.19 9.604zm6.978 6.978l-3.242-3.241a2.5 2.5 0 0 0 3.241 3.241m7.893 2.265l-1.431-1.431A8.9 8.9 0 0 0 20.778 12A9.005 9.005 0 0 0 9.552 5.338L7.974 3.76C9.221 3.27 10.58 3 12 3c5.392 0 9.878 3.88 10.819 9a10.95 10.95 0 0 1-2.012 4.593m-9.084-9.084Q11.86 7.5 12 7.5a4.5 4.5 0 0 1 4.492 4.778z"
        />
      ) : (
        <path
          fill="var(--very-dark-blue)"
          d="M12 3c5.392 0 9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.818-9C2.122 6.88 6.608 3 12 3m0 16a9.005 9.005 0 0 0 8.778-7a9.005 9.005 0 0 0-17.555 0A9.005 9.005 0 0 0 12 19m0-2.5a4.5 4.5 0 1 1 0-9a4.5 4.5 0 0 1 0 9m0-2a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5"
        />
      )}
    </svg>
  );


  return (
    <div className="auth-login-container">
      {/* Link to map page */}
      <Link to="/" className="auth-logo">
        <img src={Logo} alt="Logo" height={43} />
      </Link>

      {/* Header */}
      <div className="auth-welcome-wrapper">
        <div className="auth-icon">
          <svg
            width="31"
            height="37"
            viewBox="0 0 31 37"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.5 16.5619V5.28571C3.5 4.31265 4.17158 3.52381 5 3.52381H12.5V0H18.5V3.52381H26C26.8284 3.52381 27.5 4.31265 27.5 5.28571V16.5619L29.1285 17.1358C29.8961 17.4062 30.3471 18.3376 30.1527 19.2507L27.8774 29.9415C27.7523 29.9487 27.6266 29.9524 27.5 29.9524C26.6327 29.9524 25.7997 29.7795 25.0248 29.4613L26.9 20.0329L15.5 15.8571L4.1 20.0329L5.97512 29.4613C5.20022 29.7795 4.3673 29.9524 3.5 29.9524C3.37346 29.9524 3.24767 29.9487 3.12267 29.9415L0.84728 19.2507C0.652925 18.3376 1.10393 17.4062 1.87146 17.1358L3.5 16.5619ZM6.5 15.5048L15.5 12.3333L24.5 15.5048V7.04762H6.5V15.5048ZM3.5 33.4762C5.80507 33.4762 7.90773 32.4583 9.5 30.7844C11.0923 32.4583 13.195 33.4762 15.5 33.4762C17.805 33.4762 19.9077 32.4583 21.5 30.7844C23.0923 32.4583 25.195 33.4762 27.5 33.4762H30.5V37H27.5C25.3144 37 23.2651 36.3136 21.5 35.1142C19.7349 36.3136 17.6856 37 15.5 37C13.3144 37 11.265 36.3136 9.5 35.1142C7.73496 36.3136 5.68573 37 3.5 37H0.5V33.4762H3.5Z"
              fill="white"
            />
          </svg>
        </div>

        <h1 className="auth-welcome">Welcome Back</h1>
      </div>

      {/* Form */}
      <div className="auth-login-form">
        <h1 className="auth-signInText">Sign In</h1>
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div div className="auth-inputWrapper">
            <label htmlFor="email" className="auth-label">EMAIL</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={clearError}
              required
            />

            <EmailIcon />
          </div>

          {/* Password */}
          <div className="auth-inputWrapper">
            <label htmlFor="password" className="auth-label">PASSWORD</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={clearError}
              required
            />

            <button
              onClick={togglePasswordVisibility}
              type="button"
              className="auth-passwordToggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              <PasswordToggleIcon />
            </button>
          </div>

          {/* Error message */}
          {error && <p className="auth-errorMessage">{error}</p>}

          {/* Submit button */}
          <button type="submit" className="auth-submit-button" disabled={loading}>
            {loading ? <LoadingSpinner /> : "Sign In"}
          </button>

          {/* Signup Link */}
          <p className="auth-signupText">
            Don't have an account?{" "}
            <Link
              to="/sign-up"
              style={{ color: "var(--link-color)", textDecoration: "none" }}
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div >
    </div >
  );
}
