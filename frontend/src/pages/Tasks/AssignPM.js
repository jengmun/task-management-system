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

  const [message, setMessage] = useState("");

  const handleAssignPM = async (e) => {
    e.preventDefault();

    if (!e.target.acronym.value || !selectedUser) {
      setMessage("Please fill in all fields");
      return;
    }

    const data = await handlePostRequest("user/assign-PM", {
      acronym: e.target.acronym.value,
      username: selectedUser,
    });
    setMessage(data);
  };

  return (
    <Card
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        height: "fit-content",
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
    </Card>
  );
};

export default AssignPM;
