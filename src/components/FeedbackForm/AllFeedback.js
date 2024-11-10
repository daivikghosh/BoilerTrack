import React, { useEffect, useState } from "react";
import axios from "axios";

function AllFeedback() {
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await axios.get("/feedback/all");
        setFeedback(response.data);
      } catch (error) {
        console.error("Error fetching all feedback:", error);
      }
    }
    fetchFeedback();
  }, []);

  return (
    <div>
      <h1>All Feedback</h1>
      <ul>
        {feedback.map((item) => (
          <li key={item.FeedbackID}>
            <h1> </h1>
            <p><strong>Description:</strong> {item.Description}</p>
            <p><strong>Submitted At:</strong> {new Date(item.SubmittedAt).toLocaleString()}</p>
            <h1> </h1>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AllFeedback;