import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupPage from "./pages/LoginSignupPage";
import ImageUpload from "./pages/ImageUpload";
import Layout from "./components/Layout/Layout.js";
import ItemView from "./components/ItemView/ItemView.js";
import StaffInputForm from "./components/StaffInputForm/StaffInputForm.js";
import CloseAccountForm from "./components/CloseAccountForm/CloseAccountForm.js";
import AllItemsPage from "./pages/AllItemsPage.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />{" "}
        <Route path="/UploadImage" element={<ImageUpload />} />{" "}
        <Route path="/ItemView" element={<ItemView />} /> //test
        <Route path="/StaffInputForm" element={<StaffInputForm />} /> //test
        <Route path="/close-account" element={<CloseAccountForm />} /> //test
        <Route path="/all-items" element={<AllItemsPage />} />
        <Route path="/item-view/:id" element={<ItemView />} />
        {/* Route for ItemView */}
      </Routes>
    </Router>
  );
};

export default App;
