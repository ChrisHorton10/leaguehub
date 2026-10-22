const MANAGER_PERSONAS: Record<string, { nickname: string; context: string }> = {
  "chrishorton10": {
    nickname: "Commish",
    context: "Commissioner. Cowboys die-hard who has been promising a turnaround for 15 years. Loves to gamble."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants, Syracuse, Sabres and Yankees fan. Big hockey and video game guy. Got pushed out as manager of the league softball team's lineup. Loves to gamble. Nicknamed Germany in the league."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals, Saints and Purdue fan. Recently engaged. Has always lived in Cincinnati, away from the group."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan. Hungarian and lets people know. Drives a Tesla. Historically a trade pinata. In golf he launches it but it never goes straight and he struggles with the wedge."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Perennially late to everything (do not use lateness as a fantasy metaphor). Has real money on Bengals outcomes. Deliberately tanking for the number one pick. Nicknamed France in the league."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. Softball catcher/DH because of who he is, not his bat. Girlfriend is Gabby."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Lives in Milwaukee. Packers fan. The group has running jokes about him; only use one if it is genuinely fresh and light."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and Ohio State fan. DJs on the side, lives in NYC. Deliberately tanking. Do not mention his girlfriend."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Recently moved to Milwaukee for a new job."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns and Ohio State fan. League villain energy. 13-1 last year, lost in the semis. His brother helps run his team. Nicknamed Russia in the league."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player in the NFL. Active trader."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears, Ohio State and Duke fan in Chicago, gets called a bandwagoner. Obsessed with Caleb Williams. Into sports cards and Rocket League. In golf the front nine is great and the back nine is a disaster."
  }
};

const BANNED_JOKES = `
These bits are worn out. Do NOT use them in any form:
- Gabby running or picking Brothers' lineup / Brothers not knowing how good his team is / "autopilot"
- Dlugos gym talk, or his brother "consulting"
- Cregg arguing or fighting while drunk
- Shaz boom/bust rhyming joke, TSA jokes
- Caleb Williams one-of-one card losing value
- Tesla autopilot jokes for Kyle
- Sam being pessimistic about Clemson, Klubnik or the Jets
- "Russia doesn't rebuild, Russia reloads"
- "Snake-bitten", "held together with tape/duct tape/hope", "cheat code", "heroic"
- Tracewell DJ playlists / draft party / sets getting more action than the lineup
- Cowboys "turning it around" (only with a brand new angle)
`;

const BANNED_WORDS = `
Do NOT use these words or variations: overperformed, underperformed, busted, bust, went nuclear, nuclear, supernova, exploded, explosion, carried, "floor and ceiling" (once in the whole column at most). Never use the same verb to describe performance twice anywhere in the column. Describe big games the way a real columnist would, and vary constantly: "dropped 34 on Sunday", "looked unguardable", "got fed", "ate", "lit up the secondary", "was the best player on the field", "a monster afternoon", "quietly hung a 22-spot", "put the league on notice". Describe flops the same way: "laid an egg", "disappeared", "got stuffed", "never got going", "a no-show", "was a spectator".
`;

const ROAST_MENU = `
ROAST MENU. Every blurb needs at least one real jab, and no two blurbs should use the same type of jab. Pick from:
1. Record vs points: a team that wins ugly gets called lucky, a team that loses while scoring gets sympathy-roasted for bad scheduling luck.
2. Lineup decisions: sitting a guy who went off, starting a guy who did nothing, a bench that would have won the week.
3. A roster player's reputation or contract-year energy, roasted fairly: the guy everyone drafted too early, the QB who is a game manager at best, the RB on a bad offense.
4. Rank vs record: a team ranked high but losing, or low but winning, gets called out.
5. Cross-team comparisons: "this roster is what Sherlock's tank dreams of becoming", "would lose to the team ranked below it in a pickup game". Reference other managers by nickname.
6. Absurd comparisons grounded in the roster (a WR corps described like a bad group project, a backfield like a waiting room).
7. Mock the stakes: a team in no man's land, a "contender" with no depth, a tank that keeps accidentally winning.
Jabs should be sharp, specific, and short. A good jab is a single sentence with a punchline at the end. Do not apologize for a jab or soften it. Roast rosters, records, decisions, and luck.
`;

export async function generateTeamBlurbs(
  rankings: any[],
  isOffseason: boolean,
  week: number,
  rosterInjuries: any = {},
  rosterPlayers: any = {},
  weeklyNotes: string = "",
  lastWeekBlurbs: string[] = []
) {
  const teamSummaries = rankings.map((team, index) => {
    const persona = MANAGER_PERSONAS[team.username];
    const nickname = persona?.nickname || team.username;
    const context = persona?.context || "";
    const injuries = rosterInjuries[team.username] || [];
    const players = rosterPlayers[team.username] || [];
    const injuryNote = injuries.length > 0 ? `Currently injured: ${injuries.join(", ")}` : "No notable current injuries";

    return `#${index + 1} ${team.teamName} (${nickname})
EXACT RECORD (copy this verbatim, never calculate or guess a record): ${team.wins}-${team.losses}
Total points this season: ${team.points.toFixed(1)} | Scored this week: ${team.actualPts ? team.actualPts.toFixed(1) : "N/A"}
Manager background (use sparingly, not every week): ${context}
ROSTER (the ONLY players you may mention for this team; starters sorted by points scored this week, highest first):
${players.slice(0, 14).join("\n")}
${injuryNote}`;
  }).join("\n\n");

  const styleExamples = `
These were written or edited by the league commissioner. Match the voice, not the jokes:

"Dr. Raymond is looking more dangerous than he does on the road after a few drinks. But the best drunk driver on this side of the Mississippi is proving to everyone that not only can he get you to McDonald's at 3am without a scratch, but his team is heading towards a championship run. Josh Allen, Amon-Ra, and Kenneth Walker is the most dangerous offensive trio in the league. Keep drinking those surfsides Cregg, your team trusts you at the wheel."

"Lost his ID after going perfect last week and somehow that was the most stressful part of his week. Henry and Taylor are the most punishing RB room in the league and it is not close, Kittle is quietly becoming the best TE in this format, and Chuba Hubbard giving you a bonus week off the bench is the kind of depth that wins championships in January. The most dangerous boring team in the league."

"The Yankees season is ending and the Sabres season is just getting started, which is a pretty accurate metaphor for what is happening with his fantasy team right now. Allen, Amon-Ra, Walker, and Higgins are a top-four core that nobody in this league wants to see across the matchup. The Sabres are not the horse to bet on this winter but his fantasy team just might be."

"0-4 and just traded away Aaron Jones, his last viable running back, leaving behind what is essentially a roster you would find on a middle school waiver wire. The number one pick is the destination and he is fully committed whether he meant to be or not."
`;

  const prompt = `You are writing the Week ${week} power rankings column for the Chiraq Dynasty League, a 12-team dynasty league of close friends who talk trash constantly. Write like a sharp ESPN or Ringer fantasy columnist who also happens to be the funniest guy in the group chat: real football analysis as the foundation, with genuine roasts and punchlines on top. People stopped reading because columns sounded the same every week. Every blurb should be entertaining on its own.

${styleExamples}

${weeklyNotes ? `THIS WEEK'S TIMELY NOTES (use the genuinely funny ones, skip anything that does not fit):\n${weeklyNotes}\n` : ""}
${lastWeekBlurbs.length > 0 ? `PAST BLURBS (last 3 weeks). Do not reuse any joke, angle, closer, or phrasing from these:\n${lastWeekBlurbs.join("\n\n")}\n` : ""}
${BANNED_JOKES}
${BANNED_WORDS}
${ROAST_MENU}

FOOTBALL JUDGMENT RULES:
- One bad week from a proven star is noise. Never suggest an established stud is washed or "not the guy" off one or two weeks. At most he had a quiet Sunday.
- Only call a player a real problem if he has struggled across multiple weeks, or if he is a high-expectation guy who keeps flopping. Then say it plainly ("hasn't shown up in a month", "been a ghost").
- Credit consistently elite players who drive their team's offense every week, and name them as the engine of the team.
- A low-projected player scoring a few extra points is not news. Only highlight surprise games when they matter (roughly 15+ from someone not expected to do much, or any 30+ game).
- The two or three highest scorers on every team must be named, even after a down week.
- "started this week" means he was in the lineup that week. "did not start this week" means he sat. Use CURRENT injury status for anything about the future. A player who sat and scored big is a sleeper or trade chip, never a long-term bench guy just because he sat.
- Only mention a backup QB if he actually started or is a real threat to take the job.
- Position imbalance is fair game: stacked at one spot and thin at another means trade chip talk.
- No season-long declarations off limited data. No jokes about anyone's physique.
- Record matters: do not talk down a team that is winning, and do not hype a team that is 0-5. Call out good or bad luck when points and record disagree.
- Records: copy the EXACT RECORD shown for each team, written as numerals (2-0, never "two and oh"). Never compute a record, never mention another team's record unless it is shown in the data, and never say "unbeaten" or "winless" unless the data supports it.

STRUCTURE AND VOICE:
- 5 to 6 sentences, 100 to 130 words per blurb.
- Start each blurb with the manager's nickname, then vary the opening style team to team (a stat, a question, a one-liner, a scene, a jab).
- Give every blurb a forward-looking angle: where the team is headed, the swing factor, who to watch.
- Include at least one real jab per blurb from the roast menu.
- Personal references: at most one per blurb, only if fresh and funny. A roster-based jab beats a recycled personal bit every time.
- Vary vocabulary hard. No two blurbs should sound like they came from the same template. Never start two blurbs the same way.
- Nickname only, never team names.
- Only use players listed in each team's ROSTER section, with the NFL teams shown.

TIERS: #1-3 championship level. #4-6 playoff teams with real questions. #7-9 on the bubble. #10-12 tanking or in trouble. Match tone to rank and record.

Return ONLY a valid JSON array of 12 strings, in the same order as the teams below. No markdown, no extra text.

TEAMS:
${teamSummaries}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();

  if (!data.content || !data.content[0]) {
    console.log("Claude blurb API error:", JSON.stringify(data).slice(0, 500));
    return rankings.map(() => "Blurb unavailable.");
  }

  const text = data.content[0].text;

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => {
        if (typeof item === "string") return item;
        if (item.blurb) return item.blurb;
        if (item.text) return item.text;
        return JSON.stringify(item);
      });
    }
    return rankings.map(() => "Blurb unavailable.");
  } catch (e) {
    console.log("Blurb parse error:", e);
    console.log("Raw text received:", text);
    return rankings.map(() => "Blurb unavailable.");
  }
}