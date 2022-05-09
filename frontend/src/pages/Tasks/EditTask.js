import { useState, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const EditTask = () => {
  const { app, task } = useParams();

  // ------------- Fetch task details -------------
  const [taskDetails, setTaskDetails] = useState([]);

  const fetchTaskDetails = async () => {
    const data = await handleGetRequest(`task/task-details/${task}`);
    if (data) {
      setTaskDetails(data);
    }
  };

  // ------------- Fetch all notes -------------
  const [allNotes, setAllNotes] = useState([]);

  const fetchAllNotes = async () => {
    const data = await handleGetRequest(`task/all-notes/${task}`);
    if (data) {
      setAllNotes(data);
    }
  };

  // ------------- Fetch all plans -------------
  const [allPlans, setAllPlans] = useState([]);

  const fetchAllPlans = async () => {
    const data = await handleGetRequest(`task/all-plans/${app}`);
    if (data) {
      setAllPlans(data);
    }
    console.log(data);
  };

  useEffect(() => {
    fetchTaskDetails();
    fetchAllNotes();
    fetchAllPlans();
  }, []);

  // ------------- Update task details -------------

  const [message, setMessage] = useState("");

  const handleTaskUpdate = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-task/${task}`, {
      description: e.target.description.value,
      planName: e.target.planName.value,
    });
    setMessage(data);
  };

  return (
    <div>
      <NavLink to={`/app/${app}`}>
        <button>Back</button>
      </NavLink>
      Task Name: {taskDetails.task_name}
      Task ID: {taskDetails.task_id}
      Application: {taskDetails.acronym}
      State: {taskDetails.state}
      Created by: {taskDetails.creator}
      Created date: {taskDetails.create_date}
      Task owner: {taskDetails.owner}
      <form onSubmit={handleTaskUpdate}>
        <label htmlFor="description">Description</label>
        <textarea
          defaultValue={taskDetails.description}
          id="description"
          name="description"
        />
        <label htmlFor="planName">Plan Name</label>
        <select id="planName" name="planName">
          {allPlans.map((plan) => {
            return (
              <option
                selected={
                  plan.plan_name === taskDetails.plan_name ? true : false
                }
                value={plan.plan_name}
              >
                {plan.plan_name}
              </option>
            );
          })}
        </select>
        <button className="btn">Update task</button>
      </form>
      {message}
      {allNotes.map((note) => {
        return (
          <div>
            <h5>{note.details}</h5>
            <h5>{note.creator}</h5>
            <h5>{note.date}</h5>
            <h5>{note.state}</h5>
            <h5>{note.notes_id}</h5>
          </div>
        );
      })}
    </div>
  );
};

export default EditTask;
