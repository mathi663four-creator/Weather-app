
const ICONS = { error: '❌', info: 'ℹ️', success: '✅', warning: '⚠️' };
const COLORS = { error: '#ef5350', success: '#66bb6a', warning: '#ffa726', info: '#29b6f6' };

export default function Toast({ toasts, remove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', top: 16, right: 16, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340,
    }}>
      {toasts.map(t => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(14px)',
          borderRadius: 12,
          padding: '12px 16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          display: 'flex', gap: 10, alignItems: 'flex-start',
          cursor: 'pointer',
          borderLeft: `4px solid ${COLORS[t.type] || COLORS.info}`,
          animation: 'slideIn 0.3s ease',
        }}>
          <span style={{ fontSize: '1.1rem' }}>{ICONS[t.type] || 'ℹ️'}</span>
          <div>
            {t.title && <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111' }}>{t.title}</div>}
            {t.text  && <div style={{ fontSize: '0.85rem', color: '#333', marginTop: 2 }}>{t.text}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}