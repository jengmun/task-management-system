import { useContext, useState } from "react";
import LoginContext from "../context/login-context";
import handleCreateNewUser from "../hooks/handleCreateNewUser";
import handleUpdateDetails from "../hooks/handleUpdateDetails";

const AccountSettings = () => {
  const loginContext = useContext(LoginContext);

  // New user creation
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Update user details
  const [changePassword, setChangePassword] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");

  return (
    <div>
      <h1>Create New User</h1>
      <label htmlFor="new-email">Email</label>
      <input
        id="new-email"
        name="new-email"
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <label htmlFor="new-username">Username</label>
      <input
        id="new-username"
        name="new-username"
        onChange={(e) => setNewUsername(e.target.value)}
      />
      <label htmlFor="new-password">Password</label>
      <input
        id="new-password"
        name="new-password"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="submit"
        onClick={() => {
          handleCreateNewUser(newUsername, newPassword, newEmail);
        }}
      />
      <h1>Update user information</h1>

      <h1>Change password</h1>
      <label htmlFor="update-password">Password</label>
      <input
        id="update-password"
        name="update-password"
        onChange={(e) => setChangePassword(e.target.value)}
      />
      <input
        type="submit"
        onClick={() =>
          handleUpdateDetails(
            "password",
            loginContext.isLoggedIn.username,
            changePassword
          )
        }
      />

      <h1>Update email information</h1>
      <label htmlFor="update-email">Email</label>
      <input
        id="update-email"
        name="update-email"
        onChange={(e) => setUpdateEmail(e.target.value)}
      />
      <input
        type="submit"
        onClick={() =>
          handleUpdateDetails(
            "email",
            loginContext.isLoggedIn.username,
            updateEmail
          )
        }
      />
    </div>
  );
};

export default AccountSettings;
