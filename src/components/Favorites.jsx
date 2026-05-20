import React from 'react';
import { getFavorites, addFavorite } from '../utils/storage';

export default function Favorites({ currentCity, onSelect, toast }) {
  const [favorites, setFavorites] = React.useState(getFavorites);

  const handleSave = () => {
    if (!currentCity) { toast.showInfo('No city', 'Load a city first.'); return; }
    addFavorite(currentCity);
    setFavorites(getFavorites());
    toast.showSuccess('Saved', `${currentCity} added to favorites.`);
  };

  return (
    <div className="glass">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="section-label" style={{ marginBottom: 0 }}>⭐ Favorites</div>
        <button onClick={handleSave} style={{
          background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)',
          borderRadius: 10, padding: '5px 12px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'inherit', fontSize: '0.78rem', color: '#c4b5fd',
        }}>+ Add</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {favorites.length === 0 && <span style={{ opacity: 0.3, fontSize: '0.82rem' }}>No favorites yet.</span>}
        {favorites.slice(0, 8).map((city, i) => (
          <button key={i} onClick={() => onSelect(city)} style={{
            padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontFamily: 'inherit', fontSize: '0.83rem', fontWeight: 600,
            transition: 'all 0.2s',
          }}>{city}</button>
        ))}
      </div>
    </div>
  );
}