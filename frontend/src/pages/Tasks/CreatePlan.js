import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const CreatePlan = () => {
  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    const data = await handleGetRequest("task/all-apps");
    if (data) {
      setAllApps(data);
    }
  };

  useEffect(() => {
    fetchAllApps();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-plan", {
      planName: e.target.planName.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      acronym: e.target.acronym.value,
    });
    console.log(data);
  };

  const [startDate, setStartDate] = useState("");

  return (
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
      <input type="date" id="endDate" name="endDate" required min={startDate} />
      <select id="acronym" name="acronym">
        {allApps.map((app) => {
          return <option value={app.acronym}>{app.acronym}</option>;
        })}
      </select>
      <button>Submit</button>
    </form>
  );
};

export default CreatePlan;
