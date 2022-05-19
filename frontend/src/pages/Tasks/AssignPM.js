import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Button,
  Card,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CustomSnackbar from "../../components/CustomSnackbar";

const AssignPM = () => {
  // ------------- Fetch all users -------------
  const [allUsers, setAllUsers] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const [selectedUser, setSelectedUser] = useState("");

  // ------------- Snackbar -------------
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState("");

  const handleOpenSnackbar = (severity) => {
    setOpenSnackbar(true);
    setSeverity(severity);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const handleAssignPM = async (e) => {
    e.preventDefault();

    if (!e.target.acronym.value || !selectedUser) {
      setMessage("Please fill in all fields");
      handleOpenSnackbar("error");
      return;
    }

    const data = await handlePostRequest("user/assign-PM", {
      acronym: e.target.acronym.value,
      username: selectedUser,
    });
    setMessage(data);

    if (data !== "PM Assigned") {
      handleOpenSnackbar("error");
    } else {
      handleOpenSnackbar("success");
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "fit-content",
        backgroundColor: "white",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2 }}>
        Assign PM to new Application
      </Typography>
      <form
        onSubmit={handleAssignPM}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <TextField
          required
          InputProps={{ inputProps: { minLength: 3, maxLength: 3 } }}
          id="acronym"
          label="Application Acronym"
          sx={{ mt: 1, mb: 1 }}
        />

        <InputLabel id="user">User</InputLabel>
        <Select
          id="user"
          sx={{ width: "200px" }}
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          {allUsers.map((user) => {
            return <MenuItem value={user.username}>{user.username}</MenuItem>;
          })}
        </Select>
        <Button type="submit">Submit</Button>
        <Typography variant="body2">{message}</Typography>
      </form>
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Card>
  );
};

export default AssignPM;
