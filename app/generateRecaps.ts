export async function generateMatchupRecaps(games: any[], week: number) {
    const gameSummaries = games.map((game, index) => {
      return `Matchup ${index + 1}:
  ${game.teamA} (${game.managerA}) scored ${game.ptsA.toFixed(2)} points
  ${game.teamB} (${game.managerB}) scored ${game.ptsB.toFixed(2)} points
  Winner: ${game.ptsA > game.ptsB ? game.teamA + ' (' + game.managerA + ')' : game.teamB + ' (' + game.managerB + ')'}
  Margin: ${Math.abs(game.ptsA - game.ptsB).toFixed(2)} points
  ${game.topPerformerA ? `${game.managerA} top performer: ${game.topPerformerA}` : ''}
  ${game.topPerformerB ? `${game.managerB} top performer: ${game.topPerformerB}` : ''}`;
    }).join("\n\n");
  
    const prompt = `You are writing week ${week} matchup recaps for the Chiraq Dynasty League.

    Write a 3-4 sentence recap for each matchup. These are post-game reports — be specific and score-focused. Cover:
    - Final score and winner
    - Margin of victory — was it a blowout or a nail-biter
    - 2-3 standout performers by name with their actual points scored
    - Anyone who massively overperformed or busted their projection
    - One line on what this result means for each team's record
    
    Use manager nicknames not team names. Be sharp and specific — this is the score breakdown section, not the analysis section.
    
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