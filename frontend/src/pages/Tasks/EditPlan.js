import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const EditPlan = () => {
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

  return (
    <div>
      <NavLink to={`/app/${app}`}>
        <button>Back</button>
      </NavLink>
      <table>
        <thead>
          <tr>
            <th>Plan Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {allPlans.map((plan) => {
            return <Plan plan={plan} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EditPlan;

const Plan = (props) => {
  const { app } = useParams();

  const [input, setInput] = useState({
    planName: props.plan.plan_name,
    startDate: props.plan.start_date.slice(0, 10),
    endDate: props.plan.end_date.slice(0, 10),
  });

  const [message, setMessage] = useState("");

  const handleUpdatePlan = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-plan/${app}`, {
      planName: input.planName,
      startDate: input.startDate,
      endDate: input.endDate,
      currentPlan: props.plan.plan_name,
    });
    setMessage(data);
  };

  const handleUpdatePlanStatus = async () => {
    if (props.plan.status === "Closed") {
      setMessage("Status is already closed!");
    }

    const data = await handlePostRequest(`task/update-plan-status/${app}`, {
      planName: input.planName,
    });
    if (data === "Plan status updated") {
      props.plan.status = "Closed";
    }
    setMessage(data);
  };

  const [startDate, setStartDate] = useState("");

  return (
    <tr>
      <td>
        <input
          id="planName"
          name="planName"
          defaultValue={props.plan.plan_name}
          onChange={(e) => {
            setInput({ ...input, planName: e.target.value });
          }}
        />
      </td>
      <td>
        <input
          id="startDate"
          name="startDate"
          type="date"
          defaultValue={`${props.plan.start_date.slice(0, 10)}`}
          onChange={(e) => {
            setInput({ ...input, startDate: e.target.value });
            setStartDate(e.target.value);
          }}
        />
      </td>
      <td>
        <input
          id="endDate"
          name="endDate"
          type="date"
          defaultValue={`${props.plan.end_date.slice(0, 10)}`}
          onChange={(e) => {
            setInput({ ...input, endDate: e.target.value });
          }}
          min={startDate}
        />
      </td>
      <td>
        {props.plan.status ? (
          props.plan.status
        ) : (
          <button onClick={handleUpdatePlanStatus}>Close Plan</button>
        )}
      </td>
      <td>
        <button onClick={handleUpdatePlan}>Update</button>
      </td>
      {message}
    </tr>
  );
};
