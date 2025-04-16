import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import "./ChatWithSocketIO.css";

const ChatWithSocketIO = ({ username }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [socket, setSocket] = useState(null);
  // Removed unused onlineUsers state
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [activeChat, setActiveChat] = useState(null);
  const messagesEndRef = useRef(null);

  // بيانات الدردشات (ستأتي من السيرفر في التطبيق الحقيقي)
  const [chats] = useState([
    {
      id: 1,
      username: "User1",
      lastMessage: "Hello there",
      time: "10:30 AM",
      unread: 0,
      isOnline: false,
    },
    {
      id: 2,
      username: "User2",
      lastMessage: "Haha, that's funny",
      time: "9:15 AM",
      unread: 2,
      isOnline: true,
    },
    {
      id: 3,
      username: "User3",
      lastMessage: "Check out this new",
      time: "Yesterday",
      unread: 0,
      isOnline: false,
    },
    {
      id: 4,
      username: "User4",
      lastMessage: "Just sent you the",
      time: "Yesterday",
      unread: 1,
      isOnline: true,
    },
    {
      id: 5,
      username: "User5",
      lastMessage: "Sounds good to me",
      time: "Monday",
      unread: 0,
      isOnline: false,
    },
  ]);

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io("http://localhost:8080");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up Socket.IO event listeners
  useEffect(() => {
    if (socket && username) {
      socket.on("connect", () => {
        setConnectionStatus("connected");
        socket.emit("join", username);
      });

      socket.on("disconnect", () => {
        setConnectionStatus("disconnected");
      });

      socket.on("connect_error", () => {
        setConnectionStatus("error");
      });

      socket.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      socket.on("userJoined", (data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            username: "System",
            text: `${data.username} has joined the chat`,
            timestamp: new Date(),
            isSystem: true,
          },
        ]);
      });

      socket.on("userLeft", (data) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            username: "System",
            text: `${data.username} has left the chat`,
            timestamp: new Date(),
            isSystem: true,
          },
        ]);
      });

      socket.on("chatHistory", (history) => {
        setMessages(history);
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("message");
        socket.off("userJoined");
        socket.off("userLeft");
        socket.off("chatHistory");
      };
    }
  }, [socket, username]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && socket && connectionStatus === "connected") {
      socket.emit("sendMessage", messageInput);
      setMessageInput("");
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    // هنا يمكنك جلب رسائل المحادثة المحددة من السيرفر
    setMessages([
      {
        username: chat.username,
        text: chat.lastMessage,
        timestamp: new Date(),
        isSystem: false,
      },
    ]);
  };

  return (
    <div className="chat-container">
      {/* الجزء الجانبي لقائمة المحادثات */}
      <div className="chat-list-sidebar">
        <div className="chat-list-header">Messages</div>
        <div className="search-bar">
          <input type="text" placeholder="Search in messages" />
        </div>
        <ul className="chat-list">
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`chat-item ${
                activeChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => handleChatSelect(chat)}
            >
              <div className="user-avatar">
                {chat.username.charAt(0).toUpperCase()}
              </div>
              <div className="chat-info">
                <div className="user-name">{chat.username}</div>
                <div className="last-message">{chat.lastMessage}</div>
                {chat.isOnline && (
                  <div className="active-status">Active now</div>
                )}
              </div>
              {chat.unread > 0 && (
                <div className="unread-count">{chat.unread}</div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* جزء المحادثة الرئيسي */}
      <div className="chat-main-area">
        {activeChat ? (
          <>
            <div className="current-chat-header">
              <div className="user-avatar">
                {activeChat.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="current-chat-user">{activeChat.username}</div>
                {activeChat.isOnline ? (
                  <div className="current-chat-status">Active now</div>
                ) : (
                  <div className="current-chat-status">Last seen recently</div>
                )}
              </div>
            </div>

            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${
                    msg.isSystem
                      ? "system-message"
                      : msg.username === username
                      ? "sent-message"
                      : "received-message"
                  }`}
                >
                  {!msg.isSystem && msg.username !== username && (
                    <div className="message-sender">{msg.username}</div>
                  )}
                  <div className="message-text">{msg.text}</div>
                  <div className="message-time">
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                className="message-input"
              />

              <button
                type="submit"
                className="send-button"
                onClick={handleSendMessage}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#65676b"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div className="no-chat-text">Select a chat to start messaging</div>
          </div>
        )}
      </div>

      {/* جزء المعلومات الجانبية */}
      {activeChat && (
        <div className="chat-info-sidebar">
          <div className="info-section">
            <div className="info-section-title">User Info</div>
            <div className="user-avatar large">
              {activeChat.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-name large">{activeChat.username}</div>
            {activeChat.isOnline ? (
              <div className="active-status">Active now</div>
            ) : (
              <div className="status-text">Last seen recently</div>
            )}
          </div>

          <div className="info-section">
            <div className="info-section-title">Graph</div>
            <div className="info-item">
              <div className="info-value">Great job! Keep it up.</div>
            </div>
          </div>

          <div className="info-section">
            <div className="info-section-title">Today's highlights</div>
            <div className="info-item">
              <div className="info-value">
                Excited to share my latest post! Check it out and let me know
                your thoughts.
              </div>
              <div className="info-time">11:00 PM</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithSocketIO;
