async function testFetch() {
  const username = "RasikhAli";
  const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
  console.log("Fetching:", url);
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Portfolio-CMS",
      "Accept": "application/vnd.github.v3+json"
    }
  });
  console.log("Status:", res.status);
  const data = await res.json();
  if (Array.isArray(data)) {
    console.log("Found repos count:", data.length);
    console.log("Sample repos:", data.slice(0, 3).map(r => r.name));
  } else {
    console.log("Response:", data);
  }
}
testFetch();
