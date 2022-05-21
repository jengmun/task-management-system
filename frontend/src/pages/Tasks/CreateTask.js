import {
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextareaAutosize,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import CustomSnackbar from "../../components/CustomSnackbar";

const CreateTask = (props) => {
  const { app } = useParams();

  // ------------- Fetch all plans -------------
  const [allPlans, setAllPlans] = useState([]);

  const fetchAllPlans = async () => {
    const data = await handleGetRequest(`task/all-open-plans/${app}`);
    if (data) {
      setAllPlans(data);
    }
    console.log(data);
  };

  useEffect(() => {
    fetchAllPlans();
  }, []);

  const [selectedPlan, setSelectedPlan] = useState("");

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

  const handleCreateTask = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-task", {
      acronym: app,
      taskName: e.target.taskName.value,
      description: e.target.description.value,
      planName: selectedPlan,
    });
    setMessage(data);

    if (data === "Added note") {
      e.target.taskName.value = "";
      e.target.description.value = "";
      setSelectedPlan("");
      props.fetchTasks();
      handleOpenSnackbar("success");
    } else {
      handleOpenSnackbar("error");
    }
  };

  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 3,
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflowY: "scroll",
        backgroundColor: "white",
      }}
    >
      <Typography variant="h5" sx={{ textAlign: "center" }}>
        Create New Task
      </Typography>
      <form
        onSubmit={handleCreateTask}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        <TextField
          id="taskName"
          label="Task Name"
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
        <FormControl sx={{ mt: 2 }}>
          <InputLabel id="planName">Plan Name</InputLabel>
          <Select
            id="planName"
            label="Plan Name"
            sx={{ width: "200px" }}
            value={selectedPlan}
            onChange={(e) => {
              setSelectedPlan(e.target.value);
            }}
          >
            <MenuItem
              value=""
              sx={{
                backgroundColor: "white",
                ":hover": {
                  backgroundColor: theme.palette.info.main,
                },
              }}
            >
              No Plan Selected
            </MenuItem>
            {allPlans.map((plan) => {
              return (
                <MenuItem
                  value={plan.plan_name}
                  key={plan.plan_name}
                  sx={{
                    backgroundColor: "white",
                    ":hover": {
                      backgroundColor: theme.palette.info.main,
                    },
                  }}
                >
                  {plan.plan_name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="info" sx={{ mt: 2 }}>
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

export default CreateTask;
