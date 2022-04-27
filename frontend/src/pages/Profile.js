import { useContext, useState } from "react";
import LoginContext from "../context/login-context";
import handlePostRequest from "../hooks/handlePostRequest";

const Profile = () => {
  const loginContext = useContext(LoginContext);
  const [message, setMessage] = useState("");

  // ------------ Update email ------------
  const [updateEmail, setUpdateEmail] = useState("");

  const handleEmailChange = () => {
    if (updateEmail === loginContext.isLoggedIn.email) {
      console.log("No change in email");
      return;
    }
    handlePostRequest("user/update-email", {
      username: loginContext.isLoggedIn.username,
      email: updateEmail,
    });
    loginContext.isLoggedIn.email = updateEmail;
  };

  // ------------ Update password ------------
  const [changePassword, setChangePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordChange = async () => {
    // Step 1 - check that both passwords match
    if (changePassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    // Step 2 - check that new password matches format
    if (
      !confirmPassword.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      setMessage("Invalid password format");
      return;
    }

    // Step 3 - submit password update request
    const data = await handlePostRequest("user/user-update-password", {
      username: loginContext.isLoggedIn.username,
      password: confirmPassword,
    });

    if (typeof data === "string") {
      setMessage(data);
    } else {
      setMessage("Password updated");
    }
  };

  return (
    <div>
      <h1>Account management</h1>
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        defaultValue={loginContext.isLoggedIn.username}
        readOnly
      />
      <h1>Update email information</h1>

      <label htmlFor="update-email">Email</label>
      <input
        id="update-email"
        name="update-email"
        defaultValue={loginContext.isLoggedIn.email}
        onChange={(e) => setUpdateEmail(e.target.value)}
      />
      <button className="btn" onClick={() => handleEmailChange()}>
        Update
      </button>

      <h1>Change password</h1>
      <label htmlFor="update-password">Password</label>
      <input
        id="update-password"
        name="update-password"
        type="password"
        onChange={(e) => setChangePassword(e.target.value)}
      />
      <label htmlFor="confirm-password">Re-enter Password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        type="password"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button className="btn" onClick={() => handlePasswordChange()}>
        Update password
      </button>
      <p>{message}</p>
    </div>
  );
};

export default Profile;
