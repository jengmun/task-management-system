import { useState } from "react";
import handlePostRequest from "../../hooks/handlePostRequest";
import { Button, Card, TextField, Typography } from "@mui/material";

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
    <Card sx={{ width: "30%", p: 2 }}>
      <form
        onSubmit={handleCreateGroup}
        style={{ marginBottom: 10, display: "flex", flexDirection: "column" }}
      >
        <TextField
          id="groupName"
          label="Create New Group"
          variant="outlined"
          required
        />
        <Button type="submit" sx={{ mt: 2 }}>
          Submit
        </Button>
        <Typography>{message}</Typography>
      </form>
    </Card>
  );
};

export default CreateNewGroup;
