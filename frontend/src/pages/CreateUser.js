import React, { useEffect, useState } from "react";
import handleGetRequest from "../hooks/handleGetRequest";
import handlePostRequest from "../hooks/handlePostRequest";
import Dropdown from "../components/Dropdown";

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

  // ------------- Submit form -------------
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [message, setMessage] = useState("");

  const options = [];
  for (const group of allGroups) {
    options.push({ value: group.group_name, label: group.group_name });
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
    setSelectedGroups([]);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h1>Create New User</h1>
        <label htmlFor="username">Username</label>
        <input id="username" name="username" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" />
        <p>Assign group</p>
        <Dropdown options={options} callback={setSelectedGroups} />
        <button>Submit</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default CreateUser;
