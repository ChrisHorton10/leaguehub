"use client";

import { useState, useEffect, useRef } from "react";

export default function PlayerSearch({ onAdd }) {
  const [query, setQuery] = useState("");
  const [players, setPlayers] = useState({});
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);

  useEffect(() => {
    fetch("https://api.sleeper.app/v1/players/nfl")
      .then(res => res.json())
      .then(data => {
        setPlayers(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = Object.values(players)
      .filter(p =>
        p.active &&
        p.full_name &&
        ["QB", "RB", "WR", "TE", "K"].includes(p.position) &&
        p.full_name.toLowerCase().includes(q)
      )
      .slice(0, 8);
    setResults(matches);
  }, [query, players]);

  function handleSelect(player) {
    onAdd(player.full_name);
    setQuery("");
    setResults([]);
  }

  return (
    <div className="relative" ref={ref}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={loading ? "Loading players..." : "Search for a player..."}
        disabled={loading}
        className="w-full bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
      />
      {results.length > 0 && (
        <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded mt-1 overflow-hidden">
          {results.map(player => (
            <button
              key={player.player_id}
              onClick={() => handleSelect(player)}
              className="w-full text-left px-4 py-2 hover:bg-gray-700 text-sm flex items-center justify-between"
            >
              <span>{player.full_name}</span>
              <span className="text-gray-500 text-xs">{player.position} · {player.team || "FA"}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}