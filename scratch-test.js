const API_URL = "http://localhost:5000";
const email = `testuser_${Date.now()}@example.com`;
const password = "Password123!";

async function testAuth() {
  console.log(`Starting Auth Flow Test...`);
  
  // 1. Signup
  console.log(`\n1. Testing Signup with ${email}...`);
  const signupRes = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Test User",
      email: email,
      dob: "1990-01-01",
      password: password
    })
  });
  const signupText = await signupRes.text();
  console.log(`Signup Status: ${signupRes.status}`);
  console.log(`Signup Response: ${signupText}`);
  
  // 2. Login
  console.log(`\n2. Testing Login with ${email}...`);
  const loginRes = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const loginText = await loginRes.text();
  console.log(`Login Status: ${loginRes.status}`);
  console.log(`Login Response: ${loginText}`);
  
  let token = null;
  try {
    const loginData = JSON.parse(loginText);
    token = loginData.token;
  } catch (e) {}

  if (!token) {
    console.log("No token received, skipping GET /me");
    return;
  }

  // 3. Get Current User
  console.log(`\n3. Testing GET /api/auth/me...`);
  const meRes = await fetch(`${API_URL}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const meText = await meRes.text();
  console.log(`Me Status: ${meRes.status}`);
  console.log(`Me Response: ${meText}`);
}

testAuth().catch(console.error);
