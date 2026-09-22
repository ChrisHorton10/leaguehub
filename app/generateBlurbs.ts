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
    context: "Commissioner. Cowboys die-hard with delusional annual confidence. Loves to gamble. Lead with roster analysis first — Cowboys blind faith as the closer only if it fits naturally."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan, Syracuse fan, Buffalo Sabres fan, Yankees fan. Gets into arguments when drunk. Big hockey and video game guy. Known as Germany — only reference if there is a genuinely fresh angle, do not recycle old lines. Got pushed out as manager of the league softball team lineup. Loves to gamble. RB depth is a real concern past his top options."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals and Saints fan. Purdue Boilermakers fan. Recently engaged — keep any reference positive or neutral, no marriage or couples jokes. Lives in Cincinnati. RB room past his top back is a real weakness. Do not mention JJ McCarthy."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan — two historically painful fanbases. Hungarian and makes sure people know it. Drives a Tesla — natural Elon or self-driving joke works if it fits, do not force it. Has been a trade pinata historically. Lovable guy. In golf he launches the ball but it rarely goes straight and really struggles with the wedge."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Always late to everything — do not use being late as a fantasy metaphor. Has real money on Bengals player outcomes. Known as France — reference once only if there is a fresh angle. Actively and intentionally tanking for the number one pick — deliberate strategy not a collapse."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. Clueless sometimes but keeps winning. Does not trade much. Whipped by his girlfriend Gabby but nobody holds it against him."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani, lives in Milwaukee. Packers fan. One of the few minority friends in the group. TSA or security threat joke works if genuinely fresh — do not recycle the same line every week."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and OSU fan. Does DJ sets on the side — gentle ribbing only. Moved to NYC a while back. Actively tanking for the number one pick. Do not mention his girlfriend."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Just moved to Milwaukee for a new job. Low drama, builds quietly. QB situation is a major concern. Do not hype Jayden Reed or Xavier Worthy as difference makers."
  },
"Bdug14": {
    nickname: "Dlugos",
    context: "Browns and OSU fan. Always talking about going to the gym — joke about him constantly bringing it up, never about his actual physique or muscles. League villain. 13-1 last year but lost in semis. His brother helps run the team — league inside joke. Recently acquired Saquon Barkley. Known as Russia — use once only if there is a fresh angle."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player in the NFL. Pessimistic by nature — especially about Clemson every year. Cade Klubnik just entered the NFL on the Jets. Active trader who tends to win his trades."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan in Chicago but gets called a bandwagon — roots for Duke, OSU, and the Bears. Obsessed with Caleb Williams succeeding. Big into Rocket League and hunting for a Caleb Williams sports card one of one. Has multiple starting-caliber QBs — QB situation is a strength. In golf the front nine looks great but the back nine is always a disaster."
  }
};

export async function generateTeamBlurbs(rankings: any[], isOffseason: boolean, week: number, rosterInjuries: any = {}, rosterPlayers: any = {}) {
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
Roster (sorted by projection — [STARTER] played this week, [BENCH] did not. OVERPERFORMED = significantly beat projection. BUSTED = significantly missed projection):
${players.slice(0, 12).join("\n")}
${injuryNote}`;
  }).join("\n\n");

  const styleExamples = `
STYLE EXAMPLES — write in this voice:

"Brothers — I mean if we are being real this team is on autopilot because all Brothers' time is spent at the theater supporting the head honcho of the relationship. Even on autopilot though, this team continues to dominate with massive point explosions every week behind monster RBs in Henry and Taylor and JSN looking like Randy Moss. I would give you your flowers but you need those for Gaby." 

"Shaz — Shaz had to lay low last week considering the time of the year which is probably why is his team underperformed so much in his matchup against Dlugos. Purdy is looking different and Jamarr is continuing to make Sherlock second guess the breakup but with Bijan and London on an offense led by the local make a wish kid, this team is going to continue having stale weeks and continue losing if he cannot shore up that flex spot. He just needs volunteers! He needs a flex spot for pakistannnn."

"Cregg — Dr. Raymond is looking more dangerous than he does on the road after a few drinks. But the best drunk driver on this side of the Mississippi is proving to everyone that not only can he get you to McDonald's at 3am without a scratch, but his team is heading towards a championship run. Josh Allen, Amon-Ra, and Kenneth Walker is the most dangerous offensive trio in the league. Keep drinking those surfsides Cregg, your team trusts you at the wheel."
`;

  const prompt = isOffseason
    ? `You are writing the preseason power rankings for the Chiraq Dynasty League — a 12-team dynasty league of close friends who love football, trash talk, and giving each other hell.

${styleExamples}

Write a preseason scouting report for each team. Dry, sharp, confident — like someone who knows these guys well. One well-placed observation per blurb, not forced jokes. Football analysis first, personality second.

Ranking tiers:
- #1-3: Genuine championship threats
- #4-6: Make the playoffs but have real questions
- #7-9: On the bubble
- #10-12: Rebuilding or tanking

Only use country nicknames if there is a genuinely fresh angle — do not recycle.

Rules:
- Use nickname only, never team name
- CRITICAL: Only reference players listed in the roster section. Do not add players from your own knowledge.
- Player team affiliations are listed — use them, do not guess where players play
- One sharp observation per blurb max
- Do not invent personality traits not in the manager context
- 5-6 sentences, 100-130 words
- Return ONLY a valid JSON array of strings in order. No markdown, no extra text.

Teams:
${teamSummaries}`
    : `You are writing the week ${week} power rankings for the Chiraq Dynasty League. These are POWER RANKINGS — not game recaps. The matchup recaps handle score breakdowns. Your job is big picture analysis.

${styleExamples}

For each team write a forward-looking assessment covering:
- Where this team stands in the league hierarchy right now
- Their key strengths — who are the real weapons on this roster
- Their genuine concerns — injuries, weak positions, depth issues
- How they performed vs expectations this week — relative performance vs projection, not raw scores
- Players who emerged as potential studs based on OVERPERFORMED flags
- Position imbalances that could lead to trades
- One natural closer — punchy, forward-looking, fits the team's situation

Do NOT lead with or center blurbs on specific point totals — that is the matchup recap job.

Only use country nicknames if there is a genuinely fresh angle — do not recycle old lines.

Rules:
- Use nickname only, never team name
- CRITICAL: Only reference players listed in the roster section with their correct team affiliations
- Players marked [STARTER] actually played — focus on them
- Players marked [BENCH] did not start — only mention if OVERPERFORMED significantly
- NEVER reference a backup QB's weekly points unless they are [STARTER] or clearly competing for the job
- When a player scored 30+ points note them as a potential difference maker
- Do not make definitive season-long statements from one week of data
- Identify position imbalances as potential trade opportunities
- Do not recycle the same personality jokes from previous weeks
- One personality observation per blurb max — analysis comes first
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