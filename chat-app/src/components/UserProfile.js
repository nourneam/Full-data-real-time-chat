import React, { useState, useEffect } from "react";
import "./UserProfile.css";

const UserProfile = ({ username, onBack }) => {
  const [user, setUser] = useState({
    username: username,
    email: "user@example.com", // This will be replaced with real API data
    bio: "Hi there! I'm new to the chat app and excited to connect with others.",
    isOnline: true,
  });

  const [connections, setConnections] = useState([
    { id: 1, username: "User1", isOnline: true },
    { id: 2, username: "User2", isOnline: false },
    { id: 3, username: "User3", isOnline: true },
    { id: 4, username: "User4", isOnline: false },
    { id: 5, username: "User5", isOnline: true },
  ]);

  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState(user.bio);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  // Simulate fetching user data from an API
  useEffect(() => {
    // In a real app, fetch user data from the server here
    // fetch(`http://localhost:8080/api/users/${username}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setUser(data);
    //     setNewBio(data.bio);
    //   })
    //   .catch(err => console.error("Error fetching user data:", err));
  }, [username]);

  const handleSaveBio = () => {
    // In a real app, update the user bio via the server
    // fetch(`http://localhost:8080/api/users/${username}/bio`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ bio: newBio })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     setUser({ ...user, bio: newBio });
    //     setEditingBio(false);
    //   })
    //   .catch(err => console.error("Error updating bio:", err));

    setUser({ ...user, bio: newBio }); // Temporary local update
    setEditingBio(false);
  };

  const handleCancelEditBio = () => {
    setNewBio(user.bio);
    setEditingBio(false);
  };

  const handleDeleteAccount = () => {
    // In a real app, send a delete request to the server
    // fetch(`http://localhost:8080/api/users/${username}`, {
    //   method: 'DELETE'
    // })
    //   .then(res => {
    //     localStorage.removeItem('chatToken');
    //     window.location.reload(); // or redirect to login page
    //   })
    //   .catch(err => console.error("Error deleting account:", err));

    setShowDeleteConfirmation(false);
    onBack(); // Navigate back in this example
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // In a real app, upload the avatar to the server
    console.log("Selected file for upload:", file.name);

    // Simulate avatar upload preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log("File loaded:", reader.result);
      // Update user avatar here if needed
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="profile-container">
      <button className="back-button" onClick={onBack}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Chat
      </button>

      <div className="profile-header">
        <div className="profile-avatar-upload">
          <div className="profile-avatar">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <label className="avatar-upload-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <input
              type="file"
              accept="image/*"
              className="avatar-upload-input"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">{user.username}</h1>
          <div className="profile-email">{user.email}</div>
          {user.isOnline && <div className="profile-status">Online</div>}
        </div>
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Bio</h2>
        {editingBio ? (
          <div className="bio-editor">
            <textarea
              className="bio-textarea"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
              placeholder="Tell us something about yourself..."
            />
            <div className="bio-actions">
              <button className="cancel-button" onClick={handleCancelEditBio}>
                Cancel
              </button>
              <button className="save-button" onClick={handleSaveBio}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="bio-display">
            <p className="bio-text">{user.bio || "No bio available."}</p>
            <div className="bio-actions">
              <button
                className="save-button"
                onClick={() => setEditingBio(true)}
              >
                Edit
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="profile-section">
        <h2 className="profile-section-title">Friends & Connections</h2>
        <div className="connections-list">
          {connections.map((connection) => (
            <div key={connection.id} className="connection-item">
              <div className="connection-avatar">
                {connection.username.charAt(0).toUpperCase()}
              </div>
              <div className="connection-info">
                <div className="connection-name">{connection.username}</div>
                <div
                  className={`connection-status ${
                    !connection.isOnline ? "offline-status" : ""
                  }`}
                >
                  {connection.isOnline ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="danger-zone">
        <h2 className="danger-zone-title">Delete Account</h2>
        <p className="danger-zone-description">
          Warning: Deleting your account will permanently erase all your data
          from the system. This action is irreversible.
        </p>
        <button
          className="danger-button"
          onClick={() => setShowDeleteConfirmation(true)}
        >
          Delete My Account
        </button>
      </div>

      {showDeleteConfirmation && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3 className="modal-title">Confirm Account Deletion</h3>
            <p className="modal-text">
              Are you sure you want to delete your account? All your data and
              conversations will be permanently removed and cannot be restored.
            </p>
            <div className="modal-actions">
              <button
                className="modal-cancel"
                onClick={() => setShowDeleteConfirmation(false)}
              >
                Cancel
              </button>
              <button className="modal-confirm" onClick={handleDeleteAccount}>
                Yes, Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
