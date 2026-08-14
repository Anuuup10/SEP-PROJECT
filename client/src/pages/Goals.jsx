import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Flame,
  Home,
  LayoutDashboard,
  ScanLine,
  History,
  CircleUserRound,
  TrendingUp,
} from 'lucide-react';
import khanaLensLogo from '../assets/images/KhanaLens.jpg';

const progressData = {
  kcal: {
    label: 'Calories',
    unit: 'kcal',
    current: 1820,
    goal: 2200,
    change: '+12%',
    color: '#4cae91',
    values: [1450, 1610, 1740, 1520, 1840, 2050, 1820],
  },
  protein: {
    label: 'Protein',
    unit: 'g',
    current: 96,
    goal: 120,
    change: '+8%',
    color: '#7a8dd8',
    values: [68, 76, 82, 73, 91, 110, 96],
  },
};

const periodOptions = [
  { id: 'week', label: 'This Week' },
  { id: 'two-weeks', label: 'Last 14 Days' },
  { id: 'month', label: 'This Month' },
];

const periodData = {
  kcal: {
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [1450, 1610, 1740, 1520, 1840, 2050, 1820] },
    'two-weeks': { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'], values: [1320, 1480, 1540, 1420, 1680, 1910, 1770, 1510, 1650, 1710, 1600, 1870, 2140, 1820] },
    month: { labels: ['1', '5', '10', '15', '20', '25', '30'], values: [1550, 1690, 1760, 1620, 1910, 2070, 1820] },
  },
  protein: {
    week: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [68, 76, 82, 73, 91, 110, 96] },
    'two-weeks': { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'], values: [61, 70, 74, 68, 78, 94, 86, 69, 77, 83, 75, 90, 112, 96] },
    month: { labels: ['1', '5', '10', '15', '20', '25', '30'], values: [71, 79, 85, 76, 94, 108, 96] },
  },
};

function ProgressChart({ metric, period, selectedIndex, onSelect }) {
  const width = 340;
  const height = 190;
  const padding = { top: 18, right: 19, bottom: 30, left: 42 };
  const data = { ...progressData[metric], ...periodData[metric][period] };
  const max = Math.ceil(Math.max(...data.values, data.goal) / (metric === 'kcal' ? 500 : 20)) * (metric === 'kcal' ? 500 : 20);
  const min = 0;
  const x = (index) => padding.left + (index * (width - padding.left - padding.right)) / (data.values.length - 1);
  const y = (value) => height - padding.bottom - ((value - min) / (max - min)) * (height - padding.top - padding.bottom);
  const points = data.values.map((value, index) => `${x(index)},${y(value)}`).join(' ');
  const peakIndex = data.values.reduce((bestIndex, value, index, values) => value > values[bestIndex] ? index : bestIndex, 0);
  const peakValue = data.values[peakIndex];
  const areaPoints = `${x(0)},${height - padding.bottom} ${points} ${x(data.values.length - 1)},${height - padding.bottom}`;
  const ticks = [0, max / 2, max];

  return (
    <div className="goal-chart-wrap">
      <div className="goal-chart-legend"><span><i style={{ background: data.color }} /> Daily progress</span><span><i className="goal-line" /> Goal: {data.goal.toLocaleString()}{data.unit}</span></div>
      <svg className="goal-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${data.label} progress over the last seven days`}>
        <defs>
          <linearGradient id="goal-area-kcal" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4cae91" stopOpacity=".25" /><stop offset="100%" stopColor="#4cae91" stopOpacity=".02" /></linearGradient>
          <linearGradient id="goal-area-protein" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#7a8dd8" stopOpacity=".23" /><stop offset="100%" stopColor="#7a8dd8" stopOpacity=".02" /></linearGradient>
        </defs>
        {ticks.map((tick) => <g key={tick}>
          <line x1={padding.left} x2={width - padding.right} y1={y(tick)} y2={y(tick)} className="chart-grid" />
          <text x={padding.left - 9} y={y(tick) + 4} textAnchor="end" className="chart-axis">{tick.toLocaleString()}</text>
        </g>)}
        <line x1={padding.left} x2={width - padding.right} y1={y(data.goal)} y2={y(data.goal)} className="chart-goal-line" />
        <line className="goal-peak-vertical" x1={x(peakIndex)} x2={x(peakIndex)} y1={y(peakValue)} y2={height - padding.bottom} pathLength="1" />
        {selectedIndex !== null && <line x1={x(Math.min(selectedIndex, data.values.length - 1))} x2={x(Math.min(selectedIndex, data.values.length - 1))} y1={y(data.values[Math.min(selectedIndex, data.values.length - 1)]) + 7} y2={height - padding.bottom} className="chart-selection-line" />}
        <polygon points={areaPoints} fill={`url(#goal-area-${metric})`} />
        <polyline className="goal-chart-line" pathLength="1" points={points} fill="none" stroke={data.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <g className="goal-peak-marker" style={{ '--peak-delay': `${.95 + peakIndex * .07}s` }} aria-label={`Peak: ${peakValue.toLocaleString()} ${data.unit}`}>
          <circle cx={x(peakIndex)} cy={y(peakValue)} r="12" fill={data.color} opacity=".16" className="goal-peak-pulse" />
          <circle cx={x(peakIndex)} cy={y(peakValue)} r="7" fill="#fff" stroke={data.color} strokeWidth="3" />
          <circle cx={x(peakIndex)} cy={y(peakValue)} r="3" fill={data.color} />
        </g>
        {data.values.map((value, index) => <g key={`${value}-${index}`}>
          <circle className={`chart-point goal-chart-point ${selectedIndex === index ? 'selected' : ''}`} style={{ '--point-index': index }} cx={x(index)} cy={y(value)} r={selectedIndex === index ? 6 : 5} fill="#fff" stroke={data.color} strokeWidth="2.5" tabIndex="0" role="button" aria-label={`${data.labels[index]}: ${value.toLocaleString()} ${data.unit}`} onClick={() => onSelect(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelect(index); }} />
          {selectedIndex === index && <g><rect x={x(index) - 31} y={y(value) - 32} width="62" height="22" rx="11" fill={data.color} /><text x={x(index)} y={y(value) - 17} textAnchor="middle" className="chart-tooltip">{value.toLocaleString()}{data.unit}</text></g>}
        </g>)}
        {data.labels.map((day, index) => <text key={`${day}-${index}`} x={x(index)} y={height - 8} textAnchor="middle" className="chart-axis">{day}</text>)}
      </svg>
    </div>
  );
}

export const Goals = () => {
  const [metric, setMetric] = useState('kcal');
  const [period, setPeriod] = useState('week');
  const [periodOpen, setPeriodOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(periodData.kcal.week.values.length - 1);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setHeaderScrolled(window.scrollY > 18);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const active = useMemo(() => ({ ...progressData[metric], ...periodData[metric][period] }), [metric, period]);
  const periodLabel = periodOptions.find((option) => option.id === period).label;
  const selectedValue = active.values[Math.min(selectedIndex, active.values.length - 1)];
  const selectedLabel = active.labels[Math.min(selectedIndex, active.labels.length - 1)];
  const completion = Math.round((active.current / active.goal) * 100);

  return (
    <div className="goals-viewport">
      <main className="goals-page">
        <div className={`goals-sticky-header ${headerScrolled ? 'scrolled' : ''}`}>
        <div className="goals-brandbar">
          <Link to="/home" className="goals-brand" aria-label="KhanaLens home">
            <span className="goals-brand-mark"><img src={khanaLensLogo} alt="" /></span>
            <span className="goals-brand-copy"><strong>Khana<span>Lens</span></strong><small>Scan. Analyze. Eat Smarter.</small></span>
          </Link>
          <div className="goals-header-actions">
            <button className="goals-icon-button" aria-label="Notifications"><Bell size={19} /></button>
            <Link to="/profile" className="goals-avatar" aria-label="Open profile">AS</Link>
          </div>
        </div>
        <header className="goals-topbar">
          <Link to="/home" className="goals-back" aria-label="Back to home"><ArrowLeft size={20} /></Link>
          <div><span className="eyebrow">YOUR JOURNEY</span><h1>Goal Progress</h1></div>
          <div className="period-picker">
            <button className="period-button" onClick={() => setPeriodOpen((open) => !open)} aria-expanded={periodOpen} aria-haspopup="listbox">{periodOptions.find((option) => option.id === period).label} <ChevronDown size={15} /></button>
            {periodOpen && <div className="period-menu" role="listbox" aria-label="Progress period">
              {periodOptions.map((option) => <button key={option.id} className={period === option.id ? 'active' : ''} onClick={() => { setPeriod(option.id); setSelectedIndex(periodData[metric][option.id].values.length - 1); setPeriodOpen(false); }} role="option" aria-selected={period === option.id}>{option.label}</button>)}
            </div>}
          </div>
        </header>
        </div>

        <section className="goal-card progress-card">
          <div className="progress-card-heading">
            <div><p className="card-kicker">{periodLabel.toUpperCase()} PROGRESS</p><h2>{active.label} progress</h2></div>
            <div className="metric-switch" role="tablist" aria-label="Choose progress metric">
              <button className={metric === 'kcal' ? 'selected' : ''} onClick={() => { setMetric('kcal'); setSelectedIndex(periodData.kcal[period].values.length - 1); }} role="tab" aria-selected={metric === 'kcal'}><Flame size={14} /> kcal</button>
              <button className={metric === 'protein' ? 'selected protein' : ''} onClick={() => { setMetric('protein'); setSelectedIndex(periodData.protein[period].values.length - 1); }} role="tab" aria-selected={metric === 'protein'}>Protein</button>
            </div>
          </div>
          <div className="goal-stat-row"><div><strong>{selectedValue.toLocaleString()} <small>{active.unit}</small></strong><span>{selectedLabel} · {periodLabel}</span></div><div className="goal-target"><span>Daily goal</span><strong>{active.goal.toLocaleString()} {active.unit}</strong></div><span className="goal-change"><TrendingUp size={14} /> {active.change}</span></div>
          <ProgressChart metric={metric} period={period} selectedIndex={selectedIndex} onSelect={setSelectedIndex} />
        </section>

        <section className="goal-card completion-card">
          <div className="completion-heading"><div><p className="card-kicker">AT A GLANCE</p><h2>Goal completion</h2><span className="completion-period">{periodLabel}</span></div><span className="completion-total">{completion}%<small>{periodLabel.toLowerCase()}</small></span></div>
          <div className="completion-row"><div><span>Calories</span><strong>82%</strong></div><div className="completion-track"><span className="completion-fill" style={{ width: '100%', '--target-width': '82%', background: '#18B895' }} /></div></div>
          <div className="completion-row"><div><span>Protein</span><strong>80%</strong></div><div className="completion-track"><span className="completion-fill" style={{ width: '100%', '--target-width': '80%', background: '#7a8dd8' }} /></div></div>
          <div className="completion-row"><div><span>Carbs</span><strong>66%</strong></div><div className="completion-track"><span className="completion-fill" style={{ width: '100%', '--target-width': '66%', background: '#f0ad62' }} /></div></div>
          <div className="completion-row"><div><span>Fat</span><strong>69%</strong></div><div className="completion-track"><span className="completion-fill" style={{ width: '100%', '--target-width': '69%', background: '#6db8b0' }} /></div></div>
        </section>

        <p className="goal-note">Small, consistent steps add up. Keep tracking to stay on course.</p>
        <nav className="dashboard-nav goals-nav" aria-label="Main navigation"><Link to="/home"><Home size={18} /><span>Home</span></Link><Link className="active" to="/progress/goals"><LayoutDashboard size={18} /><span>Progress</span></Link><Link className="scan-nav" to="/scan"><span><ScanLine size={24} /><b aria-hidden="true">✦</b></span><small>Scan</small></Link><Link to="/history"><History size={18} /><span>History</span></Link><Link to="/profile"><CircleUserRound size={19} /><span>Profile</span></Link></nav>
      </main>
    </div>
  );
};
