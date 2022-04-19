export default async function handleUpdateDetails(field, username, details) {
  try {
    await fetch("http://localhost:5000/update-details", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        field,
        username,
        details,
      }),
    });
  } catch (error) {
    console.error(error);
  }
}
