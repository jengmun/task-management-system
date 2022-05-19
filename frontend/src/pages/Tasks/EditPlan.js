import {
  Card,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Button,
  TextField,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import moment from "moment";
import CustomSnackbar from "../../components/CustomSnackbar";

const EditPlan = (props) => {
  const { app } = useParams();

  // ------------- Fetch all plans -------------
  const [allPlans, setAllPlans] = useState([]);

  const fetchAllPlans = async () => {
    const data = await handleGetRequest(`task/all-plans/${app}`);
    if (data) {
      setAllPlans(data);
    }
  };

  useEffect(() => {
    fetchAllPlans();
  }, []);

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

  return (
    <Card
      sx={{
        p: 3,
        width: "max-content",
        height: "90vh",
        overflow: "scroll",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Plan Name</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allPlans.map((plan) => {
            return (
              <Plan
                plan={plan}
                fetchAllPlans={props.fetchAllPlans}
                setMessage={setMessage}
                handleOpenSnackbar={handleOpenSnackbar}
                key={plan.plan_name}
              />
            );
          })}
        </TableBody>
      </Table>
      <CustomSnackbar
        openSnackbar={openSnackbar}
        handleCloseSnackbar={handleCloseSnackbar}
        message={message}
        severity={severity}
      />
    </Card>
  );
};

export default EditPlan;

const Plan = (props) => {
  const { app } = useParams();

  const [input, setInput] = useState({
    startDate: moment(props.plan.start_date).format("YYYY-MM-DD"),
    endDate: moment(props.plan.end_date).format("YYYY-MM-DD"),
  });

  const handleUpdatePlan = async (e) => {
    e.preventDefault();

    if (new Date(input.endDate) - new Date(input.startDate) < 0) {
      props.setMessage("End date must be later than start date!");
      props.handleOpenSnackbar("error");
      return;
    }

    const data = await handlePostRequest(`task/update-plan/${app}`, {
      startDate: input.startDate,
      endDate: input.endDate,
      currentPlan: props.plan.plan_name,
    });
    props.setMessage(data);

    if (data === "Plan updated") {
      props.fetchAllPlans();
      props.handleOpenSnackbar("success");
    } else {
      props.handleOpenSnackbar("error");
    }
  };

  const handleUpdatePlanStatus = async () => {
    if (props.plan.status === "Closed") {
      props.setMessage("Status is already closed!");
      props.handleOpenSnackbar("error");
      return;
    }

    const data = await handlePostRequest(`task/update-plan-status/${app}`, {
      planName: props.plan.plan_name,
    });
    props.setMessage(data);

    if (data === "Plan status updated") {
      props.plan.status = "Closed";
      props.fetchAllPlans();
      props.handleOpenSnackbar("success");
    } else {
      props.handleOpenSnackbar("error");
    }
  };

  const [startDate, setStartDate] = useState("");

  return (
    <TableRow>
      <TableCell>{props.plan.plan_name}</TableCell>
      <TableCell>
        <TextField
          id="startDate"
          label="Start Date"
          variant="outlined"
          type="date"
          onChange={(e) => {
            setInput({ ...input, startDate: e.target.value });
            setStartDate(e.target.value);
          }}
          defaultValue={input.startDate}
          sx={{ mt: 2 }}
          InputProps={{
            inputProps: { readOnly: props.plan.status === "Closed" },
          }}
        />
      </TableCell>
      <TableCell>
        <TextField
          id="endDate"
          label="End Date"
          variant="outlined"
          type="date"
          InputProps={{
            inputProps: {
              min: startDate,
              readOnly: props.plan.status === "Closed",
            },
          }}
          defaultValue={input.endDate}
          onChange={(e) => {
            setInput({ ...input, endDate: e.target.value });
          }}
          sx={{ mt: 2 }}
        />
      </TableCell>
      <TableCell>
        {props.plan.status === "Closed" ? (
          props.plan.status
        ) : (
          <Button onClick={handleUpdatePlanStatus}>Close Plan</Button>
        )}
      </TableCell>
      <TableCell>
        {props.plan.status !== "Closed" && (
          <Button onClick={handleUpdatePlan}>Update</Button>
        )}
      </TableCell>
    </TableRow>
  );
};
