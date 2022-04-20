import { useContext, useState } from "react";
import LoginContext from "../context/login-context";
import handlePostRequest from "../hooks/handlePostRequest";

const Profile = () => {
  const loginContext = useContext(LoginContext);

  // ------------ Update email ------------
  const [updateEmail, setUpdateEmail] = useState("");

  const handleEmailChange = () => {
    console.log(updateEmail);
    console.log(loginContext.isLoggedIn.email);
    if (updateEmail === loginContext.isLoggedIn.email) {
      console.log("No change in email");
      return;
    }
    handlePostRequest("user/update-email", {
      username: loginContext.isLoggedIn.username,
      email: updateEmail,
    });
  };

  // ------------ Update password ------------
  const [changePassword, setChangePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = () => {
    // Step 1 - check that both passwords match
    if (changePassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }

    // Step 2 - check that new password matches format
    if (
      !confirmPassword.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      console.log("Invalid password format");
      return;
    }

    // Step 3 - submit password update request
    handlePostRequest("user/update-password", {
      username: loginContext.isLoggedIn.username,
      password: confirmPassword,
    });
  };

  return (
    <div>
      <h1>Account management</h1>

      <h1>Update email information</h1>
      <label htmlFor="update-email">Email</label>
      <input
        id="update-email"
        name="update-email"
        value={loginContext.isLoggedIn.email}
        onChange={(e) => setUpdateEmail(e.target.value)}
      />
      <button onClick={() => handleEmailChange()}>Update</button>

      <h1>Change password</h1>
      <label htmlFor="update-password">Password</label>
      <input
        id="update-password"
        name="update-password"
        onChange={(e) => setChangePassword(e.target.value)}
      />
      <label htmlFor="confirm-password">Re-enter Password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button onClick={() => handlePasswordChange()}>Update password</button>
    </div>
  );
};

export default Profile;
