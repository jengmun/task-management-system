import { Box, Button, TextField, Typography } from "@mui/material";
import { useContext, useState } from "react";
import LoginContext from "../../context/login-context";
import handlePostRequest from "../../hooks/handlePostRequest";

const Profile = () => {
  const loginContext = useContext(LoginContext);
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // ------------ Update email ------------
  const handleEmailChange = async (e) => {
    e.preventDefault();

    const updateEmail = e.target.updateEmail.value;

    if (updateEmail === loginContext.isLoggedIn.email) {
      setEmailMessage("No change in email");
      return;
    }

    if (!updateEmail) {
      setEmailMessage("Please enter an email address");
      return;
    }

    const data = await handlePostRequest("user/update-email", {
      username: loginContext.isLoggedIn.username,
      email: updateEmail,
    });

    if (data === "Email updated successfully") {
      setEmailMessage(data);
      loginContext.isLoggedIn.email = updateEmail;
    } else {
      setEmailMessage(data);
    }
  };

  // ------------ Update password ------------
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    const changePassword = e.target.updatePassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    // Step 1 - check that both passwords match
    if (changePassword !== confirmPassword) {
      setPasswordMessage("Passwords do not match");
      return;
    }

    // Step 2 - check that new password matches format
    if (
      !confirmPassword.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      setPasswordMessage("Invalid password format");
      return;
    }

    // Step 3 - submit password update request
    const data = await handlePostRequest("user/user-update-password", {
      username: loginContext.isLoggedIn.username,
      password: confirmPassword,
    });

    if (typeof data === "string") {
      setPasswordMessage(data);
    } else {
      setPasswordMessage("Password updated");
    }
  };

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
          border: "1px solid black",
          borderRadius: "10px",
          p: 3,
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
            <Button type="submit">Update</Button>
          </form>
          <Typography variant="body2">{emailMessage}</Typography>

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
            <Button type="submit">Update password</Button>
          </form>
          <Typography variant="body2">{passwordMessage}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;
