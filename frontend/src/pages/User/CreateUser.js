import React, { useEffect, useState } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import Dropdown from "../../components/Dropdown";

const CreateUser = () => {
  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

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

  // ------------- Submit form -------------
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [message, setMessage] = useState("");

  const options = [];
  for (const app of allApps) {
    for (const group of allGroups) {
      options.push({
        value: `${app.acronym}_${group.group_name}`,
        label: `${app.acronym} - ${group.group_name}`,
      });
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await handlePostRequest("user/create-account", {
      username: e.target.username.value,
      password: e.target.password.value,
      email: e.target.email.value,
      groups: selectedGroups,
    });
    setMessage(data);

    e.target.username.value = "";
    e.target.password.value = "";
    e.target.email.value = "";
    // setSelectedGroups([]);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Create New User</h1>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          className="input input-bordered input-primary max-w-xs"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input input-bordered input-primary max-w-xs"
          required
        />
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          className="input input-bordered input-primary max-w-xs"
          required
        />
        <p>Assign group</p>
        <Dropdown
          multi={true}
          options={options}
          closeMenuOnSelect={false}
          callback={setSelectedGroups}
        />
        <button className="btn">Submit</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CreateUser;
