import { useState, useEffect } from "react";
import Dropdown from "../../components/Dropdown";
import handleGetRequest from "../../hooks/handleGetRequest";
import handlePostRequest from "../../hooks/handlePostRequest";
import CreateNewGroup from "./CreateNewGroup";

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

  return (
    <div>
      <CreateNewGroup fetchAllGroups={fetchAllGroups} />
      <Dropdown
        multi={false}
        options={options}
        closeMenuOnSelect={true}
        callback={setSelectedGroup}
      />
      <h3>Group: {selectedGroup.label}</h3>
      {selectedGroup.value && (
        <>
          <h4>Current Members:</h4>
          <table>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {groupMembers.map((member, index) => {
                return (
                  <tr key={member.username}>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td>{member.status}</td>
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
                  <tr key={member.username}>
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
