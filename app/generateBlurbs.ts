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
    context: "Commissioner. Cowboys die-hard with delusional annual confidence — mirrors how he approaches his fantasy team. Loves to gamble. The kind of guy who is always confident heading into the season regardless of how last year went."
  },
  "BCregg": {
    nickname: "Cregg",
    context: "Giants fan, Syracuse fan, Buffalo Sabres fan, Yankees fan. Gets into arguments when drunk. Big hockey and video game guy. Known as Germany in the league — reference once. Got pushed out as manager of the league softball team lineup a few games in. Loves to gamble. His two main RBs are Kenneth Walker who was a Super Bowl MVP coming back from injury and Chase Brown who is a dawg. Pollard is also on the roster but is a depth piece."
  },
  "ScubaSteve0709": {
    nickname: "Scuba Steve",
    context: "Bengals and Saints fan. Purdue Boilermakers fan. Newly engaged. Lives in Cincinnati away from everyone else in the group. Laid back personality."
  },
  "kmyers": {
    nickname: "Kyle",
    context: "Browns and Nebraska fan — two historically painful fanbases. Hungarian and makes sure people know it. Drives a Tesla — if there is a natural self-driving or Elon joke it can work but do not force it. Has been a trade pinata in the league historically. Lovable guy. In golf he launches the ball but it rarely goes straight and really struggles with the wedge."
  },
  "Sher2Lose": {
    nickname: "Sherlock",
    context: "Bengals fan. Short. Always late to everything — do not use being late as a fantasy metaphor. Has real money on Bengals player outcomes. Known as France in the league — reference once. Actively and intentionally tanking for the number one pick — this is a deliberate strategy not giving up."
  },
  "Broth22": {
    nickname: "Brothers",
    context: "Back to back league champion. Ends up as catcher and DH on the softball team not because he is a great hitter, just where he lands. Clueless sometimes but keeps winning. Does not trade much. Whipped by his girlfriend Gabby but nobody holds it against him."
  },
  "shazman123": {
    nickname: "Shaz",
    context: "Pakistani, lives in Milwaukee. Packers fan. One of the few minority friends in the group. The group jokes his roster is a security threat — something like the TSA already has eyes on this works well. Keep it light and subtle."
  },
  "ctracewell": {
    nickname: "Tracewell",
    context: "Browns and OSU fan. Does DJ sets on the side — gentle ribbing only, not mean. Moved to NYC a while back. Whipped by his girlfriend Cate who knows nothing about fantasy football — and honestly neither does Tracewell half the time, that is the joke. Openly and intentionally tanking for the number one pick."
  },
  "GrimaceHugeSack": {
    nickname: "Grimace",
    context: "Packers and Michigan fan. Just moved to Milwaukee for a new job. Low drama, builds quietly."
  },
  "Bdug14": {
    nickname: "Dlugos",
    context: "Browns and OSU fan. Constantly talks about going to the gym and getting big — tease him for this, do not compliment him on it. League villain energy. 13-1 last year but lost in semis. His brother helps run the team — running inside joke with the league. Known as Russia — reference once. Close with Russia doesn't rebuild, Russia reloads."
  },
  "SamHuman12": {
    nickname: "Sam",
    context: "Bears fan who roots for every Clemson player in the NFL. Pessimistic by nature — especially about Clemson every year, he loves them but always expects disappointment and they usually deliver it. Clemson used to be a CFB dynasty, not anymore. Cade Klubnik just entered the NFL on the Jets which means Sam now has a Clemson guy to root for there. Active trader who tends to win his trades."
  },
  "Gillilig": {
    nickname: "Gill",
    context: "Bears fan in Chicago but gets called a bandwagon — roots for Duke, OSU, and the Bears. Obsessed with Caleb Williams succeeding — big into sports cards and probably hunting for a Caleb Williams one of one. Big into Rocket League. Gets teased for being a bandwagon fan. In golf he can put a great nine together but the other nine is always a disaster — big struggles with the driver."
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

Write sharp, honest fantasy analysis with dry wit. The humor should come from specific, true observations — not setup/punchline jokes. Think of it like a beat writer who knows everyone in the league personally and isn't afraid to say what everyone is thinking. Funny because it's accurate, not because it's trying to be funny. One good dry observation per blurb that fits naturally — if it doesn't fit, skip it and just write good analysis.

Tone guidelines by ranking position:
- #1-3: Clear favorites. Dangerous, championship caliber.
- #4-5: Solid contenders with one real question mark.
- #6-8: Middle of the pack. Uncertain. Do not hype them.
- #9-10: Outside looking in. Real concerns.
- #11-12: Rebuilding or tanking. Be honest, make it pointed.

Only reference country nicknames for: Cregg (Germany), Dlugos (Russia), Sherlock (France), Commish (NATO). Everyone else — use context as background flavor only.

Rules:
- Use nickname only, never team name
- Lead with roster analysis — who are the real difference makers, what are the genuine concerns
- Use ONLY the players listed in the key players section for each team — do not invent or assume players
- Reference specific players by name and what they bring to this roster
- Note any trades or acquisitions as forward-looking context
- One sharp personality observation or burn per blurb max — the analysis comes first
- Do not invent personality traits not explicitly stated in the manager context
- Be honest about weaknesses — if the RB room is bad, say it
- 4-5 sentences, 75-100 words per blurb
- Return ONLY a valid JSON array of strings in the same order. No markdown, no extra text.
- The flex position can be filled by WR, RB, or TE — do not assume a team can only start one TE
- Use your knowledge of 2026 NFL training camps, rookie standouts, and player developments when relevant
- Trust the key players list — these are the highest projected players on each roster regardless of position
- Teams ranked #1-6 technically make the playoffs in this league. Write the top 3 as genuine championship threats, #4-6 as teams that will make the playoffs but have real questions, #7-9 as on the bubble, #10-12 as rebuilding or out of contention.

Teams:
${teamSummaries}`
    : `You are writing the week ${week} power rankings for the Chiraq Dynasty League.

${styleExamples}

Write a weekly blurb for each team. Reference their record, recent performance, injuries, and playoff picture. Dry, sharp tone. Gets more dire as you go down the rankings.

Only reference country nicknames for: Cregg (Germany), Dlugos (Russia), Sherlock (France), Commish (NATO).

Rules:
- Use nickname only, never team name
- Lead with roster analysis — who are the real difference makers, what are the genuine concerns
- Use ONLY the players listed in the key players section for each team — do not invent or assume players
- Reference specific players by name and what they bring to this roster
- Note any trades or acquisitions as forward-looking context
- One sharp personality observation or burn per blurb max — the analysis comes first
- Do not invent personality traits not explicitly stated in the manager context
- Be honest about weaknesses — if the RB room is bad, say it
- 4-5 sentences, 75-100 words per blurb
- Return ONLY a valid JSON array of strings in the same order. No markdown, no extra text.
- The flex position can be filled by WR, RB, or TE — do not assume a team can only start one TE
- Use your knowledge of 2026 NFL training camps, rookie standouts, and player developments when relevant
- Trust the key players list — these are the highest projected players on each roster regardless of position
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