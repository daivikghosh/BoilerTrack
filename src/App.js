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
import ClaimForm from "./components/ClaimForm/ClaimForm.js";
import ItemViewStudent from "./components/ItemView/ItemViewStudent.js";
import ModifyItemForm from "./components/StaffInputForm/ModifyItemform.js";
import AllItemsPage_Staff from "./pages/AllItemsPage_Staff.js";
import ViewClaimRequests from './components/ViewClaimRequests/ViewClaimRequests.js'; 
import NotificationTab from "./components/NotificationTab/NotificationTab.js";
import LostItemForm from "./components/LostItemForm/LostItemForm.js";
import ViewPreRegItems from "./components/ViewPreRegItems/ViewPreRegItems.js"; 
import AllLostItemRequests from "./components/AllLostItemRequests/AllLostItemRequests.js";
import EditLostItemRequest from "./components/EditLostItemRequest/EditLostItemRequest.js";
import ListViewClaimRequests from "./components/ViewAllClaimsStaff/ViewAllClaimsStaff.js";
import IndividualClaimView from "./components/ViewAllClaimsStaff/ClaimViewStaff.js";
import DisputeClaimForm from "./components/DisputeClaimForm/DisputeClaimForm.js";


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />{" "}
        <Route path="/UploadImage" element={<ImageUpload />} />{" "}
        <Route path="/item/:id" element={<ItemView />} />{" "}
        {/* Item detail page */}
        <Route path="/StaffInputForm" element={<StaffInputForm />} />{" "}
        <Route path="/UserProfile" element={<UserProfilePage />} />{" "}
        <Route path="/close-account" element={<CloseAccountForm />} /> //test
        <Route path="/all-items" element={<AllItemsPage />} />
        <Route path="/item-view/:id" element={<ItemView />} />
        {/* Route for ItemView */}
        {/* Temporary route for testing with fake data */}
        <Route path="/test-item-view/1" element={<ItemView />} />
        <Route path="/test-item-view/2" element={<ItemView />} />
        <Route path="/item-view-student/:id" element={<ItemViewStudent />} />
        {/* New route for ClaimForm */}
        <Route path="/claim/:id" element={<ClaimForm />} />
        <Route path="/modify-item/:id" element={<ModifyItemForm />} />
        <Route path="all-items-staff" element={<AllItemsPage_Staff />} />
        <Route path="ClaimRequests" element={<ViewClaimRequests />} /> {/* Add this route */}
        <Route path="/dispute/:id" element={<DisputeClaimForm />} />

        <Route path="/notifications" element={<NotificationTab />} />
        <Route path="/report-lost-item" element={<LostItemForm />} />
        <Route path="/Preregistered-items" element={<ViewPreRegItems />} />

        <Route path="/all-lost-item-requests" element={<AllLostItemRequests />} />
        <Route path="/edit-lost-item/:itemId" element={<EditLostItemRequest />} />

        <Route path="/all-request-staff" element={<ListViewClaimRequests />} />
        <Route path="/individual-request-staff/:claimId" element={<IndividualClaimView />} />

      </Routes>
    </Router>
  );
};

export default App;
