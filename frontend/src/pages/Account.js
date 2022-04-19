import { useEffect, useState } from "react";

const Account = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/account", {
        credentials: "include",
      });
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return <div>{data}</div>;
};

export default Account;
