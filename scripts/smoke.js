const port = process.env.PORT || 3500;
const base = `http://localhost:${port}`;

async function main() {
  try {
    console.log(`Running smoke tests against ${base}`);
    const root = await fetch(base + '/');
    console.log('GET / ->', root.status);
    if (root.status !== 200) throw new Error('GET / failed');

    const emp = await fetch(base + '/employees');
    console.log('GET /employees ->', emp.status);
    // expecting 401 because no token
    if (![200,401,403].includes(emp.status)) throw new Error('/employees unexpected status');

    console.log('Smoke tests passed');
    return true;
  } catch (err) {
    console.error('Smoke tests failed:', err.message || err);
    return false;
  }
}

main().then(success => {
  if (!success) process.exit(1);
});
