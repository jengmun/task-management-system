import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from "../components/Dropdown";
import handleGetRequest from "../hooks/handleGetRequest";
import handlePostRequest from "../hooks/handlePostRequest";

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
    }
  };

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      const options = [];
      for (const group of data) {
        options.push({ value: group.group_name, label: group.group_name });
      }
      setAllGroups(options);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllGroups();
  }, []);

  return (
    <div>
      <NavLink to="/admin/create-group">
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
            user.formatted_groups = [];
            for (let i = 0; i < user.group_name.length; i++) {
              user.formatted_groups.push({
                value: user.group_name[i],
                label: user.group_name[i],
              });
            }
            return <User data={user} options={allGroups} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;

const User = (props) => {
  console.log(props);
  // Dataset as per database
  const [userData, setUserData] = useState(props.data);

  // Dataset as per React - to be displayed
  const [reactData, setReactData] = useState(props.data);

  const [readOnly, setReadOnly] = useState(true);

  const handleEditUser = () => {
    setReadOnly(!readOnly);
  };

  const handleCancelChanges = () => {
    setReadOnly(!readOnly);
    setReactData(userData);
  };

  // to amend name to isActive instead

  // To submit update
  const handleUpdateUser = () => {
    if (
      reactData.email !== userData.email ||
      reactData.status !== userData.status
    ) {
      handlePostRequest("user/update-details", {
        username: reactData.username,
        email: reactData.email,
        status: reactData.status,
      });
    }

    if (reactData.formatted_groups !== userData.formatted_groups) {
      handlePostRequest("user/update-groups", {
        username: reactData.username,
        currentGroups: reactData.formatted_groups,
        oldGroups: userData.group_name,
      });
    }

    setReadOnly(!readOnly);
    setUserData(reactData);
  };

  const [passwordReset, setPasswordReset] = useState(false);

  const handleResetPassword = () => {
    handlePostRequest("user/admin-password-reset", {
      username: reactData.username,
      email: reactData.email,
    });
    setPasswordReset(true);
    console.log(reactData.email);
  };

  return (
    <tr>
      <td>
        <input
          defaultValue={userData.username}
          readOnly
          style={{ backgroundColor: readOnly ? "grey" : "white" }}
        />
      </td>
      <td>
        <input
          value={reactData.email}
          readOnly={readOnly}
          style={{ backgroundColor: readOnly ? "grey" : "white" }}
          onChange={(e) => {
            setReactData({ ...reactData, email: e.target.value });
          }}
        />
        {/* WEIRD!!! */}
      </td>
      <td>
        {readOnly ? (
          reactData.formatted_groups.map((group) => {
            return <div>{group.value}</div>;
          })
        ) : (
          <Dropdown
            preselected={reactData.formatted_groups}
            options={props.options}
            callback={(e) => {
              setReactData({ ...reactData, formatted_groups: e });
            }}
          ></Dropdown>
        )}
      </td>
      <td>
        {console.log(reactData)}
        {readOnly ? (
          <div>{reactData.status}</div>
        ) : (
          <button
            onClick={() => {
              if (reactData.status === "Active") {
                setReactData({ ...reactData, status: "Inactive" });
              } else {
                setReactData({ ...reactData, status: "Active" });
              }
            }}
          >
            {reactData.status === "Active" ? "Inactive" : "Active"}
          </button>
        )}
      </td>
      <td>
        <button onClick={handleResetPassword} disabled={passwordReset}>
          {passwordReset ? "Password resetted" : "Reset password"}
        </button>
      </td>
      <td>
        {readOnly ? (
          <button onClick={handleEditUser}>Edit</button>
        ) : (
          <>
            <button onClick={handleUpdateUser}>Save</button>
            <button onClick={handleCancelChanges}>Cancel</button>
          </>
        )}
      </td>
    </tr>
  );
};
