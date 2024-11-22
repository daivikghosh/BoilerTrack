import React from 'react';
import './HelpDeskPage.css';
import helpImage from './help-image.png'; // Ensure you have an image at this path

function HelpDeskPage() {
  return (
    <div className="help-desk-page">
      <div className="top-half">
        <img src={helpImage} alt="Help Desk" className="help-image" />
      </div>
      <div className="bottom-half">
        <table className="help-desk-table">
          <thead>
            <tr>
              <th>Help Desk Name</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Hillenbrand Hall</td>
              <td>1301 3rd Street</td>
            </tr>
            <tr>
              <td>Harrison Residence Hall</td>
              <td>107 MacArthurDrive</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HelpDeskPage;