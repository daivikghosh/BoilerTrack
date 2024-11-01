import React, { useState } from "react";
import StaffLoginForm from "../components/StaffLoginForm/StaffLoginForm.js";
import StaffCreateAccountForm from "../components/StaffCreateAccountForm/StaffCreateAccountForm.js";

const StaffLoginSignUpPage = () => {
  const [currentForm, setCurrentForm] = useState("login");

  const showSignupForm = () => setCurrentForm("signup");
  const showLoginForm = () => setCurrentForm("login");

  return (
    <div>
      {currentForm === "login" && (
        <StaffLoginForm onSignupClick={showSignupForm} />
      )}
      {currentForm === "signup" && (
        <StaffCreateAccountForm onLoginClick={showLoginForm} />
      )}
    </div>
  );
};

export default StaffLoginSignUpPage;