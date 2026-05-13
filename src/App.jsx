import { useState, useRef, useEffect } from "react";

const T = {
  blue:"#1C3B8E", blueL:"#EFF6FF", red:"#E8314A", redL:"#FEE2E2",
  green:"#22A06B", greenL:"#D1FAE5", orange:"#D97706", orangeL:"#FEF3C7",
  g100:"#F3F4F6", g200:"#E5E7EB", g300:"#D1D5DB", g400:"#9CA3AF",
  g500:"#6B7280", g700:"#374151", g900:"#111827", white:"#FFFFFF", bg:"#F4F6FA",
};

const PATIENT = {
  name:"Lucie Nováková", age:54, doctor:"MUDr. Vostradovská",
  meds:[{name:"Prestarium 5mg",freq:"1× denně"},{name:"Aerius 5mg",freq:"dle potřeby"}],
  allergies:["Penicilin"], conditions:["Hypertenze","Sezónní alergie"], lastVisit:"5. 5. 2025",
};

const RECORDS = [
  { id:"lab1", type:"lab", title:"Biochemické vyšetření krve", date:"28. 4. 2025",
    doctor:"MUDr. Vostradovská", statusC:"r", statusL:"1 abnormální hodnota",
    summary:"Lipidový panel a glukóza. LDL mírně nad normou.",
    results:[
      {name:"Glukóza",code:"GLU",value:5.4,unit:"mmol/L",min:3.9,max:5.5,status:"normal",note:"V normě."},
      {name:"LDL Cholesterol",code:"LDL",value:3.8,unit:"mmol/L",min:1.8,max:3.4,status:"high",note:"Mírně zvýšené."},
      {name:"HDL Cholesterol",code:"HDL",value:1.3,unit:"mmol/L",min:1.2,max:2.5,status:"normal",note:"Dobrá hodnota."},
      {name:"Triglyceridy",code:"TG",value:1.6,unit:"mmol/L",min:0.5,max:1.7,status:"normal",note:"V normě."},
    ],
    aiInterpretation:"Výsledky jsou převážně v normě. LDL cholesterol je mírně nad referenčním rozmezím (3,8 vs. max 3,4 mmol/L). Při Vaší diagnóze hypertenze doporučujeme dietní intervenci a kontrolu za 3 měsíce.",
    lifestyle:[
      {icon:"🥗",title:"Strava",text:"Omezte nasycené tuky. Přidejte vlákninu — ovesné vločky, luštěniny."},
      {icon:"🏃",title:"Pohyb",text:"30 minut aerobní aktivity 5× týdně snižuje LDL o 5–10%."},
      {icon:"🐟",title:"Omega-3",text:"2–3 porce tučných ryb týdně nebo doplněk 1g/den."},
    ],
  },
  { id:"lab2", type:"lab", title:"Krevní obraz", date:"28. 4. 2025",
    doctor:"MUDr. Vostradovská", statusC:"g", statusL:"Vše v normě",
    summary:"Kompletní krevní obraz bez patologií.",
    results:[
      {name:"Hemoglobin",code:"HGB",value:136,unit:"g/L",min:120,max:160,status:"normal",note:"V normě."},
      {name:"Leukocyty",code:"WBC",value:6.2,unit:"×10⁹/L",min:4.0,max:10.0,status:"normal",note:"V normě."},
      {name:"Trombocyty",code:"PLT",value:242,unit:"×10⁹/L",min:150,max:400,status:"normal",note:"V normě."},
    ],
    aiInterpretation:"Krevní obraz je kompletně v normálním rozmezí. Žádné odchylky nebyly zjištěny.",
    lifestyle:[],
  },
  { id:"rec1", type:"record", title:"Zpráva z kardiologického vyšetření", date:"12. 3. 2025",
    doctor:"MUDr. Horáček, kardiolog", statusC:"b", statusL:"Informativní",
    summary:"Echokardiografie + EKG. Bez závažné patologie.",
    fullText:"Pacientka odeslána pro kontrolní echokardiografii. EKG: sinusový rytmus 72/min, normální osa. Echo: hraniční LK hypertrofie (septum 10mm). EF 62%. Závěr: kompenzovaná hypertenze, bez valvulární patologie. Doporučeno pokračovat v Prestarium 5mg, kontrola za 12 měsíců.",
    aiInterpretation:"Zpráva potvrzuje dobrou kompenzaci hypertenze. Ejekční frakce 62% je v normě (>55%). Hraniční hypertrofie levé komory je typická při chronické hypertenzi — klíčové je udržet dobrý tlak.",
    careJourney:[
      {icon:"💊",title:"Medikace",text:"Pokračovat v Prestarium 5mg 1× denně."},
      {icon:"📅",title:"Kontrola",text:"Kardiologická kontrola za 12 měsíců."},
      {icon:"📊",title:"Sledování TK",text:"Denní měření TK, cíl < 130/80 mmHg."},
      {icon:"🚶",title:"Aktivita",text:"30 min chůze denně. Vyhýbejte se těžkým váhám."},
    ],
  },
  { id:"rec2", type:"record", title:"Propouštěcí zpráva — ambulance", date:"15. 1. 2025",
    doctor:"MUDr. Kratochvílová", statusC:"b", statusL:"Archiv",
    summary:"Akutní návštěva pro záchvat alergické rýmy.",
    fullText:"Pacientka přichází pro akutní zhoršení alergické symptomatologie — vodnatá rýma, slzení, svědění. Diagnóza: sezónní alergie na pyl. Th: Aerius 5mg 1-0-0, Nasonex nosní sprej 2× denně. Stav se zlepšil. Propuštěna domů.",
    aiInterpretation:"Epizoda bez závažných komplikací. Nastavená terapie Aerius + nosní kortikoid je standardní. Sledujte sezónní zhoršení a mějte Aerius vždy k dispozici.",
    careJourney:[
      {icon:"💊",title:"Medikace",text:"Aerius 5mg dle potřeby při alergických symptomech."},
      {icon:"🌿",title:"Expozice",text:"V pylové sezóně větrejte brzy ráno nebo po dešti."},
      {icon:"🩺",title:"Alergolog",text:"Zvažte imunoterapii u alergologa."},
    ],
  },
];

const QAS = {
  lab:[
    {q:"Co znamená zvýšené LDL?", a:"**LDL cholesterol** přenáší tuky do cév. Mírně zvýšená hodnota 3,8 mmol/L je signálem ke změně životního stylu, nikoliv ještě k medikaci."},
    {q:"Co probrat s lékařem?", a:"**Doporučuji probrat:** kontrolu lipidů za 3 měsíce po dietní intervenci a celkové kardiovaskulární riziko s ohledem na hypertenzi."},
    {q:"Jak zlepšit výsledky?", a:"**Nejúčinnější:** Středomořská strava snižuje LDL o 10–15%. Aerobní aktivita 150 min/týden. Každých -5 kg tělesné hmotnosti zlepšuje lipidy o ~5%."},
  ],
  record:[
    {q:"Co zpráva znamená pro mě?", a:"**Zpráva je příznivá.** Ejekční frakce 62% je dobrá. Hraniční hypertrofie levé komory je typická — klíčové je udržet krevní tlak pod kontrolou."},
    {q:"Mám se obávat?", a:"**Není důvod k panice.** Nález je stabilní. Pokračujte v Prestarium a měřte si TK. Dušnost nebo bolest na hrudi jsou důvodem k okamžitému kontaktu s lékařem."},
    {q:"Jaké jsou další kroky?", a:"**1)** Prestarium 5mg denně. **2)** TK ráno a večer, cíl < 130/80. **3)** Kardiologická kontrola za 12 měsíců."},
  ],
};

// ── micro UI ──────────────────────────────────────────────────────────────────
const Leaf = () => <svg width={24} height={24} viewBox="0 0 40 40" fill={T.red}><path d="M20 2L22 12L30 8L26 16L36 18L28 22L32 32L22 26L20 38L18 26L8 32L12 22L4 18L14 16L10 8L18 12Z"/></svg>;
const Pulse = ({s=28}) => <div style={{width:s,height:s,borderRadius:s/2,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width={s*.6} height={s*.6} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>;
const ChevL = ({onClick}) => <div onClick={onClick} style={{cursor:"pointer",padding:"4px 8px 4px 0"}}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg></div>;
const Card = ({children,style={}}) => <div style={{background:T.white,borderRadius:12,border:`1px solid ${T.g200}`,padding:16,marginBottom:12,...style}}>{children}</div>;
const SLbl = ({c}) => <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.g400,marginBottom:8}}>{c}</div>;
const BADGE_STYLE = (col) => { const m={blue:{bg:T.blueL,c:T.blue},green:{bg:T.greenL,c:T.green},orange:{bg:T.orangeL,c:T.orange},red:{bg:T.redL,c:T.red}}; return {display:"inline-block",alignSelf:"flex-start",padding:"3px 8px",borderRadius:6,fontSize:10,fontWeight:700,whiteSpace:"nowrap",lineHeight:1.4,background:m[col]?.bg,color:m[col]?.c}; };
const Tag = ({col="blue",children}) => <span style={BADGE_STYLE(col)}>{children}</span>;
const stag = c => ({display:"inline-block",padding:"2px 6px",borderRadius:4,fontSize:9,fontWeight:700,letterSpacing:.3,lineHeight:1.2,whiteSpace:"nowrap",background:c==="g"?"#D1FAE5":c==="o"?"#FEF3C7":c==="r"?T.redL:T.blueL,color:c==="g"?"#065F46":c==="o"?T.orange:c==="r"?T.red:T.blue});
const Pill = ({active,onClick,children}) => <button onClick={onClick} style={{padding:"8px 14px",borderRadius:20,fontSize:13,cursor:"pointer",fontWeight:active?700:400,border:`1.5px solid ${active?T.blue:T.g200}`,background:active?T.blue:T.white,color:active?T.white:T.g500}}>{children}</button>;
const YesNo = ({val,onChange,yes="Ano",no="Ne"}) => <div style={{display:"flex",gap:10}}>{[true,false].map(v=><button key={String(v)} onClick={()=>onChange(v)} style={{flex:1,padding:11,borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:13,border:`1.5px solid ${val===v?T.blue:T.g200}`,background:val===v?T.blue:T.white,color:val===v?T.white:T.g500}}>{v?yes:no}</button>)}</div>;
const FadeIn = ({children}) => { const [op,setOp]=useState(0); useEffect(()=>{const t=setTimeout(()=>setOp(1),20);return()=>clearTimeout(t);},[]);return <div style={{opacity:op,transform:op?"translateY(0)":"translateY(8px)",transition:"opacity .25s,transform .25s"}}>{children}</div>; };
const TypingDots = () => { const [f,setF]=useState(0); useEffect(()=>{const t=setInterval(()=>setF(x=>(x+1)%4),400);return()=>clearInterval(t);},[]);return <div style={{display:"flex",gap:4,padding:"2px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:f>i?T.blue:"#D1D5DB"}}/>)}</div>; };

const ProgBar = ({steps,cur}) => (
  <div style={{background:T.white,padding:"10px 16px 12px",borderBottom:`1px solid ${T.g200}`,flexShrink:0}}>
    <div style={{display:"flex",alignItems:"center"}}>
      {steps.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:"none"}}>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
            <div style={{width:24,height:24,borderRadius:12,fontSize:10,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",background:cur>i?T.green:cur===i?T.blue:T.g200,color:cur>=i?T.white:T.g400}}>
              {cur>i?<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>:i+1}
            </div>
            <div style={{fontSize:8,color:cur===i?T.blue:T.g400,fontWeight:cur===i?700:400,whiteSpace:"nowrap"}}>{s}</div>
          </div>
          {i<steps.length-1&&<div style={{flex:1,height:2,margin:"0 4px",marginBottom:14,background:cur>i?T.green:T.g200}}/>}
        </div>
      ))}
    </div>
  </div>
);

const PBar = ({value,min,max,status}) => {
  const bc=status==="normal"?T.green:status==="high"?T.red:T.orange;
  const span=max*1.4-min*0.8,dot=Math.min(Math.round(((value-min*0.8)/span)*100),95);
  const rs=Math.round(((min-min*0.8)/span)*100),re=Math.round(((max-min*0.8)/span)*100);
  return <div style={{marginTop:6,marginBottom:4}}>
    <div style={{position:"relative",height:6,background:"#E5E7EB",borderRadius:4}}>
      <div style={{position:"absolute",left:`${rs}%`,width:`${re-rs}%`,height:"100%",background:"#D1FAE5",borderRadius:4}}/>
      <div style={{position:"absolute",left:`${dot}%`,top:"50%",transform:"translate(-50%,-50%)",width:13,height:13,borderRadius:7,background:bc,border:"2px solid #fff"}}/>
    </div>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:T.g400,marginTop:3}}><span>Nízká</span><span style={{color:T.green,fontWeight:600}}>Normální</span><span>Vysoká</span></div>
  </div>;
};

// ── Header ────────────────────────────────────────────────────────────────────
const Hdr = ({title,sub,backFn}) => (
  <div style={{background:T.white,padding:"10px 20px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.g200}`,flexShrink:0}}>
    {backFn?<ChevL onClick={backFn}/>:<div style={{width:28}}/>}
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:13,fontWeight:700,color:T.blue,letterSpacing:1,textTransform:"uppercase"}}>{title}</div>
      {sub&&<div style={{fontSize:10,color:T.g400}}>{sub}</div>}
    </div>
    <div style={{width:28}}/>
  </div>
);

// ── Nav buttons (always rendered, never overlapped) ────────────────────────────
const NavRow = ({step,total,onBack,onNext,nextLabel}) => (
  <div style={{display:"flex",gap:10,padding:"12px 16px",background:T.white,borderTop:`1px solid ${T.g200}`,flexShrink:0}}>
    {step>0&&<button onClick={onBack} style={{flex:1,padding:12,borderRadius:10,border:`1.5px solid ${T.g200}`,background:T.white,color:T.g700,fontWeight:700,fontSize:13,cursor:"pointer"}}>← Zpět</button>}
    <button onClick={onNext} style={{flex:2,padding:12,borderRadius:10,border:"none",background:step===total-1?T.green:T.blue,color:T.white,fontWeight:700,fontSize:14,cursor:"pointer"}}>{nextLabel||(step===total-1?"✓ Zpět na přehled":"Pokračovat →")}</button>
  </div>
);

// ── Chat ──────────────────────────────────────────────────────────────────────
const MockChat = ({record}) => {
  const qas = record.type==="lab"?QAS.lab:QAS.record;
  const [msgs,setMsgs] = useState([{role:"ai",text:"Dobrý den! Jak vám mohu pomoci porozumět tomuto výsledku?"}]);
  const [inp,setInp] = useState("");
  const [loading,setLoading] = useState(false);
  const ref = useRef(null);
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs,loading]);
  const send = txt => {
    if(!txt.trim()||loading)return;
    setInp("");
    setMsgs(m=>[...m,{role:"user",text:txt}]);
    setLoading(true);
    const match=qas.find(q=>q.q===txt);
    setTimeout(()=>{setMsgs(m=>[...m,{role:"ai",text:match?match.a:"Doporučuji tuto otázku probrat přímo s MUDr. Vostradovskou."}]);setLoading(false);},1000);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,overflow:"hidden"}}>
      <div style={{background:T.blueL,padding:"8px 16px",borderBottom:`1px solid ${T.g200}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
        <Pulse s={22}/><div style={{fontSize:12,fontWeight:700,color:T.blue}}>CM Asistent <span style={{fontSize:10,fontWeight:400,color:T.g400}}>· mock Q&A</span></div>
      </div>
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"10px 14px",display:"flex",flexDirection:"column",gap:8}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:6,alignItems:"flex-end"}}>
            {m.role==="ai"?<Pulse s={22}/>:<div style={{width:22,height:22,borderRadius:11,background:T.g200,flexShrink:0}}/>}
            <div style={{maxWidth:"80%",padding:"8px 12px",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.role==="user"?T.blue:T.white,border:m.role==="ai"?`1px solid ${T.g200}`:"none",color:m.role==="user"?T.white:T.g700,fontSize:12.5,lineHeight:1.55}}>
              {m.text.split(/\*\*(.*?)\*\*/).map((p,pi)=>pi%2===1?<strong key={pi}>{p}</strong>:<span key={pi}>{p}</span>)}
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:6,alignItems:"flex-end"}}><Pulse s={22}/><div style={{background:T.white,border:`1px solid ${T.g200}`,borderRadius:"12px 12px 12px 3px",padding:"8px 12px"}}><TypingDots/></div></div>}
      </div>
      <div style={{padding:"5px 14px 4px",display:"flex",gap:5,overflowX:"auto",borderTop:`1px solid ${T.g200}`,flexShrink:0}}>
        {qas.map(qa=><button key={qa.q} onClick={()=>send(qa.q)} style={{padding:"5px 11px",borderRadius:20,border:`1px solid ${T.g200}`,background:T.white,fontSize:10,color:T.blue,cursor:"pointer",whiteSpace:"nowrap",fontWeight:600,flexShrink:0}}>{qa.q}</button>)}
      </div>
      <div style={{padding:"5px 14px 8px",background:T.white,borderTop:`1px solid ${T.g200}`,display:"flex",gap:8,flexShrink:0}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(inp)} placeholder="Zeptejte se…" style={{flex:1,padding:"8px 12px",borderRadius:20,border:`1px solid ${T.g200}`,fontSize:12,outline:"none",background:T.bg}}/>
        <button onClick={()=>send(inp)} style={{width:36,height:36,borderRadius:18,background:inp.trim()?T.blue:T.g200,border:"none",color:T.white,fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>
      </div>
    </div>
  );
};

// ── Critical alert ────────────────────────────────────────────────────────────
const CritAlert = ({values,onDismiss}) => (
  <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.5)",zIndex:99,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
    <div style={{background:T.white,borderRadius:14,padding:20,border:`2px solid ${T.red}`,width:"100%"}}>
      <div style={{fontSize:14,fontWeight:700,color:T.red,marginBottom:8}}>⚠️ Kritické hodnoty</div>
      {values.map((v,i)=><div key={i} style={{background:T.redL,borderRadius:8,padding:"8px 12px",marginBottom:8,fontSize:12,color:T.red,fontWeight:600}}>{v.name}: {v.value} {v.unit}</div>)}
      <div style={{fontSize:12,color:T.orange,marginBottom:12,fontWeight:600}}>📞 MUDr. Vostradovská byla informována.</div>
      <button onClick={onDismiss} style={{width:"100%",padding:11,borderRadius:10,border:`1px solid ${T.g200}`,background:T.white,color:T.g500,fontWeight:700,fontSize:13,cursor:"pointer"}}>Rozumím, pokračovat</button>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE A
// ═══════════════════════════════════════════════════════════════════════════════
function FeatureA({onBack}) {
  const [view,setView] = useState("list");
  const [rec,setRec] = useState(null);
  const [step,setStep] = useState(0);
  const [critDone,setCritDone] = useState(false);

  const open = r => { setRec(r); setStep(0); setCritDone(false); setView(r.type); };
  const reset = () => { setView("list"); setRec(null); };
  const goStep = n => setStep(n);

  // ── LIST ──
  if(view==="list") return (
    <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
      <Hdr title="Medical Records" sub="Klinické záznamy" backFn={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:16}}>
        <div style={{background:T.blueL,border:`1px solid #BFDBFE`,borderRadius:12,padding:14,marginBottom:16}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}><Pulse s={34}/><div><div style={{fontSize:14,fontWeight:700,color:T.blue}}>Zdravotní záznamy</div><div style={{fontSize:12,color:T.g500,marginTop:2}}>Vyberte záznam pro AI interpretaci</div></div></div>
          <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}><Tag col="blue">Pacient: {PATIENT.name}</Tag><Tag col="orange">Věk: {PATIENT.age} let</Tag></div>
        </div>
        {[...RECORDS].sort((a,b)=>{
          const p=d=>{ const[day,mon,yr]=d.split(". "); return new Date(`${yr}-${mon.padStart(2,"0")}-${day.padStart(2,"0")}`); };
          return p(b.date)-p(a.date);
        }).map(r=>(
          <div key={r.id} onClick={()=>open(r)} style={{background:T.white,borderRadius:12,border:`1.5px solid ${r.statusC==="r"?"#FECACA":T.g200}`,padding:16,marginBottom:10,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                  <span style={{fontSize:10,fontWeight:700,letterSpacing:.5,textTransform:"uppercase",color:r.type==="lab"?T.blue:T.orange}}>{r.type==="lab"?"🧪 Lab":"📄 Zpráva"}</span>
                </div>
                <div style={{fontSize:14,fontWeight:700,color:T.g900}}>{r.title}</div>
                <div style={{fontSize:12,color:T.g400,marginTop:2}}>{r.date} · {r.doctor}</div>
              </div>
              <span style={BADGE_STYLE(r.statusC==="g"?"green":r.statusC==="r"?"red":r.statusC==="o"?"orange":"blue")}>{r.statusL}</span>
            </div>
            <div style={{fontSize:12,color:T.g500,marginBottom:10}}>{r.summary}</div>
            <div style={{paddingTop:10,borderTop:`1px solid ${T.g100}`,display:"flex",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:6}}>
                {r.type==="lab"?<><Tag col="blue">Lab + vizualizace</Tag><Tag col="blue">AI chat</Tag></>:<><Tag col="blue">AI interpretace</Tag><Tag col="green">Care Journey</Tag></>}
              </div>
              <span style={{fontSize:12,fontWeight:700,color:T.blue}}>Otevřít →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── LAB (steps 0-3) ──
  if(view==="lab") {
    const STEPS=["Kontext","Interpretace","Chat","Lifestyle"];
    const crits=rec.results.filter(r=>r.status!=="normal");
    return (
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <ProgBar steps={STEPS} cur={step}/>
        <Hdr title={rec.title} sub={rec.date} backFn={step===0?reset:()=>goStep(step-1)}/>
        {/* scrollable body */}
        {step===0&&<div style={{flex:1,overflowY:"auto",padding:16}}>
          <FadeIn>
            <Card style={{background:T.blueL,border:`1px solid #BFDBFE`}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}><Pulse s={30}/><div><div style={{fontSize:13,fontWeight:700,color:T.blue}}>Kontext pacienta</div><div style={{fontSize:11,color:T.g500}}>Výsledky interpretovány s ohledem na Váš profil</div></div></div>
              {[["Pacient",PATIENT.name],["Věk",`${PATIENT.age} let`],["Diagnózy",PATIENT.conditions.join(", ")],["Alergie",PATIENT.allergies.join(", ")],["Medikace",PATIENT.meds.map(m=>m.name).join(", ")]].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid #BFDBFE`}}><span style={{fontSize:12,color:T.blue,fontWeight:600,minWidth:80}}>{k}</span><span style={{fontSize:12,color:T.g700}}>{v}</span></div>
              ))}
            </Card>
            <Card><SLbl c="Přehled hodnot"/>
              {rec.results.map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.g100}`}}>
                  <div><div style={{fontSize:13,fontWeight:600,color:T.g900}}>{r.name}</div><div style={{fontSize:11,color:T.g400}}>{r.code}</div></div>
                  <div><span style={{fontSize:15,fontWeight:700,color:r.status==="high"?T.red:T.g900}}>{r.value}</span><span style={{fontSize:11,color:T.g400,marginLeft:4}}>{r.unit}</span></div>
                </div>
              ))}
            </Card>
          </FadeIn>
        </div>}
        {step===1&&<div style={{flex:1,overflowY:"auto",padding:16,position:"relative"}}>
          {crits.length>0&&!critDone&&<CritAlert values={crits} onDismiss={()=>setCritDone(true)}/>}
          <FadeIn>
            <Card style={{background:T.blueL,border:`1px solid #BFDBFE`}}>
              <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}><Pulse s={24}/><div><div style={{fontSize:13,fontWeight:700,color:T.blue}}>AI Shrnutí</div><div style={{fontSize:11,color:T.g500}}>Interpretace s kontextem pacienta</div></div></div>
              <p style={{fontSize:13,color:T.g700,lineHeight:1.6,margin:0}}>{rec.aiInterpretation}</p>
            </Card>
            <SLbl c="Vizualizace biomarkerů"/>
            {rec.results.map((r,i)=>(
              <div key={i} style={{background:T.white,borderRadius:10,border:`1px solid ${r.status!=="normal"?"#FECACA":T.g200}`,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <div><div style={{fontSize:13,fontWeight:700,color:T.g900}}>{r.name}</div><div style={{fontSize:11,color:T.g400}}>ref: {r.min}–{r.max} {r.unit}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:17,fontWeight:700,color:r.status==="high"?T.red:T.g900}}>{r.value}</div><div style={{fontSize:11,color:T.g400}}>{r.unit}</div></div>
                </div>
                <PBar value={r.value} min={r.min} max={r.max} status={r.status}/>
                <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>                    <span style={BADGE_STYLE(r.status==="normal"?"green":"red")}>{r.status==="normal"?"✓ Normální":"↑ Nad rozsahem"}</span><span style={{fontSize:11,color:T.g500}}>{r.note}</span></div>
              </div>
            ))}
          </FadeIn>
        </div>}
        {step===2&&<MockChat record={rec}/>}
        {step===3&&<div style={{flex:1,overflowY:"auto",padding:16}}>
          <FadeIn>
            <Card style={{background:T.greenL,border:`1px solid #6EE7B7`}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                <div><div style={{fontSize:13,fontWeight:700,color:T.green}}>Personalizovaná doporučení</div><div style={{fontSize:11,color:T.g500}}>Na základě výsledků a Vašeho profilu</div></div>
              </div>
            </Card>
            {rec.lifestyle.length===0&&<Card><div style={{fontSize:13,color:T.g500,textAlign:"center"}}>Pro tento výsledek nejsou specifická doporučení.</div></Card>}
            {rec.lifestyle.map((l,i)=><Card key={i}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:26,flexShrink:0}}>{l.icon}</span><div><div style={{fontSize:14,fontWeight:700,color:T.g900,marginBottom:4}}>{l.title}</div><div style={{fontSize:13,color:T.g700,lineHeight:1.6}}>{l.text}</div></div></div></Card>)}
          </FadeIn>
        </div>}
        {/* nav always last, never overlapped */}
        <NavRow step={step} total={STEPS.length} onBack={()=>goStep(step-1)} onNext={step===STEPS.length-1?reset:()=>goStep(step+1)}/>
      </div>
    );
  }

  // ── RECORD (steps 0-3) ──
  if(view==="record") {
    const STEPS=["Kontext","Interpretace","Chat","Care Journey"];
    return (
      <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
        <ProgBar steps={STEPS} cur={step}/>
        <Hdr title={rec.title} sub={rec.date} backFn={step===0?reset:()=>goStep(step-1)}/>
        {step===0&&<div style={{flex:1,overflowY:"auto",padding:16}}>
          <FadeIn>
            <Card style={{background:T.blueL,border:`1px solid #BFDBFE`}}>
              <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}><Pulse s={30}/><div><div style={{fontSize:13,fontWeight:700,color:T.blue}}>Kontext pacienta</div><div style={{fontSize:12,color:T.g500}}>Propojení zprávy s Vaším profilem</div></div></div>
              {[["Pacient",PATIENT.name],["Ošetřující",PATIENT.doctor],["Odesílající",rec.doctor],["Diagnózy",PATIENT.conditions.join(", ")],["Medikace",PATIENT.meds.map(m=>m.name).join(", ")]].map(([k,v])=>(
                <div key={k} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid #BFDBFE`}}><span style={{fontSize:12,color:T.blue,fontWeight:600,minWidth:90}}>{k}</span><span style={{fontSize:12,color:T.g700}}>{v}</span></div>
              ))}
            </Card>
            <Card><SLbl c="Text zprávy"/><p style={{fontSize:13,color:T.g700,lineHeight:1.7,margin:0}}>{rec.fullText}</p></Card>
          </FadeIn>
        </div>}
        {step===1&&<div style={{flex:1,overflowY:"auto",padding:16}}>
          <FadeIn>
            <Card style={{background:T.blueL,border:`1px solid #BFDBFE`}}>
              <div style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:8}}><Pulse s={24}/><div><div style={{fontSize:13,fontWeight:700,color:T.blue}}>AI Shrnutí zprávy</div><div style={{fontSize:11,color:T.g500}}>Laicky srozumitelná interpretace</div></div></div>
              <p style={{fontSize:13,color:T.g700,lineHeight:1.6,margin:0}}>{rec.aiInterpretation}</p>
            </Card>
            <Card><SLbl c="Klíčové body"/>
              {rec.fullText.split(". ").filter(s=>s.length>20).slice(0,4).map((s,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"7px 0",borderBottom:`1px solid ${T.g100}`}}>
                  <div style={{width:6,height:6,borderRadius:3,background:T.blue,flexShrink:0,marginTop:6}}/>
                  <span style={{fontSize:13,color:T.g700,lineHeight:1.5}}>{s.trim()}.</span>
                </div>
              ))}
            </Card>
          </FadeIn>
        </div>}
        {step===2&&<MockChat record={rec}/>}
        {step===3&&<div style={{flex:1,overflowY:"auto",padding:16}}>
          <FadeIn>
            <Card style={{background:T.greenL,border:`1px solid #6EE7B7`}}>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                <div><div style={{fontSize:13,fontWeight:700,color:T.green}}>Váš Care Journey</div><div style={{fontSize:11,color:T.g500}}>Plán péče vygenerovaný ze zprávy</div></div>
              </div>
            </Card>
            {rec.careJourney.map((c,i)=><Card key={i}><div style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{fontSize:26,flexShrink:0}}>{c.icon}</span><div><div style={{fontSize:14,fontWeight:700,color:T.g900,marginBottom:4}}>{c.title}</div><div style={{fontSize:13,color:T.g700,lineHeight:1.6}}>{c.text}</div></div></div></Card>)}
            <Card style={{background:T.blueL,border:`1px solid #BFDBFE`}}><div style={{fontSize:12,color:T.blue,lineHeight:1.5}}>💡 Tento Care Journey je také dostupný v sekci <strong>Plán péče</strong>.</div></Card>
          </FadeIn>
        </div>}
        <NavRow step={step} total={STEPS.length} onBack={()=>goStep(step-1)} onNext={step===STEPS.length-1?reset:()=>goStep(step+1)}/>
      </div>
    );
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE B — DIGITAL NURSE
// ═══════════════════════════════════════════════════════════════════════════════
const VISIT_TYPES=[{key:"pain",label:"Bolest / akutní potíž",icon:"🔴",desc:"Nový nebo zhoršující se příznak"},{key:"routine",label:"Preventivní prohlídka",icon:"📋",desc:"Pravidelná kontrola"},{key:"vaccination",label:"Očkování",icon:"💉",desc:"Aplikace vakcíny"},{key:"presurgery",label:"Předoperační vyšetření",icon:"🔬",desc:"Příprava před operací"},{key:"surgery",label:"Nástup k operaci",icon:"🏥",desc:"Surgery check-in"}];
const EMERG_KW=["bolest na hrudi","dušnost","infarkt","mrtvice","mdloba","bezvědomí","krvácení","ochrnutí","nemohu dýchat"];
const BODY_LOCS=["Hlava / obličej","Krk","Hrudník","Břicho","Záda – horní","Záda – dolní","Rameno","Paže / loket","Ruka / zápěstí","Kyčel / tříslo","Koleno","Bérec / kotník","Chodidlo","Celé tělo"];
const CHARS=[{v:"sharp",l:"Ostrá"},{v:"dull",l:"Tupá"},{v:"throb",l:"Tepající"},{v:"burn",l:"Pálení"},{v:"numb",l:"Brnění"},{v:"press",l:"Tlak"},{v:"cramp",l:"Křeče"}];
const DUR=[{v:0,l:"< 24 h"},{v:1,l:"2–7 dní"},{v:2,l:"1–4 týdny"},{v:3,l:"1–3 měs."},{v:4,l:"Chronické"}];

const EmAlert=({onDismiss})=>(
  <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.55)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{background:T.white,borderRadius:14,padding:24,border:`2px solid ${T.red}`,width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}><div style={{width:40,height:40,borderRadius:20,background:T.redL,display:"flex",alignItems:"center",justifyContent:"center"}}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div><div><div style={{fontSize:14,fontWeight:700,color:T.red}}>Možná závažná situace</div><div style={{fontSize:12,color:T.g500}}>Detekován kritický příznak</div></div></div>
      <p style={{fontSize:13,color:T.g700,lineHeight:1.6,margin:"0 0 14px"}}>Váš příznak může vyžadovat <strong>okamžitou pomoc</strong>.</p>
      <div style={{background:T.redL,borderRadius:10,padding:12,marginBottom:14,textAlign:"center"}}><div style={{fontSize:12,fontWeight:600,color:"#991B1B"}}>Tísňová linka</div><div style={{fontSize:22,fontWeight:700,color:T.red}}>Volejte 155 nebo 112</div></div>
      <button onClick={onDismiss} style={{width:"100%",padding:12,borderRadius:10,border:`1.5px solid ${T.g200}`,background:T.white,color:T.g500,fontWeight:700,fontSize:13,cursor:"pointer"}}>Příznaky nejsou naléhavé — pokračovat</button>
    </div>
  </div>
);

const OldCarts=({data,onChange,setAlert})=>{
  const tog=(f,v)=>onChange({...data,[f]:(data[f]||[]).includes(v)?(data[f]||[]).filter(x=>x!==v):[...(data[f]||[]),v]});
  return(
    <div>
      <div style={{background:T.blueL,border:`1px solid #BFDBFE`,borderRadius:12,padding:14,marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}><div style={{width:4,height:22,borderRadius:2,background:T.blue}}/><div style={{fontSize:13,fontWeight:700,color:T.blue}}>OLD CARTS – klinický dotazník</div></div>
        {[{lbl:"Hlavní příznak",ph:"Co vás trápí?",key:"onset",chk:true},{lbl:"Kdy začalo?",ph:"např. dnes ráno, před 3 dny",key:"onsetTime"}].map(f=>(
          <div key={f.key} style={{marginBottom:10}}><div style={{fontSize:12,fontWeight:600,color:T.g700,marginBottom:4}}>{f.lbl}</div><input value={data[f.key]||""} onChange={e=>{onChange({...data,[f.key]:e.target.value});if(f.chk&&EMERG_KW.some(k=>e.target.value.toLowerCase().includes(k)))setAlert(true);}} placeholder={f.ph} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1.5px solid ${T.g200}`,fontSize:13,outline:"none",background:T.white,boxSizing:"border-box"}}/></div>
        ))}
      </div>
      <Card><SLbl c="Délka trvání"/>
        <input type="range" min={0} max={4} step={1} value={data.duration??0} onChange={e=>onChange({...data,duration:Number(e.target.value)})} style={{width:"100%",accentColor:T.blue,cursor:"pointer"}}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>{DUR.map((d,i)=><span key={i} style={{fontSize:9,color:data.duration===i?T.blue:T.g400,fontWeight:data.duration===i?700:400,textAlign:"center",flex:1}}>{d.l}</span>)}</div>
        <div style={{textAlign:"center",marginTop:4,fontSize:13,fontWeight:700,color:T.blue}}>{DUR[data.duration??0]?.l}</div>
      </Card>
      <Card><SLbl c="Lokalizace"/>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>{BODY_LOCS.map(loc=>(
          <label key={loc} style={{display:"flex",alignItems:"center",gap:10,padding:"5px 8px",borderRadius:8,cursor:"pointer",background:(data.locations||[]).includes(loc)?T.blueL:"transparent"}}>
            <div onClick={()=>tog("locations",loc)} style={{width:18,height:18,borderRadius:4,flexShrink:0,border:`1.5px solid ${(data.locations||[]).includes(loc)?T.blue:T.g300}`,background:(data.locations||[]).includes(loc)?T.blue:T.white,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
              {(data.locations||[]).includes(loc)&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
            </div>
            <span style={{fontSize:13,color:T.g700}}>{loc}</span>
          </label>
        ))}</div>
      </Card>
      <Card><SLbl c="Intenzita (1–10)"/>
        <div style={{display:"flex",gap:4,justifyContent:"space-between",marginBottom:8}}>{[1,2,3,4,5,6,7,8,9,10].map(n=>{const cs=["#22A06B","#22A06B","#22A06B","#84CC16","#F59E0B","#F97316","#F97316","#EF4444","#DC2626","#B91C1C"];const a=data.severity===n;return<div key={n} onClick={()=>onChange({...data,severity:n})} style={{flex:1,aspectRatio:"1",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,cursor:"pointer",background:a?cs[n-1]:T.g100,color:a?"#fff":T.g400,border:a?`2px solid ${cs[n-1]}`:`1px solid ${T.g200}`}}>{n}</div>;})}
        </div>
        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:T.green,fontWeight:600}}>Bez bolesti</span><span style={{fontSize:10,color:T.red,fontWeight:600}}>Nejhorší</span></div>
      </Card>
      <Card><SLbl c="Charakter"/><div style={{display:"flex",flexWrap:"wrap",gap:8}}>{CHARS.map(o=><Pill key={o.v} active={(data.character||[]).includes(o.v)} onClick={()=>tog("character",o.v)}>{o.l}</Pill>)}</div></Card>
      <Card><SLbl c="Faktory"/>
        <div style={{fontSize:12,fontWeight:600,color:T.g700,marginBottom:6}}>Zhoršující</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>{["Pohyb","Sezení","Stání","Jídlo","Stres","Chlad","Teplo"].map(c=><Pill key={c} active={(data.aggravating||[]).includes(c)} onClick={()=>tog("aggravating",c)}>{c}</Pill>)}</div>
        <div style={{fontSize:12,fontWeight:600,color:T.g700,marginBottom:6}}>Úlevné</div>
        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Klid","Led","Teplo","Léky","Elevace","Masáž"].map(c=><Pill key={c} active={(data.relieving||[]).includes(c)} onClick={()=>tog("relieving",c)}>{c}</Pill>)}</div>
      </Card>
    </div>
  );
};

const MedHistory=({data,onChange})=>{
  const [nc,setNc]=useState("");const [na,setNa]=useState("");
  const conds=data.conditions||PATIENT.conditions;const allgs=data.allergies||PATIENT.allergies;
  return(<div>
    <Card><SLbl c="Chronická onemocnění"/>
      {conds.map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.g100}`}}><span style={{fontSize:13,color:T.g700}}>{c}</span><Tag col="blue">ze záznamu</Tag></div>)}
      <div style={{display:"flex",gap:8,marginTop:10}}><input value={nc} onChange={e=>setNc(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&nc.trim()){onChange({...data,conditions:[...conds,nc.trim()]});setNc("");}}} placeholder="Přidat…" style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1.5px solid ${T.g200}`,fontSize:13,outline:"none",background:T.bg}}/><button onClick={()=>{if(nc.trim()){onChange({...data,conditions:[...conds,nc.trim()]});setNc("");}}} style={{padding:"8px 14px",borderRadius:8,background:T.blue,border:"none",color:T.white,fontWeight:700,cursor:"pointer"}}>+</button></div>
    </Card>
    <Card><SLbl c="Alergie"/>
      {allgs.map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.g100}`}}><span style={{fontSize:13,fontWeight:600,color:T.g700}}>{a}</span><Tag col="orange">⚠ alergie</Tag></div>)}
      <div style={{display:"flex",gap:8,marginTop:10}}><input value={na} onChange={e=>setNa(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&na.trim()){onChange({...data,allergies:[...allgs,na.trim()]});setNa("");}}} placeholder="Přidat alergii…" style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1.5px solid ${T.g200}`,fontSize:13,outline:"none",background:T.bg}}/><button onClick={()=>{if(na.trim()){onChange({...data,allergies:[...allgs,na.trim()]});setNa("");}}} style={{padding:"8px 14px",borderRadius:8,background:T.red,border:"none",color:T.white,fontWeight:700,cursor:"pointer"}}>+</button></div>
    </Card>
    <Card><SLbl c="Medikace"/>{PATIENT.meds.map((m,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.g100}`}}><div><div style={{fontSize:13,fontWeight:600,color:T.g700}}>{m.name}</div><div style={{fontSize:11,color:T.g400}}>{m.freq}</div></div><Tag col="green">✓</Tag></div>)}</Card>
  </div>);
};

const ChkItem=({done,onToggle,label,tip,col=T.blue})=>(
  <div style={{borderBottom:`1px solid ${T.g100}`,paddingBottom:10,marginBottom:10}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
      <div onClick={onToggle} style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${done?col:T.g300}`,background:done?col:T.white,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:"pointer"}}>
        {done&&<svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
      </div>
      <div><div style={{fontSize:13,color:done?T.g400:T.g700,textDecoration:done?"line-through":"none"}}>{label}</div>{tip&&<div style={{fontSize:11,color:T.orange,marginTop:3}}>💡 {tip}</div>}</div>
    </div>
  </div>
);

const ChecklistPanel=({visitType,checklist,setChecklist})=>{
  const tog=k=>setChecklist(c=>({...c,[k]:!c[k]}));
  return(<div>
    {visitType!=="surgery"&&<Card><SLbl c="Vzorky"/><ChkItem done={!!checklist.urine} onToggle={()=>tog("urine")} label="🧪 Ranní moč" tip="Sterilní nádoba z lékárny, středový proud."/>{PATIENT.age>50&&<ChkItem done={!!checklist.stool} onToggle={()=>tog("stool")} label="🟤 Vzorek stolice" tip="Screening kolorektálního karcinomu (věk > 50)." col={T.orange}/>}</Card>}
    {visitType!=="surgery"&&<Card><SLbl c="Nalačno"/><ChkItem done={!!checklist.fasting} onToggle={()=>tog("fasting")} label="⏰ Nejíst min. 8 hodin před odběrem"/><ChkItem done={!!checklist.water} onToggle={()=>tog("water")} label="💧 Jen čistá voda (bez čaje, kávy)"/></Card>}
    {visitType==="surgery"&&<Card><SLbl c="Příprava před operací"/>{[{k:"shower",l:"🚿 Sprcha večer před operací"},{k:"nails",l:"💅 Odstranit lak na nehtech"},{k:"jewelry",l:"💍 Sundat šperky"},{k:"fasting",l:"🍽️ Nalačno od půlnoci"}].map(it=><ChkItem key={it.k} done={!!checklist[it.k]} onToggle={()=>tog(it.k)} label={it.l}/>)}</Card>}
    <Card><SLbl c="Dokumenty"/>{[{k:"insurance",l:"🪪 Průkaz pojištěnce"},{k:"reports",l:"📄 Zprávy od specialistů"},{k:"vaccCard",l:"💉 Očkovací průkaz"}].map(it=><ChkItem key={it.k} done={!!checklist[it.k]} onToggle={()=>tog(it.k)} label={it.l}/>)}</Card>
  </div>);
};

const HealthCheck=({data,onChange})=>(
  <div>
    <Card><SLbl c="Jak se dnes cítíte?"/><div style={{display:"flex",gap:8}}>{["Dobře","Normálně","Špatně"].map(s=><button key={s} onClick={()=>onChange({...data,feeling:s})} style={{flex:1,padding:10,borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",border:`1.5px solid ${data.feeling===s?T.blue:T.g200}`,background:data.feeling===s?T.blue:T.white,color:data.feeling===s?T.white:T.g500}}>{s}</button>)}</div></Card>
    <Card><SLbl c="Akutní onemocnění (horečka, infekce)?"/><YesNo val={data.acute} onChange={v=>onChange({...data,acute:v})}/>{data.acute&&<div style={{marginTop:10,background:T.orangeL,borderRadius:8,padding:10}}><div style={{fontSize:12,color:T.orange,fontWeight:600}}>⚠️ Informujte sestru před aplikací vakcíny.</div></div>}</Card>
  </div>
);

const Handover=({payload,onDone})=>(
  <div>
    <div style={{background:T.greenL,border:`1px solid #6EE7B7`,borderRadius:12,padding:16,marginBottom:12}}>
      <div style={{display:"flex",gap:10,alignItems:"center"}}>
        <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        <div><div style={{fontSize:14,fontWeight:700,color:T.green}}>Předávací zpráva odeslána</div><div style={{fontSize:12,color:T.g500}}>{PATIENT.doctor} · dnes</div></div>
        <div style={{marginLeft:"auto"}}><Tag col="green">✓ Odesláno</Tag></div>
      </div>
    </div>
    <Card><SLbl c="Typ návštěvy"/><div style={{fontSize:14,fontWeight:700,color:T.g900}}>{VISIT_TYPES.find(v=>v.key===payload.visitType)?.label}</div></Card>
    {payload.symptom?.onset&&<Card><SLbl c="Příznaky – OLD CARTS"/>
      {[["Příznak",payload.symptom.onset],["Vznik",payload.symptom.onsetTime],["Trvání",DUR[payload.symptom.duration??0]?.l],["Lokalizace",(payload.symptom.locations||[]).join(", ")],["Intenzita",payload.symptom.severity?`${payload.symptom.severity}/10`:null]].filter(([,v])=>v).map(([k,v])=>(
        <div key={k} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.g100}`}}><span style={{fontSize:12,color:T.g400,fontWeight:600,minWidth:80}}>{k}</span><span style={{fontSize:13,color:T.g700}}>{v}</span></div>
      ))}
    </Card>}
    {payload.history&&<Card><SLbl c="Anamnéza"/>
      <div style={{padding:"5px 0",borderBottom:`1px solid ${T.g100}`}}><span style={{fontSize:12,color:T.g400,fontWeight:600}}>Diagnózy: </span><span style={{fontSize:13,color:T.g700}}>{(payload.history.conditions||PATIENT.conditions).join(", ")}</span></div>
      <div style={{padding:"5px 0"}}><span style={{fontSize:12,color:T.g400,fontWeight:600}}>Alergie: </span><span style={{fontSize:13,color:T.orange,fontWeight:600}}>{(payload.history.allergies||PATIENT.allergies).join(", ")}</span></div>
    </Card>}
    <button onClick={onDone} style={{width:"100%",padding:13,borderRadius:10,border:"none",background:T.green,color:T.white,fontWeight:700,fontSize:14,cursor:"pointer",marginTop:4}}>✓ Potvrdit příchod</button>
  </div>
);

const FlowWrap=({steps,children,step,setStep,onDone,disableNext=false})=>(
  <div style={{display:"flex",flexDirection:"column",height:"100%"}}>
    <ProgBar steps={steps} cur={step}/>
    <div style={{flex:1,overflowY:"auto",padding:16}}><FadeIn key={step}>{children}</FadeIn></div>
    <div style={{display:"flex",gap:10,padding:"12px 16px",background:T.white,borderTop:`1px solid ${T.g200}`,flexShrink:0}}>
      {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{flex:1,padding:12,borderRadius:10,border:`1.5px solid ${T.g200}`,background:T.white,color:T.g700,fontWeight:700,fontSize:13,cursor:"pointer"}}>← Zpět</button>}
      <button onClick={step===steps.length-1?onDone:()=>setStep(s=>s+1)} disabled={disableNext} style={{flex:2,padding:12,borderRadius:10,border:"none",background:disableNext?T.g200:step===steps.length-1?T.green:T.blue,color:disableNext?T.g400:T.white,fontWeight:700,fontSize:14,cursor:disableNext?"default":"pointer"}}>
        {step===steps.length-1?"Vygenerovat souhrn →":"Pokračovat →"}
      </button>
    </div>
  </div>
);

const FlowPain=({onDone})=>{const[step,setStep]=useState(0);const[sym,setSym]=useState({duration:0});const[hist,setHist]=useState({});const[alert,setAlert]=useState(false);const STEPS=["Příznaky","Anamnéza","Souhrn"];return(<div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative"}}>{alert&&<EmAlert onDismiss={()=>setAlert(false)}/>}<FlowWrap steps={STEPS} step={step} setStep={setStep} onDone={()=>setStep(2)}>{step===0&&<OldCarts data={sym} onChange={setSym} setAlert={setAlert}/>}{step===1&&<MedHistory data={hist} onChange={setHist}/>}{step===2&&<Handover payload={{visitType:"pain",symptom:sym,history:hist}} onDone={onDone}/>}</FlowWrap></div>);};
const FlowRoutine=({onDone})=>{const[step,setStep]=useState(0);const[hist,setHist]=useState({});const[hasNew,setHasNew]=useState(null);const[sym,setSym]=useState({duration:0});const[chk,setChk]=useState({});const[alert,setAlert]=useState(false);const STEPS=["Přivítání","Anamnéza","Nový příznak?","Checklist","Souhrn"];return(<div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative"}}>{alert&&<EmAlert onDismiss={()=>setAlert(false)}/>}<FlowWrap steps={STEPS} step={step} setStep={setStep} onDone={()=>setStep(4)} disableNext={step===2&&hasNew===null}>{step===0&&<div><div style={{background:T.blueL,border:`1px solid #BFDBFE`,borderRadius:12,padding:16,marginBottom:14}}><div style={{fontSize:17,fontWeight:700,color:T.g900,marginBottom:4}}>Vítejte zpět, {PATIENT.name}! 👋</div><div style={{fontSize:13,color:T.g500,lineHeight:1.6}}>Připravujeme se na prohlídku u <strong>{PATIENT.doctor}</strong>.</div><div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}><Tag col="blue">Poslední návštěva: {PATIENT.lastVisit}</Tag><Tag col="orange">Věk: {PATIENT.age} let</Tag></div></div><div style={{fontSize:13,color:T.g700,lineHeight:1.6}}>Průvodce připraví podklady pro lékaře. Vyplnění trvá přibližně <strong>3–5 minut</strong>.</div></div>}{step===1&&<MedHistory data={hist} onChange={setHist}/>}{step===2&&<div><Card><YesNo val={hasNew} onChange={setHasNew} yes="Ano, mám nový příznak" no="Ne, cítím se stabilně"/></Card>{hasNew===true&&<OldCarts data={sym} onChange={setSym} setAlert={setAlert}/>}{hasNew===false&&<div style={{background:T.greenL,border:`1px solid #6EE7B7`,borderRadius:12,padding:14}}><div style={{fontSize:13,fontWeight:600,color:T.green}}>✓ Žádné nové příznaky.</div></div>}</div>}{step===3&&<ChecklistPanel visitType="routine" checklist={chk} setChecklist={setChk}/>}{step===4&&<Handover payload={{visitType:"routine",symptom:hasNew?sym:null,history:hist}} onDone={onDone}/>}</FlowWrap></div>);};
const FlowVaccination=({onDone})=>{const[step,setStep]=useState(0);const[health,setHealth]=useState({});const[chk,setChk]=useState({});const STEPS=["Checklist","Zdravotní stav","Souhrn"];return(<FlowWrap steps={STEPS} step={step} setStep={setStep} onDone={()=>setStep(2)}>{step===0&&<ChecklistPanel visitType="vaccination" checklist={chk} setChecklist={setChk}/>}{step===1&&<HealthCheck data={health} onChange={setHealth}/>}{step===2&&<Handover payload={{visitType:"vaccination"}} onDone={onDone}/>}</FlowWrap>);};
const FlowPresurgery=({onDone})=>{const[step,setStep]=useState(0);const[health,setHealth]=useState({});const[hist,setHist]=useState({});const[chk,setChk]=useState({});const STEPS=["Checklist","Zdravotní stav","Anamnéza","Souhrn"];return(<FlowWrap steps={STEPS} step={step} setStep={setStep} onDone={()=>setStep(3)}>{step===0&&<ChecklistPanel visitType="presurgery" checklist={chk} setChecklist={setChk}/>}{step===1&&<HealthCheck data={health} onChange={setHealth}/>}{step===2&&<MedHistory data={hist} onChange={setHist}/>}{step===3&&<Handover payload={{visitType:"presurgery",history:hist}} onDone={onDone}/>}</FlowWrap>);};
const FlowSurgery=({onDone})=>{const[step,setStep]=useState(0);const[health,setHealth]=useState({});const[chk,setChk]=useState({});const STEPS=["Must-do list","Zdravotní stav","Souhlasy","Souhrn"];return(<FlowWrap steps={STEPS} step={step} setStep={setStep} onDone={()=>setStep(3)}>{step===0&&<div><div style={{background:T.orangeL,border:`1px solid #FDE68A`,borderRadius:12,padding:14,marginBottom:14}}><div style={{fontSize:14,fontWeight:700,color:T.orange,marginBottom:4}}>🏥 Den operace</div><div style={{fontSize:13,color:T.g700}}>Zkontrolujte všechny body před vstupem na sál.</div></div><ChecklistPanel visitType="surgery" checklist={chk} setChecklist={setChk}/></div>}{step===1&&<HealthCheck data={health} onChange={setHealth}/>}{step===2&&<Card><SLbl c="Informované souhlasy"/>{[{k:"opConsent",l:"✍️ Souhlas s operačním výkonem"},{k:"anConsent",l:"✍️ Souhlas s anestezií"}].map(it=><div key={it.k} onClick={()=>setChk(c=>({...c,[it.k]:!c[it.k]}))} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:`1px solid ${T.g100}`,cursor:"pointer"}}><span style={{fontSize:13,color:T.g700}}>{it.l}</span><div style={{width:22,height:22,borderRadius:11,background:chk[it.k]?T.green:T.g200,display:"flex",alignItems:"center",justifyContent:"center"}}>{chk[it.k]&&<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}</div></div>)}<div style={{background:T.orangeL,borderRadius:8,padding:10,marginTop:10}}><div style={{fontSize:12,color:T.orange,fontWeight:600}}>⚠️ Podpis probíhá na recepci se sestrou.</div></div></Card>}{step===3&&<Handover payload={{visitType:"surgery"}} onDone={onDone}/>}</FlowWrap>);};

function FeatureB({onBack}){
  const[vt,setVt]=useState(null);const[done,setDone]=useState(false);
  if(done)return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><Hdr title="Digitální sestra" backFn={onBack}/><div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}><div style={{width:64,height:64,borderRadius:32,background:T.greenL,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16}}><svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg></div><div style={{fontSize:20,fontWeight:700,color:T.g900,marginBottom:8}}>Příjem dokončen</div><div style={{fontSize:13,color:T.g500,lineHeight:1.6,marginBottom:24}}>Informace byly předány<br/><strong>{PATIENT.doctor}</strong>.</div><button onClick={onBack} style={{padding:"12px 32px",borderRadius:10,background:T.blue,border:"none",color:T.white,fontWeight:700,fontSize:14,cursor:"pointer"}}>Zpět na hlavní stránku</button></div></div>);
  if(vt)return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><Hdr title="Digitální sestra" sub={VISIT_TYPES.find(v=>v.key===vt)?.label} backFn={()=>setVt(null)}/><div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>{vt==="pain"&&<FlowPain onDone={()=>setDone(true)}/>}{vt==="routine"&&<FlowRoutine onDone={()=>setDone(true)}/>}{vt==="vaccination"&&<FlowVaccination onDone={()=>setDone(true)}/>}{vt==="presurgery"&&<FlowPresurgery onDone={()=>setDone(true)}/>}{vt==="surgery"&&<FlowSurgery onDone={()=>setDone(true)}/>}</div></div>);
  return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><Hdr title="Digitální sestra" sub="Příjem pacienta" backFn={onBack}/><div style={{flex:1,overflowY:"auto",padding:16}}><div style={{background:T.blueL,border:`1px solid #BFDBFE`,borderRadius:12,padding:16,marginBottom:16}}><div style={{fontSize:15,fontWeight:700,color:T.blue}}>Dobré ráno, {PATIENT.name} 👋</div><div style={{fontSize:13,color:T.g500,marginTop:4,lineHeight:1.5}}>Návštěva dnes u <strong style={{color:T.blue}}>{PATIENT.doctor}</strong>.</div></div><div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:T.g400,marginBottom:12}}>Typ návštěvy</div>{VISIT_TYPES.map(v=><div key={v.key} onClick={()=>setVt(v.key)} style={{background:T.white,borderRadius:12,border:`1.5px solid ${T.g200}`,padding:16,marginBottom:10,cursor:"pointer"}}><div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:24}}>{v.icon}</span><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:T.g900}}>{v.label}</div><div style={{fontSize:12,color:T.g400,marginTop:2}}>{v.desc}</div></div><svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg></div></div>)}<div style={{marginTop:8,padding:14,background:T.redL,borderRadius:12,textAlign:"center"}}><div style={{fontSize:11,color:T.g500}}>Život ohrožující situace</div><div style={{fontSize:14,fontWeight:700,color:T.g900}}>Vždy volejte <span style={{color:T.red}}>112</span> nebo <span style={{color:T.red}}>155</span></div></div></div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE C
// ═══════════════════════════════════════════════════════════════════════════════
function FeatureC({onBack}){
  const[tab,setTab]=useState("plan");const[rxR,setRxR]=useState({});const[rehab,setRehab]=useState({});const[diet,setDiet]=useState({});
  const rxList=[{name:"Amoxicilin 500 mg",dose:"1 kapsle",freq:"3× denně · 7 dní",u:"r"},{name:"Ibuprofen 400 mg",dose:"1 tableta",freq:"Dle potřeby",u:"o"},{name:"Probiotikum (Linex)",dose:"1 kapsle",freq:"2× denně · 14 dní",u:"g"}];
  const refs=[{spec:"Ortopedie",reason:"Kontrola disku L5-S1",clinic:"Praha 5 — Waltrovka",priority:"Do 4 týdnů",u:"r"},{spec:"Fyzioterapie",reason:"Rehabilitace bederní páteře",clinic:"CM Rehabilitační centrum",priority:"Do 2 týdnů",u:"o"}];
  const rehabItems=["10 min ranní protažení","Cvičení kočka-kráva × 15 opakování","Mosty (glute bridges) × 20 opakování","30 min chůze denně","Nesedět déle než 45 minut"];
  const dietItems=["Zvýšit příjem vody na 2,5 l/den","Omezit průmyslově zpracované potraviny","Přidat Omega-3 (ryby, len)","Vyhýbat se alkoholu během antibiotik"];
  const daysLeft=18;const prog=Math.round((30-daysLeft)/30*100);
  return(<div style={{display:"flex",flexDirection:"column",height:"100%"}}><Hdr title="Plán péče" backFn={onBack}/><div style={{background:T.white,borderBottom:`1px solid ${T.g200}`,display:"flex",flexShrink:0}}>{[["plan","Plán"],["rx","Recepty"],["referrals","Doporučení"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"11px 0",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:tab===t?700:400,color:tab===t?T.blue:T.g500,borderBottom:tab===t?`2px solid ${T.blue}`:"2px solid transparent"}}>{l}</button>)}</div><div style={{flex:1,overflowY:"auto",padding:16}}>{tab==="plan"&&<><div style={{background:T.blue,borderRadius:12,padding:16,marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}><div><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,.65)",textTransform:"uppercase",letterSpacing:.8}}>Příští schůzka</div><div style={{fontSize:26,fontWeight:700,color:T.white,marginTop:2,lineHeight:1}}>{daysLeft} <span style={{fontSize:14,fontWeight:400}}>dní</span></div><div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginTop:2}}>Kontrola PL · 23. 5. 2025</div></div><div style={{width:52,height:52,borderRadius:26,background:"rgba(255,255,255,.15)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:16,fontWeight:700,color:T.white}}>{prog}%</div><div style={{fontSize:8,color:"rgba(255,255,255,.65)"}}>uzdravení</div></div></div><div style={{height:4,background:"rgba(255,255,255,.2)",borderRadius:2}}><div style={{height:"100%",background:T.white,borderRadius:2,width:`${prog}%`}}/></div></div><Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><SLbl c="Rehabilitace"/>      <span style={BADGE_STYLE(Object.values(rehab).filter(Boolean).length===rehabItems.length?"green":"blue")}>{Object.values(rehab).filter(Boolean).length}/{rehabItems.length} hotovo</span></div>{rehabItems.map((item,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.g100}`,cursor:"pointer"}} onClick={()=>setRehab(r=>({...r,[i]:!r[i]}))}><div style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${rehab[i]?T.blue:T.g300}`,background:rehab[i]?T.blue:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{rehab[i]&&<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}</div><span style={{fontSize:13,color:rehab[i]?T.g400:T.g700,textDecoration:rehab[i]?"line-through":"none"}}>{item}</span></div>)}</Card><Card><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><SLbl c="Dieta"/>      <span style={BADGE_STYLE(Object.values(diet).filter(Boolean).length===dietItems.length?"green":"blue")}>{Object.values(diet).filter(Boolean).length}/{dietItems.length}</span></div>{dietItems.map((item,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.g100}`,cursor:"pointer"}} onClick={()=>setDiet(d=>({...d,[i]:!d[i]}))}><div style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${diet[i]?T.green:T.g300}`,background:diet[i]?T.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{diet[i]&&<svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}</div><span style={{fontSize:13,color:diet[i]?T.g400:T.g700,textDecoration:diet[i]?"line-through":"none"}}>{item}</span></div>)}</Card></>}{tab==="rx"&&<>{rxList.map((rx,i)=><Card key={i}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:14,fontWeight:700,color:T.g900}}>{rx.name}</div><div style={{fontSize:12,color:T.g400}}>{rx.dose} · {rx.freq}</div></div>              <span style={BADGE_STYLE(rx.u==="r"?"red":rx.u==="o"?"orange":"green")}>{rx.u==="r"?"Prioritní":rx.u==="o"?"Pravidelný":"Podpůrný"}</span></div><button onClick={()=>setRxR(r=>({...r,[i]:!r[i]}))} style={{width:"100%",padding:9,borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,border:`1px solid ${rxR[i]?T.green:T.blue}`,background:rxR[i]?T.greenL:"transparent",color:rxR[i]?T.green:T.blue}}>{rxR[i]?"✓ Připomínka nastavena":"🔔 Nastavit připomínku"}</button></Card>)}</>}{tab==="referrals"&&<>{refs.map((r,i)=><Card key={i}><div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div style={{fontSize:14,fontWeight:700,color:T.g900}}>{r.spec}</div>              <span style={BADGE_STYLE(r.u==="r"?"red":r.u==="o"?"orange":"green")}>{r.priority}</span></div><div style={{fontSize:13,color:T.g400,marginBottom:4}}>{r.reason}</div><div style={{fontSize:12,color:T.g400,marginBottom:12}}>📍 {r.clinic}</div><button style={{width:"100%",padding:10,borderRadius:10,border:"none",background:T.blue,color:T.white,fontWeight:700,fontSize:13,cursor:"pointer"}}>Objednat se →</button></Card>)}</>}</div></div>);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT — phone shell WITHOUT position:absolute nav
// ═══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const[screen,setScreen]=useState("home");
  const[navTab,setNavTab]=useState("Moje zdraví");

  const features=[
    {key:"A",icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,title:"Medical Records",sub:"AI Med-Explainer",desc:"2 laboratorní výsledky a 2 lékařské zprávy čekají na interpretaci.",badge:"NOVÉ",bc:"r",meta:"28. 4. 2025"},
    {key:"B",icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,title:"Nadcházející návštěva",sub:"Digitální sestra — příjem",desc:"Vyplňte příjmový dotazník. 5 typů návštěvy, adaptivní triage.",badge:"DNES",bc:"r",meta:"5 větví"},
    {key:"C",icon:<svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2"><path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/></svg>,title:"Plán péče",sub:"Péče po návštěvě",desc:"3 recepty, 2 doporučení a denní rehabilitační checklist.",badge:"18 dní",bc:"b",meta:"Kontrola: 23. 5."},
  ];

  // Bottom nav as flex row (NOT position:absolute)
  const BottomNav = () => (
    <div style={{background:T.white,borderTop:`1px solid ${T.g200}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"8px 0 12px",flexShrink:0}}>
      {[["🏠","Události"],["♥","Moje zdraví"],null,["✉","Novinky"],["👤","Profil"]].map((item,i)=>
        item===null
          ?<button key="fab" onClick={()=>setScreen("home")} style={{width:50,height:50,borderRadius:25,background:T.red,border:"none",color:T.white,fontSize:24,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",marginTop:-20,boxShadow:"0 2px 8px rgba(232,49,74,.4)"}}>+</button>
          :<div key={i} onClick={()=>{setNavTab(item[1]);setScreen("home");}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontSize:10,fontWeight:navTab===item[1]?700:400,color:navTab===item[1]?T.red:T.g400,cursor:"pointer"}}><span style={{fontSize:16}}>{item[0]}</span><span>{item[1]}</span></div>
      )}
    </div>
  );

  return (
    <div style={{background:"#111827",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{width:375,height:780,background:T.bg,borderRadius:36,border:"8px solid #111827",overflow:"hidden",display:"flex",flexDirection:"column",fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif"}}>
        {/* status bar */}
        <div style={{background:T.white,padding:"12px 20px 8px",display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,color:T.g900,flexShrink:0}}>
          <span>9:41</span><span>▶ ◀ ■ 95%</span>
        </div>

        {/* main content — takes all remaining space */}
        <div style={{flex:1,minHeight:0,display:"flex",flexDirection:"column"}}>
          {screen==="A"&&<FeatureA onBack={()=>setScreen("home")}/>}
          {screen==="B"&&<FeatureB onBack={()=>setScreen("home")}/>}
          {screen==="C"&&<FeatureC onBack={()=>setScreen("home")}/>}
          {screen==="home"&&<>
            <div style={{background:T.white,padding:"14px 20px 12px",borderBottom:`1px solid ${T.g200}`,display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
              <Leaf/><div style={{fontSize:13,fontWeight:700,color:T.blue,letterSpacing:1.2,textTransform:"uppercase"}}>Canadian Medical</div><div style={{fontSize:11,color:T.g400}}>Patient Engagement Suite</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:16}}>
              <div style={{background:T.blueL,border:`1px solid #BFDBFE`,borderRadius:10,padding:16,marginBottom:12,marginTop:4}}>
                <div style={{fontSize:15,fontWeight:700,color:T.blue}}>Dobré ráno, Lucie 👋</div>
                <div style={{fontSize:13,color:T.g500,marginTop:4,lineHeight:1.5}}>Máte <strong style={{color:T.blue}}>1 nadcházející návštěvu</strong> a aktivní plán péče.</div>
              </div>
              <div style={{fontSize:11,fontWeight:700,color:T.g400,letterSpacing:.8,textTransform:"uppercase",margin:"4px 0 10px"}}>Funkce</div>
              {features.map(f=>(
                <div key={f.key} onClick={()=>setScreen(f.key)} style={{background:T.white,borderRadius:10,border:`1px solid ${T.g200}`,padding:16,marginBottom:10,cursor:"pointer"}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:44,height:44,borderRadius:10,background:T.bg,border:`1px solid ${T.g200}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                        <div><div style={{fontSize:14,fontWeight:700,color:T.g900}}>{f.title}</div><div style={{fontSize:11,color:T.g500,marginTop:1}}>{f.sub}</div></div>
                        <span style={BADGE_STYLE(f.bc==="g"?"green":f.bc==="r"?"red":f.bc==="o"?"orange":"blue")}>{f.badge}</span>
                      </div>
                      <div style={{fontSize:13,color:T.g500,lineHeight:1.5,marginTop:6}}>{f.desc}</div>
                    </div>
                  </div>
                  <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.g100}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,color:T.g400}}>{f.meta}</span>
                    <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:12,fontWeight:700,color:T.blue}}>Otevřít</span><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg></div>
                  </div>
                </div>
              ))}
              <div style={{marginTop:8,textAlign:"center",padding:"10px 0"}}><div style={{fontSize:11,color:T.g500}}>Život ohrožující situace:</div><div style={{fontSize:14,fontWeight:700,color:T.g900}}>Vždy volejte <span style={{color:T.red}}>112</span> nebo <span style={{color:T.red}}>155</span>!</div></div>
            </div>
          </>}
        </div>

        {/* bottom nav — always in normal flow, never overlaps content */}
        <BottomNav/>
      </div>
    </div>
  );
}
