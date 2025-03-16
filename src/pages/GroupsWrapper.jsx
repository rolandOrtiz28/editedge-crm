import { useState } from "react";
import Groups from "./Groups";  // ✅ Import your existing Groups.jsx

const GroupsWrapper = () => {
  const [groups, setGroups] = useState([]);  // ✅ Declare state here

  return <Groups setGroups={setGroups} />;
};

export default GroupsWrapper;
