import { useEffect, useState } from "react";

const Contact = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/contact", {
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

export default Contact;
