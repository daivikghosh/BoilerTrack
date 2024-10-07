import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginSignupPage from "./pages/LoginSignupPage";
import ImageUpload from "./pages/ImageUpload";
import Layout from "./components/Layout/Layout.js";
import ItemView from "./components/ItemView/ItemView.js";
import StaffInputForm from "./components/StaffInputForm/StaffInputForm.js";
import CloseAccountForm from "./components/CloseAccountForm/CloseAccountForm.js";
import AllItemsPage from "./pages/AllItemsPage.js";
import UserProfilePage from "./pages/UserProfilePage.js";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />
        <Route path="/UploadImage" element={<ImageUpload />} />
        <Route path="/ItemView" element={<ItemView />} />
        <Route path="/StaffInputForm" element={<StaffInputForm />} />
        <Route path="/UserProfile" element={<UserProfilePage />} />
        <Route path="/close-account" element={<CloseAccountForm />} />
        <Route path="/all-items" element={<AllItemsPage />} />
        <Route path="/item-view/:id" element={<ItemView />} />
      </Routes>
    </Router>
  );
};

export default App;