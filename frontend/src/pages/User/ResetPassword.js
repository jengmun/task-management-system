import { useParams } from "react-router-dom";
import handlePostRequest from "../../hooks/handlePostRequest";

const ResetPassword = () => {
  const params = useParams();

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    // Step 1 - check that both passwords match
    if (e.target.updatePassword.value !== e.target.confirmPassword.value) {
      console.log("Passwords do not match");
      return;
    }

    // Step 2 - check that new password matches format
    if (
      !e.target.confirmPassword.value.match(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-])\S{8,10}$/
      )
    ) {
      console.log("Invalid password format");
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
    console.log(result);
  };

  return (
    <form onSubmit={handlePasswordChange}>
      <h1>Change password</h1>

      <label htmlFor="oldPassword">Current Password</label>
      <input id="oldPassword" name="oldPassword" type="password" />
      <label htmlFor="updatePassword">New Password</label>
      <input id="updatePassword" name="updatePassword" type="password" />
      <label htmlFor="confirmPassword">Re-enter New Password</label>
      <input id="confirmPassword" name="confirmPassword" type="password" />
      <button>Update password</button>
    </form>
  );
};

export default ResetPassword;
