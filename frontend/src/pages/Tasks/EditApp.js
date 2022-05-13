import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import { Card, Button } from "@mui/material";

const EditApp = (props) => {
  const { app } = useParams();

  // ------------- Fetch app details -------------
  const [appDetails, setAppDetails] = useState([]);

  const fetchAppDetails = async () => {
    const data = await handleGetRequest(`task/apps/${app}`);
    if (data) {
      setAppDetails(data);
    }
  };

  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  useEffect(() => {
    fetchAppDetails();
    fetchAllGroups();
  }, []);

  const permissions = [
    "permitCreate",
    "permitOpen",
    "permitTodo",
    "permitDoing",
    "permitDone",
  ];

  const [message, setMessage] = useState("");

  const handleEditApp = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest(`task/update-app/${app}`, {
      description: e.target.description.value,
      startDate: e.target.startDate.value,
      endDate: e.target.endDate.value,
      permitCreate: e.target.permitCreate.value,
      permitOpen: e.target.permitOpen.value,
      permitTodo: e.target.permitTodo.value,
      permitDoing: e.target.permitDoing.value,
      permitDone: e.target.permitDone.value,
    });
    setMessage(data);
    props.fetchAppDetails();
  };
  const [startDate, setStartDate] = useState("");

  return (
    <Card>
      <h1>{app}</h1>
      {appDetails.end_date && (
        <form onSubmit={handleEditApp}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            maxLength="255"
            defaultValue={appDetails.description}
          />
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            defaultValue={`${appDetails.start_date.slice(0, 10)}`}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
          />
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            defaultValue={`${appDetails.end_date.slice(0, 10)}`}
            min={startDate}
          />
          {permissions.map((permission) => {
            return (
              <>
                <label htmlFor={permission}>{permission}</label>
                <select name={permission} id={permission}>
                  {allGroups.map((group) => {
                    return (
                      <option
                        value={group.group_name}
                        selected={
                          appDetails[
                            `${permission.slice(0, 6)}_${permission
                              .slice(6)
                              .toLowerCase()}`
                          ] === group.group_name
                            ? true
                            : false
                        }
                      >
                        {group.group_name}
                      </option>
                    );
                  })}
                </select>
              </>
            );
          })}
          <Button type="submit">Submit</Button>
        </form>
      )}
      {message}
    </Card>
  );
};

export default EditApp;
