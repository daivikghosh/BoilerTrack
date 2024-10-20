import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./NotificationTab.css";

const NotificationTab = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get("/api/notifications");
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // For testing purposes, you can use fake data
        setNotifications([
          {
            id: 1,
            message: "A match has been found for your lost item.",
            timestamp: "2024-10-16 14:30",
            itemId: 42,
          },
          {
            id: 2,
            message: "Your claim request has been approved.",
            timestamp: "2024-10-15 11:45",
            itemId: 35,
          },
        ]);
      }
    };

    fetchNotifications();
  }, []);

  const handleViewItem = (itemId) => {
    navigate(`/item-view/${itemId}`);
  };

  return (
    <div className="notification-tab-container">
      <h2>Your Notifications</h2>
      <ul className="notification-list">
        {notifications.map((notification) => (
          <li key={notification.id} className="notification-item">
            <div className="notification-content">
              <p>{notification.message}</p>
              <span className="notification-timestamp">
                {notification.timestamp}
              </span>
            </div>
            {notification.itemId && (
              <button
                className="view-item-button"
                onClick={() => handleViewItem(notification.itemId)}
              >
                View
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NotificationTab;
