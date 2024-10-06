import React, { useState } from "react";
import "./CloseAccountForm.css";
function CloseAccountForm() {
  const [confirmation, setConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");

  const handleConfirmation = (e) => {
    setConfirmation(e.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!confirmation || !password) {
      alert("Please confirm and provide your password to close your account.");
    } else {
      // API call to close the account
      console.log("Account closed with reason:", reason);
      alert("Your account has been closed.");
    }
  };

  return (
    <div className="close-account-form-container">
      <form className="close-account-form" onSubmit={handleSubmit}>
        <h2>Close Account</h2>

        <div className="form-group">
          <label htmlFor="password">Enter Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Closing Account (optional)</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell us why you're leaving"
            rows="4"
          />
        </div>

        <div className="form-group inline">
          <input
            type="checkbox"
            checked={confirmation}
            onChange={handleConfirmation}
          />
          <label>I confirm that I want to close my account.</label>
        </div>

        <button type="submit">Close Account</button>
      </form>
    </div>
  );
}

export default CloseAccountForm;
