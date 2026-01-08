import React from "react";
import LoginPage from "../../pages/Auth/LoginPage";
import { Outlet } from "react-router-dom";

const MainLogin = () => {
  return (
    <>
      <div className="main-login">
        <LoginPage />
      </div>
    </>
  );
};

export default MainLogin;
