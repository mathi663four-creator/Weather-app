import React, { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

export default function WeatherChart({ chartData }) {
  const canvasRef   = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chartData || !canvasRef.current) return;
    if (instanceRef.current) { try { instanceRef.current.destroy(); } catch(e){} instanceRef.current = null; }
    const ctx = canvasRef.current.getContext('2d');

    const g1 = ctx.createLinearGradient(0,0,0,160);
    g1.addColorStop(0,'rgba(139,92,246,0.5)'); g1.addColorStop(1,'rgba(139,92,246,0.02)');
    const g2 = ctx.createLinearGradient(0,0,0,160);
    g2.addColorStop(0,'rgba(96,165,250,0.4)'); g2.addColorStop(1,'rgba(96,165,250,0.02)');

    instanceRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          { label:'Temp °C',    data:chartData.temps, borderColor:'#fcb605', backgroundColor:g1, tension:0.4, fill:true, pointRadius:2, borderWidth:2, yAxisID:'y' },
          { label:'Humidity %', data:chartData.hums,  borderColor:'#60a5fa', backgroundColor:g2, tension:0.4, fill:true, pointRadius:2, borderWidth:2, yAxisID:'y1' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode:'index', intersect:false },
        plugins: {
          legend: { labels: { color:'rgba(255,255,255,0.6)', font:{ family:'Outfit' }, boxWidth:10 } },
        },
        scales: {
          x:  { ticks:{ color:'rgba(255,255,255,0.4)', maxTicksLimit:8, font:{family:'Outfit'} }, grid:{ color:'rgba(255,255,255,0.05)' } },
          y:  { position:'left',  ticks:{ color:'rgba(255,255,255,0.4)', font:{family:'Outfit'} }, grid:{ color:'rgba(255,255,255,0.05)' }, title:{ display:true, text:'°C', color:'rgba(255,255,255,0.4)' } },
          y1: { position:'right', ticks:{ color:'rgba(255,255,255,0.4)', font:{family:'Outfit'} }, grid:{ drawOnChartArea:false }, title:{ display:true, text:'%', color:'rgba(255,255,255,0.4)' } },
        },
      },
    });
    return () => { if (instanceRef.current) { try { instanceRef.current.destroy(); } catch(e){} instanceRef.current = null; } };
  }, [chartData]);

  return (
    <div className="glass" style={{ height: 240 }}>
      <div className="section-label">📈 24h Temp & Humidity</div>
      {chartData
        ? <canvas ref={canvasRef} style={{ width:'100%', height:'calc(100% - 28px)' }} />
        : <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'75%', opacity:0.3, fontSize:'0.85rem' }}>Search a city to load chart</div>
      }
    </div>
  );
}