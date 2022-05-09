import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import handlePostRequest from "../../hooks/handlePostRequest";

const CreateTask = () => {
  const { app } = useParams();

  // ------------- Fetch all plans -------------
  const [allPlans, setAllPlans] = useState([]);

  const fetchAllPlans = async () => {
    const data = await handlePostRequest("task/all-plans", { acronym: app });
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
      notes: e.target.notes.value,
      planName: e.target.planName.value,
      username: "1",
    });
    setMessage(data);

    if (data === "Task created") {
      e.target.taskName.value = "";
      e.target.description.value = "";
      e.target.notes.value = "";
      e.target.planName.value = "";
    }
  };

  return (
    <>
      <NavLink to={`/app/${app}`}>
        <button>Back</button>
      </NavLink>
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
        <button>Submit</button>
      </form>
      {message}
    </>
  );
};

export default CreateTask;
