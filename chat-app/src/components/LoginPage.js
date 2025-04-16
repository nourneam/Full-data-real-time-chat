// components/LoginPage.js
import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Form validation
    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        // Registration form validation
        if (!email.trim()) {
          setError("Email is required");
          setLoading(false);
          return;
        }
        if (!password.trim() || password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }

        // Send registration request to server
        const response = await fetch("http://localhost:8080/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Store JWT token in local storage
        localStorage.setItem("chatToken", data.token);
        // Successful login
        onLoginSuccess(username);
      } else {
        // Login form validation
        if (!password.trim()) {
          setError("Password is required");
          setLoading(false);
          return;
        }

        // Send login request to server
        const response = await fetch("http://localhost:8080/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        // Store JWT token in local storage
        localStorage.setItem("chatToken", data.token);
        // Successful login
        onLoginSuccess(username);
      }
    } catch (err) {
      setError(err.message);
      console.error("Authentication error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{isRegistering ? "Create a New Account" : "Login"}</h2>
        <p className="subtitle">
          {isRegistering
            ? "Please enter your information to start chatting"
            : "Please enter your login credentials to continue"}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={
                isRegistering ? "Create a password" : "Enter your password"
              }
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Processing..." : isRegistering ? "Register" : "Login"}
          </button>
        </form>

        <div className="toggle-form">
          {isRegistering ? (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setIsRegistering(false)}
                disabled={loading}
              >
                Login
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button onClick={() => setIsRegistering(true)} disabled={loading}>
                Create a new account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
