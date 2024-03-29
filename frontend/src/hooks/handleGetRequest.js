export default async function handleGetRequest(params) {
  try {
    const res = await fetch(`http://localhost:5000/${params}`, {
      credentials: "include",
    });
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
