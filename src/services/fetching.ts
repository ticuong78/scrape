export async function HTMLFetching(url: URL | String) {
  try {
    const dest = String(url);
    const response = await fetch(dest, {
      method: "GET",
    });

    if (!response.ok) throw new Error(`Failed to fetch ${dest}`);

    const doc = response.text();

    return doc;
  } catch (err) {
    console.error("Error fetching data:", err);
  }
}
