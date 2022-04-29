import { useContext, useState } from "react";
import LoginContext from "../../context/login-context";
import handlePostRequest from "../../hooks/handlePostRequest";

const Profile = () => {
  const loginContext = useContext(LoginContext);
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // ------------ Update email ------------
  const [updateEmail, setUpdateEmail] = useState("");

  const handleEmailChange = () => {
    if (updateEmail === loginContext.isLoggedIn.email) {
      setEmailMessage("No change in email");
      return;
    }

    if (!updateEmail) {
      setEmailMessage("Please enter an email address");
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
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        defaultValue={loginContext.isLoggedIn.username}
        readOnly
        className="input input-bordered input-primary max-w-xs"
      />
      <h1>Update email information</h1>

      <label htmlFor="update-email">Email</label>
      <input
        id="update-email"
        name="update-email"
        defaultValue={loginContext.isLoggedIn.email}
        className="input input-bordered input-primary max-w-xs"
        onChange={(e) => setUpdateEmail(e.target.value)}
      />
      <button className="btn" onClick={() => handleEmailChange()}>
        Update
      </button>
      <p>{emailMessage}</p>
      <h1>Change password</h1>
      <label htmlFor="update-password">Password</label>
      <input
        id="update-password"
        name="update-password"
        type="password"
        className="input input-bordered input-primary max-w-xs"
        onChange={(e) => setChangePassword(e.target.value)}
      />
      <label htmlFor="confirm-password">Re-enter Password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        type="password"
        className="input input-bordered input-primary max-w-xs"
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button className="btn" onClick={() => handlePasswordChange()}>
        Update password
      </button>
      <p>{passwordMessage}</p>
    </div>
  );
};

export default Profile;
