'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <p className="opacity-80">Tus votos son 100% anónimos ✨</p>
      </footer>
    </main>
  );
}
