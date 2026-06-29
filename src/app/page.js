'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [resultsLoading, setResultsLoading] = useState(false);

  const handleShowResults = () => {
    setShowResults(true);
    setResultsLoading(true);
    fetch('/api/results')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setResultsLoading(false);
      });
  };

  useEffect(() => {
    // Generate deviceId if doesn't exist
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("device_id", deviceId);
    }

    // Fetch events
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
      <header className="text-center mb-16 animate-fade-in flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight text-gray-800">
          Desafio de Chefsitos
        </h1>
        <img 
          src="/chefsito.png" 
          alt="Chefsito Logo" 
          className="w-32 h-32 object-contain mb-4 rounded-full shadow-sm bg-white p-2 border border-gray-100"
        />
        <p className="text-gray-600 text-lg">Elige un evento para calificar de manera anónima.</p>
      </header>

      <section className="grid gap-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        ) : (
          events.map((event, index) => (
            <Link 
              key={event.id} 
              href={event.vote_count >= 4 ? "#" : `/event/${event.id}`}
              className={`glass-card p-8 block animate-fade-in transition-all ${event.vote_count >= 4 ? 'opacity-70 cursor-not-allowed border-pink-200' : 'hover:scale-[1.02]'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-semibold mb-1 text-gray-800 flex items-center">
                    {event.name}
                    {event.vote_count >= 4 && (
                      <span className="ml-3 text-xs bg-pink-100 text-pink-600 px-2 py-1 rounded-md uppercase font-black">
                        Límite alcanzado
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 font-medium">
                    <span className={`px-2 py-0.5 rounded-full mr-2 ${event.vote_count >= 4 ? 'bg-pink-100 text-pink-500' : 'bg-pastel-green/20 text-pastel-green-dark'}`}>
                      {event.vote_count} {event.vote_count === 1 ? 'voto' : 'votos'}
                    </span>
                    <span>{event.vote_count >= 4 ? 'registrados (cerrado)' : 'registrados'}</span>
                  </div>
                </div>
                <div className={event.vote_count >= 4 ? 'text-gray-300' : 'text-accent'}>
                  {event.vote_count >= 4 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            </Link>
          ))
        )}
      </section>

      <footer className="mt-20 text-center text-gray-500 text-sm animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <button 
          onClick={handleShowResults}
          className="mb-6 px-8 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 hover:scale-105 transition-all shadow-md flex items-center justify-center mx-auto"
        >
          <span className="mr-2">🏆</span> Ver Resultados
        </button>
        <p className="opacity-80">Tus votos son 100% anónimos ✨</p>
      </footer>

      {showResults && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowResults(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center justify-center">
              🏆 Resultados Finales
            </h2>
            
            {resultsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {results.map((result) => (
                  <div key={result.id} className={`p-5 rounded-2xl border-2 transition-all ${result.is_winner ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-sm scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 text-lg flex items-center">
                        {result.is_winner && <span className="mr-2 text-2xl drop-shadow-sm" title="Ganador">👑</span>}
                        {result.name}
                      </h3>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                        {result.vote_count} votos
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <p className="text-gray-500 text-xs font-medium mb-1">Puntaje Total</p>
                        <p className="font-black text-xl text-gray-800">{result.total_score}</p>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <p className="text-gray-500 text-xs font-medium mb-1">Promedio</p>
                        <p className="font-black text-xl text-indigo-600">{Number(result.average_score).toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
