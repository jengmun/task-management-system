import { Snackbar, Alert, useTheme } from "@mui/material";

const CustomSnackbar = (props) => {
  const { openSnackbar, handleCloseSnackbar, message, severity } = props;
  const theme = useTheme();

  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
    >
      {severity && (
        <Alert
          onClose={handleCloseSnackbar}
          sx={{ width: "100%" }}
          severity={severity}
        >
          {message}
        </Alert>
      )}
    </Snackbar>
  );
};

export default CustomSnackbar;
