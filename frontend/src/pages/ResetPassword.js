import React from "react";

const ResetPassword = () => {
  return (
    <div>
      <h1>Change password</h1>
      <label htmlFor="update-password">Password</label>
      <input
        id="update-password"
        name="update-password"
        // onChange={(e) => setChangePassword(e.target.value)}
      />
      <label htmlFor="confirm-password">Re-enter Password</label>
      <input
        id="confirm-password"
        name="confirm-password"
        // onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {/* <button onClick={() => handlePasswordChange()}>Update password</button> */}
    </div>
  );
};

export default ResetPassword;
