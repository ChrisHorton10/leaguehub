export default function Home() {
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
        <main className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-5xl font-bold mb-4">Welcome to League Hub</h2>
          <p className="text-gray-400 text-xl">Your fantasy football headquarters</p>
        </main>
      </div>
    );
  }
  