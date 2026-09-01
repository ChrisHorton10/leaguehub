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
    context: "Commissioner. Cowboys fan with delusional annual confidence. WR room is his strength — Waddle in Denver, Olave, MHJ trying to bounce back. RB room is the real question — Bucky Irving, Breece Hall injury history, Quinshon Judkins on the bad Browns team. Lean into Cowboys fan confidence not integrity."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan, big hockey guy, gets into arguments when drunk. Known as Germany — reference once. Got replaced as lineup manager of the league softball team a few games in. Kenneth Walker was Super Bowl MVP and is coming back, Chase Brown is his real RB1 and is a dawg. Pollard is a depth piece not an RB1. Josh Allen projects 20-22 points weekly."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals and Saints fan. Purdue Boilermakers fan. Newly engaged. Lives in Cincinnati. Has Jalen Hurts and CeeDee Lamb as his core plus Justin Jefferson. Do not mention JJ McCarthy at all — Hurts is the guy. Make the opening interesting without forcing a joke."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan. Hungarian and makes sure people know it. Drives a Tesla. Sells sports cards on eBay. Has Lamar, Pitts who bounced back in 2025, just got Zay Flowers. Running back room is genuinely brutal — thin on both talent and depth. Has been a trade pinata historically. Lead with the football not the personal facts."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Always late to everything. Openly tanking for the number one pick. Has real money on Bengals players and outcomes. Known as France — reference once. CJ Stroud and Pickens are real pieces but the roster is thin everywhere else."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back champion. Ends up as catcher and DH on the softball team not because he is a great hitter, just where he lands. Clueless sometimes but keeps winning. Does not trade much. Whipped but nobody holds it against him."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani, lives in Milwaukee. Packers fan. Has Bijan Robinson, Ja'Marr Chase, Drake London, Brian Thomas. One of the best rosters in the league. The group makes light jokes about him being a security threat — one subtle reference is fine if it fits naturally."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and OSU fan. Does DJ sets on the side — the group teases him about it but not mean spirited. Recently moved to NYC. Whipped by his girlfriend Cate. Can be clueless. Openly tanking for the number one pick. Jayden Daniels is his only real asset. The rest of the roster is old and done."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Just moved to Milwaukee for a new job. Gibbs and Jeanty at RB is genuinely dangerous. AJ Brown is a real WR1. Malik Willis at QB on the Dolphins is the giant problem — unproven on a bad team. Do not hype Jayden Reed — he has never been a top 20 WR."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns and OSU fan. Always talking about going to the gym and getting big. League villain. 13-1 last year but lost in semis. His brother helps run the team — league inside joke. Just got Saquon Barkley. Reference Russia once. End with something punchy like Russia doesn't rebuild, Russia reloads."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player in the NFL but is pessimistic about Clemson every single year. Clubnik just entered the league — Sam may now have to root for the Jets. Active trader with a lot of picks. Burrow, Rashee Rice, McMillan are his core. Do not make up personality traits — stick to what is written here."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan in Chicago, gets called a bandwagon — roots for Duke, OSU, and the Bears. Obsessed with Caleb Williams. Has Mahomes, Bo Nix, and Baker Mayfield — genuinely rotates based on matchups, all three are viable starters. Just got CMC whose injury history cannot be ignored. Into sports cards and Rocket League."
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
    const lastYearFinish = (LAST_YEAR_FINISH as any)[team.username] || "unknown";

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

Write a preseason scouting report for each team in this voice. Dry, sharp, and confident — like someone who knows these guys well and is not trying too hard to be funny. Think Shane Gillis doing fantasy football analysis. One well-placed joke or observation per blurb, not three forced ones. Ground everything in real football first, personality second.

Tone guidelines by ranking position:
- #1-3: Clear favorites. Dangerous, championship caliber.
- #4-5: Solid contenders with one real question mark.
- #6-8: Middle of the pack. Uncertain. Do not hype them.
- #9-10: Outside looking in. Real concerns.
- #11-12: Rebuilding or tanking. Be honest, make it pointed.

Only reference country nicknames for: Cregg (Germany), Dlugos (Russia), Sherlock (France), Commish (NATO). Everyone else — use context as background flavor only.

Rules:
- Use nickname only, never team name
- Real football analysis first, personality second
- Reference actual players from their roster
- Be honest about weaknesses
- 4-5 sentences, 75-100 words per blurb
- No generic clichés
- Return ONLY a valid JSON array of strings in the same order. No markdown, no extra text.

Teams:
${teamSummaries}`
    : `You are writing the week ${week} power rankings for the Chiraq Dynasty League.

${styleExamples}

Write a weekly blurb for each team. Reference their record, recent performance, injuries, and playoff picture. Dry, sharp tone. Gets more dire as you go down the rankings.

Only reference country nicknames for: Cregg (Germany), Dlugos (Russia), Sherlock (France), Commish (NATO).

Rules:
- Use nickname only
- Football analysis first, personality second
- 4-5 sentences, 75-100 words
- Fresh every week
- Return ONLY a valid JSON array in order. No markdown, no extra text.

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
  } catch {
    return rankings.map(() => "Blurb unavailable.");
  }
}