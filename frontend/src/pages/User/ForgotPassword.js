import { Button, Card, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useState } from "react";
import CustomSnackbar from "../../components/CustomSnackbar";
import handlePostRequest from "../../hooks/handlePostRequest";

const ForgotPassword = () => {
  // ------------- Snackbar -------------
  const [message, setMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [severity, setSeverity] = useState("");

  const handleOpenSnackbar = (severity) => {
    setOpenSnackbar(true);
    setSeverity(severity);
  };

  const handleCloseSnackbar = (_event, reason) => {
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
    setMessage(data.message);

    if (data.message !== "Password successfully resetted") {
      handleOpenSnackbar("error");
    } else {
      handleOpenSnackbar("success");
    }
  };

  return (
    <Box sx={{ height: "100%", display: "flex", alignItems: "center" }}>
      <Card sx={{ height: "fit-content", p: 3 }}>
        <form
          onSubmit={handleResetPassword}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <Typography variant="h6" sx={{ mb: 1, textAlign: "center" }}>
            Reset password
          </Typography>

          <TextField
            required
            id="username"
            label="Username"
            sx={{ mt: 1, mb: 1 }}
          />
          <TextField required id="email" label="Email" sx={{ mt: 1, mb: 1 }} />

          <Button type="submit" variant="contained" color="error">
            Submit
          </Button>
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

export default ForgotPassword;
