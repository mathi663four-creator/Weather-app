
const BARS = (d, bs) => [
  { label:'UV',         icon:'☀️', pct:d?Math.min((d.uv/10)*100,100):0, val:d?` ${d.uv}/10`:'--', color:'#facc15' },
  { label:'Air Quality',icon:'🫁', pct:bs!==null?(bs/10)*100:0, val:bs!==null?`${bs.toFixed(0)}/10`:'--', color:bs!==null?(bs<5?'#f87171':bs<8?'#facc15':'#4ade80'):'#aaa' },
  { label:'Cloud Cover',icon:'☁️', pct:d?d.clouds:0, val:d?`${d.clouds} %`:'--', color:'#a78bfa' },
];

export default function DashboardBars({ dashboard: d, breathingScore: bs }) {
  return (
    <div className="glass">
      <div className="section-label">📊 Conditions</div>

      {BARS(d, bs).map(({ label, icon, pct, val, color }) => (
        <div key={label} style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, opacity: 0.8 }}>
              <span>{icon}</span><span>{label}</span>
            </div>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>{val}</span>
          </div>
          <div style={{ height: 5, background: 'rgba(139,92,246,0.2)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 4,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              boxShadow: `0 0 8px ${color}66`,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}