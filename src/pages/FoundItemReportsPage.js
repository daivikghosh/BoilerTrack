import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FoundItemReportsPage.css';

function FoundItemReportsPage() {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/found-reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching found item reports:', error);
      }
    };

    fetchReports();
  }, []);

  const handleReportClick = async (reportID) => {
    try {
      const response = await axios.get(`/api/found-reports/${reportID}`);
      setSelectedReport(response.data);
    } catch (error) {
      console.error('Error fetching report details:', error);
    }
  };

  return (
    <div className="found-reports-page">
      <h2>Found Item Reports</h2>
      <ul className="reports-list">
        {reports.map((report) => (
          <li key={report.ReportID} onClick={() => handleReportClick(report.ReportID)}>
            {report.ItemDescription}
          </li>
        ))}
      </ul>

      {selectedReport && (
        <div className="report-details">
          <h3>Report Details</h3>
          <p><strong>Location Found:</strong> {selectedReport.LocationFound}</p>
          <p><strong>Description:</strong> {selectedReport.ItemDescription}</p>
          <p><strong>Additional Details:</strong> {selectedReport.AdditionalDetails}</p>
          <p><strong>User Email:</strong> {selectedReport.UserEmail}</p>
          <button className="close-button" onClick={() => setSelectedReport(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default FoundItemReportsPage;