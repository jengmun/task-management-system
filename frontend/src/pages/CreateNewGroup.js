import { useState } from "react";
import handlePostRequest from "../hooks/handlePostRequest";

const CreateNewGroup = (props) => {
  const [message, setMessage] = useState("");
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    if (e.target.groupName.value) {
      const result = await handlePostRequest(`user/create-groups`, {
        group: e.target.groupName.value,
      });
      setMessage(result);
      props.fetchAllGroups();
    } else {
      setMessage("Please enter a group name");
    }
  };
  return (
    <form onSubmit={handleCreateGroup}>
      <label htmlFor="groupName">Create New Group</label>
      <input
        name="groupName"
        className="input input-bordered input-primary max-w-xs"
      />
      <button className="btn">Submit</button>
      <p>{message}</p>
    </form>
  );
};

export default CreateNewGroup;
