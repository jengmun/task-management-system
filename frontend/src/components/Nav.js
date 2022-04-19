import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../context/login-context";

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
              <NavLink to="/account-settings">Account Settings</NavLink>
            </li>
            <li>
              <NavLink
                to="/"
                onClick={async () => {
                  await fetch("http://localhost:5000/logout", {
                    credentials: "include",
                  });
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
        {loginContext.isLoggedIn.admin ? (
          <li>
            <NavLink to="/user">User Management</NavLink>
          </li>
        ) : (
          ""
        )}
      </ul>
    </div>
  );
};

export default Nav;
