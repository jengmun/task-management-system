import { Box, Button, TextField, Typography, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import CustomSnackbar from "../../components/CustomSnackbar";
import LoginContext from "../../context/login-context";
import handlePostRequest from "../../hooks/handlePostRequest";

const Profile = () => {
  const loginContext = useContext(LoginContext);

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

  // ------------ Update email ------------
  const handleEmailChange = async (e) => {
    e.preventDefault();

    const updateEmail = e.target.updateEmail.value;

    if (updateEmail === loginContext.isLoggedIn.email) {
      setMessage("No change in email");
      handleOpenSnackbar("info");
      return;
    }

    if (!updateEmail) {
      setMessage("Please enter an email address");
      handleOpenSnackbar("error");
      return;
    }

    const data = await handlePostRequest("user/update-email", {
      username: loginContext.isLoggedIn.username,
      email: updateEmail,
    });

    setMessage(data.message);
    if (data.message === "Email updated successfully") {
      loginContext.isLoggedIn.email = updateEmail;
      handleOpenSnackbar("success");
    } else {
      handleOpenSnackbar("error");
    }
  };

  // ------------ Update password ------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const changePassword = e.target.updatePassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Step 1 - check that both passwords match
    if (changePassword !== confirmPassword) {
      setMessage("Passwords do not match");
      handleOpenSnackbar("error");
      return;
    }

    // Step 2 - check that new password matches format
    if (
      !confirmPassword.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      setMessage("Invalid password format");
      handleOpenSnackbar("error");
      return;
    }

    // Step 3 - submit password update request
    const data = await handlePostRequest("user/user-update-password", {
      username: loginContext.isLoggedIn.username,
      password: confirmPassword,
    });

    setMessage(data.message);
    if (data.message === "Password updated") {
      handleOpenSnackbar("success");
    } else {
      handleOpenSnackbar("error");
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "15px",
          backgroundColor: theme.palette.background.paper,
          p: 3,
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.33)",
        }}
      >
        <Typography variant="h4">Account management</Typography>

        <Typography variant="body1">
          Username: {loginContext.isLoggedIn.username}
        </Typography>
        <Box sx={{ display: "flex" }}>
          <form
            onSubmit={handleEmailChange}
            style={{ display: "flex", flexDirection: "column", padding: 10 }}
          >
            <Typography
              variant="body1"
              sx={{ mt: 1, mb: 1, textAlign: "center" }}
            >
              Update email information
            </Typography>
            <TextField
              required
              id="updateEmail"
              label="Email"
              defaultValue={loginContext.isLoggedIn.email}
              sx={{ mt: 1, mb: 1 }}
            />
            <Button type="submit" variant="contained" color="error">
              Update
            </Button>
          </form>

          <form
            onSubmit={handlePasswordChange}
            style={{ display: "flex", flexDirection: "column", padding: 10 }}
          >
            <Typography
              variant="body1"
              sx={{ mt: 1, mb: 1, textAlign: "center" }}
            >
              Change password
            </Typography>
            <TextField
              required
              id="updatePassword"
              label="Password"
              type="password"
              sx={{ mt: 1, mb: 1 }}
            />
            <TextField
              required
              id="confirmPassword"
              label="Re-enter Password"
              type="password"
              sx={{ mt: 1, mb: 1 }}
            />
            <Button type="submit" variant="contained" color="info">
              Update password
            </Button>
          </form>
        </Box>
      </Box>
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Box>
  );
};

export default Profile;
