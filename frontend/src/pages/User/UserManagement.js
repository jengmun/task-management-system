import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from "../../components/Dropdown";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Box,
  Button,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import LockResetRoundedIcon from "@mui/icons-material/LockResetRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";

const UserManagement = () => {
  // ------------- Fetch all users -------------
  const [allUsers, setAllUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
      setFilterUsers(data);
    }
  };

  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    const data = await handleGetRequest("task/all-apps");
    if (data) {
      setAllApps(data);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllGroups();
    fetchAllApps();
  }, []);

  const options = [];
  for (const app of allApps) {
    for (const group of allGroups) {
      options.push({
        value: `${app.acronym}_${group.group_name}`,
        label: `${app.acronym} - ${group.group_name}`,
      });
    }
  }

  const handleFilterUsers = (e) => {
    const filteredArr = allUsers.filter((user) => {
      return (
        user.username.includes(e.target.value) ||
        user.email.includes(e.target.value) ||
        user.status.includes(e.target.value)
      );
    });

    setFilterUsers(filteredArr);
  };

  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "95%",
      }}
    >
      <Box
        sx={{
          p: 2,
          pb: 0,
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          mt: 2,
        }}
      >
        <NavLink to="/admin/create-user" style={{ textDecoration: "none" }}>
          <Button color="error" variant="contained">
            <PersonAddRoundedIcon />
            <Typography sx={{ ml: 1 }} variant="body1">
              Add new user
            </Typography>
          </Button>
        </NavLink>
        <Typography variant="h3">User Management</Typography>
        <TextField
          label="Filter"
          variant="outlined"
          onChange={handleFilterUsers}
        />
      </Box>
      <Table
        sx={{
          backgroundColor: theme.palette.background.default,
          borderRadius: "25px",
          m: 4,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ textAlign: "center" }}>Username</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Groups</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Status</TableCell>
            <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filterUsers.map((user) => {
            if (!user.formatted_groups) {
              user.formatted_groups = [];
              for (let i = 0; i < user.user_group.length; i++) {
                user.formatted_groups.push({
                  value: `${user.apps[i]}_${user.groups[i]}`,
                  label: `${user.apps[i]} - ${user.groups[i]}`,
                });
              }
            }
            return (
              <User
                data={user}
                options={options}
                setAllUsers={(user) => {
                  const allUsersArr = [...allUsers];
                  const oldUser = allUsers.find(({ username }) => {
                    return username === user.username;
                  });
                  const index = allUsers.indexOf(oldUser);
                  allUsersArr[index] = user;
                  setAllUsers(allUsersArr);
                }}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;

const User = (props) => {
  // Dataset as per database
  const [userData, setUserData] = useState(props.data);
  // Dataset as per React - to be displayed
  const [reactData, setReactData] = useState(props.data);
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    setUserData(props.data);
    setReactData(props.data);
  }, [props.data]);

  const handleEditUser = () => {
    setReadOnly(!readOnly);
  };

  const handleCancelChanges = () => {
    setReadOnly(!readOnly);
    setReactData(userData);
  };

  const handleUpdateUser = () => {
    if (!reactData.email) {
      return;
    }

    if (
      reactData.email !== userData.email ||
      reactData.status !== userData.status
    ) {
      handlePostRequest("user/update-details", {
        username: reactData.username,
        email: reactData.email,
        status: reactData.status,
      });
    }

    if (reactData.formatted_groups !== userData.formatted_groups) {
      handlePostRequest("user/update-groups", {
        username: reactData.username,
        currentGroups: reactData.formatted_groups,
        oldGroups: userData.user_group,
      });
    }

    setReadOnly(!readOnly);
    setUserData(reactData);
    props.setAllUsers(reactData);
  };

  const [passwordReset, setPasswordReset] = useState(false);

  const handleResetPassword = () => {
    handlePostRequest("user/admin-password-reset", {
      username: reactData.username,
      email: reactData.email,
    });
    setPasswordReset(true);
  };

  return (
    <TableRow>
      <TableCell sx={{ textAlign: "center" }}>{userData.username}</TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {readOnly ? (
          <>{reactData.email}</>
        ) : (
          <TextField
            variant="outlined"
            required
            value={reactData.email}
            InputProps={{ inputProps: { readOnly: readOnly } }}
            onChange={(e) => {
              setReactData({ ...reactData, email: e.target.value });
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {readOnly ? (
          <>
            {reactData.formatted_groups.length ? (
              <Tooltip
                title={reactData.formatted_groups.map((group) => {
                  return <div>{group.label}</div>;
                })}
              >
                <div>Hover to view more</div>
              </Tooltip>
            ) : (
              <div>No groups assigned!</div>
            )}
          </>
        ) : (
          <Dropdown
            multi={true}
            preselected={reactData.formatted_groups}
            options={props.options}
            closeMenuOnSelect={false}
            callback={(e) => {
              setReactData({ ...reactData, formatted_groups: e });
            }}
          />
        )}
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {readOnly ? (
          <>
            <CircleRoundedIcon
              color={reactData.status === "Active" ? "success" : "error"}
            />
          </>
        ) : (
          <Switch
            onChange={() => {
              if (reactData.status === "Active") {
                setReactData({ ...reactData, status: "Inactive" });
              } else {
                setReactData({ ...reactData, status: "Active" });
              }
            }}
            defaultChecked={reactData.status === "Active" ? true : false}
            color="success"
          />
        )}
      </TableCell>
      <TableCell sx={{ textAlign: "center" }}>
        {readOnly ? (
          <Button onClick={handleEditUser}>
            <EditIcon />
          </Button>
        ) : (
          <>
            <Tooltip title="Save changes">
              <Button onClick={handleUpdateUser}>
                <SaveRoundedIcon sx={{ mr: 1 }} color="warning" />
              </Button>
            </Tooltip>
            <Tooltip title="Cancel changes">
              <Button onClick={handleCancelChanges}>
                <CancelRoundedIcon sx={{ mr: 1 }} color="error" />
              </Button>
            </Tooltip>
            {passwordReset ? (
              "Password resetted"
            ) : (
              <Tooltip title="Reset password">
                <Button onClick={handleResetPassword} color="info">
                  <LockResetRoundedIcon />
                </Button>
              </Tooltip>
            )}
          </>
        )}
      </TableCell>
    </TableRow>
  );
};
