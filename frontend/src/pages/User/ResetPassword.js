import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useParams } from "react-router-dom";
import CustomSnackbar from "../../components/CustomSnackbar";
import handlePostRequest from "../../hooks/handlePostRequest";

const ResetPassword = () => {
  const params = useParams();

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

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Step 1 - check that both passwords match
    if (e.target.updatePassword.value !== e.target.confirmPassword.value) {
      setMessage("Passwords do not match");
      handleOpenSnackbar("error");
      return;
    }

    // Step 2 - check that new password matches format
    if (
      !e.target.confirmPassword.value.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      setMessage("Invalid password format");
      handleOpenSnackbar("error");
      return;
    }

    // Step 3 - submit password update request
    const result = await handlePostRequest(
      `user/user-password-reset/${params.username}`,
      {
        password: e.target.confirmPassword.value,
        oldPassword: e.target.oldPassword.value,
      }
    );
    setMessage(result);

    if (result !== "Password resetted!") {
      handleOpenSnackbar("error");
    } else {
      handleOpenSnackbar("success");
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
      <form
        onSubmit={handlePasswordChange}
        style={{ display: "flex", flexDirection: "column", padding: 2 }}
      >
        <Typography variant="h5" sx={{ textAlign: "center" }}>
          Change password
        </Typography>

        <TextField
          required
          id="oldPassword"
          label="Current Password"
          type="password"
          sx={{ mt: 1, mb: 1 }}
        />
        <TextField
          required
          id="updatePassword"
          label="New Password"
          type="password"
          sx={{ mt: 1, mb: 1 }}
        />
        <TextField
          required
          id="confirmPassword"
          label="Re-enter New Password"
          type="password"
          sx={{ mt: 1, mb: 2 }}
        />

        <Button type="submit" variant="contained">
          Update password
        </Button>
      </form>
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Box>
  );
};

export default ResetPassword;
