import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupPage from "./pages/LoginSignupPage";
import Layout from "./components/Layout/Layout.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />{" "}
        {/* Root URL shows the login/signup page */}
      </Routes>
    </Router>
  );
};

export default App;
