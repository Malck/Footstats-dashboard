import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '80vh', gap: '2rem', textAlign: 'center',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', lineHeight: 1 }}>
        <span style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 900,
          letterSpacing: '-.05em',
          color: 'var(--text)',
          fontFamily: "'Inter', sans-serif",
        }}>4</span>

        {/* Ballon de foot SVG */}
        <svg
          viewBox="0 0 100 100"
          style={{ width: 'clamp(80px, 12vw, 130px)', height: 'clamp(80px, 12vw, 130px)' }}
        >
          <circle cx="50" cy="50" r="48" fill="#1e293b" stroke="#334155" strokeWidth="2"/>
          {/* Pentagone central */}
          <polygon
            points="50,22 65,35 60,52 40,52 35,35"
            fill="#38bdf8" opacity="0.9"
          />
          {/* Pentagones autour */}
          <polygon points="50,22 65,35 75,20 62,8 48,8"   fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <polygon points="65,35 75,20 90,30 88,47 73,50" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <polygon points="60,52 73,50 78,65 65,75 50,68" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <polygon points="40,52 50,68 35,75 22,65 27,50" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <polygon points="35,35 27,50 12,47 10,30 25,20" fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <polygon points="50,22 35,35 25,20 38,8 52,8"   fill="#0f172a" stroke="#334155" strokeWidth="1"/>
          <circle cx="50" cy="50" r="48" fill="none" stroke="#334155" strokeWidth="2"/>
        </svg>

        <span style={{
          fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 900,
          letterSpacing: '-.05em',
          color: 'var(--text)',
          fontFamily: "'Inter', sans-serif",
        }}>4</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)' }}>
          Page introuvable
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '.95rem', maxWidth: 360 }}>
          Cette page n'existe pas ou a été déplacée.
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="btn-more"
        style={{ marginTop: '.5rem' }}
      >
        ← Retour à l'accueil
      </button>
    </div>
  );
}