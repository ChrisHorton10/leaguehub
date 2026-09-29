export const LAST_YEAR_FINISH: Record<string, number> = {
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

const MANAGER_PERSONAS: Record<string, { nickname: string; context: string }> = {
  "chrishorton10": {
    nickname: "Commish",
    context: "Commissioner. Cowboys die-hard with delusional annual confidence. Loves to gamble. Lead with roster analysis — Cowboys blind faith as the closer only if it fits naturally."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan, Syracuse fan, Buffalo Sabres fan, Yankees fan. Gets into arguments when drunk. Big hockey and video game guy. Known as Germany — only if genuinely fresh angle. Got pushed out as manager of the league softball team lineup. Loves to gamble. RB depth is a real concern past his top options."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals and Saints fan. Purdue Boilermakers fan. Recently engaged — keep any reference positive or neutral, no marriage jokes. Lives in Cincinnati. RB room past his top back is a real weakness. Do not mention JJ McCarthy."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan — two historically painful fanbases. Hungarian and makes sure people know it. Drives a Tesla — natural joke works if it fits, do not force it. Has been a trade pinata historically. Lovable guy. RB room is the real weakness on this team. In golf he launches the ball but it rarely goes straight and struggles with the wedge."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Always late to everything — do not use being late as a fantasy metaphor. Has real money on Bengals player outcomes. Known as France — only if genuinely fresh angle. Actively and intentionally tanking for the number one pick — deliberate strategy."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. Clueless sometimes but keeps winning. Does not trade much. Whipped by his girlfriend Gabby but nobody holds it against him."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani, lives in Milwaukee. Packers fan. One of the few minority friends in the group. Security threat and TSA jokes work if genuinely fresh — commit to the bit or skip it entirely."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and OSU fan. Does DJ sets on the side — gentle ribbing only. Moved to NYC a while back. Actively tanking for the number one pick. Do not mention his girlfriend."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Just moved to Milwaukee for a new job. Low drama, builds quietly. Has multiple weaknesses — QB situation is a major concern AND WR room is thin. Do not hype Jayden Reed or Xavier Worthy as difference makers. Carried by his RB room."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns and OSU fan. Always talking about going to the gym — joke about him constantly bringing it up, never about his actual physique or muscles. League villain energy. 13-1 last year but lost in semis. His brother helps run the team — league inside joke. Recently acquired Saquon Barkley. Known as Russia — only if genuinely fresh angle, do not repeat old lines."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player in the NFL. Pessimistic by nature — especially about Clemson every year. Active trader who tends to win his trades. Do not reference Cade Klubnik or the Jets — that joke has been used already."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan in Chicago but gets called a bandwagon — roots for Duke, OSU, and the Bears. Obsessed with Caleb Williams succeeding. Big into Rocket League and hunting for a Caleb Williams sports card one of one. Has multiple starting-caliber QBs — the weekly decision of who to start is the interesting storyline."
  }
};

export async function generateTeamBlurbs(rankings: any[], isOffseason: boolean, week: number, rosterInjuries: any = {}, rosterPlayers: any = {}, weeklyNotes: string = "", lastWeekBlurbs: string[] = []) {
  const teamSummaries = rankings.map((team, index) => {
    const persona = (MANAGER_PERSONAS as any)[team.username];
    const nickname = persona?.nickname || team.username;
    const context = persona?.context || "";
    const injuries = rosterInjuries[team.username] || [];
    const players = rosterPlayers[team.username] || [];
    const lastYearFinish = (LAST_YEAR_FINISH as any)[team.username] || "unknown";
    const injuryNote = injuries.length > 0 ? `Injury concerns: ${injuries.join(", ")}` : "No major injury concerns";

    return `#${index + 1} ${team.teamName} (${nickname})
Record: ${team.wins}-${team.losses} | Season points: ${team.points.toFixed(1)} | Week ${week} actual: ${team.actualPts ? team.actualPts.toFixed(1) : 'N/A'}
Last year finish: #${lastYearFinish}
Manager context: ${context}
CRITICAL: The following is the ONLY list of players on this team. Do not reference any player not on this list.
Roster ([STARTER] played this week, [BENCH] did not. OVERPERFORMED = beat projection by 20%+. BUSTED = missed projection by 50%+. 30+ POINT GAME = elite performance):
${players.slice(0, 12).join("\n")}
${injuryNote}`;
  }).join("\n\n");

  const styleExamples = `
STYLE EXAMPLES — this is the exact voice to match. Personal, specific, commits to the bit:

"Brothers — I mean if we are being real this team is on autopilot because all Brothers' time is spent at the theater supporting the head honcho of the relationship. Even on autopilot though, this team continues to dominate with massive point explosions every week behind monster RBs in Henry and Taylor and JSN looking like Randy Moss. I would give you your flowers but you need those for Gabby."

"Shaz — Purdy dropped a 30+ point game and Bijan Robinson looked like an absolute monster, which is exactly what this team needs to stay dangerous. Ja'Marr Chase and Drake London both outperformed, meaning Shaz had four studs firing on the same week — that does not happen every Sunday. The concern here is the flex position still, with the Packers being genuinely bad this year and Brian Thomas continuing to underperform, the flex spot will be the thing that makes or breaks this team. Mark Andrews busted and is questionable moving forward, so that TE situation needs monitoring. We will see if the floor continues to hold strong or if it all comes crashing down like the ball cleaner he ran over this past weekend. Fuck the Brewers."

"Cregg — Dr. Raymond is looking more dangerous than he does on the road after a few drinks. But the best drunk driver on this side of the Mississippi is proving to everyone that not only can he get you to McDonald's at 3am without a scratch, but his team is heading towards a championship run. Josh Allen, Amon-Ra, and Kenneth Walker is the most dangerous offensive trio in the league. Keep drinking those surfsides Cregg, your team trusts you at the wheel."
`;

  const prompt = `You are writing the week ${week} power rankings for the Chiraq Dynasty League — a 12-team dynasty league of close friends who love football, trash talk, and giving each other hell.

${styleExamples}

CRITICAL STYLE NOTE: The examples above are the exact voice to match. These blurbs should feel like they were written by someone who knows every person in this league personally and has zero filter. Commit fully to the bit. If the joke is obvious, make it. If the analysis is uncomfortable, say it anyway. Do not soften anything. The best blurbs make people laugh and wince at the same time.

${weeklyNotes ? `WEEKLY CONTEXT — use these timely notes to add relevant jokes and references this week:\n${weeklyNotes}\n` : ''}
${lastWeekBlurbs.length > 0 ? `LAST WEEK'S BLURBS — do not repeat any jokes, references, or observations already used:\n${lastWeekBlurbs.join("\n\n")}\n` : ''}

These are POWER RANKINGS — not game recaps. The matchup recaps handle score breakdowns. Your job is big picture analysis with personality.

For each team cover:
- Where this team stands right now and where they are headed
- Key strengths and genuine concerns — a team can have multiple weaknesses, call them all out
- How they performed vs expectations this week — relative performance, not raw scores
- Players who emerged as studs based on OVERPERFORMED or 30+ POINT GAME flags — only if they scored 15+ points
- Position imbalances that could lead to trades
- One sharp closer — punchy, forward-looking, fits the team

Ranking tiers:
- #1-3: Playing like championship contenders
- #4-6: Playoff teams with questions
- #7-9: Fighting to stay relevant
- #10-12: In trouble or tanking

Rules:
- Use nickname only, never team name
- CRITICAL: Only reference players listed in the roster section with their correct team affiliations
- Players marked [STARTER] actually played this week — this IS the starting lineup. Never say a team lacks a starter at a position if a player at that position is marked [STARTER].
- Players marked [BENCH] did not start — only mention if they scored 15+ points AND significantly beat their projection
- NEVER reference a backup QB's weekly points unless they are [STARTER]
- Do not make definitive season-long statements from limited data — one bad week from a top 10 player is noise not a trend
- Do not suggest a top tier player is underperforming based on one or two weeks
- Only mention total season points when it tells a meaningful story
- Identify position imbalances as potential trade opportunities
- Do not repeat any joke, reference, or observation from last week's blurbs
- Do not joke about anyone's physique or appearance
- CRITICAL: Always write records as numerals: "2-0" "1-1" never "two and oh" or spelled out
- 5-6 sentences, 100-130 words
- Return ONLY a valid JSON array of strings in order. No markdown, no extra text.

Teams:
${teamSummaries}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();
  const text = data.content[0].text;

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.log("Blurb parse error:", e);
    console.log("Raw text received:", text);
    return rankings.map(() => "Blurb unavailable.");
  }
}