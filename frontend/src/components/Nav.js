import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../context/login-context";
import handleGetRequest from "../hooks/handleGetRequest";

const Nav = () => {
  const loginContext = useContext(LoginContext);

  return (
    <div className="prose">
      <ul className="list-none p-0">
        <li>
          <NavButton link="/" text="Home" />
        </li>
        {loginContext.isLoggedIn.username && (
          <li>
            <NavButton link="/profile" text="Profile" />
          </li>
        )}
        {loginContext.isLoggedIn.account_type === "Admin" && (
          <>
            <li>
              <NavButton link="/admin/user-management" text="User Management" />
            </li>
            <li>
              <NavButton
                link="/admin/group-management"
                text="Group Management"
              />
            </li>
          </>
        )}
        {loginContext.isLoggedIn.username && (
          <li>
            <NavLink
              to="/"
              style={{ textDecoration: "none" }}
              onClick={() => {
                handleGetRequest("user/logout");
                loginContext.setIsLoggedIn("");
              }}
            >
              <button className="btn">Logout</button>
            </NavLink>
          </li>
        )}
      </ul>
    </div>
  );
};

export default Nav;

const NavButton = (props) => {
  return (
    <NavLink to={props.link} style={{ textDecoration: "none" }}>
      <button className="btn">{props.text}</button>
    </NavLink>
  );
};
