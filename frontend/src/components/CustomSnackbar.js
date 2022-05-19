import { Snackbar, Alert } from "@mui/material";

const CustomSnackbar = (props) => {
  const { openSnackbar, handleCloseSnackbar, message, severity } = props;

  console.log(severity);

  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
    >
      <Alert
        onClose={handleCloseSnackbar}
        sx={{ width: "100%" }}
        severity={severity}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
