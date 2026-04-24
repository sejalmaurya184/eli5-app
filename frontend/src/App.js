import React, { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ added
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [text, setText] = useState("");
  const [level, setLevel] = useState("5");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [activeTab, setActiveTab] = useState("simplify");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [changePasswordMsg, setChangePasswordMsg] = useState("");
  const [changePasswordErr, setChangePasswordErr] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const theme = darkMode
    ? {
        pageBg: "#0f172a",
        cardBg: "#111827",
        text: "#e5e7eb",
        mutedText: "#94a3b8",
        title: "#93c5fd",
        inputBg: "#1f2937",
        inputBorder: "#374151",
        tabIdleBg: "#111827",
        tabIdleBorder: "#334155",
        tabIdleText: "#e2e8f0",
        resultBg: "#162033",
        resultText: "#e5e7eb",
        historyCardBg: "#1f2937",
        historyCardBorder: "#374151",
        footerText: "#94a3b8"
      }
    : {
        pageBg: "linear-gradient(180deg, #eef5ff 0%, #f8fbff 100%)",
        cardBg: "#ffffff",
        text: "#000000",
        mutedText: "#1f2937",
        title: "#000000",
        inputBg: "#ffffff",
        inputBorder: "#d1d5db",
        tabIdleBg: "#f4f8ff",
        tabIdleBorder: "#c7d6f9",
        tabIdleText: "#000000",
        resultBg: "#eef4ff",
        resultText: "#000000",
        historyCardBg: "#fafafa",
        historyCardBorder: "#e5e7eb",
        footerText: "#6b7280"
      };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedEmail = localStorage.getItem("userEmail");
    if (savedToken) {
      setToken(savedToken);
    }
    if (savedEmail) {
      setLoggedInEmail(savedEmail);
    }
  }, []);

  const getErrorMessage = (err, fallback) => {
    const message = err.response?.data?.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
    return fallback;
  };

  const handleLogin = async () => {
    try {
      if (!email?.trim() || !password) {
        alert("Please enter both email and password.");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password }
      );
      const normalizedEmail = email.trim().toLowerCase();

      setToken(res.data.token);
      setLoggedInEmail(normalizedEmail);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", normalizedEmail);
      alert("Login successful. Welcome back to ELI5.");
    } catch (err) {
      alert(getErrorMessage(err, "Login failed. Please try again."));
    }
  };
  const handleRegister = async () => {
    try {
      if (!email?.trim() || !password) {
        alert("Please enter both email and password.");
        return;
      }
      if (password.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { email, password }
      );

      alert("Successfully registered. Please verify your email before logging in.");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(getErrorMessage(err, "Registration failed. Please try again."));
    }
  };

  const handleForgot = async () => {
    try {
      if (!email?.trim()) {
        alert("Please enter your email address.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/auth/forgot-password`,
        { email }
      );
      alert("If your email is registered, a password reset link has been sent.");
    } catch (err) {
      alert(getErrorMessage(err, "Unable to send reset link right now."));
    }
  };

  const handleReset = async (token, newPassword) => {
    try {
      if (!newPassword || newPassword.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        { password: newPassword }
      );
      alert("Password reset successful");
    } catch (err) {
      alert(getErrorMessage(err, "Password reset failed."));
    }
  };

  const handleSimplify = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${API_BASE_URL}/api/simplify`,
        { text, level },
        {
          headers: {
            Authorization: token
          }
        }
      );

      setResult(res.data.simplified);
      setHistory(res.data.history);
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteHistory = async () => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/simplify/history`,
        {
          headers: {
            Authorization: token
          }
        }
      );

      setHistory([]); // clear UI
    } catch (err) {
      alert("Failed to delete history");
    }
  };

  const handleChangePassword = async () => {
    try {
      setChangePasswordErr("");
      setChangePasswordMsg("");

      if (!currentPassword || !newAccountPassword) {
        setChangePasswordErr("Please enter both current and new password.");
        return;
      }

      if (newAccountPassword.length < 8) {
        setChangePasswordErr("New password must be at least 8 characters.");
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/auth/change-password`,
        { currentPassword, newPassword: newAccountPassword },
        {
          headers: {
            Authorization: token
          }
        }
      );

      setChangePasswordMsg("Password changed successfully.");
      alert("Password changed successfully.");
      setCurrentPassword("");
      setNewAccountPassword("");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to change password right now.";
      setChangePasswordErr(message);
      alert(message);
    }
  };

  // 🔥 UI BLOCKS (reused safely)

  const loginUI = (
    <div style={styles.authSection}>
      <h3 style={styles.sectionTitle}>Login</h3>
      <p style={{ ...styles.sectionSubtitle, color: theme.mutedText }}>Welcome back to ELI5</p>

      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={handleLogin}>
        Login
      </button>
      <p style={{ marginTop: "10px" }}>
        Don’t have an account?{" "}
        <Link to="/register">Register</Link>
      </p>
      <p>
        <Link to="/forgot-password">Forgot Password?</Link>
      </p>
    </div>
  );
  const registerUI = (
    <div style={styles.authSection}>
      <h3 style={styles.sectionTitle}>Create Account</h3>
      <p style={{ ...styles.sectionSubtitle, color: theme.mutedText }}>Start simplifying anything in seconds</p>

      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={styles.button} onClick={handleRegister}>
        Register
      </button>

      <p style={{ marginTop: "10px" }}>
        Already have an account?{" "}
        <Link to="/">Login</Link>
      </p>
    </div>
  );

  const homeUI = (
    <>
      <div style={styles.navbar}>
        <div>
          <h2 style={{ ...styles.welcomeTitle, color: theme.title }}>Welcome to ELI5</h2>
          <p style={{ ...styles.welcomeSubtitle, color: theme.mutedText }}>Make complex ideas easy to understand</p>
        </div>

        <button
          style={styles.logoutBtn}
          onClick={() => {
            setToken("");
            setLoggedInEmail("");
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
          }}
        >
          Logout
        </button>
        
      </div>

      <div style={styles.tabsRow}>
        <button
          style={{
            ...(activeTab === "simplify" ? styles.activeTabBtn : styles.tabBtn),
            ...(darkMode && (activeTab === "simplify" ? styles.activeTabBtnDark : styles.tabBtnDark))
          }}
          onClick={() => setActiveTab("simplify")}
        >
          Simplify
        </button>
        <button
          style={{
            ...(activeTab === "history" ? styles.activeTabBtn : styles.tabBtn),
            ...(darkMode && (activeTab === "history" ? styles.activeTabBtnDark : styles.tabBtnDark))
          }}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
        <button
          style={{
            ...(activeTab === "account" ? styles.activeTabBtn : styles.tabBtn),
            ...(darkMode && (activeTab === "account" ? styles.activeTabBtnDark : styles.tabBtnDark))
          }}
          onClick={() => setActiveTab("account")}
        >
          Account
        </button>
      </div>

      {activeTab === "simplify" && (
        <div style={styles.mainContent}>
          <textarea
            style={{
              ...styles.textarea,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`
            }}
            rows="5"
            placeholder="Paste any complex paragraph here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <select
            style={{
              ...styles.select,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`
            }}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="5">Explain like I'm 5</option>
            <option value="10">Explain like I'm 10</option>
            <option value="15">Explain like I'm 15</option>
          </select>

          <button
            style={styles.button}
            onClick={handleSimplify}
            disabled={loading}
          >
            {loading ? "Processing..." : "Simplify"}
          </button>

          {error && <p style={{ color: "red" }}>{error}</p>}

          {result && (
            <div style={{
              ...styles.resultBox,
              background: theme.resultBg,
              color: theme.resultText
            }}>
              <h3 style={styles.resultTitle}>Result</h3>
              <p>{result}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div style={styles.historySection}>
          <div style={styles.historyHeader}>
            <h3>History</h3>
            {history.length > 0 && (
              <button
                style={styles.deleteBtn}
                onClick={handleDeleteHistory}
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p style={styles.emptyText}>No history yet. Use Simplify to generate entries.</p>
          ) : (
            history.map((item, index) => (
              <div
                key={index}
                style={{
                  ...styles.historyItem,
                  background: theme.historyCardBg,
                  color: theme.text,
                  border: `1px solid ${theme.historyCardBorder}`
                }}
                onClick={() => {
                  setText(item.input);
                  setActiveTab("simplify");
                }}
              >
                <p><strong>Input:</strong> {item.input}</p>
                <p><strong>Output:</strong> {item.output}</p>

                <p style={{ fontSize: "12px", color: theme.mutedText }}>
                  {new Date(item.createdAt).toLocaleString()}
                </p>

                <button
                  style={styles.copyBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(item.output);
                  }}
                >
                  Copy text
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "account" && (
        <div style={styles.accountSection}>
          <h3 style={styles.accountTitle}>Change Password</h3>
          <p style={{ ...styles.accountSubtitle, color: theme.mutedText }}>
            Keep your account secure by using a strong password.
          </p>
          <p style={{ ...styles.loggedInEmailText, color: theme.mutedText }}>
            Logged in as: <strong>{loggedInEmail || "your account"}</strong>
          </p>

          <input
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`
            }}
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            style={{
              ...styles.input,
              background: theme.inputBg,
              color: theme.text,
              border: `1px solid ${theme.inputBorder}`
            }}
            type="password"
            placeholder="New password"
            value={newAccountPassword}
            onChange={(e) => setNewAccountPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleChangePassword}>
            Update Password
          </button>

          {changePasswordMsg && <p style={styles.successText}>{changePasswordMsg}</p>}
          {changePasswordErr && <p style={styles.errorText}>{changePasswordErr}</p>}
        </div>
      )}
    </>
  );
  const forgotUI = (
    <div style={styles.authSection}>
      <h3 style={styles.sectionTitle}>Forgot Password</h3>
      <p style={{ ...styles.sectionSubtitle, color: theme.mutedText }}>Enter your email and we will send a reset link.</p>

      <input
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <button style={styles.button} onClick={handleForgot}>
        Send Reset Link
      </button>

      <p>
        <Link to="/">Back to Login</Link>
      </p>
    </div>
  );

  // 🔥 ROUTING ADDED HERE

  return (
    <div
      style={{
        ...styles.container,
        background: theme.pageBg,
        position: "relative"
      }}
    >
      {/* 🌙 GLOBAL DARK MODE BUTTON */}
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <button
          style={styles.toggleBtn}
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      <div
        style={{
          ...styles.card,
          background: theme.cardBg,
          color: theme.text,
          boxShadow: darkMode ? "0 20px 45px rgba(0,0,0,0.35)" : "0 20px 45px rgba(45, 85, 160, 0.14)"
        }}
      >
        <header style={styles.appHeader}>
          <h1 style={{ ...styles.title, color: theme.title }}>ELI5 Simplifier</h1>
          <p style={{ ...styles.headerTagline, color: theme.mutedText }}>
            Turn hard topics into simple explanations.
          </p>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              !token ? loginUI : <Navigate to="/home" />
            }
          />
          
          <Route
            path="/register"
            element={!token ? registerUI : <Navigate to="/home" />}
          />

          <Route
            path="/home"
            element={
              token ? homeUI : <Navigate to="/" />
            }
          />

          <Route path="/forgot-password" element={forgotUI} />

          <Route path="/reset-password/:token" element={<ResetPassword />} />

        </Routes>
      </div>

      <footer style={{ ...styles.footer, color: theme.footerText }}>
        Built with ELI5 to make learning simpler. | Learn faster, stress less.
      </footer>
    </div>
  );
}
const ResetPassword = () => {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const getResetErrorMessage = (err) =>
    err.response?.data?.message ||
    "Password reset failed. The link may be invalid or expired.";

  const handleResetClick = async () => {
    try {
      setResetError("");

      if (!newPassword || newPassword.length < 8) {
        const message = "Password must be at least 8 characters.";
        setResetError(message);
        alert(message);
        return;
      }

      await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        { password: newPassword }
      );

      alert("Password reset successful");
      setNewPassword("");
    } catch (err) {
      const message = getResetErrorMessage(err);
      setResetError(message);
      alert(message);
    }
  };

  return (
    <div style={styles.authSection}>
      <h3 style={styles.sectionTitle}>Reset Password</h3>
      <p style={styles.sectionSubtitle}>Choose a new secure password for your account.</p>

      <input
        style={styles.input}
        type="password"
        placeholder="Enter new password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button style={styles.button} onClick={handleResetClick}>
        Reset Password
      </button>

      {resetError && <p style={{ color: "red" }}>{resetError}</p>}
    </div>
  );
};

export default App;

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f4f6f8",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    padding: "30px 20px"
  },
  card: {
    background: "#fff",
    padding: "34px",
    borderRadius: "18px",
    width: "100%",
    maxWidth: "800px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    border: "1px solid rgba(148, 163, 184, 0.22)"
  },
  appHeader: {
    borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
    marginBottom: "20px",
    paddingBottom: "14px"
  },
  headerTagline: {
    margin: 0,
    marginTop: "-10px",
    fontSize: "14px"
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "36px",
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    letterSpacing: "0.6px",
    color: "#2f6fdd"
  },
  authSection: {
    maxWidth: "420px",
    margin: "0 auto"
  },
  sectionTitle: {
    marginBottom: "6px"
  },
  sectionSubtitle: {
    marginTop: 0,
    marginBottom: "14px",
    color: "#64748b"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db"
  },
  textarea: {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    marginBottom: "12px",
    lineHeight: 1.5
  },
  select: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db"
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #2563eb, #3b82f6)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "10px",
    fontWeight: 600
  },
  tabsRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px"
  },
  tabBtn: {
    padding: "10px 16px",
    border: "1px solid #c7d6f9",
    borderRadius: "999px",
    background: "#f4f8ff",
    cursor: "pointer",
    fontWeight: 600
  },
  activeTabBtn: {
    padding: "10px 16px",
    border: "1px solid #2f6fdd",
    borderRadius: "999px",
    background: "#2f6fdd",
    color: "white",
    cursor: "pointer",
    fontWeight: 600
  },
  tabBtnDark: {
    background: "#0f172a",
    border: "1px solid #334155",
    color: "#e2e8f0"
  },
  activeTabBtnDark: {
    background: "#1d4ed8",
    border: "1px solid #3b82f6",
    color: "#fff"
  },
  resultBox: {
    background: "#e8f5e9",
    padding: "14px",
    borderRadius: "12px",
    marginTop: "10px",
    border: "1px solid rgba(59, 130, 246, 0.2)"
  },
  resultTitle: {
    marginTop: 0
  },
  historyBox: {
    marginTop: "20px"
  },
  historyItem: {
  border: "1px solid #ddd",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "10px",
  cursor: "pointer",
  background: "#fafafa",
  transition: "0.2s",
  boxShadow: "0 6px 18px rgba(2, 6, 23, 0.06)"
  },
  navbar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
  },
  welcomeTitle: {
    margin: 0,
    fontFamily: "'Trebuchet MS', 'Segoe UI', sans-serif",
    fontSize: "28px",
    color: "#2f6fdd"
  },
  welcomeSubtitle: {
    margin: "4px 0 0",
    color: "#64748b"
  },
  logoutBtn: {
    padding: "8px 12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  mainContent: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  historySection: {
    marginTop: "20px"
  },
  toggleBtn: {
  padding: "8px 12px",
  background: "#333",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px"
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  },
  deleteBtn: {
    padding: "6px 10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer"
  },
  emptyText: {
    color: "#64748b"
  },
  copyBtn: {
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    fontSize: "12px",
    marginTop: "4px"
  },
  footer: {
    marginTop: "16px",
    color: "#6b7280",
    fontSize: "13px",
    textAlign: "center"
  },
  accountSection: {
    maxWidth: "480px"
  },
  accountTitle: {
    marginBottom: "6px"
  },
  accountSubtitle: {
    marginTop: 0,
    marginBottom: "6px",
    color: "#64748b"
  },
  loggedInEmailText: {
    marginTop: 0,
    marginBottom: "12px",
    color: "#64748b",
    fontSize: "14px"
  },
  successText: {
    color: "#15803d",
    marginTop: "8px"
  },
  errorText: {
    color: "#dc2626",
    marginTop: "8px"
  }
};