import { useState, useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// ─── CONFIG: exercise count per group ────────────────────────────────────────
const GROUP_EX_COUNT = { Chest: 4, Back: 4, Legs: 4, Shoulders: 2, Biceps: 2, Triceps: 2 };
const SMALL_GROUPS = ["Shoulders","Biceps","Triceps"];

// ─── EXERCISE DATABASE ───────────────────────────────────────────────────────
const DEFAULT_EXERCISES = {
  Chest: [
    { name:"Barbell Bench Press",     muscles:["mid chest","overall chest"],        img:"https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Bench_press_2.jpg/640px-Bench_press_2.jpg" },
    { name:"Incline Dumbbell Press",  muscles:["upper chest","front delts"],        img:"" },
    { name:"Decline Bench Press",     muscles:["lower chest"],                      img:"" },
    { name:"Dumbbell Bench Press",    muscles:["mid chest","overall chest"],        img:"" },
    { name:"Dumbbell Flyes",          muscles:["mid chest","inner chest stretch"],  img:"" },
    { name:"Incline Cable Fly",       muscles:["upper chest","inner chest"],        img:"" },
    { name:"Cable Crossover Low",     muscles:["upper chest"],                      img:"" },
    { name:"Cable Crossover High",    muscles:["lower chest"],                      img:"" },
    { name:"Pec Deck Machine",        muscles:["mid chest","inner chest"],          img:"" },
    { name:"Push-Ups",                muscles:["overall chest","triceps"],          img:"" },
    { name:"Chest Dips",              muscles:["lower chest","triceps"],            img:"" },
    { name:"Pullover",                muscles:["lower chest","lats"],               img:"" },
  ],
  Back: [
    { name:"Pull-Ups",                muscles:["lats","biceps","upper back"],       img:"" },
    { name:"Lat Pulldown",            muscles:["lats","lower lats"],                img:"" },
    { name:"Barbell Row",             muscles:["mid back","lats","traps"],          img:"" },
    { name:"Single Arm DB Row",       muscles:["lats","mid back"],                  img:"" },
    { name:"Seated Cable Row",        muscles:["mid back","lats"],                  img:"" },
    { name:"T-Bar Row",               muscles:["mid back","thickness"],             img:"" },
    { name:"Deadlift",                muscles:["lower back","traps","full back"],   img:"" },
    { name:"Face Pull",               muscles:["rear delts","traps","rotator cuff"],img:"" },
    { name:"Straight Arm Pulldown",   muscles:["lats","serratus"],                  img:"" },
    { name:"Shrugs",                  muscles:["upper traps"],                      img:"" },
  ],
  Legs: [
    { name:"Barbell Squat",           muscles:["quads","glutes","overall legs"],    img:"" },
    { name:"Leg Press",               muscles:["quads","glutes"],                   img:"" },
    { name:"Hack Squat",              muscles:["quads","outer quads"],              img:"" },
    { name:"Leg Extension",           muscles:["quads isolation"],                  img:"" },
    { name:"Romanian Deadlift",       muscles:["hamstrings","glutes"],              img:"" },
    { name:"Leg Curl",                muscles:["hamstrings isolation"],             img:"" },
    { name:"Walking Lunges",          muscles:["quads","glutes","balance"],         img:"" },
    { name:"Bulgarian Split Squat",   muscles:["quads","glutes","hip flexors"],     img:"" },
    { name:"Standing Calf Raise",     muscles:["gastrocnemius"],                    img:"" },
    { name:"Seated Calf Raise",       muscles:["soleus"],                           img:"" },
    { name:"Adductor Machine",        muscles:["inner thigh","adductors"],          img:"" },
  ],
  Shoulders: [
    { name:"Dumbbell Shoulder Press", muscles:["anterior delt","medial delt"],      img:"" },
    { name:"Arnold Press",            muscles:["all three delt heads"],             img:"" },
    { name:"Barbell Overhead Press",  muscles:["anterior delt","overall shoulder"], img:"" },
    { name:"Lateral Raises",          muscles:["medial delt","shoulder width"],     img:"" },
    { name:"Cable Lateral Raise",     muscles:["medial delt"],                      img:"" },
    { name:"Face Pull",               muscles:["rear delt","rotator cuff"],         img:"" },
    { name:"Reverse Pec Deck",        muscles:["rear delt"],                        img:"" },
    { name:"Upright Row",             muscles:["medial delt","traps"],              img:"" },
    { name:"Front Raises",            muscles:["anterior delt"],                    img:"" },
    { name:"Push Press",              muscles:["anterior delt","triceps"],          img:"" },
  ],
  Biceps: [
    { name:"Barbell Curl",            muscles:["bicep peak","long head"],           img:"" },
    { name:"EZ Bar Curl",             muscles:["long head","brachialis"],           img:"" },
    { name:"Incline Dumbbell Curl",   muscles:["long head stretch","peak"],         img:"" },
    { name:"Concentration Curl",      muscles:["short head","bicep peak"],          img:"" },
    { name:"Hammer Curl",             muscles:["brachialis","brachioradialis"],     img:"" },
    { name:"Cable Curl",              muscles:["overall bicep","constant tension"], img:"" },
    { name:"Preacher Curl",           muscles:["short head","lower bicep"],         img:"" },
    { name:"Zottman Curl",            muscles:["bicep + forearm eccentric"],        img:"" },
  ],
  Triceps: [
    { name:"Tricep Pushdown",         muscles:["lateral head","overall tricep"],    img:"" },
    { name:"Rope Pushdown",           muscles:["lateral head","medial head"],       img:"" },
    { name:"Skull Crushers",          muscles:["long head","overall tricep"],       img:"" },
    { name:"Overhead Cable Extension",muscles:["long head stretch"],                img:"" },
    { name:"Close Grip Bench Press",  muscles:["overall tricep","medial head"],     img:"" },
    { name:"Tricep Dips",             muscles:["overall tricep","lower tricep"],    img:"" },
    { name:"Kickbacks",               muscles:["lateral head isolation"],           img:"" },
    { name:"Single Arm OH Extension", muscles:["long head","unilateral"],           img:"" },
  ],
};

const MUSCLE_GROUPS = Object.keys(DEFAULT_EXERCISES);
const EMOJIS = { Chest:"🏋️", Back:"🔄", Legs:"🦵", Shoulders:"💪", Biceps:"💪", Triceps:"🤜" };

function getToday() { return new Date().toISOString().split("T")[0]; }
function formatDate(d) { return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"}); }
function formatDateLong(d) { return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"}); }
function getWeekStart() {
  const d=new Date(); d.setHours(0,0,0,0);
  d.setDate(d.getDate()-d.getDay()+(d.getDay()===0?-6:1));
  return d.toISOString().split("T")[0];
}

async function callClaude(prompt,system="") {
  const body={model:"claude-sonnet-4-6",max_tokens:1000,messages:[{role:"user",content:prompt}]};
  if(system) body.system=system;
  const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  const data=await res.json();
  return data.content.map(i=>i.text||"").join("");
}

// ─── PROGRESS CHART COMPONENT ────────────────────────────────────────────────
function ExerciseChart({ exerciseName, sessions }) {
  const data = useMemo(() => {
    const points = [];
    [...sessions].reverse().forEach(s => {
      const ex = s.exercises.find(e => e.name === exerciseName);
      if (!ex || !ex.sets.length) return;
      const maxWeight = Math.max(...ex.sets.map(st => parseFloat(st.weight)||0));
      const avgReps   = Math.round(ex.sets.reduce((a,st)=>a+(parseInt(st.reps)||0),0)/ex.sets.length);
      const totalVol  = ex.sets.reduce((a,st)=>(parseFloat(st.weight)||0)*(parseInt(st.reps)||0)+a,0);
      points.push({ date: formatDate(s.date), weight: maxWeight, reps: avgReps, volume: Math.round(totalVol) });
    });
    return points;
  }, [exerciseName, sessions]);

  if (data.length < 2) return (
    <div style={{textAlign:"center",padding:"24px 0",color:"#4a6fa5",fontSize:13}}>
      {data.length===0?"No data yet for this exercise.":"Need at least 2 sessions to show progress."}
    </div>
  );

  const CustomTooltip = ({active,payload,label}) => {
    if (!active||!payload?.length) return null;
    return (
      <div style={{background:"#0d1219",border:"1px solid #1a2540",borderRadius:10,padding:"10px 14px",fontSize:12}}>
        <div style={{fontWeight:800,marginBottom:6,color:"#f0f4ff"}}>{label}</div>
        {payload.map(p=>(
          <div key={p.name} style={{color:p.color,marginBottom:2}}>
            {p.name}: <strong>{p.value}{p.name==="Weight"?" kg":p.name==="Volume"?" kg·reps":" reps"}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{marginTop:4}}>
      <div style={{fontSize:11,fontWeight:800,letterSpacing:1,color:"#2563eb",textTransform:"uppercase",marginBottom:10}}>
        Progress — {exerciseName}
      </div>
      {/* Weight chart */}
      <div style={{fontSize:11,color:"#4a6fa5",marginBottom:4}}>Max Weight (kg)</div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{top:4,right:8,left:-20,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
          <XAxis dataKey="date" tick={{fontSize:9,fill:"#4a6fa5"}} tickLine={false} axisLine={false}/>
          <YAxis tick={{fontSize:9,fill:"#4a6fa5"}} tickLine={false} axisLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Line type="monotone" dataKey="weight" name="Weight" stroke="#2563eb" strokeWidth={2.5} dot={{fill:"#2563eb",r:4}} activeDot={{r:6}}/>
        </LineChart>
      </ResponsiveContainer>
      {/* Reps chart */}
      <div style={{fontSize:11,color:"#4a6fa5",marginTop:14,marginBottom:4}}>Avg Reps per Set</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{top:4,right:8,left:-20,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
          <XAxis dataKey="date" tick={{fontSize:9,fill:"#4a6fa5"}} tickLine={false} axisLine={false}/>
          <YAxis tick={{fontSize:9,fill:"#4a6fa5"}} tickLine={false} axisLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Line type="monotone" dataKey="reps" name="Reps" stroke="#22d3ee" strokeWidth={2.5} dot={{fill:"#22d3ee",r:4}} activeDot={{r:6}}/>
        </LineChart>
      </ResponsiveContainer>
      {/* Volume chart */}
      <div style={{fontSize:11,color:"#4a6fa5",marginTop:14,marginBottom:4}}>Total Volume (kg × reps)</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{top:4,right:8,left:-20,bottom:0}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2540"/>
          <XAxis dataKey="date" tick={{fontSize:9,fill:"#4a6fa5"}} tickLine={false} axisLine={false}/>
          <YAxis tick={{fontSize:9,fill:"#4a6fa5"}} tickLine={false} axisLine={false}/>
          <Tooltip content={<CustomTooltip/>}/>
          <Line type="monotone" dataKey="volume" name="Volume" stroke="#a78bfa" strokeWidth={2.5} dot={{fill:"#a78bfa",r:4}} activeDot={{r:6}}/>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────
export default function GymApp() {
  const [tab, setTab]                   = useState("home");
  const [screen, setScreen]             = useState("main");
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [aiExercises, setAiExercises]   = useState([]);
  const [loadingAI, setLoadingAI]       = useState(false);
  const [currentIdx, setCurrentIdx]     = useState(0);
  const [sets, setSets]                 = useState({});
  const [weight, setWeight]             = useState("");
  const [reps, setReps]                 = useState("");
  const [equipType, setEquipType]       = useState("dumbbells");
  const [sessions, setSessions]         = useState(()=>{ try{return JSON.parse(localStorage.getItem("gymv4_sessions")||"[]")}catch{return []} });
  const [exercises, setExercises]       = useState(()=>{ try{return JSON.parse(localStorage.getItem("gymv4_exercises")||"null")||DEFAULT_EXERCISES}catch{return DEFAULT_EXERCISES} });
  const [todaySession, setTodaySession] = useState(null);
  const [viewSession, setViewSession]   = useState(null);
  const [expandedEx, setExpandedEx]     = useState(null); // exercise name with chart open
  const [aiNote, setAiNote]             = useState("");
  const [exTab, setExTab]               = useState("Chest");
  const [newExName, setNewExName]       = useState("");
  const [weeklyAnalysis, setWeeklyAnalysis] = useState("");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [imgErrors, setImgErrors]       = useState({});
  // Progress tab
  const [progressGroup, setProgressGroup] = useState("Chest");
  const [progressEx, setProgressEx]     = useState(null);

  useEffect(()=>{ try{localStorage.setItem("gymv4_sessions",JSON.stringify(sessions))}catch{} },[sessions]);
  useEffect(()=>{ try{localStorage.setItem("gymv4_exercises",JSON.stringify(exercises))}catch{} },[exercises]);

  // derive all exercises flat map
  const allExMap = useMemo(()=>Object.values(exercises).flat().reduce((acc,e)=>({...acc,[e.name]:e}),{}),[exercises]);

  // ─── GROUP TOGGLE ────────────────────────────────────────────────────────
  function toggleGroup(g) {
    setSelectedGroups(prev=>prev.includes(g)?prev.filter(x=>x!==g):[...prev,g]);
  }

  // ─── START WORKOUT ───────────────────────────────────────────────────────
  async function startWorkout() {
    if (!selectedGroups.length) return;
    setLoadingAI(true); setScreen("workout"); setCurrentIdx(0); setSets({}); setWeight(""); setReps("");

    const allEx = selectedGroups.flatMap(g=>exercises[g].map(e=>({...e,group:g})));
    const recent = sessions.filter(s=>selectedGroups.some(g=>(s.muscleGroups||[s.muscleGroup]).includes(g))).slice(-4).flatMap(s=>s.exercises.map(e=>e.name));

    // Build count instructions per group
    const countInstr = selectedGroups.map(g=>`- ${g}: exactly ${GROUP_EX_COUNT[g]} exercise${GROUP_EX_COUNT[g]>1?"s":""} (${SMALL_GROUPS.includes(g)?"small muscle group — keep it focused":"larger muscle group — cover all sub-muscles"})`).join("\n");

    const muscleDetail = selectedGroups.map(g=>{
      const subs=[...new Set(exercises[g].flatMap(e=>e.muscles))];
      return `${g} targets: [${subs.join(", ")}]`;
    }).join(". ");

    const prompt=`You are an elite personal trainer with deep anatomy knowledge.
The user wants to train: ${selectedGroups.join(" + ")}.
${muscleDetail}

STRICT exercise count per group:
${countInstr}

Available exercises (with target muscles):
${allEx.map(e=>`- "${e.name}" [group:${e.group}] [muscles:${e.muscles.join(", ")}]`).join("\n")}

Recently done (vary from these): ${recent.length?recent.join(", "):"none yet"}.

Rules:
1. Respect the EXACT count per group — no more, no less.
2. For small groups (Shoulders/Biceps/Triceps): pick 2 that cover different sub-muscles (e.g. for Biceps: one long head, one short head).
3. For larger groups: cover upper/mid/lower or push/pull balance.
4. For combo sessions: order exercises to alternate groups when possible.

Reply ONLY with a valid JSON array of exercise name strings. Example: ["Incline Dumbbell Press","Barbell Bench Press","Cable Crossover High","Barbell Curl","Hammer Curl"]
No other text.`;

    try {
      const raw=await callClaude(prompt);
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setAiExercises(parsed);
    } catch {
      // fallback: pick correct count per group
      const picks=selectedGroups.flatMap(g=>{
        const count=GROUP_EX_COUNT[g];
        return (exercises[g]||[]).sort(()=>Math.random()-0.5).slice(0,count).map(e=>e.name);
      });
      setAiExercises(picks);
    }
    setLoadingAI(false);
  }

  // ─── SETS ────────────────────────────────────────────────────────────────
  function addSet() {
    const w=weight.trim(); const r=reps.trim();
    if(!w||!r) return;
    const ex=aiExercises[currentIdx];
    setSets(p=>({...p,[ex]:[...(p[ex]||[]),{weight:w,reps:r,type:equipType}]}));
    setWeight(""); setReps("");
  }

  // ─── FINISH ──────────────────────────────────────────────────────────────
  async function finishWorkout() {
    const session={date:getToday(),muscleGroups:selectedGroups,muscleGroup:selectedGroups[0],exercises:aiExercises.map(n=>({name:n,sets:sets[n]||[]}))};
    setSessions(p=>[session,...p]);
    setTodaySession(session);
    const total=Object.values(sets).reduce((a,b)=>a+b.length,0);
    try {
      const note=await callClaude(`You are a motivating personal trainer. User trained ${selectedGroups.join(" + ")}. Exercises: ${aiExercises.join(", ")}. Total sets: ${total}. Give a short congrats and one specific muscle tip for next session. Max 2 sentences. English.`);
      setAiNote(note);
    } catch { setAiNote("Great session! Keep pushing! 💪"); }
    setScreen("summary");
  }

  // ─── WEEKLY ANALYSIS ─────────────────────────────────────────────────────
  async function getWeeklyAnalysis() {
    setLoadingAnalysis(true); setWeeklyAnalysis("");
    const ws=getWeekStart();
    const ws_sessions=sessions.filter(s=>s.date>=ws);
    if(!ws_sessions.length){setWeeklyAnalysis("No workouts logged this week yet. Hit the gym and come back!");setLoadingAnalysis(false);return;}
    const summary=ws_sessions.map(s=>{
      const groups=s.muscleGroups||[s.muscleGroup];
      const exDetail=s.exercises.map(e=>{
        const exData=allExMap[e.name];
        const muscles=exData?.muscles?.join(", ")||"unknown";
        const setsStr=e.sets.map(st=>`${st.weight}kg×${st.reps}`).join(", ");
        return `  • ${e.name} [${muscles}]: ${setsStr||"no sets"}`;
      }).join("\n");
      return `${formatDateLong(s.date)} — ${groups.join("+")}:\n${exDetail}`;
    }).join("\n\n");

    try {
      const note=await callClaude(`You are an expert personal trainer and sports scientist. Analyse this week's training:\n\n${summary}\n\nProvide:\n1. MUSCLE BALANCE: what was well trained vs neglected\n2. VOLUME & INTENSITY: is weight/rep range optimal\n3. WEAK POINTS: specific muscles or patterns needing work\n4. NEXT WEEK PRIORITY: 2-3 concrete actionable recommendations\n\nBe specific, reference actual exercises and weights. Be direct. English. Use clear line breaks.`);
      setWeeklyAnalysis(note);
    } catch { setWeeklyAnalysis("Could not load analysis. Try again."); }
    setLoadingAnalysis(false);
  }

  // ─── EXERCISES TAB ───────────────────────────────────────────────────────
  function removeEx(g,name){ setExercises(p=>({...p,[g]:p[g].filter(e=>e.name!==name)})); }
  function addEx(g){
    if(!newExName.trim()) return;
    const n=newExName.trim();
    if(exercises[g].find(e=>e.name.toLowerCase()===n.toLowerCase())) return;
    setExercises(p=>({...p,[g]:[...p[g],{name:n,muscles:["general"],img:""}]}));
    setNewExName("");
  }
  function resetGroup(g){ setExercises(p=>({...p,[g]:DEFAULT_EXERCISES[g]})); }

  const currentEx = aiExercises[currentIdx];
  const currentSets = sets[currentEx]||[];

  // ─── COLOURS & STYLES ────────────────────────────────────────────────────
  const C={bg:"#080b10",card:"#0d1219",card2:"#111822",border:"#1a2540",blue:"#2563eb",blueL:"#3b82f6",cyan:"#22d3ee",purple:"#a78bfa",text:"#f0f4ff",muted:"#4a6fa5",sub:"#7a8fb0"};
  const css=`
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#080b10}
    input[type=number]{-moz-appearance:textfield}
    input::-webkit-outer-spin-button,input::-webkit-inner-spin-button{-webkit-appearance:none}
    .card-hover:hover{border-color:#2563eb!important}
    .rm:hover{color:#ef4444!important}
    .tab-btn:hover{background:#111822!important}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1a2540;border-radius:4px}
  `;
  const app={minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'Inter',system-ui,sans-serif",maxWidth:430,margin:"0 auto",paddingBottom:76};
  const hdr={background:C.card,borderBottom:`1px solid ${C.border}`,padding:"16px 20px",position:"sticky",top:0,zIndex:20,display:"flex",alignItems:"center",justifyContent:"space-between"};
  const logo={fontSize:20,fontWeight:900,letterSpacing:"-0.5px"};
  const nav={position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:C.card,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:20};
  const navIt=(a)=>({flex:1,padding:"12px 0 8px",textAlign:"center",cursor:"pointer",borderTop:`2px solid ${a?C.blue:"transparent"}`});
  const inp={background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",color:C.text,fontSize:16,fontWeight:700,outline:"none",width:"100%"};
  const primaryBtn={background:`linear-gradient(135deg,#1d4ed8,${C.blue})`,border:"none",borderRadius:13,padding:"14px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",width:"100%"};

  // ─── HISTORY DETAIL (with chart) ─────────────────────────────────────────
  if(screen==="hist_detail"&&viewSession) return (
    <div style={app}><style>{css}</style>
      <div style={hdr}>
        <span style={logo}>GYM<span style={{color:C.blue}}>AI</span></span>
        <button style={{background:"none",border:"none",color:C.blue,fontWeight:700,cursor:"pointer",fontSize:13}} onClick={()=>setScreen("main")}>← Back</button>
      </div>
      <div style={{padding:"22px 20px"}}>
        <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{formatDateLong(viewSession.date)}</div>
        <div style={{fontSize:22,fontWeight:900,marginBottom:20}}>{(viewSession.muscleGroups||[viewSession.muscleGroup]).map(g=>EMOJIS[g]+" "+g).join(" + ")}</div>
        {viewSession.exercises.map(ex=>(
          <div key={ex.name} style={{marginBottom:12}}>
            <div className="card-hover" onClick={()=>setExpandedEx(expandedEx===ex.name?null:ex.name)}
              style={{background:C.card,border:`1px solid ${expandedEx===ex.name?C.blue:C.border}`,borderRadius:14,padding:"14px 16px",cursor:"pointer",transition:"border-color 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <div style={{fontSize:14,fontWeight:800}}>{ex.name}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:2}}>{allExMap[ex.name]?.muscles?.join(" · ")||""}</div>
                </div>
                <div style={{color:expandedEx===ex.name?C.blue:C.muted,fontSize:18,transition:"transform 0.2s",transform:expandedEx===ex.name?"rotate(180deg)":"none"}}>⌄</div>
              </div>
              <div style={{marginTop:10}}>
                {ex.sets.length===0&&<div style={{fontSize:12,color:C.sub}}>No sets logged</div>}
                {ex.sets.map((st,i)=>(
                  <div key={i} style={{display:"flex",gap:8,alignItems:"center",fontSize:12,color:C.sub,padding:"3px 0",borderBottom:i<ex.sets.length-1?`1px solid ${C.border}`:"none"}}>
                    <span style={{color:C.muted,width:40}}>Set {i+1}</span>
                    <span style={{fontWeight:800,color:C.text}}>{st.weight} kg</span>
                    <span style={{color:C.muted}}>×</span>
                    <span style={{fontWeight:800,color:C.text}}>{st.reps} reps</span>
                    <span style={{color:C.border}}>·</span>
                    <span style={{color:C.muted}}>{st.type}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Inline chart */}
            {expandedEx===ex.name&&(
              <div style={{background:C.card2,border:`1px solid ${C.blue}`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"16px 16px 20px",animation:"fadeUp 0.2s ease"}}>
                <ExerciseChart exerciseName={ex.name} sessions={sessions}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ─── WORKOUT SCREEN ──────────────────────────────────────────────────────
  if(screen==="workout") return (
    <div style={app}><style>{css}</style>
      <div style={hdr}>
        <div>
          <span style={logo}>GYM<span style={{color:C.blue}}>AI</span></span>
          <span style={{fontSize:11,color:C.muted,marginLeft:8}}>{selectedGroups.join(" + ")}</span>
        </div>
        <button style={{background:"none",border:"none",color:C.muted,fontWeight:700,cursor:"pointer",fontSize:13}} onClick={()=>{setScreen("main");setAiExercises([]);setSets({});setSelectedGroups([])}}>✕</button>
      </div>
      <div style={{padding:"20px"}}>
        {loadingAI?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:300,gap:16}}>
            <div style={{width:44,height:44,border:`3px solid ${C.border}`,borderTop:`3px solid ${C.blue}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
            <div style={{color:C.muted,fontSize:13,fontWeight:600,textAlign:"center",lineHeight:1.6}}>
              AI is analysing sub-muscles<br/>and building your optimal session…
            </div>
          </div>
        ):(
          <>
            {/* Progress bar */}
            <div style={{display:"flex",gap:5,marginBottom:20}}>
              {aiExercises.map((_,i)=>(
                <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<currentIdx?C.blue:i===currentIdx?C.blueL:C.border,transition:"background 0.3s"}}/>
              ))}
            </div>

            {/* Header */}
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",marginBottom:4}}>Exercise {currentIdx+1} / {aiExercises.length}</div>
            <div style={{fontSize:22,fontWeight:900,lineHeight:1.2,marginBottom:4}}>{currentEx}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:16,lineHeight:1.5}}>
              {allExMap[currentEx]?.muscles?.join(" · ")||""}
            </div>

            {/* Image / placeholder */}
            {(()=>{
              const imgSrc=allExMap[currentEx]?.img;
              if(imgSrc&&!imgErrors[currentEx]) return (
                <div style={{borderRadius:14,overflow:"hidden",marginBottom:16,background:C.card,border:`1px solid ${C.border}`,height:160,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <img src={imgSrc} alt={currentEx} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setImgErrors(p=>({...p,[currentEx]:true}))}/>
                </div>
              );
              return (
                <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:"14px 16px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:30}}>{EMOJIS[selectedGroups[0]]}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:800,color:C.text,marginBottom:3}}>{currentEx}</div>
                    <div style={{fontSize:11,color:C.muted}}>{allExMap[currentEx]?.muscles?.slice(0,2).join(" · ")||""}</div>
                  </div>
                </div>
              );
            })()}

            {/* Inline mini chart for this exercise */}
            {sessions.some(s=>s.exercises.some(e=>e.name===currentEx&&e.sets.length>0))&&(
              <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:C.muted,textTransform:"uppercase",marginBottom:6}}>Your progress on this exercise</div>
                <ExerciseChart exerciseName={currentEx} sessions={sessions}/>
              </div>
            )}

            {/* Equipment */}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              {["dumbbells","barbell","machine","cables"].map(t=>(
                <button key={t} onClick={()=>setEquipType(t)}
                  style={{flex:1,background:equipType===t?C.blue:C.card2,border:`1px solid ${equipType===t?C.blue:C.border}`,borderRadius:9,padding:"8px 0",color:equipType===t?"#fff":C.sub,fontSize:11,fontWeight:700,cursor:"pointer",textTransform:"capitalize"}}>
                  {t}
                </button>
              ))}
            </div>

            {/* Inputs */}
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Weight (kg)</div>
                <input type="number" inputMode="decimal" placeholder="0" value={weight} onChange={e=>setWeight(e.target.value)} style={inp}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:1,textTransform:"uppercase",marginBottom:5}}>Reps</div>
                <input type="number" inputMode="numeric" placeholder="0" value={reps} onChange={e=>setReps(e.target.value)} style={inp}/>
              </div>
            </div>
            <button onClick={addSet} style={{...primaryBtn,background:C.blue,fontSize:14,padding:"13px",marginBottom:16}}>+ Add Set</button>

            {/* Sets */}
            {currentSets.length>0&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",marginBottom:16}}>
                {currentSets.map((st,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",padding:"10px 14px",borderBottom:i<currentSets.length-1?`1px solid ${C.border}`:"none"}}>
                    <span style={{fontSize:12,color:C.muted,width:46}}>Set {i+1}</span>
                    <span style={{flex:1,fontSize:14,fontWeight:800}}>{st.weight} kg × {st.reps} reps</span>
                    <span style={{fontSize:11,color:C.muted,marginRight:10}}>{st.type}</span>
                    <button className="rm" onClick={()=>setSets(p=>({...p,[currentEx]:p[currentEx].filter((_,j)=>j!==i)}))}
                      style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:20,lineHeight:1,transition:"color 0.2s"}}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Nav */}
            <div style={{display:"flex",gap:10,marginBottom:12}}>
              <button disabled={currentIdx===0} onClick={()=>{setCurrentIdx(i=>i-1);setWeight("");setReps("");}}
                style={{flex:1,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",color:currentIdx===0?C.border:C.text,fontSize:13,fontWeight:700,cursor:currentIdx===0?"default":"pointer"}}>← Prev</button>
              {currentIdx<aiExercises.length-1
                ?<button onClick={()=>{setCurrentIdx(i=>i+1);setWeight("");setReps("");}}
                    style={{flex:1,background:C.card2,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer"}}>Next →</button>
                :<button onClick={finishWorkout}
                    style={{flex:1,background:"#162035",border:`1px solid ${C.blue}`,borderRadius:12,padding:"12px",color:C.blueL,fontSize:13,fontWeight:700,cursor:"pointer"}}>Finish ✓</button>
              }
            </div>
            {currentIdx===aiExercises.length-1&&(
              <button onClick={finishWorkout} style={primaryBtn}>💪 Save Workout</button>
            )}
          </>
        )}
      </div>
    </div>
  );

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  if(screen==="summary"&&todaySession) return (
    <div style={app}><style>{css}</style>
      <div style={hdr}>
        <span style={logo}>GYM<span style={{color:C.blue}}>AI</span></span>
        <button style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,fontWeight:700}} onClick={()=>{setScreen("main");setTab("home");setSelectedGroups([])}}>✕</button>
      </div>
      <div style={{padding:"28px 20px"}}>
        <div style={{fontSize:48,textAlign:"center",marginBottom:12}}>🏆</div>
        <div style={{fontSize:24,fontWeight:900,textAlign:"center",marginBottom:6}}>Workout Complete!</div>
        <div style={{textAlign:"center",color:C.muted,fontSize:13,marginBottom:24}}>
          {(todaySession.muscleGroups||[todaySession.muscleGroup]).map(g=>EMOJIS[g]+" "+g).join(" + ")} · {todaySession.exercises.reduce((a,e)=>a+e.sets.length,0)} sets
        </div>
        {aiNote&&<div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",marginBottom:20,color:"#c0d0ff",fontSize:14,lineHeight:1.7}}>💬 {aiNote}</div>}
        {todaySession.exercises.map(ex=>(
          <div key={ex.name} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10}}>
            <div style={{fontSize:14,fontWeight:800,marginBottom:2}}>{ex.name}</div>
            <div style={{fontSize:11,color:C.muted,marginBottom:8}}>{allExMap[ex.name]?.muscles?.join(" · ")||""}</div>
            {ex.sets.length===0&&<div style={{fontSize:12,color:C.sub}}>No sets logged</div>}
            {ex.sets.map((st,i)=><div key={i} style={{fontSize:12,color:C.sub,marginBottom:2}}>Set {i+1}: {st.weight}kg × {st.reps} reps ({st.type})</div>)}
          </div>
        ))}
        <button onClick={()=>{setScreen("main");setTab("home");setSelectedGroups([]);}} style={{...primaryBtn,marginTop:8}}>Back to Home</button>
      </div>
    </div>
  );

  // ─── MAIN TABS ───────────────────────────────────────────────────────────
  return (
    <div style={app}><style>{css}</style>
      <div style={hdr}>
        <span style={logo}>GYM<span style={{color:C.blue}}>AI</span></span>
        <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short"})}</span>
      </div>

      {/* ── HOME ─────────────────────────────────────────────────────── */}
      {tab==="home"&&(
        <>
          <div style={{padding:"22px 20px 0"}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",marginBottom:8}}>Ready to train?</div>
            <div style={{fontSize:23,fontWeight:900,marginBottom:6}}>Select muscle group(s)</div>
            <div style={{fontSize:13,color:C.sub,marginBottom:18}}>Tap one or combine for a superset session. Shoulders, Biceps &amp; Triceps always get 2 exercises each.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              {MUSCLE_GROUPS.map(g=>{
                const sel=selectedGroups.includes(g);
                const count=GROUP_EX_COUNT[g];
                return (
                  <button key={g} onClick={()=>toggleGroup(g)}
                    style={{background:sel?`linear-gradient(135deg,#1d4ed8,${C.blue})`:C.card,border:`2px solid ${sel?C.blue:C.border}`,borderRadius:14,padding:"16px 14px",cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                    <span style={{fontSize:22,display:"block",marginBottom:6}}>{EMOJIS[g]}</span>
                    <div style={{fontSize:14,fontWeight:800,color:C.text}}>{g}</div>
                    <div style={{fontSize:11,color:sel?"rgba(255,255,255,0.65)":C.muted,marginTop:2}}>{exercises[g]?.length||0} exercises · AI picks {count}</div>
                  </button>
                );
              })}
            </div>
            {selectedGroups.length>0&&(
              <button onClick={startWorkout} style={{...primaryBtn,marginBottom:16,fontSize:14}}>
                🚀 Start {selectedGroups.join(" + ")} Workout
              </button>
            )}
            {!selectedGroups.length&&<div style={{textAlign:"center",color:C.muted,fontSize:13,marginBottom:16}}>Tap a group above to begin</div>}
          </div>
          {sessions.length>0&&(
            <div style={{padding:"0 20px"}}>
              <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",padding:"16px 0 10px"}}>Last Session</div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px"}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{formatDateLong(sessions[0].date)}</div>
                <div style={{fontSize:15,fontWeight:800}}>{(sessions[0].muscleGroups||[sessions[0].muscleGroup]).map(g=>EMOJIS[g]+" "+g).join(" + ")}</div>
                <div style={{fontSize:12,color:C.sub,marginTop:4}}>{sessions[0].exercises.map(e=>e.name).join(" · ")}</div>
              </div>
            </div>
          )}
          {/* Weekly AI */}
          <div style={{padding:"0 20px",marginTop:20,paddingBottom:8}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",marginBottom:10}}>Weekly AI Coach</div>
            <button onClick={getWeeklyAnalysis} disabled={loadingAnalysis}
              style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",color:C.text,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:12}}>
              {loadingAnalysis
                ?<><div style={{width:16,height:16,border:`2px solid ${C.border}`,borderTop:`2px solid ${C.blue}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>Analysing your week…</>
                :<>🧠 Analyse My Week &amp; Tell Me What To Improve</>
              }
            </button>
            {weeklyAnalysis&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"16px",animation:"fadeUp 0.3s ease"}}>
                <div style={{fontSize:10,fontWeight:800,letterSpacing:1,color:C.blue,textTransform:"uppercase",marginBottom:10}}>AI Weekly Analysis</div>
                <div style={{fontSize:13,color:"#c0d0ff",lineHeight:1.9,whiteSpace:"pre-wrap"}}>{weeklyAnalysis}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── HISTORY ──────────────────────────────────────────────────── */}
      {tab==="history"&&(
        <>
          <div style={{padding:"22px 20px 0"}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",marginBottom:8}}>Your workouts</div>
            <div style={{fontSize:23,fontWeight:900,marginBottom:16}}>History</div>
          </div>
          {sessions.length===0?(
            <div style={{padding:"60px 20px",textAlign:"center",color:C.muted}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <div>No workouts yet. Start training!</div>
            </div>
          ):(
            <div style={{padding:"0 20px"}}>
              {sessions.map((s2,i)=>(
                <div key={i} className="card-hover" onClick={()=>{setViewSession(s2);setExpandedEx(null);setScreen("hist_detail")}}
                  style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:10,cursor:"pointer",transition:"border-color 0.2s"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:4}}>{formatDateLong(s2.date)}</div>
                  <div style={{fontSize:15,fontWeight:800}}>{(s2.muscleGroups||[s2.muscleGroup]).map(g=>EMOJIS[g]+" "+g).join(" + ")}</div>
                  <div style={{fontSize:12,color:C.sub,marginTop:4}}>{s2.exercises.map(e=>e.name).join(" · ")}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:5}}>{s2.exercises.reduce((a,e)=>a+e.sets.length,0)} total sets</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── PROGRESS TAB ─────────────────────────────────────────────── */}
      {tab==="progress"&&(
        <>
          <div style={{padding:"22px 20px 0"}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",marginBottom:8}}>Track gains</div>
            <div style={{fontSize:23,fontWeight:900,marginBottom:16}}>Progress Charts</div>
            {/* Group filter */}
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
              {MUSCLE_GROUPS.map(g=>(
                <button key={g} onClick={()=>{setProgressGroup(g);setProgressEx(null)}}
                  style={{whiteSpace:"nowrap",background:progressGroup===g?C.blue:C.card2,border:`1px solid ${progressGroup===g?C.blue:C.border}`,borderRadius:20,padding:"7px 14px",color:progressGroup===g?"#fff":C.sub,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  {EMOJIS[g]} {g}
                </button>
              ))}
            </div>
            {/* Exercise list */}
            <div style={{marginBottom:20}}>
              {(exercises[progressGroup]||[]).map(ex=>{
                const hasSessions=sessions.some(s=>s.exercises.some(e=>e.name===ex.name&&e.sets.length>0));
                const isOpen=progressEx===ex.name;
                return (
                  <div key={ex.name} style={{marginBottom:10}}>
                    <div className="card-hover" onClick={()=>setProgressEx(isOpen?null:ex.name)}
                      style={{background:C.card,border:`1px solid ${isOpen?C.blue:C.border}`,borderRadius:14,padding:"13px 16px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"border-color 0.2s"}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:800}}>{ex.name}</div>
                        <div style={{fontSize:10,color:hasSessions?C.cyan:C.muted,marginTop:2}}>{hasSessions?"Data available":"No data yet"}</div>
                      </div>
                      <div style={{color:isOpen?C.blue:C.muted,fontSize:18,transition:"transform 0.2s",transform:isOpen?"rotate(180deg)":"none"}}>⌄</div>
                    </div>
                    {isOpen&&(
                      <div style={{background:C.card2,border:`1px solid ${C.blue}`,borderTop:"none",borderRadius:"0 0 14px 14px",padding:"16px",animation:"fadeUp 0.2s ease"}}>
                        <ExerciseChart exerciseName={ex.name} sessions={sessions}/>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ── EXERCISES TAB ────────────────────────────────────────────── */}
      {tab==="exercises"&&(
        <>
          <div style={{padding:"22px 20px 0"}}>
            <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.blue,textTransform:"uppercase",marginBottom:8}}>Manage</div>
            <div style={{fontSize:23,fontWeight:900,marginBottom:14}}>Exercise Library</div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:14}}>
              {MUSCLE_GROUPS.map(g=>(
                <button key={g} onClick={()=>setExTab(g)}
                  style={{whiteSpace:"nowrap",background:exTab===g?C.blue:C.card2,border:`1px solid ${exTab===g?C.blue:C.border}`,borderRadius:20,padding:"7px 14px",color:exTab===g?"#fff":C.sub,fontSize:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>
                  {EMOJIS[g]} {g}
                </button>
              ))}
            </div>
            <div style={{background:C.card2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:12,color:C.muted}}>
              AI will pick <strong style={{color:C.text}}>{GROUP_EX_COUNT[exTab]} exercise{GROUP_EX_COUNT[exTab]>1?"s":""}</strong> from {exTab} per session.
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <input value={newExName} onChange={e=>setNewExName(e.target.value)} placeholder="Add exercise name…"
                onKeyDown={e=>e.key==="Enter"&&addEx(exTab)}
                style={{...inp,flex:1,fontSize:14,padding:"10px 14px"}}/>
              <button onClick={()=>addEx(exTab)} style={{background:C.blue,border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontSize:18,fontWeight:900,cursor:"pointer"}}>+</button>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontSize:12,color:C.muted}}>{exercises[exTab]?.length||0} exercises</span>
              <button onClick={()=>resetGroup(exTab)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",color:C.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>Reset defaults</button>
            </div>
          </div>
          <div style={{padding:"0 20px"}}>
            {(exercises[exTab]||[]).map(ex=>(
              <div key={ex.name} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:10,overflow:"hidden",display:"flex",alignItems:"center",animation:"fadeUp 0.2s ease"}}>
                <div style={{width:80,height:80,flexShrink:0,background:"#080b10",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
                  {ex.img&&!imgErrors[ex.name+"_lib"]
                    ?<img src={ex.img} alt={ex.name} style={{width:"100%",height:"100%",objectFit:"contain"}} onError={()=>setImgErrors(p=>({...p,[ex.name+"_lib"]:true}))}/>
                    :<span style={{fontSize:26}}>{EMOJIS[exTab]}</span>
                  }
                </div>
                <div style={{flex:1,padding:"10px 12px"}}>
                  <div style={{fontSize:13,fontWeight:800}}>{ex.name}</div>
                  <div style={{fontSize:10,color:C.muted,marginTop:3,lineHeight:1.5}}>{ex.muscles?.join(" · ")||""}</div>
                </div>
                <button className="rm" onClick={()=>removeEx(exTab,ex.name)}
                  style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:22,padding:"0 16px",transition:"color 0.2s"}}>×</button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BOTTOM NAV ───────────────────────────────────────────────── */}
      <div style={nav}>
        {[{id:"home",icon:"🏠",label:"HOME"},{id:"progress",icon:"📈",label:"PROGRESS"},{id:"history",icon:"📋",label:"HISTORY"},{id:"exercises",icon:"✏️",label:"EXERCISES"}].map(n=>(
          <div key={n.id} style={navIt(tab===n.id)} onClick={()=>setTab(n.id)}>
            <div style={{fontSize:18}}>{n.icon}</div>
            <div style={{fontSize:8,fontWeight:800,color:tab===n.id?C.blue:C.muted,letterSpacing:0.5,marginTop:1}}>{n.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
