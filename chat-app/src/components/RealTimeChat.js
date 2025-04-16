// RealTimeChat.js
import React, { useState, useEffect, useRef } from "react";

const RealTimeChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const messagesEndRef = useRef(null);

  // Connect to WebSocket server
  useEffect(() => {
    if (isUsernameSet && !socket) {
      // In a real application, replace with your WebSocket server URL
      const ws = new WebSocket("ws://localhost:8080");

      ws.onopen = () => {
        console.log("Connected to chat server");
        setConnectionStatus("connected");

        // Send a join message to the server
        ws.send(
          JSON.stringify({
            type: "join",
            username: username,
          })
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "message":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: Date.now(),
                username: data.username,
                text: data.text,
                timestamp: new Date(),
                isMine: data.username === username,
              },
            ]);
            break;
          case "join":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: Date.now(),
                system: true,
                text: `${data.username} has joined the chat`,
                timestamp: new Date(),
              },
            ]);
            break;
          case "leave":
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                id: Date.now(),
                system: true,
                text: `${data.username} has left the chat`,
                timestamp: new Date(),
              },
            ]);
            break;
          default:
            console.warn("Unknown message type:", data);
        }
      };

      ws.onclose = () => {
        console.log("Disconnected from chat server");
        setConnectionStatus("disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setConnectionStatus("error");
      };

      setSocket(ws);

      // Clean up on unmount
      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "leave",
              username: username,
            })
          );
          ws.close();
        }
      };
    }
  }, [isUsernameSet, username]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (
      !inputMessage.trim() ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const messageData = {
      type: "message",
      username: username,
      text: inputMessage.trim(),
    };

    socket.send(JSON.stringify(messageData));
    setInputMessage("");
  };

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!isUsernameSet) {
    return (
      <div className="username-container">
        <h2>Enter your username to join the chat</h2>
        <form onSubmit={handleUsernameSubmit} className="username-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="username-input"
          />
          <button type="submit" className="username-button">
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>Real-time Chat</h1>
        <div className="user-status">
          <span
            className={`status-indicator ${
              connectionStatus === "connected" ? "online" : "offline"
            }`}
          ></span>
          <span>
            {username} ({connectionStatus})
          </span>
        </div>
      </header>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.system
                  ? "system-message"
                  : message.isMine
                  ? "user-message"
                  : "other-message"
              }`}
            >
              {!message.system && (
                <div className="message-username">{message.username}</div>
              )}
              <div className="message-content">{message.text}</div>
              <div className="message-timestamp">
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form className="message-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
            disabled={connectionStatus !== "connected"}
          />
          <button
            type="submit"
            className="send-button"
            disabled={connectionStatus !== "connected"}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default RealTimeChat;
