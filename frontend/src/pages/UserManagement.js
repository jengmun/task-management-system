import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import handleGetRequest from "../hooks/handleGetRequest";
import handlePostRequest from "../hooks/handlePostRequest";

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("admin/all-users");
    if (data) {
      setAllUsers(data);
    }
  };

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("admin/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllGroups();
  }, []);

  return (
    <div>
      <NavLink to="/">
        <button>Create New Group</button>
      </NavLink>
      <NavLink to="/admin/create-user">
        <button>Create New User</button>
      </NavLink>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Groups</th>
            <th>Status</th>
            <th>Password reset</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((user) => {
            return <User data={user} groups={allGroups} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;

const User = (props) => {
  const [email, setEmail] = useState(props.data.email);

  const [readOnly, setReadOnly] = useState(true);
  const toggleReadOnly = () => {
    setReadOnly(!readOnly);
    // setEmail
    // setGroup
    // setStatus()
  };

  // Formatting for React-Select
  const options = [];
  for (const group of props.groups) {
    options.push({ value: group.group_name, label: group.group_name });
  }

  const currentGroup = [];
  for (const group of props.data.group_name) {
    currentGroup.push({ value: group, label: group });
  }

  const [selected, setSelected] = useState(currentGroup);

  // Toggle active status
  const [status, setStatus] = useState(props.data.status);

  const handleUpdateStatus = () => {
    if (status === "Active") {
      setStatus("Inactive");
    } else {
      setStatus("Active");
    }
  };

  // to amend name to isActive instead

  // To submit update
  const handleUpdateUser = () => {
    handlePostRequest("admin/update-details", {
      username: props.data.username,
      email: email,
      group: currentGroup,
    });

    if (props.data.status !== status) {
      handlePostRequest("admin/toggle-status", {
        username: props.data.username,
        status: status,
      });
    }
  };

  return (
    <tr>
      <td>
        <input
          defaultValue={props.data.username}
          readOnly
          style={{ backgroundColor: readOnly ? "grey" : "white" }}
        />
      </td>
      <td>
        <input
          defaultValue={props.data.email}
          readOnly={readOnly}
          style={{ backgroundColor: readOnly ? "grey" : "white" }}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </td>
      <td>
        {readOnly ? (
          <input
            defaultValue={props.data.group_name}
            readOnly={readOnly}
            style={{ backgroundColor: readOnly ? "grey" : "white" }}
          />
        ) : (
          <Dropdown
            preselected={selected}
            options={options}
            callback={(e) => {
              setSelected(e);
            }}
          ></Dropdown>
        )}
      </td>
      <td>
        {readOnly ? (
          <p>{status}</p>
        ) : (
          <button disabled={readOnly} onClick={handleUpdateStatus}>
            {status === "Active" ? "Inactive" : "Active"}
          </button>
        )}
      </td>
      <td>
        <button>Reset password</button>
      </td>
      <td>
        {readOnly ? (
          <button onClick={toggleReadOnly}>Edit</button>
        ) : (
          <>
            <button onClick={handleUpdateUser}>Save</button>
            <button onClick={toggleReadOnly}>Cancel</button>
          </>
        )}
      </td>
    </tr>
  );
};
