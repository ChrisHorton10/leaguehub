export const LAST_YEAR_FINISH = {
  "Broth22": 1,
  "ctracewell": 2,
  "Bdug14": 3,
  "kmyers": 4,
  "BCregg": 5,
  "GrimaceHugeSack": 6,
  "Gillilig": 7,
  "shazman123": 8,
  "ScubaSteve0709": 9,
  "chrishorton10": 10,
  "SamHuman12": 11,
  "Sher2Lose": 12
};

const MANAGER_PERSONAS = {
  "chrishorton10": {
    nickname: "Commish",
    persona: "Commissioner of the league. Cowboys die-hard, loves to gamble. Keep blurbs commissioner or Cowboys themed, maybe a gambling reference. Never roast him."
  },
  "BCregg": {
    nickname: "Cregg",
    persona: "Giants fan, known for aggressive trade offers (running league joke he denies), knows fantasy football deeply, hothead who can get into arguments, loves to gamble."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    persona: "Vibes guy, loves to joke around, lives in Cincinnati away from everyone else in the league."
  },
  "kmyers": {
    nickname: "Kyle",
    persona: "Browns fan, Nebraska fan, lovable guy, has made some bad trades and some good ones over the years."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    persona: "Short king, major rebuild mode, Bengals fan, always takes breaks from gambling to save himself and act like a good boy."
  },
  "Broth22": {
    nickname: "Brothers",
    persona: "Back to back league champion with a stacked roster. Doesn't make many trades and doesn't need to — just wins. Sometimes comes off careless about the game but the results speak for themselves. Light jokes about being a lib are fine but keep it very subtle, he's a genuinely nice guy."
  },
  "shazman123": {
    nickname: "Shaz",
    persona: "Pakistani, actual Packers fan and proud of it. Quietly competitive manager."
  },
  "ctracewell": {
    nickname: "Tracewell",
    persona: "Wannabe DJ, Browns fan. Made the championship game last year but his roster is old and not competitive right now — got lucky in the playoffs."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    persona: "Packers fan, goofy guy. Bears and Cowboys fans in the league give him grief about the Packers."
  },
  "Bdug14": {
    nickname: "Dlugos",
    persona: "League villain, Browns die-hard, best regular season record last year at 13-1 but lost in the semis. His brothers secretly help him manage his team which is an inside joke."
  },
  "SamHuman12": {
    nickname: "Sam",
    persona: "Nicest dude in the league, loves Clemson and Clemson NFL players, Bears fan, loves making trades, had rough seasons but team is on the come up. Hates the Packers."
  },
  "Gillilig": {
    nickname: "Gill",
    persona: "Bears fan, obsessed with Caleb Williams and Ohio State players, from middle of nowhere Ohio, the guys joke he is gay for Caleb Williams. Hates the Packers."
  }
};

export async function generateTeamBlurbs(rankings, isOffseason, week, rosterInjuries = {}, rosterPlayers = {}) {
  const teamSummaries = rankings.map((team, index) => {
    const persona = MANAGER_PERSONAS[team.username];
    const nickname = persona?.nickname || team.username;
    const personalityNote = persona?.persona || "";
    const injuries = rosterInjuries[team.username] || [];
    const players = rosterPlayers[team.username] || [];
    const injuryNote = injuries.length > 0
      ? `Injury concerns: ${injuries.join(", ")}`
      : "No major injury concerns";
    const rosterNote = players.length > 0
      ? `Key players: ${players.slice(0, 8).join(", ")}`
      : "Roster unknown";
    const lastYearFinish = LAST_YEAR_FINISH[team.username] || "unknown";

    return `#${index + 1} ${team.teamName} (${nickname})
Record: ${team.wins}-${team.losses} | Points: ${team.points.toFixed(1)} | Power Score: ${team.powerScore.toFixed(1)}
Last year finish: #${lastYearFinish}
About this manager: ${personalityNote}
${rosterNote}
${injuryNote}`;
  }).join("\n\n");

  const prompt = isOffseason
    ? `You are a sharp fantasy football analyst writing the preseason column for the Chiraq Dynasty League — a 12-team dynasty league of close friends who love football and genuinely know the game.

Write a preseason scouting report blurb for each team. Use your own knowledge of NFL players, their 2026 fantasy projections, ADP, injury history, breakout potential, and bust risk to inform your analysis. This is the 2026-27 dynasty season. Cross reference player knowledge with the actual roster provided. If a manager has elite players say so. If their roster is aging or thin at key positions call it out analytically.

Also factor in last year's finish — if someone won the championship or had a great season acknowledge it. If someone finished last or near the bottom, factor that in too.

The blurbs should get progressively more skeptical and critical as you go down the rankings. Top 3 should feel like contenders, middle of the pack should feel uncertain, bottom should feel like rebuilds or question marks.

Tone is Bill Simmons — witty, honest, personal. Not a roast but sharp commentary that reflects both who these guys are AND what their roster actually looks like.

Important rules:
- Use the nickname, never the team name
- Lead with football analysis first, personality second
- Be honest — if the team is bad based on the roster and last year's finish, say it
- No generic clichés like "one to watch" or "dark horse"
- 2 sentences max, under 40 words
- Return ONLY a valid JSON array of strings in the same order. No markdown, no text outside the array.

Teams:
${teamSummaries}`
    : `You are a sharp fantasy football analyst writing the week ${week} power rankings for the Chiraq Dynasty League.

Write a blurb for each team using your knowledge of NFL players — their current form, injury status, usage trends, and fantasy value — combined with the actual roster and record data provided.

The blurbs should get progressively more skeptical and critical as you go down the rankings. Top teams feel like contenders, bottom teams feel like they're in trouble.

Tone is Bill Simmons meets fantasy insider — smart, fun, honest. Fresh and original every week.

Important rules:
- Use the nickname, never the team name
- Lead with football analysis, weave personality in naturally
- Be honest about roster quality
- No repeated phrases or clichés
- 2 sentences max, under 40 words
- Return ONLY a valid JSON array of strings in order. No markdown, no extra text.

Teams:
${teamSummaries}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;

  console.log("API response:", JSON.stringify(data));

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch {
    return rankings.map(() => "Blurb unavailable.");
  }
}