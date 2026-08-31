export async function generateMatchupRecaps(games, week) {
    const gameSummaries = games.map((game, index) => {
      return `Matchup ${index + 1}:
  ${game.teamA} (${game.managerA}) scored ${game.ptsA.toFixed(2)} points
  ${game.teamB} (${game.managerB}) scored ${game.ptsB.toFixed(2)} points
  Winner: ${game.ptsA > game.ptsB ? game.teamA + ' (' + game.managerA + ')' : game.teamB + ' (' + game.managerB + ')'}
  Margin: ${Math.abs(game.ptsA - game.ptsB).toFixed(2)} points
  ${game.topPerformerA ? `${game.managerA} top performer: ${game.topPerformerA}` : ''}
  ${game.topPerformerB ? `${game.managerB} top performer: ${game.topPerformerB}` : ''}`;
    }).join("\n\n");
  
    const prompt = `You are a sharp fantasy football analyst writing week ${week} matchup recaps for the Chiraq Dynasty League — a 12-team dynasty league of close friends who love football.
  
  Write a 2-3 sentence game recap for each matchup. These should read like post-game reports — focus entirely on what happened in the game. Reference the final score, margin of victory, whether it was a blowout or came down to the wire, and any standout performer. Do NOT talk about the manager's personality or season outlook — save that for power rankings. This is purely about the game itself.
  
  Manager nicknames:
  - chrishorton10 = Commish
  - BCregg = Cregg
  - ScubaSteve0709 = Scuba Steve
  - kmyers = Kyle
  - Sher2Lose = Sherlock
  - Broth22 = Brothers
  - shazman123 = Shaz
  - ctracewell = Tracewell
  - GrimaceHugeSack = Grimace
  - Bdug14 = Dlugos
  - SamHuman12 = Sam
  - Gillilig = Gill
  
  Matchups:
  ${gameSummaries}
  
  Return ONLY a valid JSON array of strings, one recap per matchup in the same order. No markdown, no extra text.`;
  
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });
  
    const data = await response.json();
    const text = data.content[0].text;
  
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return games.map(() => "Recap unavailable.");
    }
  }