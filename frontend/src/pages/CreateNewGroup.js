import { useState } from "react";
import handlePostRequest from "../hooks/handlePostRequest";

const CreateNewGroup = () => {
  const [message, setMessage] = useState("");
  const handleCreateGroup = async (e) => {
    e.preventDefault();

    const result = await handlePostRequest(`user/create-groups`, {
      group: e.target.groupName.value,
    });
    setMessage(result);
  };
  return (
    <form onSubmit={handleCreateGroup}>
      <label htmlFor="groupName">Create New Group</label>
      <input name="groupName" />
      <button>Submit</button>
      <p>{message}</p>
    </form>
  );
};

export default CreateNewGroup;
