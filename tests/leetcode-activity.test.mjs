import assert from "node:assert/strict";
import test from "node:test";
import { fetchLeetCodeCalendar } from "../api/leetcode-activity.js";

test("LeetCode aligns UTC weeks across leap day and fills only unreported dates", async (t) => {
  const calendar = {
    [Date.parse("2024-02-29") / 1000]: 4,
    [Date.parse("2024-12-31") / 1000]: 2,
  };
  t.mock.method(globalThis, "fetch", async (_, request) => {
    const { query, variables } = JSON.parse(request.body);
    assert.deepEqual(variables, { username: "Mightbe_Syed" });
    for (const year of [2023, 2024, 2025])
      assert.ok(query.includes("y" + year + ":userCalendar"));
    return Response.json({
      data: {
        matchedUser: {
          username: variables.username,
          y2023: { submissionCalendar: "{}" },
          y2024: { submissionCalendar: JSON.stringify(calendar) },
          y2025: { submissionCalendar: "{}" },
        },
      },
    });
  });
  const { days } = await fetchLeetCodeCalendar(
    new Date("2025-01-01T23:30:00Z"),
  );
  assert.equal(days[0].date, "2023-12-31");
  assert.equal(days.at(-1).date, "2025-01-01");
  assert.equal(days.at(-1).level, 0);
  assert.equal(days.find((day) => day.date === "2024-02-29").count, 4);
  assert.equal(
    days.reduce((sum, day) => sum + day.count, 0),
    6,
  );
});

test("LeetCode rejects partial or malformed calendars instead of reporting no activity", async (t) => {
  const user = {
    username: "Mightbe_Syed",
    y2025: { submissionCalendar: "{}" },
  };
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({ data: { matchedUser: user } }),
  );
  const date = new Date("2026-08-01T00:00:00Z");
  await assert.rejects(fetchLeetCodeCalendar(date));
  user.y2026 = { submissionCalendar: '{"1767225600":-1}' };
  await assert.rejects(fetchLeetCodeCalendar(date));
});
