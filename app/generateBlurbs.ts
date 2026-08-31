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
    context: "Commissioner. Cowboys die-hard with unwavering blind faith every year. Strength is his receiver room — Waddle in Denver, Olave, MHJ trying to bounce back. RB room is the real question mark — Bucky Irving, Breece Hall health, Judkins on a bad Browns team. Lean into Cowboys fan delusion and gambling confidence. Do not make him sound noble or like a man of integrity."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan, Syracuse fan, Buffalo Sabres fan, Yankees fan. Knows the game deeply. Loves to start fights especially when drunk. Huge video game guy — loves Fort, COD, NHL. Big hockey guy. Known as Germany — reference once. Got pushed out as manager of the league softball team a few games in. Kenneth Walker was Super Bowl MVP and coming back, Chase Brown is a dawg, Pollard is worthless. Josh Allen projects around 20-22 points weekly not 35."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals and Saints fan. Purdue Boilermakers fan. Newly engaged. Lives in Cincinnati. JJ McCarthy is actually starting and unproven — do not hype him. Has Hurts and CeeDee as his foundation plus Jefferson. Make the first line actually funny."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns fan, Nebraska fan, Hungarian and makes sure people know it. Drives a Tesla. Big sports card guy — sells them on eBay. Into Rocket League. Lovable guy. Has Lamar and Pitts who bounced back in 2025, just got Zay Flowers. Running back room is genuinely brutal — thin on talent and depth. Has been a trade pinata."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Perennially late to everything. Full rebuild and openly tanking. All his eggs are in the Bengals basket — fantasy team, real life fandom, actual money on Bengals player outcomes. Takes gambling breaks to save himself. Known as France — reference once. CJ Stroud and Pickens are real pieces but the rest is thin."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. All time catcher and DH on the softball team — not because he's a good hitter, just ends up there. Sometimes clueless but keeps winning anyway. Nice guy, low key, doesn't trade much. Whipped but nobody holds it against him."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "One of the few minority friends in the group. Pakistani. Lives in Milwaukee. Packers fan. Has Bijan Robinson, Ja'Marr Chase, Drake London, Brian Thomas. Knows football better than most. The group makes terrorist jokes or jokes about him being a security threat — weave one in naturally but keep it light. Genuinely dangerous roster."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns fan, Ohio State fan. DJ in his spare time — the group gives him grief about it but not mean, more like gentle ribbing. Recently moved to NYC. Whipped by his girlfriend Cate. Sometimes clueless and the group gives him shit for it. Fully tanking and not hiding it — racing Sherlock to the bottom for the number one pick. Jayden Daniels is his one real asset."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers fan, Michigan fan. Just moved to Milwaukee for a new job. Has Gibbs and Jeanty at RB which is genuinely dangerous. AJ Brown is a real WR1. Malik Willis at QB is a massive problem — unproven, starting for the Dolphins which is a bad franchise. Do not hype Jayden Reed — he has never been a top 20 WR. RB room wins weeks, QB situation loses seasons."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns fan, OSU fan. Constantly talking about going to the gym and getting big. League villain energy. 13-1 last regular season but lost in semis. His actual brother helps him manage — running inside joke. Just acquired Saquon Barkley. Reference Russia once naturally. End punchy — Russia doesn't rebuild, Russia reloads."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for all Clemson players in the NFL but is famously pessimistic about Clemson every year. Cclubnik just entered the league — Sam might have to root for the Jets now to support him. Active trader, loaded with picks. Burrow is his QB, Rashee Rice and McMillan are key pieces. Do not just call him the nicest guy — make it more specific and funnier."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan, OSU fan. Lives in Chicago but we make fun of him for being a bandwagon — likes Duke, OSU, and now the Bears. Gay for Caleb Williams and OSU players (not actually gay, running joke). Big sports card guy and into Fortnite and Rocket League. Has Mahomes, Bo Nix, Baker Mayfield — rides the hot hand. Just got CMC but his injury history is very real. Do not oversell this team."
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