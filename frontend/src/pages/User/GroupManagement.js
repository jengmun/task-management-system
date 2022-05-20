import { useState, useEffect } from "react";
import Dropdown from "../../components/Dropdown";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import CreateNewGroup from "./CreateNewGroup";
import {
  Box,
  Button,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import GroupAddRoundedIcon from "@mui/icons-material/GroupAddRounded";
import GroupRemoveRoundedIcon from "@mui/icons-material/GroupRemoveRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { useTheme } from "@mui/system";

const GroupManagement = () => {
  // ------------- Fetch all groups -------------
  const [allGroups, setAllGroups] = useState([]);

  const fetchAllGroups = async () => {
    const data = await handleGetRequest("user/all-groups");
    if (data) {
      setAllGroups(data);
    }
  };

  // ------------- Fetch all users -------------
  const [allUsers, setAllUsers] = useState([]);

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
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
    fetchAllGroups();
    fetchAllUsers();
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

  const [groupMembers, setGroupMembers] = useState([]);
  const [remainingUsers, setRemainingUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState({ value: null });

  const fetchGroupMembers = async () => {
    const data = await handlePostRequest("user/groups-users", {
      group: selectedGroup.value,
    });
    setGroupMembers(data);
  };

  useEffect(() => {
    fetchGroupMembers();
  }, [selectedGroup]);

  useEffect(() => {
    const membersArr = [];
    for (const user of allUsers) {
      if (!groupMembers.find(({ username }) => username === user.username)) {
        membersArr.push(user);
      }
    }
    setRemainingUsers(membersArr);
  }, [groupMembers]);

  const handleRemoveMember = (username, index) => {
    const members = [...groupMembers];
    members.splice(index, 1);
    setGroupMembers(members);

    handlePostRequest("user/remove-group-member", {
      username: username,
      group: selectedGroup.value,
    });
  };

  const handleAddMember = async (username, index) => {
    const members = [...groupMembers];
    members.push(remainingUsers[index]);
    setGroupMembers(members);

    handlePostRequest("user/add-group-member", {
      username: username,
      group: selectedGroup.value,
    });
  };

  const [open, setOpen] = useState(false);

  const theme = useTheme();

  return (
    <div style={{ width: "95%", marginTop: 10 }}>
      <Box
        sx={{
          display: "flex",
          mb: 2,
          flexDirection: "column",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="h3">Group Management</Typography>
        <Modal
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        >
          <CreateNewGroup fetchAllGroups={fetchAllGroups} />
        </Modal>
        <Button
          variant="contained"
          color="info"
          onClick={() => {
            setOpen(true);
          }}
          sx={{ mt: 1 }}
        >
          <AddBoxIcon sx={{ mr: 0.5 }} />
          New Group
        </Button>
      </Box>
      <Dropdown
        multi={false}
        options={options}
        closeMenuOnSelect={true}
        callback={setSelectedGroup}
      />
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2, mt: 2 }}>
        Group: {selectedGroup.label}
      </Typography>
      {selectedGroup.value && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-around",
          }}
        >
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: "20px",
              p: 5,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.33)",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Current Members:
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: "center" }}>Username</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {groupMembers.map((member, index) => {
                  return (
                    <TableRow key={member.username}>
                      <TableCell sx={{ textAlign: "center" }}>
                        {member.username}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {member.email}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <CircleRoundedIcon
                          color={
                            member.status === "Active" ? "success" : "error"
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button
                          onClick={() => {
                            handleRemoveMember(member.username, index);
                          }}
                        >
                          <GroupRemoveRoundedIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: "20px",
              p: 5,
              boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.33)",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ textAlign: "center" }}>
              Other Members:
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ textAlign: "center" }}>Username</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Status</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {remainingUsers.map((member, index) => {
                  return (
                    <TableRow key={member.username}>
                      <TableCell sx={{ textAlign: "center" }}>
                        {member.username}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        {member.email}
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <CircleRoundedIcon
                          color={
                            member.status === "Active" ? "success" : "error"
                          }
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: "center" }}>
                        <Button
                          onClick={() => {
                            handleAddMember(member.username, index);
                          }}
                        >
                          <GroupAddRoundedIcon color="error" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Box>
      )}
    </div>
  );
};

export default GroupManagement;
