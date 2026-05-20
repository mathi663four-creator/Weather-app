import React, { useState, useEffect } from 'react';
import { fetchRainAdvice, fetchLifestylePlan } from '../utils/api';
import { getOutfitSuggestion, getVitaminDAdvice, makeTime } from '../utils/weatherHelpers';
import { getLastCity, getLatestWeather, getTheme } from '../utils/storage';

const PLANT_DATA = {
  tomato:     { minT:18, maxT:35, minH:50, maxH:80 },
  rose:       { minT:15, maxT:30, minH:40, maxH:70 },
  moneyPlant: { minT:15, maxT:35, minH:30, maxH:60 },
  cactus:     { minT:20, maxT:45, minH:10, maxH:40 },
  jasmine:    { minT:20, maxT:38, minH:40, maxH:70 },
};

export default function MenuPage({ onBack }) {
  const [plant,         setPlant]         = useState('');
  const [plantTemp,     setPlantTemp]     = useState('');
  const [plantHum,      setPlantHum]      = useState('');
  const [plantResult,   setPlantResult]   = useState('');
  const [rainAdvice,    setRainAdvice]    = useState('');
  const [outfitTemp,    setOutfitTemp]    = useState('');
  const [condition,     setCondition]     = useState('');
  const [outfitResult,  setOutfitResult]  = useState('');
  const [uvInput,       setUvInput]       = useState('');
  const [vitaminResult, setVitaminResult] = useState('');
  const [uvLevel,       setUvLevel]       = useState(0);
  const [planHTML,      setPlanHTML]      = useState('');

  const darkMode = getTheme() === 'dark';
  const BG = darkMode
    ? 'linear-gradient(135deg,#0a0a1a 0%,#0d0b2e 50%,#1a0a2e 100%)'
    : 'linear-gradient(135deg,#1a0a3e 0%,#2d1b69 25%,#3d2b8a 50%,#1e1b4b 75%,#0f0a2e 100%)';

  useEffect(() => {
    const lw = getLatestWeather();
    if (lw.temp) {
      setPlantTemp(Math.round(lw.temp));
      setPlantHum(lw.humidity || '');
      setOutfitTemp(Math.round(lw.temp));
      const c = (lw.condition || '').toLowerCase();
      if      (c.includes('clear')) setCondition('clear');
      else if (c.includes('cloud')) setCondition('cloudy');
      else if (c.includes('rain'))  setCondition('rainy');
      else if (c.includes('snow'))  setCondition('snowy');
    }
  }, []); // eslint-disable-line

  const checkPlant = () => {
    if (!plant || !plantTemp || !plantHum) { setPlantResult('Please fill all fields.'); return; }
    const d = PLANT_DATA[plant];
    const t = parseFloat(plantTemp);
    const h = parseFloat(plantHum);
    setPlantResult(
      t < d.minT || t > d.maxT || h < d.minH || h > d.maxH
        ? plant + ' conditions not ideal. Try adjusting watering or light.'
        : plant.charAt(0).toUpperCase() + plant.slice(1) + ' is thriving in current conditions!'
    );
  };

  const checkRain = async () => {
    setRainAdvice('Checking forecast...');
    try {
      const { rainExpected, humAvg } = await fetchRainAdvice(getLastCity());
      setRainAdvice(
        rainExpected ? 'Rain expected - skip watering today!' :
        humAvg > 75  ? 'High humidity - reduce watering.' :
                       'No rain - normal schedule.'
      );
    } catch (e) { setRainAdvice('Unable to fetch data.'); }
  };

  const checkOutfit = () => {
    const t = parseFloat(outfitTemp);
    if (isNaN(t) || !condition) { setOutfitResult('Enter temperature and condition.'); return; }
    setOutfitResult(getOutfitSuggestion(t, condition));
  };

  const checkVitaminD = () => {
    const uv = parseFloat(uvInput);
    if (isNaN(uv) || uv <= 0) { setVitaminResult('Enter valid UV index (1-10).'); return; }
    setVitaminResult(getVitaminDAdvice(uv));
    setUvLevel(Math.min(Math.max(uv, 0), 10));
  };

  const generatePlan = async () => {
    setPlanHTML('Analyzing weather...');
    try {
      const { bestExercise, bestPhoto, rainHours } = await fetchLifestylePlan(getLastCity());
      let html = '';
      html += bestExercise ? 'Recommended exercise time: <b>' + makeTime(bestExercise) + '</b><br>' : 'No ideal exercise time.<br>';
      html += bestPhoto    ? 'recommended photo time: <b>' + makeTime(bestPhoto) + '</b><br>'  : 'No clear golden hour.<br>';
      html += rainHours.length
        ? 'Avoid outdoors: <b>' + rainHours.map(makeTime).join(', ') + '</b>'
        : 'No rain expected in next 24 hours.';
      setPlanHTML(html);
    } catch (e) { setPlanHTML('Unable to generate plan.'); }
  };

  const card = {
    background: 'rgba(255,255,255,0.10)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: 24,
    border: '1px solid rgba(255,255,255,0.18)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
    padding: 'clamp(16px,4vw,28px)',
    color: '#fff',
  };
  const inp = {
    padding: '10px 14px', borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.3)',
    background: 'rgba(255,255,255,0.12)', color: '#fff',
    fontFamily: 'inherit', fontSize: 'clamp(0.85rem,2.2vw,0.92rem)',
    outline: 'none', flex: 1, minWidth: 90, width: '100%',
  };
  const btn = {
    border: '1px solid rgba(255,255,255,0.4)', padding: '10px 18px',
    borderRadius: 12, cursor: 'pointer', fontWeight: 700,
    background: 'rgba(255,255,255,0.18)', color: '#fff',
    fontFamily: 'inherit', fontSize: 'clamp(0.85rem,2.2vw,0.9rem)',
    transition: 'all 0.2s', whiteSpace: 'nowrap',
  };
  const result = {
    marginTop: 12, padding: '10px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#fff', fontWeight: 600,
    fontSize: 'clamp(0.82rem,2.2vw,0.9rem)',
  };
  const h2s = {
    fontWeight: 700, fontSize: 'clamp(0.95rem,2.5vw,1.05rem)',
    margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff',
  };
  const ps = { opacity: 0.72, fontSize: 'clamp(0.78rem,2vw,0.85rem)', margin: '0 0 14px' };

  return (
    <div style={{
      fontFamily: "'DM Sans','Inter',sans-serif",
      minHeight: '100vh',
      background: BG,
      backgroundAttachment: 'fixed',
      color: '#fff',
      position: 'relative',
    }}>

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', overflow:'hidden' }}>
        <div style={{ position:'absolute', width:600, height:600, top:'-15%', right:'-10%', borderRadius:'50%', background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)' }} />
        <div style={{ position:'absolute', width:400, height:400, bottom:'-5%', left:'-5%', borderRadius:'50%', background:'radial-gradient(circle,rgba(99,102,241,0.1) 0%,transparent 70%)' }} />
      </div>

      <div style={{ position:'relative', zIndex:1, padding:'clamp(12px,3vw,24px)' }}>
        <div style={{ maxWidth:900, margin:'0 auto' }}>

          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24, flexWrap:'wrap' }}>
            <button onClick={onBack} style={{ ...btn, padding:'9px 18px' }}>Back</button>
            <div>
              <h1 style={{ fontWeight:700, fontSize:'clamp(1.1rem,4vw,1.4rem)', margin:0 }}>Smart Features</h1>
              <p style={{ opacity:0.72, fontSize:'clamp(0.75rem,2vw,0.85rem)', margin:0 }}>Advanced weather tools for your lifestyle</p>
            </div>
          </div>

          <div className="menu-grid">

            <div style={card}>
              <h2 style={h2s}>Plant Health</h2>
              <p style={ps}>Check if weather suits your plant.</p>
              <div className="input-row">
                <select style={{ ...inp, cursor:'pointer' }} value={plant} onChange={e => setPlant(e.target.value)}>
                  <option value="" style={{ color:'#000' }}>Select Plant</option>
                  {Object.keys(PLANT_DATA).map(k => (
                    <option key={k} value={k} style={{ color:'#000' }}>
                      {k.charAt(0).toUpperCase() + k.slice(1)}
                    </option>
                  ))}
                </select>
                <input style={inp} type="number" placeholder="Temp C" value={plantTemp} onChange={e => setPlantTemp(e.target.value)} />
                <input style={inp} type="number" placeholder="Humidity %" value={plantHum} onChange={e => setPlantHum(e.target.value)} />
                <button style={btn} onClick={checkPlant}>Check</button>
              </div>
              {plantResult && <div style={result}>{plantResult}</div>}
            </div>

            <div style={card}>
              <h2 style={h2s}>Rain and Water</h2>
              <p style={ps}>Plan your watering schedule smartly.</p>
              <button style={{ ...btn, width:'100%' }} onClick={checkRain}>Check Upcoming Rain</button>
              {rainAdvice && <div style={result}>{rainAdvice}</div>}
            </div>

            <div style={card}>
              <h2 style={h2s}>Outfit Recommender</h2>
              <p style={ps}>Get outfit ideas based on today's weather.</p>
              <div className="input-row">
                <input style={inp} type="number" placeholder="Temp C" value={outfitTemp} onChange={e => setOutfitTemp(e.target.value)} />
                <select style={{ ...inp, cursor:'pointer' }} value={condition} onChange={e => setCondition(e.target.value)}>
                  <option value="" style={{ color:'#000' }}>Condition</option>
                  {['clear','cloudy','rainy','snowy','windy'].map(c => (
                    <option key={c} value={c} style={{ color:'#000' }}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
                <button style={btn} onClick={checkOutfit}>Suggest</button>
              </div>
              {outfitResult && <div style={result}>{outfitResult}</div>}
            </div>

            <div style={card}>
              <h2 style={h2s}>Vitamin-D Index</h2>
              <p style={ps}>Calculate safe sun exposure from UV.</p>
              <div className="input-row">
                <input style={inp} type="number" placeholder="UV Index (1-10)" value={uvInput} onChange={e => setUvInput(e.target.value)} />
                <button style={btn} onClick={checkVitaminD}>Calculate</button>
              </div>
              {vitaminResult && <div style={result}>{vitaminResult}</div>}
              <div style={{ marginTop:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', opacity:0.65, marginBottom:6 }}>
                  {['0','2','4','6','8','10'].map(v => <span key={v}>{v}</span>)}
                </div>
                <div style={{ height:12, borderRadius:8, background:'linear-gradient(to right,#4ade80,#facc15,#fb923c,#f87171,#c084fc)', position:'relative' }}>
                  <div style={{
                    position:'absolute', top:-9,
                    left: (uvLevel / 10 * 100) + '%',
                    transform:'translateX(-50%)',
                    width:0, height:0,
                    borderLeft:'7px solid transparent',
                    borderRight:'7px solid transparent',
                    borderBottom:'11px solid #fff',
                    transition:'left 0.6s ease',
                  }} />
                </div>
                <div style={{ textAlign:'center', marginTop:8, fontWeight:700, fontSize:'0.9rem' }}>
                  UV: {uvLevel.toFixed(1)}
                </div>
              </div>
            </div>

            <div style={card} className="full-width">
              <h2 style={h2s}>Lifestyle Scheduler</h2>
              <p style={ps}>Smart activity plan for the next 24 hours based on forecast.</p>
              <button style={{ ...btn, minWidth:160 }} onClick={generatePlan}>Generate Plan</button>
              {planHTML && (
                <div style={{ ...result, marginTop:14, lineHeight:2 }} dangerouslySetInnerHTML={{ __html: planHTML }} />
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}