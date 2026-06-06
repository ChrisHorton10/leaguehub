"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const LOOKING_FOR_TAGS = [
  "WR1", "WR2", "Young WR",
  "RB1", "RB2", "Handcuff",
  "QB1", "QB2",
  "TE1",
  "Early Picks", "Late Picks",
  "Any Position"
];

const LEAGUE_ID = "1330820695583625216";

export default function TradeDeskPage() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [manager, setManager] = useState("");
  const [myPlayers, setMyPlayers] = useState([]);
  const [offeringPlayers, setOfferingPlayers] = useState([]);
  const [extraOffering, setExtraOffering] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [rosterLoading, setRosterLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  async function fetchUsers() {
    const res = await fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/users`, { cache: "no-store" });
    const data = await res.json();
    setUsers(data);
  }

  async function fetchPosts() {
    const { data } = await supabase
      .from("trade_posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }

  async function handleManagerSelect(displayName) {
    setManager(displayName);
    setMyPlayers([]);
    setOfferingPlayers([]);
    if (!displayName) return;

    setRosterLoading(true);

    const user = users.find(u => u.display_name === displayName);
    if (!user) return;

    const [rostersRes, playersRes] = await Promise.all([
      fetch(`https://api.sleeper.app/v1/league/${LEAGUE_ID}/rosters`, { cache: "no-store" }),
      fetch("https://api.sleeper.app/v1/players/nfl", { cache: "no-store" })
    ]);

    const rosters = await rostersRes.json();
    const allPlayers = await playersRes.json();

    const myRoster = rosters.find(r => r.owner_id === user.user_id);
    if (!myRoster) return;

    const playerList = (myRoster.players || [])
      .map(id => allPlayers[id])
      .filter(p => p && p.full_name && ["QB", "RB", "WR", "TE", "K"].includes(p.position))
      .sort((a, b) => {
        const order = ["QB", "RB", "WR", "TE", "K"];
        return order.indexOf(a.position) - order.indexOf(b.position);
      });

    setMyPlayers(playerList);
    setRosterLoading(false);
  }

  function togglePlayer(name) {
    setOfferingPlayers(prev =>
      prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]
    );
  }

  function toggleTag(tag) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  async function handleSubmit() {
    if (!manager || (offeringPlayers.length === 0 && !extraOffering) || selectedTags.length === 0) return;
    const offeringText = [...offeringPlayers, extraOffering].filter(Boolean).join(", ");
    const looking = selectedTags.join(", ");
    const { data } = await supabase
      .from("trade_posts")
      .insert([{ manager, offering: offeringText, looking, notes }])
      .select();
    setPosts([data[0], ...posts]);
    setOfferingPlayers([]);
    setExtraOffering("");
    setSelectedTags([]);
    setNotes("");
  }

  async function handleDelete(id) {
    await supabase.from("trade_posts").delete().eq("id", id);
    setPosts(posts.filter(p => p.id !== id));
  }

  const positionColors = {
    QB: "text-red-400",
    RB: "text-green-400",
    WR: "text-blue-400",
    TE: "text-yellow-400",
    K: "text-gray-400"
  };

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
          <div className="flex flex-col gap-4">

            <select
              value={manager}
              onChange={e => handleManagerSelect(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white"
            >
              <option value="">Select your name</option>
              {users.map(u => (
                <option key={u.user_id} value={u.display_name}>{u.display_name}</option>
              ))}
            </select>

            {rosterLoading && (
              <p className="text-gray-500 text-sm">Loading your roster...</p>
            )}

            {myPlayers.length > 0 && (
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Select players you're willing to trade</label>
                <div className="flex flex-wrap gap-2">
                  {myPlayers.map(p => (
                    <button
                      key={p.player_id}
                      onClick={() => togglePlayer(p.full_name)}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        offeringPlayers.includes(p.full_name)
                          ? 'bg-green-600 border-green-500 text-white'
                          : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                      }`}
                    >
                      <span className={`text-xs font-bold mr-1 ${positionColors[p.position]}`}>{p.position}</span>
                      {p.full_name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              value={extraOffering}
              onChange={e => setExtraOffering(e.target.value)}
              placeholder="Add picks (e.g. 2027 1st, 2027 2nd)"
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
            />

            <div>
              <label className="text-sm text-gray-400 mb-2 block">What are you looking for?</label>
              <div className="flex flex-wrap gap-2">
                {LOOKING_FOR_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-green-600 border-green-500 text-white'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <input
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes? (optional)"
              className="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500"
            />

            <button
              onClick={handleSubmit}
              className="bg-green-600 hover:bg-green-500 text-white font-semibold px-6 py-2 rounded"
            >
              Post Trade
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loading && <p className="text-gray-500 text-center py-8">Loading posts...</p>}
          {!loading && posts.length === 0 && (
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
              <div className="flex flex-col gap-2 text-sm">
                <p><span className="text-gray-400">Offering:</span> {post.offering}</p>
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-gray-400">Looking for:</span>
                  {post.looking.split(", ").map(tag => (
                    <span key={tag} className="bg-gray-800 border border-gray-700 text-gray-300 px-2 py-0.5 rounded-full text-xs">{tag}</span>
                  ))}
                </div>
                {post.notes && <p><span className="text-gray-400">Notes:</span> {post.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}