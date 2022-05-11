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

  // ------------- Check if Lead -------------/
  const [isLead, setIsLead] = useState(false);

  const checkLead = async () => {
    const data = await handlePostRequest("task/is-group", {
      group: "Team Lead",
      acronym: app,
    });
    if (data) {
      setIsLead(data);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
    fetchAllNotes();
    fetchAllPlans();
    checkLead();
  }, []);

  // ------------- Update task details -------------

  const [readOnly, setReadOnly] = useState(true);
  const [message, setMessage] = useState("");

  const handleTaskUpdate = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-task`, {
      description: e.target.description.value,
      planName: e.target.planName.value,
      acronym: app,
      taskID: task,
    });
    setMessage(data);
    fetchAllNotes();
  };

  const setPermissions = () => {
    if (isLead && taskDetails.state === "Open") {
      setReadOnly(false);
    }
  };

  useEffect(() => {
    setPermissions();
  }, [isLead, taskDetails]);

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
          readOnly={readOnly}
        />
        {readOnly ? (
          <h5>Plan Name: {taskDetails.plan_name}</h5>
        ) : (
          <>
            <label htmlFor="planName">Plan Name</label>
            <select id="planName" name="planName">
              <option
                value="null"
                selected={taskDetails.plan_name ? true : false}
              >
                No plan
              </option>
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
          </>
        )}
      </form>
      {message}
      {allNotes.map((note) => {
        return (
          <div>
            <h5>Note ID: {note.notes_id}</h5>
            <h5>Description: {note.details}</h5>
            <h5>Author: {note.creator}</h5>
            <h5>Date: {note.date}</h5>
            <h5>Current State: {note.state}</h5>
          </div>
        );
      })}
    </div>
  );
};

export default EditTask;
