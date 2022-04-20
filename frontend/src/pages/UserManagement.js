import React, { useEffect, useState } from "react";
import handleGetRequest from "../hooks/handleGetRequest";

const UserManagement = () => {
  // Fetch all users
  const [users, setUsers] = useState([]);

  // New user creation
  const [newEmail, setNewEmail] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newGroup, setNewGroup] = useState("");

  // Update user details
  const [user, setUser] = useState("");
  const [changePassword, setChangePassword] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/all-users", {
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // const handleCreateNewUser = async () => {
  //   try {
  //     const res = await fetch("http://localhost:5000/create-account", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         username: newUsername,
  //         password: newPassword,
  //         email: newEmail,
  //         group: newGroup,
  //       }),
  //     });
  //     const data = await res.json();
  //     console.log(data);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  // const handleUpdateDetails = async (field) => {
  //   try {
  //     await fetch("http://localhost:5000/update-details", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         field: field,
  //         username: user,
  //         details: field === "password" ? changePassword : updateEmail,
  //       }),
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const handleDisableUser = async () => {
    try {
      await fetch("http://localhost:5000/disable-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: user,
        }),
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Create New User</h1>
      <label htmlFor="new-email">Email</label>
      <input
        id="new-email"
        name="new-email"
        onChange={(e) => setNewEmail(e.target.value)}
      />
      <label htmlFor="new-username">Username</label>
      <input
        id="new-username"
        name="new-username"
        onChange={(e) => setNewUsername(e.target.value)}
      />
      <label htmlFor="new-password">Password</label>
      <input
        id="new-password"
        name="new-password"
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <label htmlFor="new-group">Group</label>
      <input
        id="new-group"
        name="new-group"
        onChange={(e) => setNewGroup(e.target.value)}
      />
      <input
        type="submit"
        // onClick={() =>
        //   handleCreateNewUser(newUsername, newPassword, newEmail, newGroup)
        // }
      />

      <h1>Update user information</h1>
      <label htmlFor="user">User</label>
      <select
        onChange={(e) => {
          setUser(e.target.value);
        }}
      >
        <option disabled selected>
          Select user
        </option>
        {users.map((user) => {
          return <option value={user.username}>{user.username}</option>;
        })}
      </select>

      <h1>Change password</h1>
      <label htmlFor="update-password">Password</label>
      <input
        id="update-password"
        name="update-password"
        onChange={(e) => setChangePassword(e.target.value)}
      />
      <input
        type="submit"
        // onClick={() => handleUpdateDetails("password", user, changePassword)}
      />

      <h1>Update email information</h1>
      <label htmlFor="update-email">Email</label>
      <input
        id="update-email"
        name="update-email"
        onChange={(e) => setUpdateEmail(e.target.value)}
      />
      <input
        type="submit"
        // onClick={() => handleUpdateDetails("email", user, updateEmail)}
      />

      <h1>Disable user</h1>
      <input
        type="submit"
        value="Disable"
        onClick={() => handleDisableUser()}
      />
    </div>
  );
};

export default UserManagement;
