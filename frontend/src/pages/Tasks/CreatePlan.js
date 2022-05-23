import { useState } from "react";
import { useParams } from "react-router-dom";
import handlePostRequest from "../../hooks/handlePostRequest";
import {
  Button,
  Card,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import CustomSnackbar from "../../components/CustomSnackbar";

const CreatePlan = (props) => {
  const { app } = useParams();

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

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-plan", {
      planName: e.target.planName.value,
      description: e.target.description.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      acronym: app,
    });

    if (data === "Plan created") {
      e.target.startDate.value = "";
      e.target.description.value = "";
      e.target.endDate.value = "";
      e.target.planName.value = "";
      setMessage(data);
      handleOpenSnackbar("success");
      props.fetchAllPlans();
    } else if (data.includes("Duplicate")) {
      setMessage("Plan name already exists");
      handleOpenSnackbar("error");
    } else {
      setMessage(data);
      handleOpenSnackbar("error");
    }
  };

  const [startDate, setStartDate] = useState(
    moment(new Date()).format("YYYY-MM-DD")
  );

  return (
    <Card
      sx={{
        p: 3,
        width: "max-content",
        backgroundColor: "white",
      }}
    >
      <Typography variant="h6" sx={{ textAlign: "center" }}>
        Create New Plan
      </Typography>
      <form
        onSubmit={handleCreatePlan}
        style={{ display: "flex", flexDirection: "column" }}
      >
        <TextField
          id="planName"
          label="Plan Name"
          variant="outlined"
          required
          sx={{ mt: 2, mb: 2 }}
        />
        <TextareaAutosize
          required
          maxLength="255"
          minRows={3}
          id="description"
          placeholder="Description"
        />
        <TextField
          id="startDate"
          label="Start Date"
          variant="outlined"
          required
          type="date"
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
          defaultValue={moment(new Date()).format("YYYY-MM-DD")}
          sx={{ mt: 2 }}
        />
        <TextField
          id="endDate"
          label="End Date"
          variant="outlined"
          required
          type="date"
          InputProps={{ inputProps: { min: startDate } }}
          defaultValue={moment(new Date()).format("YYYY-MM-DD")}
          sx={{ mt: 2 }}
        />
        <Button type="submit" variant="contained" color="error" sx={{ mt: 2 }}>
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
  );
};

export default CreatePlan;
