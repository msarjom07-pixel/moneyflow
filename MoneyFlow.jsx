import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import {
  Home, List, Plus, BarChart2, MessageSquare, Settings,
  TrendingUp, TrendingDown, PiggyBank, Wallet, ChevronRight,
  Edit2, Trash2, Search, X, Check, ArrowUpRight, ArrowDownRight,
  ChevronDown, Download, RefreshCw, Tag, Bot, Zap, Target,
  Calendar, FileText, Bell, Shield, Camera, MoreVertical,
  ArrowLeft, Send, Sparkles, Globe, Lock, RotateCcw, Filter,
  ChevronUp, Info, AlertCircle,
} from "lucide-react";

// ─────────────────────────────────────────────
//  DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  bg:       "#04101e",
  bg2:      "#071828",
  card:     "#0b2240",
  cardHi:   "#0e2d52",
  border:   "#153660",
  accent:   "#3d9bff",
  accentLo: "#1a4a8a",
  green:    "#20dfa8",
  red:      "#ff5c7c",
  purple:   "#a78bfa",
  yellow:   "#fbbf24",
  text:     "#d8eeff",
  sub:      "#6a9bc5",
  dim:      "#2a4a6a",
};

const S = {
  screen: { background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: "'Outfit', sans-serif", color: C.text },
  card: { background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "16px" },
  cardSm: { background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, padding: "12px" },
  btn: { background: C.accent, color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  btnSm: { background: C.accentLo, color: C.accent, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" },
  input: { background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: "11px 14px", color: C.text, fontSize: 15, outline: "none", fontFamily: "'Outfit', sans-serif", width: "100%", boxSizing: "border-box" },
  label: { color: C.sub, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block" },
};

// ─────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────
const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
];
const FX = { USD:1, EUR:1.08, GBP:1.27, JPY:0.0067, CAD:0.74, AUD:0.65, CHF:1.12, CNY:0.14, INR:0.012, BRL:0.20 };
const toUSD = (amount, code) => amount * (FX[code] || 1);
const fromUSD = (amount, code) => amount / (FX[code] || 1);
const fmtCur = (amount, code = "USD") => {
  const sym = CURRENCIES.find(c => c.code === code)?.symbol || "$";
  return `${sym}${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const INIT_CATS = {
  income: [
    { id: "sal",  name: "Salary",     icon: "💼", color: C.green  },
    { id: "bus",  name: "Business",   icon: "🏢", color: C.accent },
    { id: "inv",  name: "Investment", icon: "📈", color: C.purple },
    { id: "gift", name: "Gift",       icon: "🎁", color: C.yellow },
    { id: "oi",   name: "Other",      icon: "💰", color: C.sub    },
  ],
  expense: [
    { id: "food",  name: "Food",          icon: "🍔", color: "#ff5252" },
    { id: "tran",  name: "Transport",     icon: "🚗", color: "#ff6d00" },
    { id: "rent",  name: "Rent",          icon: "🏠", color: C.yellow  },
    { id: "shop",  name: "Shopping",      icon: "🛍️", color: "#e040fb" },
    { id: "hlth",  name: "Health",        icon: "❤️", color: C.red     },
    { id: "ent",   name: "Entertainment", icon: "🎮", color: "#40c4ff" },
    { id: "util",  name: "Utilities",     icon: "⚡", color: C.green   },
    { id: "oe",    name: "Other",         icon: "💳", color: C.sub     },
  ],
  savings: [
    { id: "emrg", name: "Emergency Fund", icon: "🛡️", color: C.green  },
    { id: "tvl",  name: "Travel",         icon: "✈️", color: C.accent },
    { id: "is",   name: "Investment",     icon: "💹", color: C.purple },
    { id: "edu",  name: "Education",      icon: "🎓", color: C.yellow },
    { id: "os",   name: "Other",          icon: "🐷", color: C.sub    },
  ],
};

// Generate realistic sample data
const genSampleTx = () => {
  const now = new Date();
  const txs = [];
  const incomeData  = [{ cat:"sal", amt:4500 }, { cat:"inv", amt:800 }, { cat:"bus", amt:1200 }];
  const expenseData = [
    { cat:"rent", amt:1200 }, { cat:"food", amt:320 }, { cat:"tran", amt:85 },
    { cat:"shop", amt:210 }, { cat:"ent", amt:65 }, { cat:"util", amt:95 },
    { cat:"hlth", amt:45 }, { cat:"food", amt:180 }, { cat:"shop", amt:140 },
  ];
  const savingsData = [{ cat:"emrg", amt:500 }, { cat:"tvl", amt:300 }, { cat:"is", amt:600 }];

  let id = 0;
  for (let m = 2; m >= 0; m--) {
    const mo = new Date(now.getFullYear(), now.getMonth() - m, 1);
    // Income (monthly)
    incomeData.forEach(({ cat, amt }, i) => {
      const d = new Date(mo); d.setDate(1 + i * 3);
      const catObj = INIT_CATS.income.find(c => c.id === cat);
      txs.push({ id: `t${id++}`, type: "income", amount: amt + Math.round((Math.random()-0.5)*amt*0.1), currency: "USD", category: cat, date: d.toISOString().split("T")[0], note: catObj.name + " payment", attachments: [] });
    });
    // Expenses
    expenseData.forEach(({ cat, amt }, i) => {
      const d = new Date(mo); d.setDate(2 + i * 2);
      const catObj = INIT_CATS.expense.find(c => c.id === cat);
      const cur = ["USD","EUR","GBP"][Math.floor(Math.random()*3)];
      txs.push({ id: `t${id++}`, type: "expense", amount: amt + Math.round((Math.random()-0.5)*amt*0.2), currency: cur, category: cat, date: d.toISOString().split("T")[0], note: catObj.name, attachments: [] });
    });
    // Savings
    savingsData.forEach(({ cat, amt }, i) => {
      const d = new Date(mo); d.setDate(5 + i * 5);
      const catObj = INIT_CATS.savings.find(c => c.id === cat);
      txs.push({ id: `t${id++}`, type: "savings", amount: amt, currency: "USD", category: cat, date: d.toISOString().split("T")[0], note: catObj.name + " deposit", attachments: [] });
    });
  }
  return txs.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const INIT_TX = genSampleTx();

// ─────────────────────────────────────────────
//  SMALL UI HELPERS
// ─────────────────────────────────────────────
const Badge = ({ type }) => {
  const cfg = { income: { bg:"#0d3d2a", color:C.green, label:"Income" }, expense: { bg:"#3d1525", color:C.red, label:"Expense" }, savings: { bg:"#2a1f5c", color:C.purple, label:"Savings" } };
  const c = cfg[type] || cfg.income;
  return <span style={{ background:c.bg, color:c.color, padding:"2px 8px", borderRadius:6, fontSize:11, fontWeight:700 }}>{c.label}</span>;
};

const TypeTab = ({ value, onChange }) => (
  <div style={{ display:"flex", background:C.bg2, borderRadius:10, padding:3, gap:2 }}>
    {["income","expense","savings"].map(t => (
      <button key={t} onClick={() => onChange(t)} style={{ flex:1, padding:"8px 4px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, transition:"all 0.2s",
        background: value===t ? (t==="income"?C.green:t==="expense"?C.red:C.purple) : "transparent",
        color: value===t ? "#fff" : C.sub }}>
        {t.charAt(0).toUpperCase()+t.slice(1)}
      </button>
    ))}
  </div>
);

const Select = ({ value, onChange, options, placeholder }) => {
  const [open, setOpen] = useState(false);
  const sel = options.find(o => o.value === value);
  return (
    <div style={{ position:"relative" }}>
      <div onClick={() => setOpen(!open)} style={{ ...S.input, display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}>
        <span style={{ color: sel ? C.text : C.sub }}>{sel ? sel.label : placeholder}</span>
        <ChevronDown size={16} color={C.sub} />
      </div>
      {open && (
        <div style={{ position:"absolute", top:"100%", left:0, right:0, zIndex:100, background:C.cardHi, border:`1px solid ${C.border}`, borderRadius:10, marginTop:4, maxHeight:200, overflowY:"auto" }}>
          {options.map(o => (
            <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} style={{ padding:"10px 14px", cursor:"pointer", color: value===o.value ? C.accent : C.text, background: value===o.value ? C.accentLo : "transparent", fontSize:14 }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, change }) => (
  <div style={{ ...S.card, flex:1, minWidth:140 }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
      <span style={{ color:C.sub, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
      <div style={{ background:color+"22", borderRadius:8, padding:6 }}><Icon size={14} color={color} /></div>
    </div>
    <div style={{ fontSize:20, fontWeight:700, color:C.text, marginBottom:4 }}>{value}</div>
    {change !== undefined && (
      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
        {change >= 0 ? <ArrowUpRight size={12} color={C.green} /> : <ArrowDownRight size={12} color={C.red} />}
        <span style={{ fontSize:11, color: change >= 0 ? C.green : C.red }}>{Math.abs(change)}% vs last month</span>
      </div>
    )}
  </div>
);

const TxItem = ({ tx, cats, defaultCurrency, onEdit, onDelete }) => {
  const allCats = [...cats.income, ...cats.expense, ...cats.savings];
  const cat = allCats.find(c => c.id === tx.category) || { icon:"💸", color:C.sub, name:"Other" };
  const usd = toUSD(tx.amount, tx.currency);
  const disp = fromUSD(usd, defaultCurrency);
  const cur = CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];
  const sign = tx.type === "expense" ? "-" : "+";
  const col = tx.type === "income" ? C.green : tx.type === "expense" ? C.red : C.purple;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.border}22` }}>
      <div style={{ width:42, height:42, borderRadius:12, background:cat.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{cat.icon}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontWeight:600, fontSize:14, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{cat.name}</div>
        <div style={{ color:C.sub, fontSize:12, marginTop:2 }}>{tx.date} · {tx.currency !== defaultCurrency ? `${fmtCur(tx.amount, tx.currency)} (${tx.currency})` : ""}</div>
      </div>
      <div style={{ textAlign:"right" }}>
        <div style={{ fontWeight:700, fontSize:15, color:col }}>{sign}{cur.symbol}{disp.toFixed(2)}</div>
        {tx.note && <div style={{ color:C.sub, fontSize:11, marginTop:2, maxWidth:90, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tx.note}</div>}
      </div>
      <div style={{ display:"flex", gap:4 }}>
        <button onClick={() => onEdit(tx)} style={{ background:"none", border:"none", cursor:"pointer", color:C.sub, padding:4 }}><Edit2 size={13} /></button>
        <button onClick={() => onDelete(tx.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red+"99", padding:4 }}><Trash2 size={13} /></button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SCREENS
// ─────────────────────────────────────────────

// DASHBOARD
const DashboardScreen = ({ transactions, categories, defaultCurrency, setActiveScreen, setEditTx }) => {
  const [period, setPeriod] = useState("monthly");
  const periods = ["daily","weekly","monthly","yearly"];
  const cur = CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];

  const now = new Date();
  const filterByPeriod = (txs, p) => {
    const d = new Date();
    if (p === "daily") { d.setHours(0,0,0,0); return txs.filter(t => new Date(t.date) >= d); }
    if (p === "weekly") { d.setDate(d.getDate()-7); return txs.filter(t => new Date(t.date) >= d); }
    if (p === "monthly") { d.setDate(1); d.setHours(0,0,0,0); return txs.filter(t => new Date(t.date) >= d); }
    if (p === "yearly") { d.setMonth(0,1); d.setHours(0,0,0,0); return txs.filter(t => new Date(t.date) >= d); }
    return txs;
  };

  const filtered = filterByPeriod(transactions, period);
  const sumType = (type) => filtered.filter(t=>t.type===type).reduce((s,t)=>s+toUSD(t.amount,t.currency),0);
  const totalIncome  = sumType("income");
  const totalExpense = sumType("expense");
  const totalSavings = sumType("savings");
  const balance = totalIncome - totalExpense - totalSavings;

  // Pie data - expenses by category
  const allCats = [...categories.expense];
  const pieData = allCats.map(cat => {
    const total = filtered.filter(t=>t.type==="expense"&&t.category===cat.id).reduce((s,t)=>s+toUSD(t.amount,t.currency),0);
    return { name:cat.name, value:total, color:cat.color, icon:cat.icon };
  }).filter(d => d.value > 0);

  // Bar data - last 6 months
  const barData = Array.from({length:6}).map((_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const mo = d.toLocaleString("default",{month:"short"});
    const txMo = transactions.filter(t=>{ const td=new Date(t.date); return td.getMonth()===d.getMonth()&&td.getFullYear()===d.getFullYear(); });
    return {
      month:mo,
      income:  +fromUSD(txMo.filter(t=>t.type==="income").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency).toFixed(0),
      expense: +fromUSD(txMo.filter(t=>t.type==="expense").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency).toFixed(0),
      savings: +fromUSD(txMo.filter(t=>t.type==="savings").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency).toFixed(0),
    };
  });

  const recent = transactions.slice(0,5);

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px" }}>
      {/* Header */}
      <div style={{ padding:"20px 0 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ color:C.sub, fontSize:13 }}>Good morning 👋</div>
          <div style={{ fontSize:22, fontWeight:700, color:C.text }}>Money Flow</div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <div style={{ background:C.card, borderRadius:10, padding:8, border:`1px solid ${C.border}` }}><Bell size={18} color={C.sub} /></div>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${C.accent}, ${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:15, fontWeight:700 }}>MF</div>
        </div>
      </div>

      {/* Balance Hero */}
      <div style={{ background:`linear-gradient(135deg, #0e3060 0%, #0a2040 100%)`, borderRadius:20, padding:"24px", marginBottom:16, border:`1px solid ${C.border}`, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", right:-30, top:-30, width:120, height:120, borderRadius:"50%", background:C.accent+"11" }} />
        <div style={{ position:"absolute", right:20, bottom:-20, width:80, height:80, borderRadius:"50%", background:C.purple+"11" }} />
        <div style={{ color:C.sub, fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Total Balance</div>
        <div style={{ fontSize:36, fontWeight:800, color: balance >= 0 ? C.text : C.red, letterSpacing:"-0.02em" }}>
          {balance >= 0 ? "" : "-"}{cur.symbol}{Math.abs(fromUSD(balance, defaultCurrency)).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2})}
        </div>
        <div style={{ color:C.sub, fontSize:12, marginTop:4 }}>{defaultCurrency} • Updated just now</div>
        <div style={{ display:"flex", gap:12, marginTop:20 }}>
          {[["Income",totalIncome,C.green,ArrowUpRight],["Expenses",totalExpense,C.red,ArrowDownRight]].map(([l,v,c,Icon])=>(
            <div key={l} style={{ flex:1, background:"#ffffff0d", borderRadius:10, padding:"10px 12px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:4 }}>
                <Icon size={12} color={c} /><span style={{ color:c, fontSize:11, fontWeight:600 }}>{l}</span>
              </div>
              <div style={{ color:C.text, fontWeight:700, fontSize:15 }}>{cur.symbol}{fromUSD(v,defaultCurrency).toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Period Filter */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {periods.map(p => (
          <button key={p} onClick={()=>setPeriod(p)} style={{ flex:1, padding:"7px 4px", borderRadius:8, border:`1px solid ${period===p?C.accent:C.border}`, background:period===p?C.accentLo:"transparent", color:period===p?C.accent:C.sub, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", textTransform:"capitalize" }}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        <StatCard label="Income" value={`${cur.symbol}${fromUSD(totalIncome,defaultCurrency).toFixed(0)}`} icon={TrendingUp} color={C.green} change={8.2} />
        <StatCard label="Savings" value={`${cur.symbol}${fromUSD(totalSavings,defaultCurrency).toFixed(0)}`} icon={PiggyBank} color={C.purple} change={3.1} />
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && (
        <div style={{ ...S.card, marginBottom:16 }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Expenses by Category</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => `${cur.symbol}${fromUSD(v,defaultCurrency).toFixed(2)}`} contentStyle={{ background:C.cardHi, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:8 }}>
            {pieData.slice(0,6).map((d,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:8, height:8, borderRadius:2, background:d.color }} />
                <span style={{ fontSize:11, color:C.sub }}>{d.icon} {d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar Chart */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Monthly Overview</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={barData} barSize={8} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.sub, fontSize:10 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ background:C.cardHi, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }} />
            <Bar dataKey="income"  fill={C.green}  radius={[4,4,0,0]} />
            <Bar dataKey="expense" fill={C.red}    radius={[4,4,0,0]} />
            <Bar dataKey="savings" fill={C.purple} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
          {[["Income",C.green],["Expense",C.red],["Savings",C.purple]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:10, height:10, borderRadius:2, background:c }} />
              <span style={{ fontSize:11, color:C.sub }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Recent Transactions</div>
          <button onClick={()=>setActiveScreen("transactions")} style={{ background:"none", border:"none", cursor:"pointer", color:C.accent, fontSize:13, fontWeight:600, fontFamily:"'Outfit',sans-serif", display:"flex", alignItems:"center", gap:4 }}>
            See all <ChevronRight size={14} />
          </button>
        </div>
        {recent.map(tx => <TxItem key={tx.id} tx={tx} cats={categories} defaultCurrency={defaultCurrency} onEdit={(t)=>{setEditTx(t);setActiveScreen("add");}} onDelete={()=>{}} />)}
      </div>
    </div>
  );
};

// TRANSACTIONS
const TransactionsScreen = ({ transactions, categories, defaultCurrency, setEditTx, setActiveScreen, onDelete }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const cur = CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];
  const allCats = [...categories.income, ...categories.expense, ...categories.savings];

  const filtered = transactions.filter(t => {
    if (filter !== "all" && t.type !== filter) return false;
    const cat = allCats.find(c => c.id === t.category);
    const searchLower = search.toLowerCase();
    return !search || t.note?.toLowerCase().includes(searchLower) || cat?.name.toLowerCase().includes(searchLower);
  });

  const grouped = filtered.reduce((acc, tx) => {
    const key = tx.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {});

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px" }}>
      <div style={{ padding:"20px 0 16px", fontWeight:700, fontSize:20 }}>Transactions</div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:12 }}>
        <Search size={15} color={C.sub} style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search transactions..." style={{ ...S.input, paddingLeft:36 }} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:16 }}>
        {["all","income","expense","savings"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${filter===f?C.accent:C.border}`, background:filter===f?C.accentLo:"transparent", color:filter===f?C.accent:C.sub, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Outfit',sans-serif", textTransform:"capitalize" }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {Object.keys(grouped).sort((a,b)=>new Date(b)-new Date(a)).map(date=>(
        <div key={date} style={{ marginBottom:16 }}>
          <div style={{ color:C.sub, fontSize:12, fontWeight:600, marginBottom:8 }}>{new Date(date).toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}</div>
          <div style={{ ...S.card }}>
            {grouped[date].map(tx=>(
              <TxItem key={tx.id} tx={tx} cats={categories} defaultCurrency={defaultCurrency}
                onEdit={t=>{setEditTx(t);setActiveScreen("add");}}
                onDelete={onDelete} />
            ))}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign:"center", color:C.sub, padding:"40px 0", fontSize:15 }}>No transactions found</div>}
    </div>
  );
};

// ADD/EDIT TRANSACTION
const AddTransactionScreen = ({ categories, onSave, editTx, setEditTx, setActiveScreen, defaultCurrency }) => {
  const blank = { type:"expense", amount:"", currency:defaultCurrency, category:"", date:new Date().toISOString().split("T")[0], note:"", attachments:[] };
  const [form, setForm] = useState(editTx || blank);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => { setForm(editTx || blank); }, [editTx]);

  const cats = categories[form.type] || [];
  const catOptions = cats.map(c => ({ value:c.id, label:`${c.icon} ${c.name}` }));
  const curOptions = CURRENCIES.map(c => ({ value:c.code, label:`${c.symbol} ${c.code} - ${c.name}` }));

  const handleSave = () => {
    if (!form.amount || !form.category) return;
    onSave({ ...form, amount: parseFloat(form.amount), id: form.id || `t${Date.now()}` });
    setEditTx(null);
    setForm(blank);
    setActiveScreen("transactions");
  };

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanResult({ amount:"42.50", currency:"USD", merchant:"Whole Foods Market", date:new Date().toISOString().split("T")[0], suggestedCategory:"food" });
      setScanning(false);
    }, 2000);
  };

  const applyScan = () => {
    setForm(f=>({ ...f, type:"expense", amount:scanResult.amount, currency:scanResult.currency, category:scanResult.suggestedCategory, date:scanResult.date, note:`Receipt: ${scanResult.merchant}` }));
    setScanResult(null);
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px" }}>
      <div style={{ padding:"20px 0 16px", display:"flex", alignItems:"center", gap:12 }}>
        {editTx && <button onClick={()=>{setEditTx(null);setActiveScreen("transactions");}} style={{ background:"none", border:"none", cursor:"pointer", color:C.sub }}><ArrowLeft size={20} /></button>}
        <div style={{ fontWeight:700, fontSize:20 }}>{editTx ? "Edit" : "Add"} Transaction</div>
      </div>

      {/* Receipt Scanner */}
      <div style={{ ...S.card, marginBottom:16, cursor:"pointer" }} onClick={simulateScan}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ background:C.accentLo, borderRadius:10, padding:10 }}><Camera size={18} color={C.accent} /></div>
          <div>
            <div style={{ fontWeight:600, fontSize:14 }}>Scan Receipt / Statement</div>
            <div style={{ color:C.sub, fontSize:12 }}>Auto-extract amount, date & merchant</div>
          </div>
          {scanning && <div style={{ marginLeft:"auto", width:20, height:20, borderRadius:"50%", border:`2px solid ${C.accent}`, borderTopColor:"transparent", animation:"spin 0.8s linear infinite" }} />}
        </div>
      </div>

      {scanResult && (
        <div style={{ ...S.card, marginBottom:16, border:`1px solid ${C.green}44` }}>
          <div style={{ fontWeight:600, fontSize:14, color:C.green, marginBottom:10 }}>✅ Receipt Scanned</div>
          {[["Amount",`$${scanResult.amount}`],["Merchant",scanResult.merchant],["Date",scanResult.date],["Suggested",`🍔 Food`]].map(([k,v])=>(
            <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span style={{ color:C.sub, fontSize:13 }}>{k}</span>
              <span style={{ fontWeight:600, fontSize:13 }}>{v}</span>
            </div>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button onClick={applyScan} style={{ ...S.btn, flex:1, padding:"10px" }}>Apply</button>
            <button onClick={()=>setScanResult(null)} style={{ ...S.btnSm, flex:1, padding:"10px" }}>Dismiss</button>
          </div>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <div>
          <label style={S.label}>Type</label>
          <TypeTab value={form.type} onChange={v=>setForm(f=>({...f,type:v,category:""}))} />
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <div style={{ flex:2 }}>
            <label style={S.label}>Amount</label>
            <input type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" style={S.input} />
          </div>
          <div style={{ flex:1 }}>
            <label style={S.label}>Currency</label>
            <Select value={form.currency} onChange={v=>setForm(f=>({...f,currency:v}))} options={curOptions} placeholder="USD" />
          </div>
        </div>

        <div>
          <label style={S.label}>Category</label>
          <Select value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} options={catOptions} placeholder="Select category" />
        </div>

        <div>
          <label style={S.label}>Date</label>
          <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={{ ...S.input, colorScheme:"dark" }} />
        </div>

        <div>
          <label style={S.label}>Notes (optional)</label>
          <input value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Add a note..." style={S.input} />
        </div>

        <button onClick={handleSave} style={{ ...S.btn, marginTop:8, padding:"14px" }}>
          {editTx ? "Update Transaction" : "Save Transaction"}
        </button>

        {editTx && (
          <button onClick={()=>{setEditTx(null);setForm(blank);}} style={{ ...S.btnSm, padding:"12px", width:"100%" }}>
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// ANALYTICS
const AnalyticsScreen = ({ transactions, categories, defaultCurrency }) => {
  const cur = CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];
  const now = new Date();
  const allCats = [...categories.income, ...categories.expense, ...categories.savings];

  // Last 6 months line data
  const lineData = Array.from({length:6}).map((_,i)=>{
    const d = new Date(now.getFullYear(), now.getMonth()-5+i, 1);
    const mo = d.toLocaleString("default",{month:"short"});
    const txMo = transactions.filter(t=>{ const td=new Date(t.date); return td.getMonth()===d.getMonth()&&td.getFullYear()===d.getFullYear(); });
    const inc  = fromUSD(txMo.filter(t=>t.type==="income").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency);
    const exp  = fromUSD(txMo.filter(t=>t.type==="expense").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency);
    const sav  = fromUSD(txMo.filter(t=>t.type==="savings").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency);
    return { month:mo, income:+inc.toFixed(0), expense:+exp.toFixed(0), savings:+sav.toFixed(0), net:+(inc-exp-sav).toFixed(0) };
  });

  // Top expense categories
  const topCats = categories.expense.map(cat => ({
    ...cat,
    total: fromUSD(transactions.filter(t=>t.type==="expense"&&t.category===cat.id).reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency)
  })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total).slice(0,5);

  const maxCat = topCats[0]?.total || 1;

  // Savings progress
  const savingsTotal = fromUSD(transactions.filter(t=>t.type==="savings").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency);
  const savingsGoal  = 10000;

  // Current month vs last month
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const txThis = transactions.filter(t=>new Date(t.date)>=thisMonth);
  const txLast = transactions.filter(t=>new Date(t.date)>=lastMonth&&new Date(t.date)<=lastMonthEnd);
  const expThis = fromUSD(txThis.filter(t=>t.type==="expense").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency);
  const expLast = fromUSD(txLast.filter(t=>t.type==="expense").reduce((s,t)=>s+toUSD(t.amount,t.currency),0), defaultCurrency);
  const expDiff  = expLast > 0 ? ((expThis-expLast)/expLast*100).toFixed(1) : 0;

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px" }}>
      <div style={{ padding:"20px 0 16px", fontWeight:700, fontSize:20 }}>Analytics</div>

      {/* Key Insights */}
      <div style={{ ...S.card, marginBottom:16, background:`linear-gradient(135deg,#0e3060,#1a0e40)` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Zap size={16} color={C.yellow} /><span style={{ fontWeight:700, fontSize:14 }}>Key Insights</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ background:"#ffffff0d", borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.sub, fontSize:13 }}>Spending vs last month</span>
            <span style={{ fontWeight:700, color: parseFloat(expDiff) <= 0 ? C.green : C.red }}>{expDiff >= 0 ? "+" : ""}{expDiff}%</span>
          </div>
          <div style={{ background:"#ffffff0d", borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.sub, fontSize:13 }}>Top expense</span>
            <span style={{ fontWeight:700 }}>{topCats[0] ? `${topCats[0].icon} ${topCats[0].name}` : "—"}</span>
          </div>
          <div style={{ background:"#ffffff0d", borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:C.sub, fontSize:13 }}>Savings rate</span>
            <span style={{ fontWeight:700, color:C.purple }}>
              {(txThis.filter(t=>t.type==="income").reduce((s,t)=>s+toUSD(t.amount,t.currency),0) > 0 ?
                (txThis.filter(t=>t.type==="savings").reduce((s,t)=>s+toUSD(t.amount,t.currency),0) /
                txThis.filter(t=>t.type==="income").reduce((s,t)=>s+toUSD(t.amount,t.currency),0) * 100).toFixed(1) : 0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Financial Trend</div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={lineData}>
            <defs>
              <linearGradient id="incGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.green} stopOpacity={0.3}/><stop offset="95%" stopColor={C.green} stopOpacity={0}/></linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.red} stopOpacity={0.3}/><stop offset="95%" stopColor={C.red} stopOpacity={0}/></linearGradient>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={C.accent} stopOpacity={0.3}/><stop offset="95%" stopColor={C.accent} stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="month" tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:C.sub, fontSize:10 }} axisLine={false} tickLine={false} width={45} />
            <Tooltip contentStyle={{ background:C.cardHi, border:`1px solid ${C.border}`, borderRadius:8, color:C.text, fontSize:12 }} formatter={v=>`${cur.symbol}${v}`} />
            <Area type="monotone" dataKey="income"  stroke={C.green}  strokeWidth={2} fill="url(#incGrad)" dot={false} />
            <Area type="monotone" dataKey="expense" stroke={C.red}    strokeWidth={2} fill="url(#expGrad)" dot={false} />
            <Area type="monotone" dataKey="net"     stroke={C.accent} strokeWidth={2} fill="url(#netGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:8 }}>
          {[["Income",C.green],["Expense",C.red],["Net",C.accent]].map(([l,c])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:10, height:3, borderRadius:2, background:c }} />
              <span style={{ fontSize:11, color:C.sub }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>Top Expense Categories</div>
        {topCats.map((cat, i) => (
          <div key={cat.id} style={{ marginBottom:12 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
              <span style={{ fontSize:13 }}>{cat.icon} {cat.name}</span>
              <span style={{ fontWeight:700, fontSize:13, color:cat.color }}>{cur.symbol}{cat.total.toFixed(0)}</span>
            </div>
            <div style={{ background:C.bg2, borderRadius:4, height:6 }}>
              <div style={{ background:cat.color, borderRadius:4, height:6, width:`${(cat.total/maxCat*100).toFixed(1)}%`, transition:"width 0.5s" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Savings Progress */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Savings Goal</div>
          <Target size={16} color={C.purple} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:C.sub, fontSize:13 }}>Saved so far</span>
          <span style={{ fontWeight:700, color:C.purple }}>{cur.symbol}{savingsTotal.toFixed(0)}</span>
        </div>
        <div style={{ background:C.bg2, borderRadius:8, height:10, marginBottom:8 }}>
          <div style={{ background:`linear-gradient(90deg,${C.purple},${C.accent})`, borderRadius:8, height:10, width:`${Math.min(savingsTotal/savingsGoal*100,100).toFixed(1)}%`, transition:"width 0.5s" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:C.sub }}>{(savingsTotal/savingsGoal*100).toFixed(1)}% of goal</span>
          <span style={{ fontSize:12, color:C.sub }}>Goal: {cur.symbol}{savingsGoal.toLocaleString()}</span>
        </div>
      </div>

      {/* Comparison */}
      <div style={{ ...S.card, marginBottom:16 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:12 }}>This Month vs Last Month</div>
        {[["Income",C.green,"income"],["Expenses",C.red,"expense"],["Savings",C.purple,"savings"]].map(([label,color,type])=>{
          const thisVal = fromUSD(txThis.filter(t=>t.type===type).reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency);
          const lastVal = fromUSD(txLast.filter(t=>t.type===type).reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency);
          const diff = lastVal > 0 ? ((thisVal-lastVal)/lastVal*100).toFixed(1) : 0;
          return (
            <div key={type} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <span style={{ fontSize:13, flex:1 }}>{label}</span>
              <div style={{ flex:2, display:"flex", flexDirection:"column", gap:3 }}>
                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:C.sub, width:32 }}>This</span>
                  <div style={{ flex:1, background:C.bg2, borderRadius:3, height:4 }}>
                    <div style={{ background:color, borderRadius:3, height:4, width:`${Math.min(thisVal/(Math.max(thisVal,lastVal)||1)*100,100)}%` }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, width:55, textAlign:"right" }}>{cur.symbol}{thisVal.toFixed(0)}</span>
                </div>
                <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                  <span style={{ fontSize:10, color:C.sub, width:32 }}>Last</span>
                  <div style={{ flex:1, background:C.bg2, borderRadius:3, height:4 }}>
                    <div style={{ background:color+"66", borderRadius:3, height:4, width:`${Math.min(lastVal/(Math.max(thisVal,lastVal)||1)*100,100)}%` }} />
                  </div>
                  <span style={{ fontSize:11, color:C.sub, width:55, textAlign:"right" }}>{cur.symbol}{lastVal.toFixed(0)}</span>
                </div>
              </div>
              <span style={{ fontSize:11, fontWeight:700, color: type==="expense" ? (parseFloat(diff)<=0?C.green:C.red) : (parseFloat(diff)>=0?C.green:C.red), width:40, textAlign:"right" }}>{diff>=0?"+":""}{diff}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// AI ASSISTANT
const AIScreen = ({ transactions, categories, defaultCurrency }) => {
  const [messages, setMessages] = useState([
    { role:"assistant", content:"Hello! I'm your AI financial assistant 🤖\n\nI can help you understand your spending, analyze trends, and suggest ways to save. What would you like to know?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const cur = CURRENCIES.find(c => c.code === defaultCurrency) || CURRENCIES[0];

  const suggestions = [
    "How much did I spend this month?",
    "What's my top expense category?",
    "How can I save more money?",
    "Compare this month vs last month",
  ];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  const buildContext = () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth()-1, 1);
    const lastEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
    const allCats   = [...categories.income, ...categories.expense, ...categories.savings];
    const getCatName = id => allCats.find(c=>c.id===id)?.name || id;

    const txThis = transactions.filter(t=>new Date(t.date)>=thisMonth);
    const txLast = transactions.filter(t=>new Date(t.date)>=lastMonth&&new Date(t.date)<=lastEnd);

    const sumType = (txs,type) => fromUSD(txs.filter(t=>t.type===type).reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency);
    const byCat = (txs,type) => {
      const cats = categories[type] || [];
      return cats.map(cat=>({ name:getCatName(cat.id), total:fromUSD(txs.filter(t=>t.type===type&&t.category===cat.id).reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency).toFixed(2) })).filter(c=>parseFloat(c.total)>0);
    };

    return {
      defaultCurrency,
      currentMonth: {
        income:  sumType(txThis,"income").toFixed(2),
        expense: sumType(txThis,"expense").toFixed(2),
        savings: sumType(txThis,"savings").toFixed(2),
        balance: (sumType(txThis,"income")-sumType(txThis,"expense")-sumType(txThis,"savings")).toFixed(2),
        expenseByCategory: byCat(txThis,"expense"),
        incomeByCategory:  byCat(txThis,"income"),
      },
      lastMonth: {
        income:  sumType(txLast,"income").toFixed(2),
        expense: sumType(txLast,"expense").toFixed(2),
        savings: sumType(txLast,"savings").toFixed(2),
      },
      totalTransactions: transactions.length,
      allTime: {
        income:  fromUSD(transactions.filter(t=>t.type==="income").reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency).toFixed(2),
        expense: fromUSD(transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency).toFixed(2),
        savings: fromUSD(transactions.filter(t=>t.type==="savings").reduce((s,t)=>s+toUSD(t.amount,t.currency),0),defaultCurrency).toFixed(2),
      },
    };
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(m=>[...m, { role:"user", content:msg }]);
    setLoading(true);

    try {
      const ctx = buildContext();
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a friendly and professional AI financial assistant for the Money Flow app.
The user's financial data in ${ctx.defaultCurrency}:
${JSON.stringify(ctx, null, 2)}

Guidelines:
- Be concise, helpful, and encouraging
- Use specific numbers from their data
- Format currency with the ${ctx.defaultCurrency} symbol
- Give actionable advice
- Use emojis sparingly for clarity
- Keep responses under 200 words
- If asked about data you don't have, say so honestly`,
          messages: [...messages.filter(m=>m.role!=="assistant"||messages.indexOf(m)>0).slice(-8), { role:"user", content:msg }],
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "I couldn't process that. Please try again.";
      setMessages(m=>[...m, { role:"assistant", content:reply }]);
    } catch (e) {
      setMessages(m=>[...m, { role:"assistant", content:"I'm having trouble connecting. Please check your connection and try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"20px 16px 12px", borderBottom:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Bot size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:16 }}>AI Assistant</div>
            <div style={{ color:C.green, fontSize:12, display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:C.green }} />Online
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ color:C.sub, fontSize:12, marginBottom:8, fontWeight:600 }}>QUICK QUESTIONS</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {suggestions.map((s,i) => (
                <button key={i} onClick={()=>sendMessage(s)} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"8px 12px", color:C.text, fontSize:12, cursor:"pointer", fontFamily:"'Outfit',sans-serif", textAlign:"left" }}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:12 }}>
            {m.role==="assistant" && (
              <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", marginRight:8, flexShrink:0, marginTop:4 }}>
                <Sparkles size={12} color="#fff" />
              </div>
            )}
            <div style={{ maxWidth:"80%", background:m.role==="user"?`linear-gradient(135deg,${C.accent},#2060d0)`:C.card, borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px", padding:"10px 14px", border:m.role==="assistant"?`1px solid ${C.border}`:"none" }}>
              <div style={{ fontSize:14, lineHeight:1.5, color:C.text, whiteSpace:"pre-wrap" }}>{m.content}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center" }}><Sparkles size={12} color="#fff" /></div>
            <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:"16px 16px 16px 4px", padding:"12px 16px", display:"flex", gap:4, alignItems:"center" }}>
              {[0,1,2].map(i=><div key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.accent, animation:`bounce 1s infinite ${i*0.2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.border}`, display:"flex", gap:10 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendMessage()} placeholder="Ask about your finances..." style={{ ...S.input, flex:1 }} />
        <button onClick={()=>sendMessage()} disabled={loading||!input.trim()} style={{ ...S.btn, padding:"11px 16px", opacity:loading||!input.trim()?0.5:1 }}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

// CATEGORIES
const CategoriesScreen = ({ categories, setCategories }) => {
  const [activeType, setActiveType] = useState("income");
  const [adding, setAdding] = useState(false);
  const [newCat, setNewCat] = useState({ name:"", icon:"🏷️", color:C.accent });
  const [editId, setEditId] = useState(null);
  const icons = ["💰","🏢","📈","🎁","🍔","🚗","🏠","🛍️","❤️","🎮","⚡","💳","🛡️","✈️","💹","🎓","🐷","🎯","💡","🔑"];
  const colors = [C.green, C.accent, C.purple, C.yellow, C.red, "#ff6d00", "#40c4ff", "#e040fb"];

  const addCategory = () => {
    if (!newCat.name.trim()) return;
    const cat = { id:`c${Date.now()}`, name:newCat.name.trim(), icon:newCat.icon, color:newCat.color };
    setCategories(prev=>({ ...prev, [activeType]:[...prev[activeType], cat] }));
    setNewCat({ name:"", icon:"🏷️", color:C.accent });
    setAdding(false);
  };

  const deleteCategory = (id) => {
    setCategories(prev=>({ ...prev, [activeType]:prev[activeType].filter(c=>c.id!==id) }));
  };

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px" }}>
      <div style={{ padding:"20px 0 16px", fontWeight:700, fontSize:20 }}>Categories</div>

      <TypeTab value={activeType} onChange={setActiveType} />

      <div style={{ marginTop:16 }}>
        {categories[activeType]?.map(cat=>(
          <div key={cat.id} style={{ ...S.card, marginBottom:8, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:cat.color+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{cat.icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:14 }}>{cat.name}</div>
              <div style={{ fontSize:11, color:cat.color, marginTop:2 }}>{activeType.charAt(0).toUpperCase()+activeType.slice(1)}</div>
            </div>
            <button onClick={()=>deleteCategory(cat.id)} style={{ background:"none", border:"none", cursor:"pointer", color:C.red+"99", padding:6 }}><Trash2 size={15} /></button>
          </div>
        ))}
      </div>

      {adding ? (
        <div style={{ ...S.card, marginTop:16 }}>
          <div style={{ fontWeight:600, fontSize:15, marginBottom:12 }}>New Category</div>
          <div style={{ marginBottom:10 }}>
            <label style={S.label}>Name</label>
            <input value={newCat.name} onChange={e=>setNewCat(n=>({...n,name:e.target.value}))} placeholder="Category name" style={S.input} />
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={S.label}>Icon</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {icons.map(ic=>(
                <button key={ic} onClick={()=>setNewCat(n=>({...n,icon:ic}))} style={{ width:36, height:36, fontSize:18, borderRadius:8, border:`2px solid ${newCat.icon===ic?C.accent:C.border}`, background:newCat.icon===ic?C.accentLo:C.bg2, cursor:"pointer" }}>{ic}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={S.label}>Color</label>
            <div style={{ display:"flex", gap:8 }}>
              {colors.map(col=>(
                <button key={col} onClick={()=>setNewCat(n=>({...n,color:col}))} style={{ width:28, height:28, borderRadius:"50%", background:col, border:`3px solid ${newCat.color===col?"white":"transparent"}`, cursor:"pointer" }} />
              ))}
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={addCategory} style={{ ...S.btn, flex:1 }}>Add Category</button>
            <button onClick={()=>setAdding(false)} style={{ ...S.btnSm, flex:1 }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={()=>setAdding(true)} style={{ ...S.btn, width:"100%", marginTop:16, background:C.accentLo, color:C.accent, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <Plus size={16} /> Add Category
        </button>
      )}
    </div>
  );
};

// SETTINGS
const SettingsScreen = ({ defaultCurrency, setDefaultCurrency, transactions, categories }) => {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const exportCSV = () => {
    const allCats = [...categories.income, ...categories.expense, ...categories.savings];
    const rows = [["Date","Type","Category","Amount","Currency","Note"]];
    transactions.forEach(t=>{
      const cat = allCats.find(c=>c.id===t.category);
      rows.push([t.date, t.type, cat?.name||t.category, t.amount, t.currency, t.note||""]);
    });
    const csv = rows.map(r=>r.join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="moneyflow_export.csv"; a.click();
  };

  const Toggle = ({ value, onChange }) => (
    <div onClick={()=>onChange(!value)} style={{ width:44, height:24, borderRadius:12, background:value?C.accent:C.dim, cursor:"pointer", position:"relative", transition:"background 0.2s" }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:3, left:value?23:3, transition:"left 0.2s" }} />
    </div>
  );

  const curOptions = CURRENCIES.map(c=>({ value:c.code, label:`${c.symbol} ${c.code} - ${c.name}` }));

  const Section = ({ title, children }) => (
    <div style={{ marginBottom:20 }}>
      <div style={{ color:C.sub, fontSize:12, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>{title}</div>
      <div style={{ ...S.card }}>
        {children}
      </div>
    </div>
  );

  const Row = ({ icon:Icon, color, label, right, onClick }) => (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.border}22`, cursor:onClick?"pointer":"default" }}>
      <div style={{ width:32, height:32, borderRadius:8, background:color+"22", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={15} color={color} />
      </div>
      <span style={{ flex:1, fontSize:14, fontWeight:500 }}>{label}</span>
      {right}
      {onClick && <ChevronRight size={14} color={C.sub} />}
    </div>
  );

  return (
    <div style={{ flex:1, overflowY:"auto", padding:"0 16px 24px" }}>
      <div style={{ padding:"20px 0 16px", fontWeight:700, fontSize:20 }}>Settings</div>

      <Section title="Preferences">
        <div style={{ paddingBottom:4 }}>
          <label style={S.label}>Default Currency</label>
          <Select value={defaultCurrency} onChange={setDefaultCurrency} options={curOptions} placeholder="Select currency" />
        </div>
      </Section>

      <Section title="Features">
        <Row icon={Bot}    color={C.accent}  label="AI Assistant"    right={<Toggle value={aiEnabled}     onChange={setAiEnabled}     />} />
        <Row icon={Bell}   color={C.yellow}  label="Notifications"   right={<Toggle value={notifications} onChange={setNotifications} />} />
        <Row icon={Shield} color={C.green}   label="Encrypted Storage" right={<span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Active</span>} />
        <Row icon={Globe}  color={C.purple}  label="Live FX Rates"   right={<span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Synced</span>} />
      </Section>

      <Section title="Data">
        <Row icon={Download}   color={C.accent}  label="Export CSV"      onClick={exportCSV} />
        <Row icon={FileText}   color={C.purple}  label="Export PDF Report" onClick={()=>alert("PDF export — connect backend")} />
        <Row icon={RefreshCw}  color={C.green}   label="Backup to Cloud" onClick={()=>alert("Cloud backup — connect backend")} />
        <Row icon={RotateCcw}  color={C.yellow}  label="Restore Backup"  onClick={()=>alert("Restore — connect backend")} />
      </Section>

      <Section title="About">
        <Row icon={Sparkles} color={C.yellow} label="Money Flow" right={<span style={{ fontSize:12, color:C.sub }}>v1.0.0</span>} />
        <Row icon={Shield}   color={C.green}  label="Privacy Policy"   onClick={()=>{}} />
        <Row icon={Info}     color={C.sub}    label="Terms of Service" onClick={()=>{}} />
      </Section>
    </div>
  );
};

// ─────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────
export default function MoneyFlowApp() {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [transactions, setTransactions] = useState(INIT_TX);
  const [categories, setCategories] = useState(INIT_CATS);
  const [defaultCurrency, setDefaultCurrency] = useState("USD");
  const [editTx, setEditTx] = useState(null);

  const saveTransaction = (tx) => {
    setTransactions(prev => {
      const exists = prev.find(t => t.id === tx.id);
      if (exists) return prev.map(t => t.id === tx.id ? tx : t);
      return [tx, ...prev];
    });
  };

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const NAV = [
    { id:"dashboard",    icon:Home,          label:"Home"    },
    { id:"transactions", icon:List,          label:"History" },
    { id:"add",          icon:Plus,          label:"Add",  special:true },
    { id:"analytics",    icon:BarChart2,     label:"Charts"  },
    { id:"ai",           icon:MessageSquare, label:"AI"      },
    { id:"settings",     icon:Settings,      label:"More"    },
  ];

  const screenProps = { transactions, categories, defaultCurrency, setActiveScreen, setEditTx };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:2px; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(0.6) sepia(1) saturate(3) hue-rotate(180deg); }
      `}</style>
      <div style={{ ...S.screen, maxWidth:430, margin:"0 auto", position:"relative" }}>
        {/* Content */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {activeScreen === "dashboard"    && <DashboardScreen    {...screenProps} />}
          {activeScreen === "transactions" && <TransactionsScreen {...screenProps} onDelete={deleteTransaction} />}
          {activeScreen === "add"          && <AddTransactionScreen {...screenProps} onSave={saveTransaction} editTx={editTx} setEditTx={setEditTx} />}
          {activeScreen === "analytics"    && <AnalyticsScreen    {...screenProps} />}
          {activeScreen === "ai"           && <AIScreen           {...screenProps} />}
          {activeScreen === "categories"   && <CategoriesScreen   categories={categories} setCategories={setCategories} />}
          {activeScreen === "settings"     && <SettingsScreen     defaultCurrency={defaultCurrency} setDefaultCurrency={setDefaultCurrency} transactions={transactions} categories={categories} />}
        </div>

        {/* Bottom Nav */}
        <div style={{ background:C.bg2, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", padding:"8px 0 4px", flexShrink:0 }}>
          {NAV.map(({ id, icon:Icon, label, special }) => {
            const active = activeScreen === id;
            return special ? (
              <button key={id} onClick={()=>{ setEditTx(null); setActiveScreen(id); }} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", background:"none", border:"none", cursor:"pointer", padding:0 }}>
                <div style={{ width:48, height:48, borderRadius:16, background:`linear-gradient(135deg,${C.accent},${C.purple})`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:2, boxShadow:`0 4px 20px ${C.accent}44`, transform:"translateY(-10px)" }}>
                  <Icon size={22} color="#fff" />
                </div>
                <span style={{ fontSize:10, color:C.sub, fontFamily:"'Outfit',sans-serif", fontWeight:500 }}>{label}</span>
              </button>
            ) : (
              <button key={id} onClick={()=>setActiveScreen(id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"6px 0 8px" }}>
                <Icon size={20} color={active ? C.accent : C.sub} />
                <span style={{ fontSize:10, fontFamily:"'Outfit',sans-serif", fontWeight:active?700:400, color:active?C.accent:C.sub, transition:"color 0.2s" }}>{label}</span>
                {active && <div style={{ width:4, height:4, borderRadius:"50%", background:C.accent }} />}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
