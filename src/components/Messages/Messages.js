import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Messages = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/messages/${id}`);
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`/messages/${id}`, { message: newMessage });
      setMessages((prev) => [...prev, { sender: "user", text: newMessage }]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div>
      <h2>Messages for Dispute #{id}</h2>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender === "staff" ? "Staff" : "You"}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      ></textarea>
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Messages;