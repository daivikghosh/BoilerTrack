import React, { useState } from "react";
import LoginForm from "../components/LoginForm/LoginForm.js";
import CreateAccountForm from "../components/CreateAccountForm/CreateAccountForm.js";
import ForgotPassword from "../components/ForgotPasswordForm/ForgotPasswordForm.js";

const LoginSignupPage = () => {
  // const [isLogin, setIsLogin] = useState(true);
  // const handleToggle = () => {
  //   setIsLogin(!isLogin);
  // };
  // return (
  //   <div>
  //     {isLogin ? (
  //       <LoginForm onSignupClick={handleToggle} />
  //     ) : (
  //       <CreateAccountForm onLoginClick={handleToggle} />
  //     )}
  //   </div>
  // );
  const [currentForm, setCurrentForm] = useState("login");

  const showSignupForm = () => setCurrentForm("signup");
  const showLoginForm = () => setCurrentForm("login");
  const showForgotPasswordForm = () => setCurrentForm("forgotPassword");

  return (
    <div>
      {currentForm === "login" && (
        <LoginForm
          onSignupClick={showSignupForm}
          onForgotPasswordClick={showForgotPasswordForm}
        />
      )}
      {currentForm === "signup" && (
        <CreateAccountForm onLoginClick={showLoginForm} />
      )}
      {currentForm === "forgotPassword" && (
        <ForgotPassword onBackToLogin={showLoginForm} />
      )}
    </div>
  );
};

export default LoginSignupPage;
