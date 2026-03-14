'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function EventVote() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id;

  const [scores, setScores] = useState({
    creatividad: 3.0,
    sabor: 3.0,
    presentacion: 3.0,
    actividad: 3.0
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    const deviceId = localStorage.getItem("device_id");
    if (!deviceId) return;

    // Check if already voted
    fetch(`/api/vote?eventId=${eventId}&deviceId=${deviceId}`)
      .then(res => res.json())
      .then(data => {
        if (data.alreadyVoted) {
          setHasVoted(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const deviceId = localStorage.getItem("device_id");

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          eventId: parseInt(eventId),
          ...scores
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setHasVoted(true);
      } else {
        setError(data.error || 'Algo salió mal');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  return (
    <main className="min-h-screen px-6 py-12 max-w-xl mx-auto">
      <Link href="/" className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver
      </Link>

      <div className="glass-card p-8 animate-fade-in">
        {hasVoted ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">¡Ya calificaste este evento!</h2>
            <p className="text-gray-500 mb-8">Gracias por tu participación. Tus votos ayudan a mejorar cada evento.</p>
            <Link href="/" className="btn-primary inline-block">Ver otros eventos</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h1 className="text-3xl font-bold mb-8 tracking-tight text-gray-800">Califica el <span className="text-gradient">Evento {eventId}</span></h1>
            
            <div className="space-y-10">
              {Object.keys(scores).map((aspect) => (
                <div key={aspect} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-medium capitalize text-gray-700">
                      {aspect}
                    </label>
                    <span className="text-2xl font-bold text-[#bdb2ff]">{scores[aspect].toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={scores[aspect]}
                    onChange={(e) => setScores({ ...scores, [aspect]: parseFloat(e.target.value) })}
                  />
                  <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest font-bold">
                    <span>Mejorable</span>
                    <span>Increíble</span>
                  </div>
                </div>
              ))}
            </div>

            {error && <p className="text-pink-600 mt-8 text-center bg-pink-100 p-4 rounded-xl border border-pink-200">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary mt-12 text-lg py-4"
            >
              {submitting ? 'Enviando...' : 'Enviar Calificación'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
