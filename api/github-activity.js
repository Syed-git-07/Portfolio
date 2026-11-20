const ACCOUNT = "Syed-git-07";
const DAY = 86400000;
const TTL = 6 * 60 * 60 * 1000;
const levels = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
];
const colors = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

function attribute(tag, name) {
  return tag.match(new RegExp(" " + name + '="([^"]+)"'))?.[1];
}

function publicDays(html) {
  const counts = new Map();
  for (const [, tag, count] of html.matchAll(
    /(<tool-tip\b[^>]*>)\s*(No|[\d,]+) contributions? on [^<]+<\/tool-tip>/gi,
  )) {
    counts.set(
      attribute(tag, "for"),
      count === "No" ? 0 : Number(count.replaceAll(",", "")),
    );
  }
  return Array.from(
    html.matchAll(/<td\b[^>]* data-date="[^"]+"[^>]*>/g),
    ([tag]) => {
      const level = Number(attribute(tag, "data-level"));
      return {
        date: attribute(tag, "data-date"),
        count: counts.get(attribute(tag, "id")),
        level,
        color: colors[level],
      };
    },
  );
}

export async function fetchCalendar(token) {
  const signal = AbortSignal.timeout(10000);
  let days;
  if (token) {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      signal,
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query:
          '{user(login:"Syed-git-07"){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount contributionLevel color}}}}}}',
      }),
    });
    if (!response.ok) throw new Error("Calendar unavailable");
    const calendar = (await response.json()).data?.user?.contributionsCollection
      ?.contributionCalendar;
    days = calendar?.weeks.flatMap((week) =>
      week.contributionDays.map((day) => ({
        date: day.date,
        count: day.contributionCount,
        level: levels.indexOf(day.contributionLevel),
        color: day.color,
      })),
    );
  } else {
    const response = await fetch(
      "https://github.com/users/" + ACCOUNT + "/contributions",
      { signal, headers: { "Accept-Language": "en-US" } },
    );
    if (!response.ok) throw new Error("Calendar unavailable");
    days = publicDays(await response.text());
  }
  if (!days || days.length < 365 || days.length > 371)
    throw new Error("Incomplete calendar");
  days.sort((a, b) => a.date.localeCompare(b.date));
  days.forEach((day, i) => {
    if (
      !/^\d{4}-\d\d-\d\d$/.test(day.date) ||
      !Number.isSafeInteger(day.count) ||
      day.count < 0 ||
      !Number.isInteger(day.level) ||
      day.level < 0 ||
      day.level > 4 ||
      !/^#[\da-f]{6}$/i.test(day.color) ||
      (i && Date.parse(day.date) - Date.parse(days[i - 1].date) !== DAY)
    )
      throw new Error("Invalid calendar");
  });
  return { account: ACCOUNT, days };
}

let cached,
  expires = 0,
  pending;
export default async function activity(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end("{}");
    return;
  }
  try {
    if (!cached || Date.now() >= expires) {
      pending ??= fetchCalendar(process.env.GITHUB_ACTIVITY_TOKEN)
        .then((value) => {
          cached = value;
          expires = Date.now() + TTL;
        })
        .finally(() => {
          pending = undefined;
        });
      await pending;
    }
    res.setHeader(
      "Cache-Control",
      "public, max-age=900, s-maxage=21600, stale-while-revalidate=86400",
    );
    res.end(JSON.stringify(cached));
  } catch {
    res.setHeader("Cache-Control", "no-store");
    res.statusCode = cached ? 200 : 503;
    res.end(JSON.stringify(cached || { error: "Calendar unavailable" }));
  }
}
