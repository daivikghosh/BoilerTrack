import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="homepage">
      <h1>Welcome to BoilerTrack</h1>
      {/* Other content */}

      {/* Link to All Items page */}
      <Link to="/all-items">View All Lost Items</Link>
    </div>
  );
}

export default HomePage;
