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
    context: "Commissioner. Cowboys die-hard — has been saying the Cowboys are going to turn it around for 15 years. Loves to gamble. Bowers and Olave are the engines of this team."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan, Sabres fan, Yankees fan. Starts arguments when drunk. Big hockey guy. Got pushed out as lineup manager of the league softball team. Loves to gamble. Germany nickname — only if genuinely fresh. Amon-Ra and Tee Higgins coming back will change this team's ceiling."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals and Saints fan. Purdue fan. Recently engaged. Lives in Cincinnati. RB room is a disaster. 0-5 but averaging over 118 points a game — the most snake-bitten team in the league."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan. Hungarian. Drives a Tesla. Trade pinata historically. RB room is the real weakness. In golf launches it far but never straight, terrible with the wedge."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Late to everything — do not use as fantasy metaphor. Has money on Bengals outcomes. France nickname — only if fresh. Deliberately tanking for the number one pick. Has young pieces and draft capital to build around."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back champion. Clueless sometimes but keeps winning. Does not trade much. Whipped by girlfriend Gabby. The most dangerous boring team in the league."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani, lives in Milwaukee. Packers fan. One of the few minority friends in the group. TSA and security threat jokes work if genuinely fresh. Boom or bust nature of some players is a recurring theme."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and OSU fan. DJs on the side. Lives in NYC. Actively tanking. Roster is a middle school waiver wire. Do not mention his girlfriend."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Just moved to Milwaukee. Carried entirely by Gibbs and Jeanty. QB and WR room are both genuine problems. Do not hype Reed or Worthy."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns and OSU fan. Constantly talks about the gym — joke about bringing it up, never about his physique. League villain. 13-1 last year, lost in semis. Brother runs the team — inside joke. Has Saquon Barkley. Russia nickname — only if fresh, do not repeat old lines."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player. Pessimistic by nature about Clemson every year. Active trader. 3-2 but roster has real depth concerns. Do not reference Klubnik or the Jets — already used."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan, bandwagon — roots for Duke, OSU, Bears. Obsessed with Caleb Williams. Into Rocket League and hunting a Caleb Williams one of one. Multiple QBs — weekly decision is the storyline. CMC back is the reset button."
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
CRITICAL: Only reference players on this list. Do not add players from your own knowledge.
Roster ([STARTER] = played this week, [BENCH] = did not. OVERPERFORMED = beat projection 20%+. BUSTED = missed projection 50%+. 30+ POINT GAME = elite):
${players.slice(0, 12).join("\n")}
${injuryNote}`;
  }).join("\n\n");

  const styleExamples = `
VOICE EXAMPLES — match this exactly. Sharp, personal, commits to the bit. Edge comes from truth not forced jokes:

"Brothers — Lost his ID after going perfect last week and somehow that was the most stressful part of his week because this team is on full autopilot. Henry and Taylor are the most punishing RB room in the league and it is not close, Kittle is quietly becoming the best TE in this format, and Chuba Hubbard giving you a bonus week off the bench is the kind of depth that wins championships in January. 4-0 with Wilson and Tuten still on the bench. The most dangerous boring team in the league."

"Cregg — The Yankees season is ending and the Sabres season is just getting started, which is a pretty accurate metaphor for what is happening with Cregg's fantasy team right now. Allen, Amon-Ra, Walker, and Higgins are a top-four core that nobody in this league wants to see across the matchup, and the Aaron Jones addition from the Tracewell fire sale quietly gave this RB room the depth it was missing all season. The Sabres are not the horse to bet on this winter but his fantasy team just might be."

"Shaz — Bijan, London, and Hockenson are looking like dawgs for the rest of this season and Kyler Murray keeps feeding Hockenson like he is the only receiver on the field, which at this point might actually be true. Chase going down hurts but this team has enough top-end firepower to absorb it if Brian Robinson stops stealing touchdowns from Bijan in the red zone. Montgomery and Doubs remain boom or bust — Shaz loves the boom, and the league is well aware he has a complicated relationship with the other thing that rhymes with it."

"Gill — This team is a collection of guys with enormous upside who keep finding new ways to disappoint, kind of like a Caleb Williams one of one that keeps losing value every time he gets carted off the field. CMC coming back is the reset button — if he stays healthy this team has a real second half of the season."

"Tracewell — 0-4 and just traded away Aaron Jones, his last viable running back, leaving behind what is essentially a roster you would find on a middle school waiver wire. The DJ sets in NYC are getting more action than this lineup right now and at least the music is good. The number one pick is the destination, Tracewell is fully committed whether he meant to be or not, and somewhere in NYC a playlist is already being built for the draft party."

"Dlugos — Put up a massive week even with Barkley on the shelf again, which is either a sign of incredible roster depth or proof that his brother has figured out something the rest of the league has not. The entire Rams offense through Puka, Davante, and Kyren is a working plan, Javonte is becoming a red zone touchdown machine in Dallas, and Trey McBride is being fed 15 targets a game like a PPR god who did nothing to deserve this kind of volume. The gym talk is ramping up, the brother is working overtime, and the injury bug is the only thing standing between this roster and a championship conversation."
`;

  const prompt = `You are writing the week ${week} power rankings for the Chiraq Dynasty League — a 12-team dynasty league of close friends who trash talk each other constantly and have zero filter.

${styleExamples}

MATCH THIS VOICE EXACTLY. These are close friends. The humor is specific, personal, and sometimes uncomfortable. This group does hockey chirping humor, racial jokes that work because they come from within the group, and specific references to things happening in their lives. Do not water it down. Do not be generic. If the observation is true and funny, say it. The best lines land because they are accurate.

${weeklyNotes ? `WEEKLY CONTEXT:\n${weeklyNotes}\n` : ''}
${lastWeekBlurbs.length > 0 ? `LAST WEEK — do not repeat any joke, angle, or observation from these:\n${lastWeekBlurbs.join("\n\n")}\n` : ''}

POWER RANKINGS — not recaps. Big picture. Where is this team headed.

For each team:
- The top 2-3 scorers MUST be mentioned by name — do not skip a key player
- Call out players who have been consistently bad for multiple weeks — "been a ghost" "hasn't shown up in weeks" etc
- Do NOT pile on someone for one bad week — one off week from a reliable player is noise
- Call out position imbalances as trade opportunities
- One sharp closer per blurb

Tiers:
- 1-3: Championship level
- 4-6: Playoff with questions  
- 7-9: Bubble
- 10-12: Tanking or in trouble

Rules:
- Nickname only, never team name
- Only reference players on the roster list — do not add players from your own knowledge
- [STARTER] played, [BENCH] did not — never say a team lacks a starter if one is marked [STARTER]
- [BENCH] players only if 15+ points and significantly beat projection
- Never reference a backup QB's points unless [STARTER]
- Records always as numerals: 2-0, never two and oh
- 5-6 sentences, 100-130 words
- Return ONLY a valid JSON array. No markdown, no extra text.

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