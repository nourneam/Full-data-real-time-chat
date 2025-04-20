import React, { useState } from "react";
import "./LoginPage.css";

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!username.trim()) {
      setError("Username is required");
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
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

        localStorage.setItem("chatToken", data.token);
        onLoginSuccess(username);
      } else {
        if (!password.trim()) {
          setError("Password is required");
          setLoading(false);
          return;
        }

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

        localStorage.setItem("chatToken", data.token);
        onLoginSuccess(username);
      }
    } catch (err) {
      setError(err.message);
      console.error("Authentication error:", err);
    } finally {
      setLoading(false);
    }
  };

  // إنشاء العناصر باستخدام React.createElement بدلاً من JSX
  return React.createElement(
    "div",
    { className: "login-container" },
    React.createElement(
      "div",
      { className: "login-card" },
      React.createElement(
        "h2",
        null,
        isRegistering ? "Create a New Account" : "Login"
      ),
      React.createElement(
        "p",
        { className: "subtitle" },
        isRegistering
          ? "Please enter your information to start chatting"
          : "Please enter your login credentials to continue"
      ),
      error &&
        React.createElement("div", { className: "error-message" }, error),
      React.createElement(
        "form",
        { onSubmit: handleSubmit, className: "login-form" },
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", { htmlFor: "username" }, "Username"),
          React.createElement("input", {
            type: "text",
            id: "username",
            value: username,
            onChange: (e) => setUsername(e.target.value),
            placeholder: "Enter your username",
            disabled: loading,
          })
        ),
        isRegistering &&
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement("label", { htmlFor: "email" }, "Email"),
            React.createElement("input", {
              type: "email",
              id: "email",
              value: email,
              onChange: (e) => setEmail(e.target.value),
              placeholder: "Enter your email",
              disabled: loading,
            })
          ),
        React.createElement(
          "div",
          { className: "form-group" },
          React.createElement("label", { htmlFor: "password" }, "Password"),
          React.createElement(
            "div",
            { className: "password-input-container" },
            React.createElement("input", {
              type: showPassword ? "text" : "password",
              id: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              placeholder: isRegistering
                ? "Create a password"
                : "Enter your password",
              disabled: loading,
            }),
            React.createElement(
              "button",
              {
                type: "button",
                className: "password-toggle",
                onClick: togglePasswordVisibility,
                disabled: loading,
              },
              showPassword ? "Hide" : "Show"
            )
          )
        ),
        React.createElement(
          "button",
          {
            type: "submit",
            className: "login-button",
            disabled: loading,
          },
          loading ? "Processing..." : isRegistering ? "Register" : "Login"
        )
      ),
      React.createElement(
        "div",
        { className: "toggle-form" },
        isRegistering
          ? React.createElement(
              "p",
              null,
              "Already have an account? ",
              React.createElement(
                "button",
                {
                  onClick: () => setIsRegistering(false),
                  disabled: loading,
                },
                "Login"
              )
            )
          : React.createElement(
              "p",
              null,
              "Don't have an account? ",
              React.createElement(
                "button",
                {
                  onClick: () => setIsRegistering(true),
                  disabled: loading,
                },
                "Create a new account"
              )
            )
      )
    )
  );
};

export default LoginPage;
