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
    context: "Bengals and Saints fan. Purdue Boilermakers fan. Newly engaged. Lives in Cincinnati. RB room past his top back is a real weakness. Do not mention JJ McCarthy."
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
    context: "Browns and OSU fan. Constantly talks about going to the gym — tease him for this, do not compliment him. League villain. 13-1 last year but lost in semis. His brother helps run the team — league inside joke. Recently acquired Saquon Barkley — mention this. Known as Russia — use once only if there is a fresh angle. Do not repeat Russia doesn't rebuild Russia reloads if it was used last week."
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
Roster (sorted by projection, with actual week ${week} scores where available — OVERPERFORMED and BUSTED flags indicate players who significantly exceeded or missed expectations):
${players.slice(0, 12).join("\n")}
${injuryNote}`;
  }).join("\n\n");

  const styleExamples = `
STYLE EXAMPLES — write in this voice:

"Brothers — Reigning champ, still running the league like a pro. His team is legit — he has got all the pieces to strike again. But lets be honest, hes whipped harder than anyone in this league and outside of fantasy hes really only good at following instructions. Respect the team though."

"Cregg — The leagues public enemy number one. Aggressive, fights with everyone, Germany through and through. Somehow has the roster to back it up. If he wins this year were all basically living under a dictatorship."

"Dlugos — Browns fan so cursed already. Russia is back and more dangerous than ever after acquiring Saquon. His brother already has the lineup set through Week 10. 13-1 last year and still couldn't close — at some point the psycho GM energy has to translate."

"Shaz — While his time in the US might be limited, Shaz continues to show why he is a major threat to security. The dude just puts up points every week with Bijan and Jamarr doing damage."
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

Only use country nicknames (Germany/Cregg, Russia/Dlugos, France/Sherlock, NATO/Commish) if there is a genuinely fresh angle — do not recycle.

Rules:
- Use nickname only, never team name
- CRITICAL: Only reference players listed in the roster section. Do not add players from your own knowledge.
- Player team affiliations are listed — use them, do not guess where players play
- One sharp observation per blurb max
- Do not invent personality traits not in the manager context
- 4-5 sentences, 75-100 words
- Return ONLY a valid JSON array of strings in order. No markdown, no extra text.

Teams:
${teamSummaries}`
    : `You are writing the week ${week} power rankings for the Chiraq Dynasty League.

${styleExamples}

Write a weekly power rankings blurb for each team. These should be forward-looking — where does this team stand and where are they headed? Use week ${week} results as evidence for your assessment, not as the story itself. The story is the team's trajectory. One key week 1 observation that tells us something meaningful about this team's season outlook, not a point-by-point recap.
Ranking tiers:
- #1-3: Playing like championship contenders right now
- #4-6: Playoff teams with questions
- #7-9: Fighting to stay relevant  
- #10-12: In trouble or tanking

Only use country nicknames if there is a genuinely NEW angle this week — do not repeat lines used in previous weeks.

Rules:
- Use nickname only, never team name
- CRITICAL: Only reference players listed in the roster section with their actual team affiliations
- Players marked [STARTER] actually played this week — focus analysis on them
- Players marked [BENCH] did not start — only mention if they OVERPERFORMED significantly as a sleeper worth watching
- Reference actual week ${week} scores — proj means projection, actual means what they scored
- Call out OVERPERFORMED and BUSTED players specifically by name
- NEVER reference a backup QB's points as meaningful unless they are marked [STARTER] or clearly competing for the starting job
- When mentioning a QB make clear if they started or are a depth stash
- One personality observation per blurb max — football analysis comes first
- Do not recycle the same personality jokes from previous weeks
- 5-6 sentences, 100-130 words
- Return ONLY a valid JSON array of strings in order. No markdown, no extra text.
- Do not make definitive season-long statements based on one week of data — use language like "could be" or "worth watching" when projecting trends

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
  console.log("Claude blurb response:", JSON.stringify(data).slice(0, 500));

  try {
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  } catch (e) {
    console.log("Blurb parse error:", e);
    console.log("Raw text received:", text);
    return rankings.map(() => "Blurb unavailable.");
  }
}