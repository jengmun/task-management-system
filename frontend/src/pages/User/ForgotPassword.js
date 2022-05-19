import { Button, Card } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import CustomSnackbar from "../../components/CustomSnackbar";
import handlePostRequest from "../../hooks/handlePostRequest";

const ResetPassword = () => {
  // ------------- Snackbar -------------
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState("");

  const handleOpenSnackbar = (severity) => {
    setOpenSnackbar(true);
    setSeverity(severity);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("user/admin-password-reset", {
      username: e.target.username.value,
      email: e.target.email.value,
    });
    setMessage(data);

    if (data !== "Password successfully resetted") {
      handleOpenSnackbar("error");
    } else {
      handleOpenSnackbar("success");
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
      <Card sx={{ height: "fit-content", p: 3 }}>
        <form onSubmit={handleResetPassword}>
          <h1>Reset password</h1>

          <label htmlFor="username">Username</label>
          <input id="username" name="username" />

          <label htmlFor="email">Email</label>
          <input id="email" name="email" />

          <Button type="submit">Submit</Button>
        </form>
        <CustomSnackbar
          openSnackbar={openSnackbar}
          handleCloseSnackbar={handleCloseSnackbar}
          message={message}
          severity={severity}
        />
      </Card>
    </Box>
  );
};

export default ResetPassword;
