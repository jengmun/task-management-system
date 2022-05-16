import { Button, TextField, Typography } from "@mui/material";
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
    <div>
      <h1>Account management</h1>

      <Typography variant="h6">
        Username: {loginContext.isLoggedIn.username}
      </Typography>
      <h1>Update email information</h1>
      <form onSubmit={handleEmailChange}>
        <TextField
          required
          id="updateEmail"
          label="Email"
          defaultValue={loginContext.isLoggedIn.email}
          sx={{ mt: 1, mb: 1 }}
        />
        <Button type="submit">Update</Button>
      </form>
      <p>{emailMessage}</p>

      <h1>Change password</h1>
      <form onSubmit={handlePasswordChange}>
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
      <p>{passwordMessage}</p>
    </div>
  );
};

export default Profile;
