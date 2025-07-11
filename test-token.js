// Test script to check token expiration
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiT3duZXIiLCJuYW1lIjoib3duZXIiLCJ1c2VySWQiOiIxIiwiZXhwIjoxNzUyMjIxODM4LCJpc3MiOiJsb2NhbGhvc3QiLCJhdWQiOiJsb2NhbGhvc3QifQ.IgmuBdb6fm72lT2w3I9OCLek2vlEf7fZbWteGd0Um3o";

try {
  const payload = JSON.parse(atob(token.split(".")[1]));
  const currentTime = Math.floor(Date.now() / 1000);

  console.log("Token payload:", payload);
  console.log("Current time:", currentTime);
  console.log("Token expires at:", payload.exp);
  console.log("Time remaining:", Math.floor((payload.exp - currentTime) / 60), "minutes");
  console.log("Is expired?", payload.exp < currentTime);

  // Convert timestamps to readable dates
  console.log("Current time:", new Date(currentTime * 1000).toISOString());
  console.log("Token expires:", new Date(payload.exp * 1000).toISOString());
} catch (error) {
  console.error("Error parsing token:", error);
}
