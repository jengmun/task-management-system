import { Button, Card } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

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

  const [message, setMessage] = useState("");

  const handleCreateTask = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-task", {
      acronym: app,
      taskName: e.target.taskName.value,
      description: e.target.description.value,
      details: e.target.notes.value,
      planName: e.target.planName.value,
    });
    setMessage(data);

    if (data === "Added note") {
      e.target.taskName.value = "";
      e.target.description.value = "";
      e.target.notes.value = "";
      e.target.planName.value = "";
      props.fetchTasks();
    }
  };

  return (
    <Card>
      <form onSubmit={handleCreateTask}>
        <label htmlFor="taskName">Task Name</label>
        <input id="taskName" name="taskName" required />
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          maxLength="255"
          required
        />
        <label htmlFor="notes">Notes</label>
        <input id="notes" name="notes" required />
        {/* needed? */}
        <label htmlFor="planName">Plan Name</label>
        <select id="planName" name="planName">
          <option value="">No Plan Selected</option>
          {allPlans.map((plan) => {
            return <option value={plan.plan_name}>{plan.plan_name}</option>;
          })}
        </select>
        <Button type="submit">Submit</Button>
      </form>
      {message}
    </Card>
  );
};

export default CreateTask;
