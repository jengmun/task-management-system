import { useState, useEffect } from "react";
import Dropdown from "../components/Dropdown";
import handleGetRequest from "../hooks/handleGetRequest";
import handlePostRequest from "../hooks/handlePostRequest";
import CreateNewGroup from "./CreateNewGroup";

const GroupManagement = () => {
  const [allGroups, setAllGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState({ value: "" });
  const [allUsers, setAllUsers] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [remainingUsers, setRemainingUsers] = useState([]);

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

  const fetchAllUsers = async () => {
    const data = await handleGetRequest("user/all-users");
    if (data) {
      setAllUsers(data);
    }
  };

  useEffect(() => {
    fetchAllGroups();
    fetchAllUsers();
  }, []);

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

  return (
    <div>
      <CreateNewGroup fetchAllGroups={fetchAllGroups} />
      <Dropdown
        multi={false}
        options={allGroups}
        closeMenuOnSelect={true}
        callback={setSelectedGroup}
      />
      <h3>Group: {selectedGroup.value}</h3>
      {selectedGroup.value && (
        <>
          <h4>Current Members:</h4>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                {/* <th>Role</th> */}
              </tr>
            </thead>

            <tbody>
              {groupMembers.map((member, index) => {
                return (
                  <tr>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td>{member.status}</td>
                    {/* <td>{member.username}</td> */}
                    <td>
                      <button
                        onClick={() => {
                          handleRemoveMember(member.username, index);
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <h4> Other Members:</h4>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {remainingUsers.map((member, index) => {
                return (
                  <tr>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td>{member.status}</td>
                    <td>
                      <button
                        onClick={() => {
                          handleAddMember(member.username, index);
                        }}
                      >
                        Add
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default GroupManagement;
