import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Dropdown from "../../components/Dropdown";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const UserManagement = () => {
  // ------------- Fetch all users -------------
  const [allUsers, setAllUsers] = useState([]);
  const [filterUsers, setFilterUsers] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
      setFilterUsers(data);
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

  // ------------- Fetch all apps -------------
  const [allApps, setAllApps] = useState([]);

  const fetchAllApps = async () => {
    const data = await handleGetRequest("task/all-apps");
    if (data) {
      setAllApps(data);
    }
  };

  useEffect(() => {
    fetchAllUsers();
    fetchAllGroups();
    fetchAllApps();
  }, []);

  const options = [];
  for (const app of allApps) {
    for (const group of allGroups) {
      options.push({
        value: `${app.acronym}_${group.group_name}`,
        label: `${app.acronym} - ${group.group_name}`,
      });
    }
  }

  const handleFilterUsers = (e) => {
    const filteredArr = allUsers.filter((user) => {
      return (
        user.username.includes(e.target.value) ||
        user.email.includes(e.target.value) ||
        user.status.includes(e.target.value)
      );
    });
    setFilterUsers(filteredArr);
  };

  return (
    <div>
      <NavLink to="/admin/create-user">
        <button>Create New User</button>
      </NavLink>
      <label>Filter</label>
      <input onChange={handleFilterUsers} />
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
          {filterUsers.map((user, index) => {
            if (!user.formatted_groups) {
              user.formatted_groups = [];
              for (let i = 0; i < user.user_group.length; i++) {
                user.formatted_groups.push({
                  value: `${user.apps[i]}_${user.groups[i]}`,
                  label: `${user.apps[i]} - ${user.groups[i]}`,
                });
              }
            }
            return (
              <User
                data={user}
                options={options}
                setAllUsers={(user) => {
                  const allUsersArr = [...allUsers];
                  allUsersArr[index] = user;
                  setAllUsers(allUsersArr);
                }}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;

const User = (props) => {
  // Dataset as per database
  const [userData, setUserData] = useState(props.data);
  // Dataset as per React - to be displayed
  const [reactData, setReactData] = useState(props.data);
  const [readOnly, setReadOnly] = useState(true);

  useEffect(() => {
    setUserData(props.data);
    setReactData(props.data);
  }, [props.data]);

  const handleEditUser = () => {
    setReadOnly(!readOnly);
  };

  const handleCancelChanges = () => {
    setReadOnly(!readOnly);
    setReactData(userData);
  };

  // to amend name to isActive instead

  const handleUpdateUser = () => {
    if (!reactData.email) {
      return;
    }

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
        oldGroups: userData.user_group,
      });
    }

    setReadOnly(!readOnly);
    setUserData(reactData);
    props.setAllUsers(reactData);
  };

  const [passwordReset, setPasswordReset] = useState(false);

  const handleResetPassword = () => {
    handlePostRequest("user/admin-password-reset", {
      username: reactData.username,
      email: reactData.email,
    });
    setPasswordReset(true);
  };

  return (
    <tr>
      <td>
        <input
          value={userData.username}
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
            return <div>{group.label}</div>;
          })
        ) : (
          <Dropdown
            multi={true}
            preselected={reactData.formatted_groups}
            options={props.options}
            closeMenuOnSelect={false}
            callback={(e) => {
              setReactData({ ...reactData, formatted_groups: e });
            }}
          ></Dropdown>
        )}
      </td>
      <td>
        {readOnly ? (
          <div>{reactData.status}</div>
        ) : (
          <input
            type="checkbox"
            checked={reactData.status === "Active" ? true : false}
            onChange={() => {
              if (reactData.status === "Active") {
                setReactData({ ...reactData, status: "Inactive" });
              } else {
                setReactData({ ...reactData, status: "Active" });
              }
            }}
          />
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
            <button btn onClick={handleUpdateUser}>
              Save
            </button>
            <button onClick={handleCancelChanges}>Cancel</button>
          </>
        )}
      </td>
    </tr>
  );
};
