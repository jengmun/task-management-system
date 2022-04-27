import { useState } from "react";
import handlePostRequest from "../hooks/handlePostRequest";

const ResetPassword = () => {
  const [message, setMessage] = useState("");
  const handleResetPassword = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("user/admin-password-reset", {
      username: e.target.username.value,
      email: e.target.email.value,
    });
    setMessage(data);
  };

  return (
    <form onSubmit={handleResetPassword}>
      <h1>Reset password</h1>

      <label htmlFor="username">Username</label>
      <input id="username" name="username" />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" />

      <button className="btn">Submit</button>
      <p>{message}</p>
    </form>
  );
};

export default ResetPassword;
