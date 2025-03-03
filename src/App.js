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
import ViewClaimRequests from "./components/ViewClaimRequests/ViewClaimRequests.js";
import NotificationTab from "./components/NotificationTab/NotificationTab.js";
import LostItemForm from "./components/LostItemForm/LostItemForm.js";
import ViewPreRegItems from "./components/ViewPreRegItems/ViewPreRegItems.js";
import QRCodeInstructions from "./components/QRCodeInstructions/QRCodeInstructions.js"; // Import the new component
import AllLostItemRequests from "./components/AllLostItemRequests/AllLostItemRequests.js";
import EditLostItemRequest from "./components/EditLostItemRequest/EditLostItemRequest.js";
import PasswordChangeForm from "./components/PasswordChangeForm/PasswordChangeForm.js";
import ListViewClaimRequests from "./components/ViewAllClaimsStaff/ViewAllClaimsStaff.js";
import IndividualClaimView from "./components/ViewAllClaimsStaff/ClaimViewStaff.js";
import DisputeClaimForm from "./components/DisputeClaimForm/DisputeClaimForm.js";
import ReleaseForm from "./components/ReleaseForm/ReleaseForm.js";
import ProcessedClaimsPage from "./components/ProcessedClaims/ProcessedClaims.js";
import EditProcessedClaim from "./components/EditProcessedClaim/EditProcessedClaim.js"; // Import the edit component if created
import ListViewClaimRequestsStudent from "./components/ViewAllClaimsStudent/ViewAllClaimsStudent.js";
import ModifyClaimForm from "./components/ClaimForm/ModifyClaimForm.js";
import TokenResetForm from "./components/TokenResetForm/TokenResetForm.js";
import PrintItem from "./components/ItemView/PrintItem.js";
import BulkUpload from "./components/StaffInputForm/BulkUpload.js";
import LayoutBar from "./components/LayoutBar/LayoutBar.js";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage";
import StaffAnalyticsPage from "./pages/StaffAnalyticsPage";
import LostItemRequestsStaffView from "./components/LostItemRequestsStaffView/LostItemRequestsStaffView.js";
import StaffLoginSignUpPage from "./pages/StaffLoginSignUpPage.js";
import MapView from "./components/MapView/MapView.js";
import FeedbackForm from "./components/FeedbackForm/FeedbackForm.js";
import AllFeedback from "./components/FeedbackForm/AllFeedback.js";
import UserFeedback from "./components/FeedbackForm/UserFeedback.js";
import PreRegItemForm from "./components/PreRegItemForm/PreRegItemForm.js";
import ListViewItemHistory from "./components/ViewAllHistoryStaff/ViewAllHistoryStaff.js";
import TimelineView from "./components/ViewAllHistoryStaff/HistoryViewStaff.js";
import StaffQRCodeUploadForm from "./components/StaffQRCodeUploadForm/StaffQRCodeUploadForm.js";

import UnclaimedItemTemplate from "./components/UnclaimedItemTemplate/UnclaimedItemTemplate.js";
import StaffItemTemplate from "./components/StaffItemTemplate/StaffItemTemplate.js";
import HelpDeskPage from "./pages/HelpDeskPage";
import StudentMessages from "./components/Messages/StudentMessages.js";
import StaffMessages from "./components/Messages/StaffMessages.js";

import FoundItemReportForm from "./components/FoundItemReportForm/FoundItemReportForm";
import FoundItemReportsPage from './pages/FoundItemReportsPage';

const App = () => {
  return (
    <Router>
      <LayoutBar />
      <Routes>
        <Route path="/" element={<LoginSignupPage />} />{" "}
        <Route path="/UploadImage" element={<ImageUpload />} />{" "}
        <Route path="/item/:id" element={<ItemView />} />{" "}
        {/* Item detail page */}
        <Route path="/StaffInputForm" element={<StaffInputForm />} />{" "}
        <Route path="/UserProfile" element={<UserProfilePage />} />{" "}
        <Route path="/" element={<LoginSignupPage />} />
        <Route path="/UploadImage" element={<ImageUpload />} />
        <Route path="/item/:id" element={<ItemView />} />{" "}
        {/* Item detail page */}
        <Route path="/StaffInputForm" element={<StaffInputForm />} />
        <Route path="/UserProfile" element={<UserProfilePage />} />
        <Route path="/close-account" element={<CloseAccountForm />} /> //test
        <Route path="/all-items" element={<AllItemsPage />} />
        <Route path="/item-view/:id" element={<ItemView />} />
        {/* Route for ItemView */}
        <Route path="/item-view/:id" element={<ItemView />} />{" "}
        {/* Route for ItemView */}
        {/* Temporary route for testing with fake data */}
        <Route path="/test-item-view/1" element={<ItemView />} />
        <Route path="/test-item-view/2" element={<ItemView />} />
        <Route path="/item-view-student/:id" element={<ItemViewStudent />} />
        {/* New route for ClaimForm */}
        <Route path="/claim/:id" element={<ClaimForm />} />
        <Route path="/modify-item/:id" element={<ModifyItemForm />} />
        <Route path="all-items-staff" element={<AllItemsPage_Staff />} />
        <Route path="/upload-qr-code" element={<StaffQRCodeUploadForm />} />
        <Route path="ClaimRequests" element={<ViewClaimRequests />} />{" "}
        {/* Add this route */}
        <Route path="/dispute/:id" element={<DisputeClaimForm />} />
        <Route path="/notifications" element={<NotificationTab />} />
        <Route path="/report-lost-item" element={<LostItemForm />} />
        <Route path="/Preregistered-items" element={<ViewPreRegItems />} />
        <Route path="/allitemhistory-staff" element={<ListViewItemHistory />} />
        <Route
          path="/individual-itemhistory-staff/:itemId"
          element={<TimelineView />}
        />
        <Route
          path="/all-lost-item-requests"
          element={<AllLostItemRequests />}
        />
        <Route
          path="/lost-items-staff"
          element={<LostItemRequestsStaffView />}
        />{" "}
        <Route
          path="/edit-lost-item/:itemId"
          element={<EditLostItemRequest />}
        />
        <Route path="/resetpassword" element={<PasswordChangeForm />} />
        <Route path="/all-request-staff" element={<ListViewClaimRequests />} />
        <Route
          path="/individual-request-staff/:claimId"
          element={<IndividualClaimView />}
        />
        <Route path="/release-form/:claimId" element={<ReleaseForm />} />
        <Route path="/processed-claims" element={<ProcessedClaimsPage />} />
        <Route
          path="/edit-processed-claim/:claimId"
          element={<EditProcessedClaim />}
        />
        <Route
          path="/allclaim-requests-student/:emailId"
          element={<ListViewClaimRequestsStudent />}
        />
        <Route
          path="/claim-modify-student/:claim_id"
          element={<ModifyClaimForm />}
        />
        <Route path="/token-reset" element={<TokenResetForm />} />
        <Route path="/print-item/:id" element={<PrintItem />} />{" "}
        <Route path="/bulk" element={<BulkUpload />} />{" "}
        {/* Analytics page route */}
        <Route path="/student-analytics" element={<StudentAnalyticsPage />} />
        <Route path="/staff-analytics" element={<StaffAnalyticsPage />} />
        {/* Staff Authentication */}
        <Route path="/staff-auth" element={<StaffLoginSignUpPage />} />
        <Route path="/map-view" element={<MapView />} />
        <Route path="/FeedbackForm" element={<FeedbackForm />} />
        <Route path="/UserFeedback" element={<UserFeedback />} />
        <Route path="/AllFeedback" element={<AllFeedback />} />
        {/* QR Code Instructions */}
        <Route path="/qr-code-instructions" element={<QRCodeInstructions />} />
        {/* Pre-registered item form */}
        <Route path="/add-registered-item" element={<PreRegItemForm />} />
        <Route
          path="/unclaimed-item-template"
          element={<UnclaimedItemTemplate />}
        />
        <Route path="/template/:itemId" element={<StaffItemTemplate />} />
        <Route path="/help-desk" element={<HelpDeskPage />} />
        <Route path="/student-messages/:id" element={<StudentMessages />} />
        <Route path="/staff-messages/:id" element={<StaffMessages />} />

        <Route path="/report-found-item" element={<FoundItemReportForm />} />
        <Route path="/found-item-reports" element={<FoundItemReportsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
