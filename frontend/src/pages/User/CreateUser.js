import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import Dropdown from "../../components/Dropdown";
import {
  Typography,
  TextField,
  Button,
  Card,
  Box,
  useTheme,
} from "@mui/material";
import CustomSnackbar from "../../components/CustomSnackbar";

const CreateUser = () => {
  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    const data = await handleGetRequest("task/all-apps");
    if (data) {
      setAllApps(data);
    }
  };

  useEffect(() => {
    fetchAllApps();
  }, []);

  // ------------- Submit form -------------
  const [selectedGroups, setSelectedGroups] = useState([]);
  // ------------- Snackbar -------------
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState("");

  const handleOpenSnackbar = (severity) => {
    setOpenSnackbar(true);
    setSeverity(severity);
  };

  const handleCloseSnackbar = (_event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const options = [];
  for (const app of allApps) {
    for (const group of allGroups) {
      options.push({
        value: `${app.acronym}_${group.group_name}`,
        label: `${app.acronym} - ${group.group_name}`,
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await handlePostRequest("user/create-account", {
      username: e.target.username.value,
      password: e.target.password.value,
      email: e.target.email.value,
      groups: selectedGroups,
    });
    setMessage(data.message);

    if (data.message !== "User created") {
      handleOpenSnackbar("error");
    } else {
      e.target.username.value = "";
      e.target.password.value = "";
      e.target.email.value = "";
      handleOpenSnackbar("success");
    }
  };

  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      <NavLink
        to={`/admin/user-management`}
        style={{
          textDecoration: "none",
          position: "fixed",
          left: "6vw",
          top: "0.5vh",
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: theme.palette.background.default,
            ":hover": { backgroundColor: theme.palette.primary.light },
          }}
        >
          Back
        </Button>
      </NavLink>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "70%",
          p: 5,
          overflowY: "scroll",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h5">Create New User</Typography>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            required
            sx={{ mt: 2 }}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            variant="outlined"
            required
            sx={{ mt: 2 }}
          />
          <TextField
            id="email"
            label="Email"
            variant="outlined"
            required
            sx={{ mt: 2 }}
          />
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            Assign group
          </Typography>
          <Dropdown
            multi={true}
            options={options}
            closeMenuOnSelect={false}
            callback={setSelectedGroups}
          />
          <Button
            type="submit"
            variant="contained"
            color="error"
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </form>
        <CustomSnackbar
          openSnackbar={openSnackbar}
          handleCloseSnackbar={handleCloseSnackbar}
          message={message}
          severity={severity}
        />
      </Card>
    </Box>
  );
};

export default CreateUser;
