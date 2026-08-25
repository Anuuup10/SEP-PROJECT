import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { firebaseSignIn, firebaseSignInWithGoogle, firebaseSignUp } from "../services/firebaseAuth";

// ------------------------------------------------------------------
// Fill these in once you've registered your apps. Until then, the
// buttons show a friendly "not configured yet" message instead of
// silently failing.
// ------------------------------------------------------------------
function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a20.3 20.3 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 7 11 7a20.29 20.29 0 0 1-3.22 4.36M14.12 14.12a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Login({ initialSignup = false }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(initialSignup);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleLogin(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!email) nextErrors.email = "Enter your email.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await firebaseSignIn(email, password);
      login(response.token, response.user);
      navigate("/home");
    } catch (error) {
      setErrors({ form: error.message || "Unable to log in." });
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!name) nextErrors.name = "Enter your name.";
    if (!signupEmail) nextErrors.signupEmail = "Enter your email.";
    if (!signupPassword) nextErrors.signupPassword = "Create a password.";
    else if (signupPassword.length < 6) nextErrors.signupPassword = "Use at least 6 characters.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await firebaseSignUp(signupEmail, signupPassword, name);
      login(response.token, response.user);
      navigate("/profile/setup");
    } catch (error) {
      setErrors({ form: error.message || "Unable to create your account." });
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    if (!email) {
      setErrors({ email: "Enter your email first." });
      return;
    }
    alert("Password reset link sent to " + email);
  }

  // --- Google Sign-In ---
  async function handleGoogle() {
    setErrors({});
    setLoading(true);
    try {
      const response = await firebaseSignInWithGoogle();
      login(response.token, response.user);
      navigate("/profile/setup");
    } catch (error) {
      setErrors({ form: error.code === "auth/popup-closed-by-user" ? "Google sign-in was cancelled." : (error.message || "Unable to sign in with Google.") });
    } finally {
      setLoading(false);
    }
  }

  function goToSignup() {
    setLoading(false);
    setErrors({});
    setIsSignup(true);
    navigate("/register");
  }

  function goToLogin() {
    setLoading(false);
    setErrors({});
    setIsSignup(false);
    navigate("/login");
  }

  return (
    <div className="page-wrap" style={styles.page}>
      <div className="auth-card" style={styles.card}>
        <div style={styles.sliderWindow}>
          <div
            style={{
              ...styles.slider,
              transform: isSignup ? "translateX(-50%)" : "translateX(0%)",
            }}
          >
            {/* Login */}
            <div style={styles.formPage}>
              <div
                style={{
                  ...styles.headingArea,
                  opacity: isSignup ? 0 : 1,
                  transform: isSignup ? "translateY(10px) scale(0.96)" : "translateY(0) scale(1)",
                  transition: isSignup
                    ? "opacity 0.2s ease, transform 0.2s ease"
                    : "opacity 0.55s ease 0.2s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.2s",
                }}
              >
                <h2 className="auth-title" style={styles.title}>
                  <span className="glass-shine" style={styles.glassTitle}>
                    Journey to Fitness
                  </span>
                </h2>
                <p style={styles.subtitle}>Starts Here</p>
              </div>

              <div>
                <p style={styles.welcome}>Welcome back!</p>
                <p style={styles.accountText}>Log in to your account</p>
                {errors.form && !isSignup && <p style={styles.errorText}>{errors.form}</p>}
              </div>

              <form onSubmit={handleLogin} noValidate>
                <label htmlFor="login-email" style={styles.label}>Email</label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="glass-input"
                  style={styles.input}
                />
                {errors.email && <p style={styles.errorText}>{errors.email}</p>}

                <label htmlFor="login-password" style={styles.label}>Password</label>
                <div style={styles.inputWrap}>
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="glass-input"
                    style={{ ...styles.input, paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.password && <p style={styles.errorText}>{errors.password}</p>}

                <button type="button" onClick={handleForgotPassword} style={styles.forgot}>
                  Forgot password?
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-btn"
                  style={{ ...styles.loginButton, opacity: loading ? 0.75 : 1 }}
                >
                  {loading ? (
                    <span style={styles.loadingContainer}>
                      <span className="spinner" style={styles.spinner}></span>
                      Logging in...
                    </span>
                  ) : (
                    <>
                      Log in
                      <span style={styles.arrow}>→</span>
                    </>
                  )}
                </button>
              </form>

              <div style={styles.divider}>
                <div style={styles.line}></div>
                <p style={styles.or}>or continue with</p>
                <div style={styles.line}></div>
              </div>

              <div style={styles.socialButtons}>
                <button type="button" onClick={handleGoogle} style={styles.socialButton}>
                  <span style={styles.google}>G</span>
                  Google
                </button>
              </div>

              <p style={styles.signupText}>
                Don't have an account?
                <button type="button" onClick={goToSignup} style={styles.signupButton}>
                  Sign up
                </button>
              </p>
            </div>

            {/* Register */}
            <div style={styles.formPage}>
              <div
                style={{
                  ...styles.headingArea,
                  opacity: isSignup ? 1 : 0,
                  transform: isSignup ? "translateY(0) scale(1)" : "translateY(10px) scale(0.96)",
                  transition: isSignup
                    ? "opacity 0.55s ease 0.2s, transform 0.55s cubic-bezier(0.34,1.56,0.64,1) 0.2s"
                    : "opacity 0.2s ease, transform 0.2s ease",
                }}
              >
                <h2 className="auth-title" style={styles.title}>
                  <span className="glass-shine" style={styles.glassTitle}>
                    Start Your Journey
                  </span>
                </h2>
                <p style={styles.subtitle}>Create your account</p>
              </div>

              <form onSubmit={handleSignup} noValidate>
                {errors.form && isSignup && <p style={styles.errorText}>{errors.form}</p>}
                <label htmlFor="signup-name" style={styles.label}>Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="glass-input"
                  style={styles.input}
                />
                {errors.name && <p style={styles.errorText}>{errors.name}</p>}

                <label htmlFor="signup-email" style={styles.label}>Email</label>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  className="glass-input"
                  style={styles.input}
                />
                {errors.signupEmail && <p style={styles.errorText}>{errors.signupEmail}</p>}

                <label htmlFor="signup-password" style={styles.label}>Password</label>
                <div style={styles.inputWrap}>
                  <input
                    id="signup-password"
                    type={showSignupPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={signupPassword}
                    onChange={(event) => setSignupPassword(event.target.value)}
                    className="glass-input"
                    style={{ ...styles.input, paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword((prev) => !prev)}
                    style={styles.eyeButton}
                    aria-label={showSignupPassword ? "Hide password" : "Show password"}
                  >
                    {showSignupPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {errors.signupPassword && <p style={styles.errorText}>{errors.signupPassword}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-btn"
                  style={{ ...styles.loginButton, marginTop: "22px", opacity: loading ? 0.75 : 1 }}
                >
                  {loading ? (
                    <span style={styles.loadingContainer}>
                      <span className="spinner" style={styles.spinner}></span>
                      Creating...
                    </span>
                  ) : (
                    <>
                      Create account
                      <span style={styles.arrow}>→</span>
                    </>
                  )}
                </button>
              </form>

              <div style={styles.divider}>
                <div style={styles.line}></div>
                <p style={styles.or}>or sign up with</p>
                <div style={styles.line}></div>
              </div>

              <div style={styles.socialButtons}>
                <button type="button" onClick={handleGoogle} style={styles.socialButton}>
                  <span style={styles.google}>G</span>
                  Google
                </button>
              </div>

              <p style={styles.signupText}>
                Already have an account?
                <button type="button" onClick={goToLogin} style={styles.signupButton}>
                  Log in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes sweepMove {
            0%, 12% { left: -60%; }
            55%, 100% { left: 130%; }
          }

          .glass-shine {
            position: relative;
            display: inline-block;
            color: #176b4d;
            overflow: hidden;
          }

          .glass-shine::after {
            content: "";
            position: absolute;
            top: 0;
            left: -60%;
            width: 40%;
            height: 100%;
            background: linear-gradient(
              100deg,
              rgba(255,255,255,0) 0%,
              rgba(255,255,255,0.55) 40%,
              rgba(255,255,255,0.95) 50%,
              rgba(255,255,255,0.55) 60%,
              rgba(255,255,255,0) 100%
            );
            transform: skewX(-20deg);
            animation: sweepMove 3s cubic-bezier(0.37, 0, 0.15, 1) 0.4s infinite;
            pointer-events: none;
          }

          .spinner {
            animation: spin 0.7s linear infinite;
          }

          /* Primary button: lighter mint-to-green gradient, no stripe overlay */
          .primary-btn {
            background: linear-gradient(135deg, #4fe0ab 0%, #22c58c 45%, #17a374 100%) !important;
            color: #ffffff !important;
          }

          /* Liquid glass input fields */
          .glass-input {
            background: rgba(255, 255, 255, 0.5) !important;
            backdrop-filter: blur(14px) saturate(160%);
            -webkit-backdrop-filter: blur(14px) saturate(160%);
            border: 1px solid rgba(255, 255, 255, 0.65) !important;
            box-shadow:
              inset 0 1px 1px rgba(255, 255, 255, 0.85),
              inset 0 -6px 14px rgba(23, 163, 116, 0.05),
              0 4px 14px rgba(20, 70, 52, 0.06);
            transition: box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease;
          }

          .glass-input:hover {
            background: rgba(255, 255, 255, 0.62) !important;
          }

          .glass-input:focus {
            border-color: rgba(23, 163, 116, 0.55) !important;
            background: rgba(255, 255, 255, 0.78) !important;
            box-shadow:
              inset 0 1px 1px rgba(255, 255, 255, 0.9),
              0 0 0 3px rgba(23, 163, 116, 0.12),
              0 6px 18px rgba(20, 70, 52, 0.1);
            outline: none;
          }

          input::placeholder {
            transition: opacity 0.35s ease, transform 0.35s ease;
            opacity: 1;
            transform: translateX(0);
            color: #6b7a74;
          }

          input:focus::placeholder {
            opacity: 0;
            transform: translateX(8px);
          }

          button {
            transition: all 0.2s ease;
          }

          button:hover:not(:disabled) {
            transform: translateY(-2px);
          }

          button:active:not(:disabled) {
            transform: scale(0.96);
          }

          /* Mobile responsive adjustments */
          @media (max-width: 480px) {
            .auth-card {
              padding: 22px 18px !important;
              border-radius: 16px !important;
              max-width: 100% !important;
            }

            .auth-title {
              font-size: 21px !important;
            }

            input {
              font-size: 16px !important; /* prevents iOS auto-zoom on focus */
              height: 46px !important;
            }
          }

          @media (max-width: 360px) {
            .auth-card {
              padding: 18px 14px !important;
            }

            .auth-title {
              font-size: 19px !important;
            }
          }

          @media (max-width: 380px) {
            .page-wrap {
              padding: 12px !important;
            }
          }

          @media (max-height: 700px) and (max-width: 480px) {
            .auth-card {
              padding-top: 16px !important;
              padding-bottom: 16px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    backgroundColor: "#f6f9f7",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    boxSizing: "border-box",
  },

  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "390px",
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 15px 40px rgba(20,70,52,0.12)",
    boxSizing: "border-box",
  },

  sliderWindow: {
    width: "100%",
    overflow: "hidden",
  },

  slider: {
    width: "200%",
    display: "flex",
    transition: "transform 0.6s cubic-bezier(0.77,0,0.18,1)",
  },

  formPage: {
    width: "50%",
    flexShrink: 0,
    boxSizing: "border-box",
  },

  headingArea: {
    textAlign: "center",
    marginBottom: "22px",
  },

  title: {
    margin: 0,
    fontSize: "26px",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    color: "#153d2e",
  },

  glassTitle: {
    letterSpacing: "-0.02em",
    textShadow: "0 1px 1px rgba(21, 61, 46, 0.12)",
  },

  subtitle: {
    margin: "5px 0 0 0",
    fontSize: "14px",
    fontWeight: 650,
    letterSpacing: "0.02em",
    color: "#23845f",
  },

  welcome: {
    margin: "0 0 4px 0",
    fontSize: "14px",
    fontWeight: 600,
    color: "#52645d",
  },

  accountText: {
    margin: "0 0 18px 0",
    fontSize: "14px",
    color: "#66736f",
  },

  label: {
    display: "block",
    marginTop: "14px",
    marginBottom: "7px",
    fontSize: "13px",
    fontWeight: 700,
    color: "#20352d",
  },

  input: {
    width: "100%",
    height: "50px",
    padding: "0 15px",
    boxSizing: "border-box",
    border: "1px solid #d9e6e0",
    borderRadius: "11px",
    fontSize: "14px",
    color: "#19352a",
  },

  inputWrap: {
    position: "relative",
    width: "100%",
  },

  eyeButton: {
    position: "absolute",
    top: "50%",
    right: "14px",
    transform: "translateY(-50%)",
    border: "none",
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#687570",
    cursor: "pointer",
  },

  errorText: {
    margin: "6px 0 0 0",
    fontSize: "12px",
    fontWeight: 600,
    color: "#c1443a",
  },

  forgot: {
    display: "block",
    marginLeft: "auto",
    marginTop: "10px",
    marginBottom: "23px",
    border: "none",
    backgroundColor: "transparent",
    color: "#23845f",
    cursor: "pointer",
    fontWeight: 650,
    fontSize: "13px",
  },

  loginButton: {
    width: "100%",
    height: "53px",
    border: "none",
    borderRadius: "12px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 7px 18px rgba(34,197,140,0.32)",
  },

  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "9px",
  },

  spinner: {
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.4)",
    borderTop: "2px solid #ffffff",
    borderRadius: "50%",
    display: "inline-block",
  },

  arrow: {
    display: "inline-block",
    marginLeft: "8px",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "21px 0 16px 0",
  },

  line: {
    flex: 1,
    height: "1px",
    backgroundColor: "#e3ebe7",
  },

  or: {
    margin: 0,
    color: "#687570",
    fontSize: "12px",
    whiteSpace: "nowrap",
  },

  socialButtons: {
    display: "flex",
    gap: "12px",
  },

  socialButton: {
    flex: 1,
    height: "47px",
    border: "1px solid #cfe6da",
    borderRadius: "10px",
    backgroundColor: "#eef7f2",
    fontSize: "14px",
    cursor: "pointer",
    color: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  google: {
    color: "#4285f4",
    fontWeight: "bold",
    marginRight: "7px",
  },

  apple: {
    width: "16px",
    height: "16px",
    color: "#1a1a1a",
    marginRight: "7px",
    flexShrink: 0,
  },

  signupText: {
    textAlign: "center",
    marginTop: "17px",
    marginBottom: 0,
    color: "#687570",
    fontSize: "13px",
  },

  signupButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#176b4d",
    fontWeight: 700,
    cursor: "pointer",
    marginLeft: "5px",
    fontSize: "13px",
  },
};
