import { useState } from "react";
import { useParams } from "react-router-dom";
import handlePostRequest from "../../hooks/handlePostRequest";
import { Button, Card, TextField, Typography } from "@mui/material";

const CreatePlan = (props) => {
  const { app } = useParams();

  const [message, setMessage] = useState("");

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-plan", {
      planName: e.target.planName.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      acronym: app,
    });

    if (data === "Plan created") {
      e.target.startDate.value = "";
      e.target.endDate.value = "";
      e.target.planName.value = "";
      setMessage(data);
      props.fetchAllPlans();
    } else if (data.includes("Duplicate")) {
      setMessage("Plan name already exists");
    } else {
      setMessage(data);
    }
  };

  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  return (
    <Card
      sx={{
        p: 3,
        width: "max-content",
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
          sx={{ mt: 2 }}
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
          defaultValue={new Date().toISOString().slice(0, 10)}
          sx={{ mt: 2 }}
        />
        <TextField
          id="endDate"
          label="End Date"
          variant="outlined"
          required
          type="date"
          InputProps={{ inputProps: { min: startDate } }}
          defaultValue={new Date().toISOString().slice(0, 10)}
          sx={{ mt: 2 }}
        />
        <Button type="submit">Submit</Button>
      </form>
      <Typography sx={{ textAlign: "center" }}>{message}</Typography>
    </Card>
  );
};

export default CreatePlan;
