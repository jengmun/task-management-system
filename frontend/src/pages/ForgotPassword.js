import handlePostRequest from "../hooks/handlePostRequest";

const ResetPassword = () => {
  const handleResetPassword = (e) => {
    e.preventDefault();

    handlePostRequest("admin-password-reset", {
      username: e.target.username.value,
      email: e.target.email.value,
    });
  };

  return (
    <form onSubmit={handleResetPassword}>
      <h1>Reset password</h1>

      <label htmlFor="username">Username</label>
      <input id="username" name="username" />

      <label htmlFor="email">Email</label>
      <input id="email" name="email" />

      <button>Submit</button>
    </form>
  );
};

export default ResetPassword;
