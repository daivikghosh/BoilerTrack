import React, { useEffect, useState } from "react";
import axios from "axios";

function UserFeedback() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await axios.get("/feedback/user");
        setFeedback(response.data);
      } catch (error) {
        console.error("Error fetching user feedback:", error);
      }
    }
    fetchFeedback();
  }, []);

  return (
    <div>
      <h1>Your Feedback</h1>
      <ul>
        {feedback.map((item) => (
          <li key={item.FeedbackID}>
            <p><strong>Description:</strong> {item.Description}</p>
            <p><strong>Submitted At:</strong> {new Date(item.SubmittedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserFeedback;