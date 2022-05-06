import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const CreateApp = () => {
  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
    console.log(data);
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

  const permissions = [
    "permitCreate",
    "permitOpen",
    "permitTodo",
    "permitDoing",
    "permitDone",
  ];

  const handleCreateApp = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("task/create-app", {
      acronym: e.target.acronym.value,
      description: e.target.description.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      permitCreate: e.target.permitCreate.value,
      permitOpen: e.target.permitOpen.value,
      permitTodo: e.target.permitTodo.value,
      permitDoing: e.target.permitDoing.value,
      permitDone: e.target.permitDone.value,
    });
    console.log(data);
  };

  return (
    <form onSubmit={handleCreateApp}>
      <label htmlFor="acronym">Application Acronym</label>
      <input id="acronym" name="acronym" minLength="3" maxLength="3" required />
      <label htmlFor="description">Description</label>
      <textarea id="description" name="description" maxLength="255" required />
      <label htmlFor="startDate">Start Date</label>
      <input type="date" id="startDate" name="startDate" required />
      <label htmlFor="endDate">End Date</label>
      <input type="date" id="endDate" name="endDate" required />
      {/* restrict end date to after start date */}
      {permissions.map((permission) => {
        return (
          <>
            <label htmlFor={permission}>{permission}</label>
            <select name={permission} id={permission}>
              {allGroups.map((group) => {
                return (
                  <option value={group.group_name}>{group.group_name}</option>
                );
              })}
            </select>
          </>
        );
      })}
      <button>Submit</button>
    </form>
  );
};

export default CreateApp;
