import { useState } from "react";
import handlePostRequest from "../../hooks/handlePostRequest";
import { Button, Card, TextField, Typography } from "@mui/material";
import CustomSnackbar from "../../components/CustomSnackbar";

const CreateNewGroup = (props) => {
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

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (e.target.groupName.value) {
      const result = await handlePostRequest(`user/create-groups`, {
        group: e.target.groupName.value,
      });

      setMessage(result.message);
      if (result.message === "Group created!") {
        handleOpenSnackbar("success");
        props.fetchAllGroups();
      } else {
        handleOpenSnackbar("error");
      }
    } else {
      setMessage("Please enter a group name");
      handleOpenSnackbar("error");
    }
  };
  return (
    <Card sx={{ width: "30%", p: 2, backgroundColor: "white" }}>
      <form
        onSubmit={handleCreateGroup}
        style={{
          marginBottom: 10,
          marginTop: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TextField
          id="groupName"
          label="Create New Group"
          variant="outlined"
          required
        />
        <Button type="submit" variant="contained" color="info" sx={{ mt: 2 }}>
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
  );
};

export default CreateNewGroup;
