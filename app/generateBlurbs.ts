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
    context: "Commissioner. Cowboys die-hard with delusional annual confidence — has been saying the Cowboys are going to turn it around for 15 years. Loves to gamble. Lead with roster analysis — Cowboys blind faith as the closer only if it fits naturally."
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
    context: "Browns and Nebraska fan — two historically painful fanbases. Hungarian and makes sure people know it. Drives a Tesla. Has been a trade pinata historically. Lovable guy. RB room is the real weakness on this team. In golf he launches the ball but it rarely goes straight and struggles with the wedge."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Always late to everything — do not use being late as a fantasy metaphor. Has real money on Bengals player outcomes. Known as France — only if genuinely fresh angle. Actively and intentionally tanking for the number one pick — deliberate strategy. Has draft capital and young pieces to build around."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. Clueless sometimes but keeps winning. Does not trade much. Whipped by his girlfriend Gabby but nobody holds it against him. The most dangerous boring team in the league."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani, lives in Milwaukee. Packers fan. One of the few minority friends in the group. Security threat and TSA jokes work if genuinely fresh — commit to the bit or skip it entirely. Boom or bust nature of some of his players is a recurring theme."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and OSU fan. Does DJ sets on the side — gentle ribbing only. Moved to NYC a while back. Actively tanking for the number one pick. Do not mention his girlfriend. Roster is thin and getting thinner."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Just moved to Milwaukee for a new job. Low drama, builds quietly. QB situation is a major concern AND WR room is thin. Do not hype Jayden Reed or Xavier Worthy as difference makers. Carried entirely by his RB room — Gibbs and Jeanty are doing heroic work."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns and OSU fan. Always talking about going to the gym — joke about him constantly bringing it up, never about his actual physique or muscles. League villain energy. 13-1 last year but lost in semis. His brother helps run the team — league inside joke. Recently acquired Saquon Barkley. Known as Russia — only if genuinely fresh angle, do not repeat old lines."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player in the NFL. Pessimistic by nature — especially about Clemson every year. Active trader who sometimes wins and sometimes loses. Currently in no man's land — not bad enough to tank, not good enough to contend. Do not reference Cade Klubnik or the Jets — that joke has been used."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan in Chicago but gets called a bandwagon — roots for Duke, OSU, and the Bears. Obsessed with Caleb Williams succeeding. Big into Rocket League and hunting for a Caleb Williams sports card one of one. Has multiple starting-caliber QBs — the weekly decision of who to start is the interesting storyline. CMC coming back is the reset button for this team."
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
STYLE EXAMPLES — this is the exact voice to match. Personal, specific, commits to the bit. Edge comes from specificity and truth, not forced jokes:

"Brothers — Lost his ID after going perfect last week and somehow that was the most stressful part of his week because this team is on full autopilot. Henry and Taylor are the most punishing RB room in the league and it is not close, Kittle is quietly becoming the best TE in this format, and Chuba Hubbard giving you a bonus week off the bench is the kind of depth that wins championships in January. 4-0 with Wilson and Tuten still on the bench. The most dangerous boring team in the league."

"Cregg — The Yankees season is ending and the Sabres season is just getting started, which is a pretty accurate metaphor for what is happening with Cregg's fantasy team right now. Allen, Amon-Ra, Walker, and Higgins are a top-four core that nobody in this league wants to see across the matchup, and the Aaron Jones addition from the Tracewell fire sale quietly gave this RB room the depth it was missing all season. The Sabres are not the horse to bet on this winter but his fantasy team just might be."

"Shaz — Bijan, London, and Hockenson are looking like dawgs for the rest of this season and Kyler Murray keeps feeding Hockenson like he is the only receiver on the field, which at this point might actually be true. Chase going down hurts but this team has enough top-end firepower to absorb it if Brian Robinson stops stealing touchdowns from Bijan in the red zone. Montgomery and Doubs remain boom or bust — Shaz loves the boom, and the league is well aware he has a complicated relationship with the other thing that rhymes with it."

"Gill — This team is a collection of guys with enormous upside who keep finding new ways to disappoint, kind of like a Caleb Williams one of one that keeps losing value every time he gets carted off the field. CMC coming back is the reset button — if he stays healthy this team has a real second half of the season."

"Tracewell — 0-4 and just traded away Aaron Jones, his last viable running back, leaving behind what is essentially a roster you would find on a middle school waiver wire. The DJ sets in NYC are getting more action than this lineup right now and at least the music is good. The number one pick is the destination, Tracewell is fully committed whether he meant to be or not, and somewhere in NYC a playlist is already being built for the draft party."
`;

  const prompt = `You are writing the week ${week} power rankings for the Chiraq Dynasty League — a 12-team dynasty league of close friends who love football, trash talk, and giving each other hell.

${styleExamples}

CRITICAL STYLE NOTE: Match this voice exactly. Edge and humor come from specific, true observations — not forced jokes. The best lines make people laugh because they are accurate, not because they are trying to be funny. Commit fully to every observation. If it is uncomfortable, say it anyway. Do not soften anything.

${weeklyNotes ? `WEEKLY CONTEXT — use these timely notes for relevant jokes and references:\n${weeklyNotes}\n` : ''}
${lastWeekBlurbs.length > 0 ? `LAST WEEK'S BLURBS — do not repeat any joke, reference, or observation already used. Find completely fresh angles:\n${lastWeekBlurbs.join("\n\n")}\n` : ''}

These are POWER RANKINGS — not game recaps. Big picture analysis with personality. The matchup recaps handle score breakdowns.

For each team cover:
- Where this team stands and where they are headed
- CRITICAL: The top 2-3 scorers on this team MUST be mentioned by name — do not skip a player just because they had one bad week
- Key strengths and genuine concerns — call out multiple weaknesses if they exist
- Players who have been consistently underperforming week after week should be called out directly — "been a ghost," "hasn't shown up," etc.
- Do NOT pile on a player for one bad week — one off week from a reliable player is noise, not a trend
- Position imbalances that could lead to trades
- One sharp closer that fits the team's situation

Ranking tiers:
- #1-3: Championship contenders
- #4-6: Playoff teams with real questions
- #7-9: Fighting to stay relevant
- #10-12: Tanking or in trouble

Rules:
- Use nickname only, never team name
- CRITICAL: Only reference players listed in the roster section with their correct team affiliations
- Players marked [STARTER] actually played — focus on them. Never say a team lacks a starter at a position if one is marked [STARTER]
- Players marked [BENCH] did not start — only mention if they scored 15+ points AND significantly beat projection
- NEVER reference a backup QB's weekly points unless they are [STARTER]
- Do not make definitive statements from one week of data — one bad week is noise
- Only mention total season points when it adds to the narrative
- Do not repeat any joke or reference from last week
- Do not joke about anyone's physique or appearance
- CRITICAL: Always write records as numerals — "2-0" never "two and oh"
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