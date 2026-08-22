'use client'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { RefreshCw, Download, Bell, Search, Printer, Moon, Sun, X, CheckCircle2, AlertCircle } from 'lucide-react';
interface Exam {
  _id:string; name:string; class:string; subject:string; examDate:string;
  totalMarks:number; status: 'upcoming' | 'completed' | 'cancelled';
  createdAt:string; updatedAt:string; __v:number;
}
interface DashboardData {
  students:{total:number;presentToday:number;absentToday:number};
  teachers:{total:number};
  classes:{total:number};
  fees:{totalAmount:number;paidAmount:number;pendingCount:number;collectionPct:number};
  notices:{total:number};
  sms: {sentToday:number};
  upcomingExams:Exam[];
  classAttendance?: { class:string; present:number; total:number }[];
  topDefaulters?: { name:string; class:string; amountDue:number }[];
}
interface StatCard { label:string; value:number; suffix?:string; icon:string; color:string; bg:string; change:string; up:boolean; isCurrency?:boolean }
interface ActivityItem {icon:string;text:string;time:string;color:string}
interface QuickAction  { href: string; label: string; icon: string; color:string;bg:string}
interface FeeSummaryItem { label: string; value: string; color:string;bg:string}
interface Toast { id:number; type:'success'|'error'|'info'; text:string }

const RECENT_ACTIVITY: ActivityItem[] = [
  { icon: '🔴', text:'Priya Patel marked ABSENT – SMS sent to parent',time:'8:46 AM',color:'#fee2e2'},
  { icon: '🔴', text:'Kabir Khan marked ABSENT – SMS alert failed',time:'8:47 AM',color:'#fee2e2'},
  { icon: '📢', text:'New notice: Annual Sports Day published',time: '9:00 AM',color:'#e0f2fe'},
  { icon: '💰', text:'Fee received: Arjun Singh – ₹10,000',time: '10:15 AM',color:'#d1fae5'},
  { icon: '📱', text:'Bulk SMS sent to Class 10 parents (PTM reminder)',time:'10:30 AM',color:'#e0f2fe'},
  { icon: '✏️', text:'Exam schedule added: Unit Test 1 – Class 10-A Math',time:'11:00 AM',color:'#ede9fe'},
];
const QUICK_ACTIONS: QuickAction[] = [
  { href:'/attendance',label: 'Mark Attendance',icon:'✅',color:'#059669',bg:'#d1fae5'},
  { href:'/sms',label:'Send SMS',icon:'📱',color:'#0284c7',bg:'#e0f2fe'},
  { href:'/students',label:'Add Student',icon:'➕',color:'#7c3aed',bg:'#ede9fe'},
  { href:'/notices',label:'Post Notice',icon:'📢',color:'#db2777',bg:'#fce7f3'},
  { href:'/fees',label:'Collect Fee',icon:'💰',color:'#d97706',bg:'#fef3c7'},
  { href:'/exams',label:'Add Exam',icon:'📝',color:'#1e3a5f',bg:'#e0e7ff'},
];
const ATTENDANCE_TREND = [
  { day: 'Mon', pct: 92 }, { day: 'Tue', pct: 88 }, { day: 'Wed', pct: 95 },
  { day: 'Thu', pct: 90 }, { day: 'Fri', pct: 93 }, { day: 'Sat', pct: 85 },
];
const API_URL  = 'https://edumanagebackend-1.onrender.com/api/v1/dashboard';
const TIMEOUT_MS = 20_000;
const MAX_RETRY  = 2;
const AUTO_REFRESH_MS = 60_000;

function formatINR(amount: number):string{
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount}`;
}
function deduplicateExams(exams:Exam[]):Exam[]{
  const seen = new Map<string,Exam>();
  for (const exam of exams){
    const key = `${exam.name}-${exam.class}-${exam.subject}-${exam.examDate}`;
    if (!seen.has(key)) seen.set(key,exam);
  }
  return Array.from(seen.values());
}
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
}
function clearSession(){
  ['token', 'user'].forEach((k)=>{ localStorage.removeItem(k); sessionStorage.removeItem(k); });
}
async function fetchWithTimeout(url:string,options:RequestInit,ms:number):Promise<Response>{
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(),ms);
  try { return await fetch(url,{...options, signal:controller.signal}); }
  finally { clearTimeout(timer); }
}
function downloadCSV(stats: StatCard[]) {
  const rows = [
    ['Metric', 'Value', 'Detail'],
    ...stats.map(s => [s.label, s.isCurrency ? formatINR(s.value) : String(s.value), s.change]),
  ];
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `dashboard-snapshot-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function useCountUp(target: number, durationMs = 700) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    function tick(now: number) {
      const progress = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3); 
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, durationMs]);
  return value;
}
function StatCardView({ stat, index }: { stat: StatCard; index: number }) {
  const animated = useCountUp(stat.value);
  const displayValue = stat.isCurrency ? formatINR(animated) : `${animated}${stat.suffix ?? ''}`;
  return (
    <div className="stat-card fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="stat-icon" style={{ background: stat.bg }}>
        <span style={{ fontSize: 22 }}>{stat.icon}</span>
      </div>
      <div className="stat-info">
        <h3 style={{ color: stat.color }}>{displayValue}</h3>
        <p>{stat.label}</p>
        <div className={`stat-change ${stat.up ? 'up' : 'down'}`}>
          {stat.up ? '↑' : '↓'} {stat.change}
        </div>
      </div>
    </div>
  );
}
function AttendanceTrendChart({ data }: { data: { day: string; pct: number }[] }) {
  const max = 100, w = 260, h = 90;
  const barW = w / data.length - 8;
  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} width="100%" height={h + 20} role="img" aria-label="Attendance trend, last 6 days">
      {data.map((d, i) => {
        const barH = (d.pct / max) * h;
        const x = i * (w / data.length) + 4;
        const y = h - barH;
        return (
          <g key={d.day}>
            <rect x={x} y={y} width={barW} height={barH} rx={4}
              fill={d.pct >= 90 ? '#059669' : d.pct >= 80 ? '#0891b2' : '#d97706'} opacity={0.9} />
            <text x={x + barW / 2} y={h + 14} fontSize={10} textAnchor="middle" fill="#64748b">{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
}
function StatSkeleton(){
  return (
    <div className="stat-card skeleton-card">
      <div className="skeleton-circle" />
      <div style={{ flex: 1 }}>
        <div className="skeleton-line" style={{ width: '50%', height: 20, marginBottom: 8 }} />
        <div className="skeleton-line" style={{ width: '70%', height: 12, marginBottom: 6 }} />
        <div className="skeleton-line" style={{ width: '40%', height: 10 }} />
      </div>
    </div>
  );
}

let toastIdCounter = 0;

export default function Dashboard(){
  const [dashData,setDashData] = useState<DashboardData | null>(null);
  const [loading,setLoading]  = useState(true);
  const [retrying,setRetrying] = useState(false);
  const [error,setError]    = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [examSearch, setExamSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const pushToast = useCallback((type: Toast['type'], text: string) => {
    const id = ++toastIdCounter;
    setToasts(t => [...t, { id, type, text }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-theme');
    if (saved === 'dark') setDarkMode(true);
  }, []);
  useEffect(() => {
    localStorage.setItem('dashboard-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  const fetchDashboard = useCallback(async (attempt = 1, silent = false)=>{
    try {
      if (!silent) setLoading(true);
      setError(null);
      const token = getToken();
      if (!token){ return; }
      let response:Response;
      try {
        response = await fetchWithTimeout(
          API_URL, { method:'GET',headers:{Authorization:`Bearer ${token}`}}, TIMEOUT_MS,
        );
      } catch (fetchErr:any){
        if (attempt < MAX_RETRY){
          setRetrying(true);
          await new Promise((r)=> setTimeout(r,3000));
          setRetrying(false);
          return fetchDashboard(attempt + 1, silent);
        }
        throw new Error('Cannot reach the server. It may be waking up — please wait a moment and try again.');
      }
      if (response.status === 401){ clearSession(); return; }
      const json = await response.json();
      if (!response.ok){ throw new Error(json?.message || `Server error (${response.status})`); }
      if (json.success && json.data){
        setDashData(json.data);
        setLastUpdated(new Date());
        if (silent) pushToast('success', 'Dashboard refreshed');
      } else {
        throw new Error(json?.message || 'Unexpected response from server.');
      }
    } catch (err:any){
      setError(err.message || 'Something went wrong.');
      if (silent) pushToast('error', 'Refresh failed');
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  },[pushToast]);
  useEffect(()=> {fetchDashboard();},[fetchDashboard]);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchDashboard(1, true), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, fetchDashboard]);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'r' || e.key === 'R') { fetchDashboard(1, true); }
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fetchDashboard]);
  const students      = dashData?.students      ?? {total:0,presentToday:0,absentToday:0};
  const teachers      = dashData?.teachers      ?? {total:0};
  const classes       = dashData?.classes       ?? {total:0};
  const fees          = dashData?.fees          ?? {totalAmount:0,paidAmount:0,pendingCount:0,collectionPct:0};
  const notices       = dashData?.notices       ?? {total:0};
  const sms           = dashData?.sms           ?? {sentToday:0};
  const upcomingExams = dashData?.upcomingExams ?? [];
  const classAttendance = dashData?.classAttendance ?? [];
  const topDefaulters = dashData?.topDefaulters ?? [];
  const pendingFees   = fees.totalAmount - fees.paidAmount;
  const attendancePct = students.total > 0 ? ((students.presentToday / students.total) * 100).toFixed(1) : '0.0';
  const absentPct     = students.total > 0 ? ((students.absentToday  / students.total) * 100).toFixed(1) : '0.0';
  const stats: StatCard[] = useMemo(() => [
    { label:'Total Students',value: students.total,icon:'🎓',color:'#1e3a5f',bg:'#e0e7ff',change:'Enrolled',up:true},
    { label:'Teachers',value:teachers.total,icon:'👩‍🏫',color:'#7c3aed',bg:'#ede9fe',change:'On staff',up:true},
    { label:'Classes',value: classes.total,icon:'📚',color:'#0891b2', bg: '#e0f2fe',change:'All active',up:true},
    { label:'Present Today',value: students.presentToday,icon:'✅',color:'#059669',bg:'#d1fae5', change:`${attendancePct}% attendance`,up:true},
    { label: 'Absent Today',value: students.absentToday,icon:'❌',color:'#dc2626',bg:'#fee2e2',change:`${absentPct}% absent`,up: false},
    { label:'Fee Pending',value:pendingFees,icon:'💰',color:'#d97706',bg: '#fef3c7',change: `${fees.pendingCount} students`, up: false, isCurrency:true},
    { label: 'Notices',value: notices.total,icon:'📢',color:'#db2777',bg:'#fce7f3',change:'Published',up:false},
    { label: 'SMS Sent Today',value: sms.sentToday,icon:'📱',color:'#0284c7',bg:'#e0f2fe',change: 'Alerts sent',up:true},
  ], [students, teachers, classes, fees, notices, sms, attendancePct, absentPct, pendingFees]);
  const feeSummary: FeeSummaryItem[] = useMemo(() => [
    { label:'Total Collected',value:formatINR(fees.paidAmount),color:'#059669',bg:'#d1fae5'},
    { label:'Pending',value:formatINR(pendingFees),color:'#d97706',bg:'#fef3c7'},
    { label:'Overdue',value:'₹0',color:'#dc2626',bg:'#fee2e2'},
    { label:'Collection Rate',value: `${fees.collectionPct}%`,color:'#1e3a5f',bg:'#e0e7ff'},
  ], [fees, pendingFees]);
  const filteredExams = useMemo(() => {
    const deduped = deduplicateExams(upcomingExams);
    if (!examSearch.trim()) return deduped;
    const q = examSearch.toLowerCase();
    return deduped.filter(e => e.name.toLowerCase().includes(q) || e.subject.toLowerCase().includes(q) || e.class.toLowerCase().includes(q));
  }, [upcomingExams, examSearch]);

  const notifications = useMemo(() => ([
    { text: `${notices.total} notices published`, time: 'Today' },
    { text: `${students.absentToday} students absent today`, time: 'Today' },
    { text: `${fees.pendingCount} students have pending fees`, time: 'Today' },
  ]), [notices.total, students.absentToday, fees.pendingCount]);

  return (
    <AppLayout title="Dashboard" subtitle={`Welcome back! Today is ${new Date().toDateString()}`}>
      <div className={darkMode ? 'dash-root dark' : 'dash-root'}>
        <div className="toast-stack" aria-live="polite">
          {toasts.map(t => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {t.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{t.text}</span>
              <button onClick={() => setToasts(ts => ts.filter(x => x.id !== t.id))} aria-label="Dismiss"><X size={12} /></button>
            </div>
          ))}
        </div>
        <div className="dash-toolbar">
          {lastUpdated && (
            <span className="toolbar-meta">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <label className="toolbar-toggle">
            <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
            Auto-refresh
          </label>
          <button onClick={() => fetchDashboard(1, true)} className="toolbar-btn" title="Refresh now (R)" aria-label="Refresh dashboard">
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button onClick={() => { downloadCSV(stats); pushToast('info', 'CSV export started'); }} className="toolbar-btn" title="Export snapshot as CSV">
            <Download size={14} /> Export
          </button>
          <button onClick={() => window.print()} className="toolbar-btn" title="Print dashboard">
            <Printer size={14} /> Print
          </button>
          <button onClick={() => setDarkMode(d => !d)} className="toolbar-btn" title="Toggle theme" aria-label="Toggle dark mode">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
          <div ref={notifRef} style={{ position:'relative' }}>
            <button onClick={() => setShowNotifs(v => !v)} className="toolbar-btn" title="Notifications" aria-label="Notifications">
              <Bell size={14} />
              {notifications.length > 0 && <span className="notif-dot" />}
            </button>
            {showNotifs && (
              <div className="notif-dropdown">
                <div className="notif-dropdown-header">Notifications</div>
                {notifications.map((n, i) => (
                  <div key={i} className="notif-item"><p>{n.text}</p><span>{n.time}</span></div>
                ))}
              </div>
            )}
          </div>
        </div>
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => fetchDashboard()} className="error-retry-btn">Retry</button>
          </div>
        )}
        {retrying && <div className="retry-banner">⏳ Server is waking up, retrying…</div>}
        {loading ? (
          <div className="stats-grid">
            {Array.from({ length: 8 }).map((_, i) => <StatSkeleton key={i} />)}
          </div>
        ) : (
          <div className="stats-grid">
            {stats.map((s, i) => <StatCardView key={s.label} stat={s} index={i} />)}
          </div>
        )}
        <div className="grid-2" style={{gap:20}}>
          <div className="card">
            <div className="card-header"><h3>📋 Recent Activity</h3><span className="badge badge-info">Today</span></div>
            <div className="card-body" style={{padding:'16px 24px'}}>
              <div className="timeline">
                {RECENT_ACTIVITY.map((a, i)=>(
                  <div key={i} className="timeline-item">
                    <div className="timeline-dot" style={{background:a.color,fontSize:16}}>{a.icon}</div>
                    <div className="timeline-content"><h4>{a.text}</h4><p>{a.time}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:'flex',flexDirection:'column',gap:20}}>
            <div className="card">
              <div className="card-header"><h3>⚡Quick Actions</h3></div>
              <div className="card-body">
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  {QUICK_ACTIONS.map((a)=>(
                    <Link key={a.href} href={a.href} className="quick-action"
                      style={{background:a.bg}}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.02)';}}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';}}
                    >
                      <span style={{ fontSize: 20 }}>{a.icon}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: a.color }}>{a.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <h3>📝 Upcoming Exams</h3>
                <Link href="/exams" style={{fontSize:12,color:'#1e3a5f',fontWeight:600}}>View all</Link>
              </div>
              <div className="card-body" style={{padding:'10px 24px 12px'}}>
                <div style={{ position:'relative', marginBottom: 10 }}>
                  <Search size={14} style={{ position:'absolute', left:10, top:9, color:'#94a3b8' }} />
                  <input
                    ref={searchRef}
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Search by name, subject or class… (/)"
                    className="search-input"
                  />
                </div>
                {loading ? (
                  <p className="empty-state">Loading…</p>
                ) : filteredExams.length === 0 ? (
                  <p className="empty-state">{examSearch ? 'No matching exams' : 'No upcoming exams'}</p>
                ) : (
                  filteredExams.map((exam)=> (
                    <div key={exam._id} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 0',borderBottom:'1px solid #f1f5f9' }}>
                      <span className="badge badge-info" style={{fontSize:10,whiteSpace:'nowrap'}}>Class {exam.class}</span>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 13 }}>{exam.name} – {exam.subject}</p>
                        <p style={{ fontSize: 11.5, color: '#64748b' }}>
                          {new Date(exam.examDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {'·'}{exam.totalMarks} marks
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="grid-2" style={{ gap: 20, marginTop: 20 }}>
          <div className="card">
            <div className="card-header"><h3>📈 Attendance Trend</h3><span className="badge badge-info">Last 6 days</span></div>
            <div className="card-body"><AttendanceTrendChart data={ATTENDANCE_TREND} /></div>
          </div>
          <div className="card">
            <div className="card-header">
              <h3>🏫 Class-wise Attendance</h3>
              <Link href="/attendance" style={{fontSize:12,color:'#1e3a5f',fontWeight:600}}>Details</Link>
            </div>
            <div className="card-body" style={{ padding: '10px 24px' }}>
              {classAttendance.length === 0 ? (
                <p className="empty-state">No class-wise data available yet</p>
              ) : (
                classAttendance.map(c => {
                  const pct = c.total > 0 ? Math.round((c.present / c.total) * 100) : 0;
                  return (
                    <div key={c.class} style={{ marginBottom: 10 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                        <span style={{ fontWeight:600 }}>Class {c.class}</span>
                        <span style={{ color:'#64748b' }}>{c.present}/{c.total} ({pct}%)</span>
                      </div>
                      <div className="progress-bar" style={{ height: 6 }}>
                        <div className="progress-fill" style={{ width: `${pct}%`, background: pct >= 90 ? '#059669' : pct >= 75 ? '#0891b2' : '#dc2626' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <div className="grid-2" style={{ gap: 20, marginTop: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3>💰 Fee Collection Overview</h3>
              <Link href="/fees" className="btn btn-outline btn-sm">Manage Fees</Link>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)',gap:12}}>
                {feeSummary.map((f,i)=>(
                  <div key={i} style={{background:f.bg,borderRadius: 10, padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: f.color, fontFamily: 'Syne, sans-serif' }}>{f.value}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4 }}>{f.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14}}>
                <div style={{ display:'flex',justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                  <span>Collection Progress</span><span>{fees.collectionPct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${fees.collectionPct}%`, background: 'linear-gradient(90deg,#1e3a5f,#3b82f6)' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>⚠️ Top Fee Defaulters</h3>
              <Link href="/fees" style={{fontSize:12,color:'#1e3a5f',fontWeight:600}}>View all</Link>
            </div>
            <div className="card-body" style={{ padding: '10px 24px' }}>
              {topDefaulters.length === 0 ? (
                <p className="empty-state">No defaulter data available yet</p>
              ) : (
                topDefaulters.slice(0, 5).map((d, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < topDefaulters.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                    <div>
                      <p style={{ fontWeight:600, fontSize:13 }}>{d.name}</p>
                      <p style={{ fontSize:11, color:'#64748b' }}>Class {d.class}</p>
                    </div>
                    <span style={{ fontWeight:700, fontSize:13, color:'#dc2626' }}>{formatINR(d.amountDue)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </AppLayout>
  );
}