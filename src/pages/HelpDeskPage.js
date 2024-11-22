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
              <td>Cary Quadrangle Help Desk</td>
              <td>1016 W. Stadium Avenue</td>
          </tr>
          <tr>
              <td>Earhart Hall Help Desk</td>
              <td>1275 First Street</td>
          </tr>
          <tr>
              <td>First Street Towers Help Desk</td>
              <td>1250 First Street</td>
          </tr>
          <tr>
              <td>Frieda Parker Hall Help Desk</td>
              <td>401 N. Russell Street</td>
          </tr>
          <tr>
              <td>Hawkins Hall Help Desk</td>
              <td>205 N. Russell Street</td>
          </tr>
          <tr>
              <td>Hillenbrand Hall Help Desk</td>
              <td>1301 Third Street</td>
          </tr>
          <tr>
              <td>Hilltop Apartments Help Desk</td>
              <td>1301 Hilltop Drive</td>
          </tr>
          <tr>
              <td>McCutcheon Hall Help Desk</td>
              <td>400 McCutcheon Drive</td>
          </tr>
          <tr>
              <td>Meredith Hall Help Desk</td>
              <td>201 N. Russell Street</td>
          </tr>
          <tr>
              <td>Meredith South Help Desk</td>
              <td>205 N. Russell Street</td>
          </tr>
          <tr>
              <td>Owen Hall Help Desk</td>
              <td>1201 Third Street</td>
          </tr>
          <tr>
              <td>Shreve Hall Help Desk</td>
              <td>1275 Third Street</td>
          </tr>
          <tr>
              <td>Tarkington Hall Help Desk</td>
              <td>201 N. Martin Jischke Drive</td>
          </tr>
          <tr>
              <td>Wiley Hall Help Desk</td>
              <td>500 N. Martin Jischke Drive</td>
          </tr>
          <tr>
              <td>Windsor Halls Help Desk</td>
              <td>230 N. Russell Street</td>
          </tr>

          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HelpDeskPage;