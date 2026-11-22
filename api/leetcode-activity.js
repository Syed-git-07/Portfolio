const ACCOUNT = "Mightbe_Syed";
const DAY = 86_400_000;
const colors = ["#e1e8e4", "#f3d49c", "#e8b65e", "#cd9336", "#a8691d"];

// LeetCode's epoch keys represent UTC calendar dates, not local submission times.
export async function fetchLeetCodeCalendar(now = new Date()) {
  const end = Date.parse(now.toISOString().slice(0, 10));
  const start = end - (364 + new Date(end).getUTCDay()) * DAY;
  const years = [];
  for (
    let year = new Date(start).getUTCFullYear();
    year <= now.getUTCFullYear();
    year++
  )
    years.push(year);
  const fields = years.map(
    (year) => `y${year}:userCalendar(year:${year}){submissionCalendar}`,
  );
  const response = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com/u/Mightbe_Syed/",
    },
    signal: AbortSignal.timeout(10000),
    body: JSON.stringify({
      query: `query Calendar($username:String!){matchedUser(username:$username){username ${fields.join(" ")}}}`,
      variables: { username: ACCOUNT },
    }),
  });
  if (!response.ok) throw new Error("Calendar unavailable");
  const { data, errors } = await response.json();
  const user = data?.matchedUser;
  if (errors?.length || user?.username !== ACCOUNT)
    throw new Error("Profile unavailable");
  const counts = new Map();
  for (const year of years) {
    const calendar = JSON.parse(user[`y${year}`]?.submissionCalendar);
    if (!calendar || typeof calendar !== "object" || Array.isArray(calendar))
      throw new Error("Invalid calendar");
    for (const [key, count] of Object.entries(calendar)) {
      const time = Number(key) * 1000;
      if (
        !/^\d+$/.test(key) ||
        !Number.isSafeInteger(time) ||
        time % DAY !== 0 ||
        !Number.isSafeInteger(count) ||
        count < 0
      )
        throw new Error("Invalid day");
      if (new Date(time).getUTCFullYear() === year) counts.set(time, count);
    }
  }
  const days = [];
  for (let time = start; time <= end; time += DAY) {
    const count = counts.get(time) ?? 0;
    const level =
      count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
    days.push({
      date: new Date(time).toISOString().slice(0, 10),
      count,
      level,
      color: colors[level],
    });
  }
  return { account: ACCOUNT, days };
}

let cached,
  pending,
  nextRefresh = 0;
export default async function activity(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    return res.end("{}");
  }
  if (Date.now() >= nextRefresh) {
    pending ??= fetchLeetCodeCalendar()
      .then((value) => {
        cached = value;
        nextRefresh = Date.now() + 6 * 3600000;
      })
      .catch(() => {
        nextRefresh = Date.now() + 60000;
      })
      .finally(() => {
        pending = undefined;
      });
    await pending;
  }
  res.statusCode = cached ? 200 : 503;
  res.setHeader(
    "Cache-Control",
    cached
      ? "public, max-age=900, s-maxage=21600, stale-while-revalidate=86400"
      : "no-store",
  );
  res.end(JSON.stringify(cached ?? { error: "Calendar unavailable" }));
}
