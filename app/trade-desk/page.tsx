"use client";

import { useState, useEffect } from "react";

export default function TradeDeskPage() {
  const [posts, setPosts] = useState([]);
  const [managers, setManagers] = useState([]);
  const [manager, setManager] = useState("");
  const [offering, setOffering] = useState("");
  const [looking, setLooking] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch("https://api.sleeper.app/v1/league/1330820695583625216/users", { cache: "no-store" })
      .then(res => res.json())
      .then(users => {
        const names = users.map(u => u.display_name).sort();
        setManagers(names);
      });
  }, []);

  function handleSubmit() {
    if (!manager || !offering || !looking) return;
    setPosts([{ manager, offering, looking, notes, id: Date.now() }, ...posts]);
    setOffering("");
    setLooking("");
    setNotes("");
  }

  function handleDelete(id) {
    setPosts(posts.filter(p => p.id !== id));
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-green-400">League Hub</h1>
          <div className="flex gap-6">
            <a href="/" className="text-gray-300 hover:text-white">Home</a>
            <a href="/power-rankings" className="text-gray-300 hover:text-white">Power Rankings</a>
            <a href="/trade-desk" className="text-gray-300 hover:text-white">Trade Desk</a>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Trade Desk</h2>
          <p className="text-gray-400 mt-1">Post what you want and what you're willing to give up</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-10">
          <h3 className="text-lg font-semibold mb-4">Post a Trade</h3>
          <div className="flex flex-col gap-3">
            <select
              value={manager}
              onChange={e => setManager(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
            >
              <option value="">Select your name</option>
              {managers.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input
              value={offering}
              onChange={e => setOffering(e.target.value)}
              placeholder="What are you offering? (players, picks)"
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
            />
            <input
              value={looking}
              onChange={e => setLooking(e.target.value)}
              placeholder="What are you looking for?"
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
            />
            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes? (optional)"
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
            />
            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2 rounded mt-1"
            >
              Post Trade
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {posts.length === 0 && (
            <p className="text-gray-500 text-center py-8">No trade posts yet — be the first to post.</p>
          )}
          {posts.map(post => (
            <div key={post.id} className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-green-400 font-bold">{post.manager}</span>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-gray-600 hover:text-red-400 text-sm"
                >
                  Remove
                </button>
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <p><span className="text-gray-400">Offering:</span> {post.offering}</p>
                <p><span className="text-gray-400">Looking for:</span> {post.looking}</p>
                {post.notes && <p><span className="text-gray-400">Notes:</span> {post.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}