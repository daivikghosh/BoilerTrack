import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const StudentMessages = () => {
  const { id } = useParams(); // Dispute ID
  const [newMessage, setNewMessage] = useState("");
  const [status, setStatus] = useState("");

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`/messages/${id}`, { message: newMessage });
      setNewMessage("");
      setStatus("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
      setStatus("Failed to send message. Please try again.");
    }
  };

  return (
    <div>
      <h2>Send a Message for Dispute #{id}</h2>
      <textarea
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="Type your message..."
      ></textarea>
      <button onClick={sendMessage}>Send</button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default StudentMessages;
