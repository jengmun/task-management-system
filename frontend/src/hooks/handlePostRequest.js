export default async function handlePostRequest(params, body) {
  try {
    const res = await fetch(`http://localhost:5000/${params}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    // console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}
