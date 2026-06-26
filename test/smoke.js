// Simple smoke tests for express_user_roles
const base = process.env.BASE_URL || 'http://localhost:3501';
const make = (path) => `${base}${path}`;

const uniqueUser = `testuser_${Date.now()}`;
const pwd = 'TestPass123!';

async function run() {
  console.log('Checking', make('/'));
  let res = await fetch(make('/'));
  console.log('/', res.status);

  console.log('Registering user', uniqueUser);
  res = await fetch(make('/register'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: uniqueUser, pwd })
  });
  console.log('/register', res.status);
  if (res.status !== 201) {
    const body = await res.text();
    console.error('Register failed:', body);
    process.exit(1);
  }

  console.log('Logging in');
  res = await fetch(make('/auth'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: uniqueUser, pwd })
  });
  console.log('/auth', res.status);
  if (res.status !== 200) {
    console.error('Login failed');
    process.exit(1);
  }
  const { accessToken } = await res.json();

  console.log('Fetching employees with access token');
  res = await fetch(make('/employees'), {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  console.log('/employees', res.status);
  if (res.status !== 200) {
    console.error('Employees fetch failed');
    process.exit(1);
  }

  console.log('Smoke tests passed');
}

run().catch(err => { console.error(err); process.exit(1); });
