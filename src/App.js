import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupPage from "./pages/LoginSignupPage";
import ImageUpload from "./pages/ImageUpload";
import Layout from "./components/Layout/Layout.js";
import ItemView from "./components/ItemView/ItemView.js";
import StaffInputForm from "./components/StaffInputForm/StaffInputForm.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />{" "}
        <Route path="/UploadImage" element={<ImageUpload />} />{" "}
        <Route path="/item/:id" element={<ItemView />} /> {/* Item detail page */}
        <Route path="/StaffInputForm" element={<StaffInputForm />} /> //test
      </Routes>
    </Router>
  );
};

export default App;
