// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import ChatWithSocketIO from "./components/ChatWithSocketIO";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLoginSuccess = (username) => {
    setUser({ username });
  };

  // Check JWT token when the app loads
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("chatToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:8080/api/verify-token", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.valid) {
          setUser({ username: data.user.username });
        } else {
          // If token is invalid, remove it
          localStorage.removeItem("chatToken");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem("chatToken");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("chatToken");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <div className="chat-wrapper">
          <div className="app-header">
            <h1>Real Time Chat</h1>
            <div className="user-controls">
              <span>
                Welcome: <strong>{user.username}</strong>
              </span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          </div>

          <ChatWithSocketIO username={user.username} />
        </div>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
