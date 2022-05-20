import { Snackbar, Alert, useTheme } from "@mui/material";

const CustomSnackbar = (props) => {
  const { openSnackbar, handleCloseSnackbar, message, severity } = props;
  const theme = useTheme();

  console.log(severity);

  return (
    <Snackbar
      open={openSnackbar}
      autoHideDuration={3000}
      onClose={handleCloseSnackbar}
      sx={{ backgroundColor: severity && theme.palette[severity].main }}
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
