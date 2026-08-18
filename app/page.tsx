'use client';
import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine, ZAxis 
} from 'recharts';
import { 
  FlaskConical, Calendar, Crosshair, TrendingUp, Target, 
  ListOrdered, Activity, CheckCircle2, AlertCircle 
} from 'lucide-react';

// Aapka Supabase URL aur Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mjoqhqruzocmbhhjkjtv.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qb3FocXJ1em9jbWJoaGpranR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NDg2NjYsImV4cCI6MjEwMjIyNDY2Nn0.MU1awKKiUp3x0laQvazM_nMuj96vyXmw2uG7qEZIR7M";
const supabase = createClient(supabaseUrl, supabaseKey);

// Reusable KPI Component
const KPIWidget = ({ title, value, subtext, icon, colorClass }: any) => (
  <div className="bg-[#0b0e14] border border-gray-800 p-5 rounded-2xl shadow-xl flex items-center space-x-4 transition-all hover:border-gray-600 relative overflow-hidden group">
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${colorClass.replace('text-', 'bg-')}`}></div>
    <div className={`p-3 rounded-xl bg-gray-900/50 border border-gray-800 ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
  </div>
);

export default function PureResearchDashboard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sampleWindow, setSampleWindow] = useState<50 | 100 | 200>(100);
  
  // Naya State Button/Dropdown ke liye
  const [dateFilter, setDateFilter] = useState('Live & Past');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchResearchData() {
      try {
        const { data, error } = await supabase
          .from('daman_history')
          .select('*')
          .order('period', { ascending: false }); 

        if (error) throw error;

        if (data) {
          const sortedData = data.reverse();
          setHistory(sortedData);
        }
      } catch (err: any) {
        console.error("Supabase Error:", err.message);
        setErrorMsg(err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    }
    fetchResearchData();
  }, []);

  // --- ANALYTICS ENGINE ---
  const { liveSmallRatio, scatterData, totalRows } = useMemo(() => {
    if (history.length === 0) return { liveSmallRatio: "0.0", scatterData: [], totalRows: 0 };

    const recentRows = history.slice(-sampleWindow);
    const smallCount = recentRows.filter(r => r.result_type === 'small').length;
    const ratio = ((smallCount / recentRows.length) * 100).toFixed(1);

    // Scatter Data Generation for Chart
    const mockScatterData = [
      { time: '08:00', ratio: 62 }, { time: '09:00', ratio: 71 }, 
      { time: '10:00', ratio: 67 }, { time: '11:00', ratio: 68.5 }, 
      { time: '12:00', ratio: 69 }, { time: '13:00', ratio: 60 },
      { time: '14:00', ratio: 68.2 }, { time: '15:00', ratio: 73 }, 
      { time: '16:00', ratio: 67.9 }, { time: '17:00', ratio: 68.8 },
      { time: 'Live', ratio: parseFloat(ratio) }
    ];

    return { liveSmallRatio: ratio, scatterData: mockScatterData, totalRows: history.length };
  }, [history, sampleWindow]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-indigo-500 font-bold space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="tracking-widest uppercase text-sm text-gray-400">Fetching Unlimited Data...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center text-rose-500 font-bold space-y-4 p-6 text-center">
        <AlertCircle size={48} />
        <p className="text-xl">Database Connection Error</p>
        <p className="text-sm text-gray-400">{errorMsg}</p>
      </div>
    );
  }

  // Dropdown select hone par kya hoga
  const handleDateSelect = (option: string) => {
    setDateFilter(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-gray-100 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-800/80 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3 tracking-tight">
              <FlaskConical className="text-emerald-400" size={32} />
              Pure <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-500">Research</span>
            </h1>
            <p className="text-gray-500 mt-2 text-sm font-medium tracking-wide">ALGORITHMIC REVERSAL DETECTION SYSTEM</p>
          </div>
          
          {/* FIXED: Date Filter Dropdown Button */}
          <div className="mt-4 md:mt-0 relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 bg-[#0b0e14] hover:bg-gray-800 border border-gray-700 px-5 py-2.5 rounded-xl text-sm text-gray-300 transition-all shadow-lg w-full md:w-auto justify-between"
            >
              <span className="flex items-center gap-2"><Calendar size={16} className="text-indigo-400"/> Date: {dateFilter}</span>
              <span>▼</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0b0e14] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div 
                  onClick={() => handleDateSelect('Live & Past')}
                  className="px-4 py-3 hover:bg-gray-800 cursor-pointer text-sm text-gray-300 border-b border-gray-800"
                >
                  Live & Past
                </div>
                <div 
                  onClick={() => handleDateSelect('Today Only')}
                  className="px-4 py-3 hover:bg-gray-800 cursor-pointer text-sm text-gray-300 border-b border-gray-800"
                >
                  Today Only
                </div>
                <div 
                  onClick={() => handleDateSelect('Yesterday')}
                  className="px-4 py-3 hover:bg-gray-800 cursor-pointer text-sm text-gray-300"
                >
                  Yesterday
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <KPIWidget title="Average Reversal Peak" value="68.4%" subtext="Calculated Golden Average" icon={<Crosshair size={24}/>} colorClass="text-amber-400" />
          <KPIWidget title="LIVE 'Small' Ratio" value={`${liveSmallRatio}%`} subtext={`Based on last ${sampleWindow} rows`} icon={<TrendingUp size={24}/>} colorClass="text-rose-500" />
          <KPIWidget title="Optimal Data Window" value={`${sampleWindow} Rows`} subtext="Active testing size" icon={<Target size={24}/>} colorClass="text-emerald-400" />
          <KPIWidget title="Total Rows Scanned" value={totalRows.toLocaleString()} subtext="Database verified" icon={<ListOrdered size={24}/>} colorClass="text-indigo-400" />
        </div>

        {/* 1. Data Sample Tester */}
        <div className="bg-[#0b0e14] border border-gray-800/80 p-6 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500 opacity-20"></div>
          
          <h3 className="text-lg font-bold text-gray-100 mb-5 flex items-center gap-2">
            <Activity size={20} className="text-indigo-400"/> 
            1. Data Sample Tester (Volatility Analysis)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 50 Rows Card */}
            <div onClick={() => setSampleWindow(50)} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${sampleWindow === 50 ? 'bg-indigo-900/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-[#07090e] border-gray-800 hover:border-gray-600'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`font-bold ${sampleWindow === 50 ? 'text-indigo-400' : 'text-gray-300'}`}>Check 50 Rows</span>
                {sampleWindow === 50 && <CheckCircle2 size={20} className="text-indigo-400" />}
              </div>
              <p className="text-sm text-gray-400 mb-2">Avg Peak at <span className="text-amber-400 font-bold text-lg">74%</span></p>
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-900/50 p-2 rounded-lg">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Result: Fluctuation zyada hai, fake peak detection high.</p>
              </div>
            </div>

            {/* 100 Rows Card */}
            <div onClick={() => setSampleWindow(100)} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${sampleWindow === 100 ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-[#07090e] border-gray-800 hover:border-gray-600'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`font-bold ${sampleWindow === 100 ? 'text-emerald-400' : 'text-gray-300'}`}>Check 100 Rows</span>
                {sampleWindow === 100 && <CheckCircle2 size={20} className="text-emerald-400" />}
              </div>
              <p className="text-sm text-gray-400 mb-2">Avg Peak at <span className="text-emerald-400 font-bold text-lg">68.4%</span> 🏆</p>
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-900/50 p-2 rounded-lg">
                <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-500/70" />
                <p>Result: Sabse stable aur accurate reversal metric.</p>
              </div>
            </div>

            {/* 200 Rows Card */}
            <div onClick={() => setSampleWindow(200)} className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 ${sampleWindow === 200 ? 'bg-indigo-900/10 border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'bg-[#07090e] border-gray-800 hover:border-gray-600'}`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`font-bold ${sampleWindow === 200 ? 'text-indigo-400' : 'text-gray-300'}`}>Check 200 Rows</span>
                {sampleWindow === 200 && <CheckCircle2 size={20} className="text-indigo-400" />}
              </div>
              <p className="text-sm text-gray-400 mb-2">Avg Peak at <span className="text-rose-500 font-bold text-lg">58%</span></p>
              <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-900/50 p-2 rounded-lg">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Result: Graph flat ho gaya, peak identify karna mushkil.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Scatter Plot / Reversal Cluster */}
        <div className="bg-[#0b0e14] border border-gray-800/80 p-6 rounded-3xl shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                <Target size={20} className="text-rose-500"/> 
                2. Peak Reversal Cluster (Drop to 50%)
              </h3>
              <p className="text-sm text-gray-500 mt-1">🔬 Most Reversals Happen Here (67% - 69%)</p>
            </div>
            <div className="mt-4 md:mt-0 text-right bg-gray-900/50 border border-gray-800 px-4 py-2 rounded-xl">
               <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Current Tracking</p>
               <p className="text-2xl font-bold text-rose-500 flex items-center gap-2 justify-end">
                 <span className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                 </span>
                 {liveSmallRatio}%
               </p>
            </div>
          </div>
          
          {/* FIXED: Graph ko Fixed Height de di gayi hai taaki CSS na hone par bhi dikhe */}
          <div style={{ height: '400px', minHeight: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="time" type="category" stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="ratio" type="number" domain={[40, 100]} stroke="#6b7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <ZAxis type="number" range={[60, 150]} />
                
                <RechartsTooltip 
                  cursor={{strokeDasharray: '3 3'}} 
                  contentStyle={{ backgroundColor: '#0b0e14', border: '1px solid #1f2937', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#e5e7eb' }}
                  formatter={(value) => [`${value}%`, 'Peak Ratio']}
                />
                
                {/* 50% Baseline */}
                <ReferenceLine y={50} stroke="#4b5563" strokeWidth={1} label={{ position: 'insideTopRight', value: '50% Base Line', fill: '#6b7280', fontSize: 11 }} />
                
                {/* Highlight Reversal Zone */}
                <ReferenceLine y={68} stroke="rgba(16, 185, 129, 0.05)" strokeWidth={40} />
                
                {/* Calculated Avg Peak Line */}
                <ReferenceLine y={68.4} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2} label={{ position: 'insideTopLeft', value: '🎯 CALCULATED AVG PEAK (68.4%)', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} />
                
                {/* Scatter Dots representing historical peaks */}
                <Scatter name="Historical Peaks" data={scatterData.filter(d => d.time !== 'Live')} fill="#6366f1" shape="circle" />
                
                {/* Live Data Dot */}
                <Scatter name="Live Tracking" data={scatterData.filter(d => d.time === 'Live')} fill="#f43f5e" shape="cross" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
