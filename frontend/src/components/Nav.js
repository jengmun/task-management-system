import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../context/login-context";
import handleGetRequest from "../hooks/handleGetRequest";

const Nav = () => {
  const loginContext = useContext(LoginContext);

  return (
    <div>
      <ul>
        <li>
          <NavLink to="/">Home</NavLink>
        </li>
        {loginContext.isLoggedIn ? (
          <>
            <li>
              <NavLink to="/profile">Profile</NavLink>
            </li>
            <li>
              <NavLink
                to="/"
                onClick={() => {
                  handleGetRequest("user/logout");
                  loginContext.setIsLoggedIn("");
                }}
              >
                Logout
              </NavLink>
            </li>
          </>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
        {console.log(loginContext.isLoggedIn)}
        {loginContext.isLoggedIn.account_type === "Admin" ? (
          <li>
            <NavLink to="/admin/user-management">User Management</NavLink>
          </li>
        ) : (
          ""
        )}
      </ul>
    </div>
  );
};

export default Nav;
