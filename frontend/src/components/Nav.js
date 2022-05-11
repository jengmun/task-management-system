import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import LoginContext from "../context/login-context";
import handleGetRequest from "../hooks/handleGetRequest";
import { useTheme } from "@mui/material/styles";
import { List, ListItem, Button } from "@mui/material";

const Nav = () => {
  const loginContext = useContext(LoginContext);
  const theme = useTheme();

  return (
    <List
      sx={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        width: "15%",
        height: "100%",
        p: 0,
        backgroundColor: theme.palette.primary.light,
      }}
    >
      <ListItem>
        <NavButton link="/" text="Dashboard" />
      </ListItem>
      {loginContext.isLoggedIn.username && (
        <ListItem>
          <NavButton link="/profile" text="Profile" />
        </ListItem>
      )}
      {loginContext.isLoggedIn.account_type === "Admin" && (
        <>
          <ListItem>
            <NavButton link="/admin/user-management" text="User Management" />
          </ListItem>
          <ListItem>
            <NavButton link="/admin/group-management" text="Group Management" />
          </ListItem>
        </>
      )}
      {loginContext.isLoggedIn.username && (
        <ListItem>
          <NavLink
            to="/"
            style={{ textDecoration: "none" }}
            onClick={() => {
              handleGetRequest("user/logout");
              loginContext.setIsLoggedIn("");
            }}
          >
            <Button>Logout</Button>
          </NavLink>
        </ListItem>
      )}
    </List>
  );
};

export default Nav;

const NavButton = (props) => {
  return (
    <NavLink to={props.link} style={{ textDecoration: "none" }}>
      <Button>{props.text}</Button>
    </NavLink>
  );
};
