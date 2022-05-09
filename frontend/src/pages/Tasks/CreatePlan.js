import { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import handlePostRequest from "../../hooks/handlePostRequest";

const CreatePlan = () => {
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
    setMessage(data);

    if (data === "Plan created") {
      e.target.startDate.value = "";
      e.target.endDate.value = "";
      e.target.planName.value = "";
    }
  };

  const [startDate, setStartDate] = useState("");

  return (
    <>
      <NavLink to={`/app/${app}`}>
        <button>Back</button>
      </NavLink>
      <form onSubmit={handleCreatePlan}>
        <label htmlFor="planName">Plan Name</label>
        <input id="planName" name="planName" required />
        <label htmlFor="startDate">Start Date</label>
        <input
          type="date"
          id="startDate"
          name="startDate"
          required
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
        />
        <label htmlFor="endDate">End Date</label>
        <input
          type="date"
          id="endDate"
          name="endDate"
          required
          min={startDate}
        />
        <button>Submit</button>
      </form>
      {message}
    </>
  );
};

export default CreatePlan;
