export default async function handleCreateNewUser(
  username,
  password,
  email,
  group = null
) {
  try {
    const res = await fetch("http://localhost:5000/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        password,
        email,
        group,
      }),
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
