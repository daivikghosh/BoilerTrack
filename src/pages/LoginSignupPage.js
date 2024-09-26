import React, { useState } from "react";
import LoginForm from "../components/LoginForm/LoginForm.js";
import CreateAccountForm from "../components/CreateAccountForm/CreateAccountForm.js";

const LoginSignupPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const handleToggle = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm onSignupClick={handleToggle} />
      ) : (
        <CreateAccountForm onLoginClick={handleToggle} />
      )}
    </div>
  );
};

export default LoginSignupPage;
