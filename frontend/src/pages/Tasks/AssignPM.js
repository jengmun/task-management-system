import { useState, useEffect } from "react";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";

const AssignPM = () => {
  // ------------- Fetch all users -------------
  const [allUsers, setAllUsers] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleAssignPM = async (e) => {
    e.preventDefault();

    const data = await handlePostRequest("user/assign-PM", {
      acronym: e.target.acronym.value,
      username: e.target.user.value,
    });
    console.log(data);
  };

  return (
    <div>
      <h1>Assign PM to new Application</h1>
      <form onSubmit={handleAssignPM}>
        <label htmlFor="acronym">Application Acronym</label>
        <input
          id="acronym"
          name="acronym"
          minLength="3"
          maxLength="3"
          required
        />
        <label htmlFor="user">User</label>
        <select id="user" name="user">
          {allUsers.map((user) => {
            return <option value={user.username}>{user.username}</option>;
          })}
        </select>
        <button>Submit</button>
      </form>
    </div>
  );
};

export default AssignPM;
