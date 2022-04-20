import React, { useEffect, useState } from "react";
import handleGetRequest from "../hooks/handleGetRequest";

const CreateUser = () => {
  const [groups, setGroups] = useState(null);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("admin/all-groups");
    if (data) {
      setGroups(data);
    }
  };

  useEffect(() => {
    fetchAllGroups();
  }, []);

  return (
    <div>
      <form>
        <h1>Create New User</h1>

        <label htmlFor="username">Username</label>
        <input id="username" name="username" />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" />
        <label htmlFor="email">Email</label>
        <input id="email" name="email" />
        <select multiple>
          {groups.map((group) => {
            <option>1</option>;
          })}
        </select>

        <input type="submit" />
      </form>
    </div>
  );
};

export default CreateUser;
