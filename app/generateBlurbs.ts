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
    context: "Commissioner. Cowboys die-hard with unwavering, almost delusional confidence in his team every year — mirrors his confidence in his fantasy squad. Has the power to make rulings but would never abuse it (joke about having the power is fine). Has Trevor Lawrence who bounced back in 2025. Never make him the villain — lean into the Cowboys blind faith angle."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan. Knows the game deeply. Competitive, passionate, gets heated. Loves to gamble. Known as Germany — reference it once, not repeatedly. Was pushed out as manager of the league softball team just a few games in. His RB room has injury concerns but Kenneth Walker was a Super Bowl MVP and should be back, Chase Brown is a dawg. Pollard is a nobody on a bad team. Do not make multiple Germany references."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Lives in Cincinnati away from everyone else. Laid back personality. Has Hurts and CeeDee as his foundation plus Justin Jefferson. The sleeping giant angle is fine but make the first line actually funny and interesting — not generic. Avoid saying he will be unbothered until week 7, that makes no sense."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan — two historically painful fanbases. Lovable guy. Has Lamar Jackson and Kyle Pitts who bounced back in 2025. Just acquired Zay Flowers. His running back room is genuinely brutal — thin on both talent and depth. Has been a trade pinata in the past. The roster has Lamar and Pitts but not much else of note."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Full rebuild and not hiding it — tanking openly. All his eggs are in the basket of the Bengals season — his fantasy team, his real life fandom, and he has actual money on Bengals player outcomes. Michigan had a rough year too. Takes gambling breaks to save himself. Known as France — reference it once. CJ Stroud and George Pickens are real pieces."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. Stacked roster. Doesn't trade much, just wins. Nice guy, low key, occasionally seems unbothered but keeps winning. Whipped but nobody holds it against him."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani. Packers fan. Has Bijan Robinson, Ja'Marr Chase, Drake London, Brian Thomas. Knows football better than most. The group makes terrorist jokes or jokes about him being a Brewers superfan — weave one in naturally. Genuinely one of the most dangerous rosters in the league."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Wannabe DJ. Browns fan. Made the championship last year but got lucky. Fully tanking now and not hiding it at all — openly racing Sherlock to the bottom for the number one pick. Roster is old and uncompetitive. Jayden Daniels is the one bright spot."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers fan. Has Gibbs and Jeanty as his RB core — that is genuinely dangerous. AJ Brown is a real WR1. Malik Willis at QB is a massive problem — he has no proof he can start in the NFL, especially on the Dolphins. Do not hype Jayden Reed as a fantasy threat — he has never been a top 20 WR. Focus on the RB upside and the QB problem."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns fan. League villain energy — the guy nobody wants to deal with but everyone respects. 13-1 last regular season but lost in semis. His actual brother helps him manage his team — running inside joke with the league. Just acquired Saquon Barkley. Loaded roster. Reference Russia once naturally, not multiple times. End with something punchy like Russia doesn't rebuild, Russia reloads."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for all Clemson players in the NFL — but is famously pessimistic about Clemson every single year despite loving them. Clubnik just entered the league which means Sam might have to root for the Jets now too. Active trader, loaded with picks. Team is improving. Do not just call him the nicest guy — make it funnier and more specific. Burrow is his QB, Rashee Rice and McMillan are key pieces."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan from rural Ohio. Has THREE legit starting QBs — Mahomes, Bo Nix, and Baker Mayfield. Rides the hot hand at QB week to week. Do not assume who starts. Just acquired Christian McCaffrey. Solid WR room. Obsessed with Caleb Williams succeeding. High upside team if CMC stays healthy."
  }
};

export async function generateTeamBlurbs(rankings: any[], isOffseason: boolean, week: number, rosterInjuries: any = {}, rosterPlayers: any = {}) {
  const teamSummaries = rankings.map((team, index) => {
    const persona = (MANAGER_PERSONAS as any)[team.username];
    const nickname = persona?.nickname || team.username;
    const context = persona?.context || "";
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
Record: ${team.wins}-${team.losses} | Points: ${team.points.toFixed(1)}
Last year finish: #${lastYearFinish}
Manager context: ${context}
${rosterNote}
${injuryNote}`;
  }).join("\n\n");

  const styleExamples = `
STYLE EXAMPLES — write in this voice:

"Brothers — Reigning champ, still running the league like a pro. His team is legit — he's got all the pieces to strike again. But lets be honest, hes whipped harder than anyone in this league and outside of fantasy hes really only good at following instructions. Respect the team though."

"Cregg — The leagues public enemy number one. Aggressive, fights with everyone, Germany through and through. Somehow has the roster to back it up. If he wins this year were all basically living under a dictatorship."

"Dlugos — Browns fan so cursed already. Russia is back and more dangerous than ever after acquiring Saquon. His brother already has the lineup set through Week 10. 13-1 last year and still couldn't close — at some point the psycho GM energy has to translate."

"Shaz — While his time in the US might be limited, Shaz continues to show why he is a major threat to league security. The dude just puts up points every week with Bijan and Jamarr doing damage."

"Kyle — Someone came up to Kyle at softball and said Damn Nebraska and the Browns? Thats tough. Tough indeed. Wanna know who else is tough? His fantasy team when the QB is cooking."
`;

  const prompt = isOffseason
    ? `You are writing the preseason power rankings column for the Chiraq Dynasty League — a 12-team dynasty league of close friends who love football, trash talk, and giving each other hell.

${styleExamples}

Write a preseason scouting report for each team in this voice. Sharp, funny, personal, grounded in real football analysis. Mix in personality and inside jokes naturally.

Tone guidelines by ranking position:
- #1-3: These are the clear favorites. Write them as legitimate threats, dangerous, championship caliber.
- #4-5: Solid contenders but with real questions. Acknowledge their strengths but point out the one thing that could derail them.
- #6-8: Middle of the pack. Uncertain. Could go either way. Don't hype them up too much.
- #9-10: On the outside looking in. Real concerns. Need things to break right.
- #11-12: Rebuilding or tanking. Be honest about it, make it funny.

Only reference country nicknames directly for: Cregg (Germany), Dlugos (Russia), Sherlock (France), Commish (NATO). Everyone else — use their context as background flavor only.

Rules:
- Use nickname only, never team name
- Mix real football analysis with personality naturally
- Reference actual players from their roster
- Be honest — if a team has real weaknesses say so
- 4-5 sentences, 75-100 words per blurb
- No generic clichés
- Return ONLY a valid JSON array of strings in the same order. No markdown, no extra text.

Teams:
${teamSummaries}`
    : `You are writing the week ${week} power rankings for the Chiraq Dynasty League.

${styleExamples}

Write a weekly blurb for each team. Reference their record, recent performance, injuries, and playoff picture. Tone gets more dire as you go down the rankings.

Only reference country nicknames for: Cregg (Germany), Dlugos (Russia), Sherlock (France), Commish (NATO).

Rules:
- Use nickname only
- Mix football analysis with personality
- 4-5 sentences, 75-100 words
- Fresh every week
- Return ONLY a valid JSON array in order. No markdown, no extra text.

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
  } catch {
    return rankings.map(() => "Blurb unavailable.");
  }
}