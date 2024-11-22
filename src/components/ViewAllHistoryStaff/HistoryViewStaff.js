import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./HistoryViewStaff.css";

const TimelineView = () => {
  const { itemId } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/individual-itemhistory-staff/${itemId}`);
        setHistory(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError("Failed to load history. Please try again later.");
        setLoading(false);
      }
    };

    fetchHistory();
  }, [itemId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="history-timeline-container">
      <div className="timeline">
        {history.map((entry, index) => (
          <div className="timeline-item" key={index}>
            <div className="timeline-marker"></div>
            <div className="timeline-item-content">
              <div className="timeline-item-header">
                <strong>Item ID:</strong> {entry.ItemID}
              </div>
              <div className="timeline-item-body">
                <p><strong>Modified By:</strong> {entry.UserEmail}</p>
                <p><strong>Change:</strong></p>
                <p>{entry.Change}</p> {/* Newlines (\n) will render here */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print Button */}
      <button className="print-button" onClick={handlePrint}>
        Print Item History
      </button>
    </div>
  );
};

export default TimelineView;