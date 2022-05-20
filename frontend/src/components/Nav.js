import React, { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LoginContext from "../context/login-context";
import handleGetRequest from "../hooks/handleGetRequest";
import { useTheme } from "@mui/material/styles";
import { List, ListItem, Button } from "@mui/material";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";

const Nav = () => {
  const loginContext = useContext(LoginContext);
  const theme = useTheme();

  return (
    <List
      sx={{
        position: "fixed",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "5%",
        height: "100%",
        p: 0,
      }}
    >
      <ListItem sx={{ display: "flex", justifyContent: "center" }}>
        <NavButton link="/" text={HomeRoundedIcon} />
      </ListItem>
      {loginContext.isLoggedIn.username && (
        <ListItem sx={{ display: "flex", justifyContent: "center" }}>
          <NavButton link="/profile" text={AccountCircleRoundedIcon} />
        </ListItem>
      )}
      {loginContext.isLoggedIn.account_type === "Admin" && (
        <>
          <ListItem sx={{ display: "flex", justifyContent: "center" }}>
            <NavButton
              link="/admin/user-management"
              text={ManageAccountsRoundedIcon}
            />
          </ListItem>
          <ListItem sx={{ display: "flex", justifyContent: "center" }}>
            <NavButton
              link="/admin/group-management"
              text={GroupsRoundedIcon}
            />
          </ListItem>
        </>
      )}
      {loginContext.isLoggedIn.username && (
        <ListItem sx={{ display: "flex", justifyContent: "center" }}>
          <NavLink
            to="/"
            style={{ textDecoration: "none", marginTop: 10 }}
            onClick={() => {
              handleGetRequest("user/logout");
              loginContext.setIsLoggedIn("");
            }}
          >
            <Button
              sx={{
                minWidth: "24px",
                borderRadius: "10px",
              }}
            >
              <LogoutRoundedIcon />
            </Button>
          </NavLink>
        </ListItem>
      )}
    </List>
  );
};

export default Nav;

const NavButton = (props) => {
  const location = useLocation();

  return (
    <NavLink to={props.link} style={{ textDecoration: "none", marginTop: 10 }}>
      <Button
        sx={{
          minWidth: "24px",
          borderRadius: "10px",
          backgroundColor: location.pathname.includes(props.link) && "white",
        }}
      >
        <props.text />
      </Button>
    </NavLink>
  );
};
