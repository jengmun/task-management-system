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
          <li>
            <NavLink to="/profile">Profile</NavLink>
          </li>
        ) : (
          <li>
            <NavLink to="/login">Login</NavLink>
          </li>
        )}
        {loginContext.isLoggedIn.account_type === "Admin" && (
          <>
            <li>
              <NavLink to="/admin/user-management">User Management</NavLink>
            </li>
            <li>
              <NavLink to="/admin/group-management">Group Management</NavLink>
            </li>
          </>
        )}
        {loginContext.isLoggedIn && (
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
        )}
      </ul>
    </div>
  );
};

export default Nav;
