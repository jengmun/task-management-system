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

  const handleUpdatePlan = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-plan/${app}`, {
      planName: input.planName,
      startDate: input.startDate,
      endDate: input.endDate,
      currentPlan: props.plan.plan_name,
    });
    // console.log(data);
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
        <button className="btn" onClick={handleUpdatePlan}>
          Update
        </button>
      </td>
    </tr>
  );
};
