import { useState, useRef, useEffect, useCallback } from "react";

// ── EXACT CANADIAN MEDICAL TOKENS (extracted from screenshots) ───────────────
const T = {
  blue:     "#1C3B8E",   // primary — headers, active buttons, nav active
  red:      "#E8314A",   // accent — CTAs, icons, dates, FAB
  bg:       "#F4F6FA",   // page background (very light blue-grey)
  white:    "#FFFFFF",   // card surface
  border:   "#E8EAF2",   // card borders (cool grey)
  text:     "#1A1D2E",   // primary text (near-black navy)
  muted:    "#6B7280",   // secondary text
  label:    "#9CA3AF",   // tertiary / captions
  green:    "#22A06B",   // success states only (status dot, confirmed)
  orange:   "#D97706",   // warning states only
  redLight: "#FEE2E2",   // red tint background
  blueLight:"#EFF6FF",   // blue tint background
};

// Typography — all from screenshots
// Screen titles: uppercase, bold, CM_BLUE, ~15px, letter-spacing
// Body: 13–14px, regular weight, T.text
// Captions: 11–12px, T.muted or T.label
// Active nav: T.red, bold; inactive: T.muted
// Buttons primary: full-width, 48px tall, T.blue bg, white text, 10px radius
// Buttons destructive: T.red bg
// Buttons outline: T.blue border + text
// Cards: white, 1px T.border, 10px radius, 16px padding
// Icons: outlined SVG, T.red for primary actions, T.blue for navigation
// Day chips (active): T.blue bg, white text, 10px radius
// Day chips (inactive): white bg, T.border border

const S = {
  phone: { width:375, minHeight:780, background:T.bg, borderRadius:36, border:"8px solid #111827", overflow:"hidden", position:"relative", fontFamily:"'Inter','Helvetica Neue',Arial,sans-serif", margin:"0 auto", display:"flex", flexDirection:"column" },
  sb:   { background:T.white, padding:"12px 20px 8px", display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:12, fontWeight:600, color:T.text },
  hdr:  { background:T.white, padding:"10px 20px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.border}` },
  ht:   { fontSize:15, fontWeight:700, color:T.blue, letterSpacing:1.2, textTransform:"uppercase" },
  sc:   { flex:1, overflowY:"auto", padding:"16px", paddingBottom:90 },
  card: { background:T.white, borderRadius:10, border:`1px solid ${T.border}`, padding:"16px", marginBottom:12 },
  btnP: { width:"100%", padding:"14px", borderRadius:10, border:"none", background:T.blue, color:T.white, fontWeight:700, fontSize:15, cursor:"pointer", letterSpacing:0.2 },
  btnR: { width:"100%", padding:"14px", borderRadius:10, border:"none", background:T.red, color:T.white, fontWeight:700, fontSize:15, cursor:"pointer" },
  btnO: { width:"100%", padding:"13px", borderRadius:10, border:`1.5px solid ${T.blue}`, background:"transparent", color:T.blue, fontWeight:700, fontSize:14, cursor:"pointer" },
  sl:   { fontSize:11, fontWeight:700, color:T.muted, letterSpacing:0.8, textTransform:"uppercase", marginBottom:10 },
  nav:  { position:"absolute", bottom:0, left:0, right:0, background:T.white, borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-around", padding:"10px 0 14px", height:64 },
  ni:   (a) => ({ display:"flex", flexDirection:"column", alignItems:"center", gap:3, fontSize:10, fontWeight:a?700:400, color:a?T.red:T.muted, cursor:"pointer" }),
  fab:  { width:52, height:52, borderRadius:26, background:T.red, border:"none", color:T.white, fontSize:28, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", marginTop:-18, boxShadow:"0 2px 8px rgba(232,49,74,0.35)" },
  chip: (a) => ({ padding:"8px 14px", borderRadius:10, border:`1px solid ${a?T.blue:T.border}`, background:a?T.blue:T.white, color:a?T.white:T.muted, fontSize:13, fontWeight:a?700:400, cursor:"pointer" }),
  tag:  (c) => ({ display:"inline-block", padding:"3px 9px", borderRadius:6, fontSize:11, fontWeight:600, background:c==="g"?"#D1FAE5":c==="o"?"#FEF3C7":c==="r"?T.redLight:T.blueLight, color:c==="g"?"#065F46":c==="o"?T.orange:c==="r"?T.red:T.blue }),
};

// ── ICONS (outlined, matching app style) ────────────────────────────────────
const Leaf = ({size=22,color=T.red}) => <svg width={size} height={size} viewBox="0 0 40 40" fill={color}><path d="M20 2 L22 12 L30 8 L26 16 L36 18 L28 22 L32 32 L22 26 L20 38 L18 26 L8 32 L12 22 L4 18 L14 16 L10 8 L18 12 Z"/></svg>;

// CM pulse icon for AI — matches the "Lékař Online" pulse motif in screenshots
const PulseIcon = ({size=30}) => (
  <div style={{ width:size, height:size, borderRadius:size/2, background:T.blue, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
    <svg width={size*.6} height={size*.6} viewBox="0 0 24 24" fill="none" stroke={T.white} strokeWidth="2.5" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
  </div>
);

const Back = ({onClick}) => (
  <div onClick={onClick} style={{ cursor:"pointer", padding:"4px 8px 4px 0" }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
  </div>
);

function TypingDots() {
  const [f,setF]=useState(0);
  useEffect(()=>{const t=setInterval(()=>setF(x=>(x+1)%4),400);return()=>clearInterval(t);},[]);
  return <div style={{display:"flex",gap:4,padding:"2px 0"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:f>i?T.blue:"#D1D5DB",transition:"background 0.15s"}}/>)}</div>;
}

function PDFChip({name,onRemove}) {
  return (
    <div style={{display:"inline-flex",alignItems:"center",gap:6,background:T.redLight,border:`1px solid #FECACA`,borderRadius:8,padding:"5px 10px",fontSize:12}}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
      <span style={{color:T.text,fontWeight:600,maxWidth:110,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{name}</span>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
      {onRemove&&<span onClick={onRemove} style={{cursor:"pointer",color:T.muted,fontSize:13,lineHeight:1}}>×</span>}
    </div>
  );
}

// ── SHARED AI CHAT ───────────────────────────────────────────────────────────
function AIChat({onClose,context,uploadedDoc,initialPrompt,quickActions}) {
  const SYS = `You are a warm, empathetic AI health assistant for Canadian Medical clinic in Prague. ${context||""} ${uploadedDoc?`Patient uploaded: "${uploadedDoc}". Answer document questions helpfully.`:""} Keep responses to 3–4 sentences. Bold the opening sentence. Never diagnose. For emergencies advise calling 155.`;
  const [msgs,setMsgs]=useState([{role:"ai",text:"Hello! I'm your CM Assistant. How can I help you today?",ts:new Date()}]);
  const [inp,setInp]=useState(initialPrompt||"");
  const [loading,setLoading]=useState(false);
  const [drag,setDrag]=useState(false);
  const [doc,setDoc]=useState(uploadedDoc||null);
  const ref=useRef(null);
  const fref=useRef(null);
  useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight;},[msgs,loading]);
  useEffect(()=>{if(initialPrompt)setTimeout(()=>send(initialPrompt),300);},[]);
  const handleFile=f=>{if(!f)return;setDoc(f.name);setMsgs(m=>[...m,{role:"system",text:`Document uploaded: ${f.name}`,ts:new Date()}]);};
  const onDrop=useCallback(e=>{e.preventDefault();setDrag(false);handleFile(e.dataTransfer.files[0]);},[]);
  const send=async(override)=>{
    const txt=(override||inp).trim();if(!txt||loading)return;
    if(!override)setInp("");
    setMsgs(m=>[...m,{role:"user",text:txt,ts:new Date()}]);setLoading(true);
    try{
      const hist=msgs.filter(m=>m.role!=="system").map(m=>({role:m.role==="ai"?"assistant":"user",content:m.text.replace(/\*\*/g,"")}));
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:SYS,messages:[...hist,{role:"user",content:txt}]})});
      const d=await res.json();
      setMsgs(m=>[...m,{role:"ai",text:d.content?.map(c=>c.text).join("")||"Please try again.",ts:new Date()}]);
    }catch{setMsgs(m=>[...m,{role:"ai",text:"Connection issue. Please try again.",ts:new Date()}]);}
    setLoading(false);
  };
  const fmt=ts=>ts.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});

  return(
    <div style={{display:"flex",flexDirection:"column",position:"absolute",inset:0,bottom:64,background:T.bg}}>
      {/* Header */}
      <div style={S.hdr}>
        <Back onClick={onClose}/>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <span style={S.ht}>CM Assistant</span>
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:1}}>
            <div style={{width:6,height:6,borderRadius:3,background:T.green}}/><span style={{fontSize:10,color:T.muted}}>AI Online</span>
          </div>
        </div>
        <div style={{width:20}}/>
      </div>
      {/* Active doc banner — matches appointment detail style */}
      {doc&&<div style={{background:"#FFFBEB",borderBottom:`1px solid #FDE68A`,padding:"7px 16px",display:"flex",alignItems:"center",gap:8}}><PDFChip name={doc}/><span style={{fontSize:11,color:T.orange,fontWeight:600}}>Active document context</span></div>}
      {/* Messages */}
      <div ref={ref} style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12,minHeight:0}}>
        {msgs.map((m,i)=>m.role==="system"?(
          <div key={i} style={{display:"flex",justifyContent:"center"}}>
            <div style={{background:"#D1FAE5",border:`1px solid #6EE7B7`,borderRadius:20,padding:"4px 12px",fontSize:11,color:"#065F46",display:"flex",alignItems:"center",gap:5}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>{m.text}
            </div>
          </div>
        ):(
          <div key={i} style={{display:"flex",flexDirection:m.role==="user"?"row-reverse":"row",gap:8,alignItems:"flex-end"}}>
            {m.role==="ai"
              ? <PulseIcon size={30}/>
              : <div style={{width:30,height:30,borderRadius:15,background:T.border,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>}
            <div style={{maxWidth:"76%"}}>
              <div style={{padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",background:m.role==="user"?T.blue:T.white,border:m.role==="ai"?`1px solid ${T.border}`:"none",color:m.role==="user"?T.white:T.text,fontSize:13.5,lineHeight:1.6}}>
                {m.text.split(/\*\*(.*?)\*\*/).map((p,pi)=>pi%2===1?<strong key={pi}>{p}</strong>:<span key={pi}>{p}</span>)}
              </div>
              <div style={{fontSize:10,color:T.label,marginTop:3,textAlign:m.role==="user"?"right":"left",paddingLeft:m.role==="ai"?4:0}}>
                {m.role==="ai"&&"CM Assistant · "}{fmt(m.ts)}
              </div>
            </div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",gap:8,alignItems:"flex-end"}}><PulseIcon size={30}/><div style={{background:T.white,border:`1px solid ${T.border}`,borderRadius:"14px 14px 14px 4px",padding:"10px 14px"}}><TypingDots/></div></div>}
      </div>
      {/* Upload zone */}
      <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)} onDrop={onDrop} onClick={()=>fref.current?.click()}
        style={{margin:"0 16px 8px",border:`1.5px dashed ${drag?T.blue:T.border}`,borderRadius:10,padding:"8px 12px",background:drag?T.blueLight:"transparent",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={drag?T.blue:T.muted} strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        {doc?<><PDFChip name={doc}/><span style={{fontSize:11,color:T.muted}}>Replace</span></>:<span style={{fontSize:12,color:T.muted}}>Upload prescription, scan, or report PDF</span>}
        <input ref={fref} type="file" accept=".pdf,.jpg,.png" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
      </div>
      {/* Quick actions — pill chips like the day selector in screenshots */}
      <div style={{paddingLeft:16,paddingBottom:6,display:"flex",gap:6,overflowX:"auto",scrollbarWidth:"none",flexShrink:0}}>
        {(quickActions||[]).map(qa=>(
          <button key={qa.label} onClick={()=>send(qa.prompt)} style={{padding:"7px 13px",borderRadius:20,border:`1px solid ${T.border}`,background:T.white,fontSize:11,color:T.blue,cursor:"pointer",whiteSpace:"nowrap",fontWeight:600,flexShrink:0}}>{qa.label}</button>
        ))}
      </div>
      {/* Input */}
      <div style={{padding:"6px 16px 8px",background:T.white,borderTop:`1px solid ${T.border}`,display:"flex",gap:8,flexShrink:0}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask a follow-up question…" style={{flex:1,padding:"10px 14px",borderRadius:22,border:`1px solid ${T.border}`,fontSize:13.5,outline:"none",background:T.bg,color:T.text,fontFamily:"inherit"}}/>
        <button onClick={()=>send()} style={{width:42,height:42,borderRadius:21,background:inp.trim()?T.blue:"#D1D5DB",border:"none",cursor:inp.trim()?"pointer":"default",color:T.white,fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s"}}>↑</button>
      </div>
    </div>
  );
}

// ── EMERGENCY ALERT ──────────────────────────────────────────────────────────
function EmAlert({onDismiss}) {
  return(
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.white,borderRadius:12,padding:24,border:`2px solid ${T.red}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
          <div style={{width:40,height:40,borderRadius:20,background:T.redLight,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div><div style={{fontSize:15,fontWeight:700,color:T.red}}>Urgent Symptom Detected</div><div style={{fontSize:12,color:T.muted}}>Immediate attention may be needed</div></div>
        </div>
        <p style={{fontSize:13,color:T.text,lineHeight:1.6,margin:"0 0 14px"}}>You reported a symptom that may require <strong>immediate medical attention</strong>. Do not wait for your appointment.</p>
        <div style={{background:T.redLight,borderRadius:10,padding:"12px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:12,fontWeight:600,color:"#991B1B"}}>Life-threatening situation?</div>
          <div style={{fontSize:20,fontWeight:700,color:T.red}}>Call 155 or 112 immediately</div>
        </div>
        <button onClick={onDismiss} style={{...S.btnO,color:T.muted,borderColor:T.border,fontSize:13}}>My symptoms are not an emergency — continue</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE A — AI LAB INSIGHT
// ══════════════════════════════════════════════════════════════════════════════
function PBar({value,min,max,status}) {
  const bc=status==="normal"?T.green:status==="high"?T.red:T.orange;
  const span=max*1.4-min*0.8;
  const dot=Math.min(Math.round(((value-min*0.8)/span)*100),95);
  const rs=Math.round(((min-min*0.8)/span)*100);
  const re=Math.round(((max-min*0.8)/span)*100);
  return(
    <div style={{marginTop:8,marginBottom:4}}>
      <div style={{position:"relative",height:7,background:"#E5E7EB",borderRadius:4}}>
        <div style={{position:"absolute",left:`${rs}%`,width:`${re-rs}%`,height:"100%",background:"#D1FAE5",borderRadius:4}}/>
        <div style={{position:"absolute",left:`${dot}%`,top:"50%",transform:"translate(-50%,-50%)",width:13,height:13,borderRadius:7,background:bc,border:"2px solid #fff"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:T.label,marginTop:4}}>
        <span>Low</span><span style={{color:T.green,fontWeight:600}}>Normal range</span><span>High</span>
      </div>
    </div>
  );
}

const BM=[
  {name:"Glucose (Fasting)",code:"S-S-GLU",value:5.4,unit:"mmol/L",min:3.9,max:5.5,status:"normal",note:"Within healthy range. Maintain current diet and exercise."},
  {name:"LDL Cholesterol",code:"S-LDL",value:3.8,unit:"mmol/L",min:1.8,max:3.4,status:"high",note:"Slightly elevated. Consider reducing saturated fats and discuss with your doctor."},
  {name:"HDL Cholesterol",code:"S-HDL",value:1.3,unit:"mmol/L",min:1.2,max:2.5,status:"normal",note:"Good level. Regular aerobic exercise helps maintain healthy HDL."},
];

function FeatureA({onBack}) {
  const [tab,setTab]=useState("summary");
  const [chat,setChat]=useState(false);
  const [chatPrompt,setChatPrompt]=useState(null);
  const [doc,setDoc]=useState(null);
  const [drag,setDrag]=useState(false);
  const fref=useRef(null);
  const openChat=(p=null)=>{setChatPrompt(p);setChat(true);};

  if(chat) return <AIChat onClose={()=>{setChat(false);setChatPrompt(null);}} context="Patient reviewing lab results: Glucose 5.4 mmol/L (normal), LDL 3.8 mmol/L (slightly high), HDL 1.3 mmol/L (normal). Explain results warmly in plain language." uploadedDoc={doc} initialPrompt={chatPrompt} quickActions={[{label:"Explain medical terms",prompt:"Can you explain the medical terms in my results in plain English?"},{label:"Next steps",prompt:"Based on my results, what next steps should I discuss with my doctor?"},{label:"Trend over time",prompt:"What should I track going forward to improve these results?"},{label:"Prepare for MRI",prompt:"How should I prepare for an upcoming MRI scan?"}]}/>;

  return(
    <>
      <div style={S.hdr}>
        <Back onClick={onBack}/>
        <span style={S.ht}>AI Lab Insight</span>
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <span style={{fontSize:11,color:T.red,fontWeight:600}}>28 Apr 2025</span>
        </div>
      </div>
      {/* Tabs — exact style from app screenshots */}
      <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,display:"flex"}}>
        {[["summary","Summary"],["details","Biomarkers"],["ask","Ask AI"]].map(([t,l])=>(
          <button key={t} onClick={()=>t==="ask"?openChat():setTab(t)} style={{flex:1,padding:"11px 0",border:"none",background:"transparent",cursor:"pointer",fontSize:13,fontWeight:tab===t?700:400,color:tab===t?T.blue:T.muted,borderBottom:tab===t?`2px solid ${T.blue}`:"2px solid transparent"}}>{l}</button>
        ))}
      </div>
      <div style={S.sc}>
        {/* Upload — matches "online check-in" QR zone style */}
        <div onDragOver={e=>{e.preventDefault();setDrag(true)}} onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)setDoc(f.name);}}
          onClick={()=>fref.current?.click()}
          style={{border:`1.5px dashed ${drag?T.blue:T.border}`,borderRadius:10,padding:"12px 14px",marginBottom:12,background:drag?T.blueLight:T.white,display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
          {doc?<><PDFChip name={doc} onRemove={e=>{e.stopPropagation();setDoc(null);}}/><span style={{fontSize:12,color:T.muted}}>Tap to replace</span></>
              :<><div style={{width:34,height:34,borderRadius:8,background:T.bg,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div><div style={{fontSize:13,fontWeight:600,color:T.text}}>Upload a report</div><div style={{fontSize:11,color:T.muted}}>PDF, radiology, or referral letter</div></div></>}
          <input ref={fref} type="file" accept=".pdf,.jpg,.png" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setDoc(f.name);}}/>
        </div>

        {tab==="summary"&&<>
          <div style={{...S.card,background:T.blueLight,border:`1px solid #BFDBFE`}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <div style={{width:36,height:36,borderRadius:18,background:T.blue,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.white} strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <div><div style={{fontSize:11,color:T.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:0.5}}>Overall status</div><div style={{fontSize:16,fontWeight:700,color:T.blue}}>Mostly stable</div></div>
            </div>
            <p style={{fontSize:13,color:"#374151",lineHeight:1.6,margin:0}}>Your results are mostly within healthy ranges. LDL Cholesterol is slightly elevated — worth discussing at your next visit.</p>
          </div>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:0.8,textTransform:"uppercase",margin:"4px 0 8px"}}>Key biomarkers</div>
          {BM.map((b,i)=>(
            <div key={i} style={{...S.card,cursor:"pointer"}} onClick={()=>openChat(`Tell me more about my ${b.name} result of ${b.value} ${b.unit}.`)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div><div style={{fontSize:14,fontWeight:700,color:T.text}}>{b.name}</div><div style={{fontSize:11,color:T.muted}}>{b.code}</div></div>
                <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:700,color:b.status==="high"?T.red:T.text}}>{b.value}</div><div style={{fontSize:11,color:T.muted}}>{b.unit}</div></div>
              </div>
              <PBar {...b}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:8}}>
                <span style={S.tag(b.status==="normal"?"g":b.status==="high"?"r":"o")}>{b.status==="normal"?"✓ Normal":b.status==="high"?"↑ Above range":"↓ Below range"}</span>
                <span style={{fontSize:11,color:T.blue,fontWeight:600}}>Ask AI →</span>
              </div>
            </div>
          ))}
          <button onClick={()=>openChat()} style={{...S.btnP,display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4}}><PulseIcon size={20}/>Open AI Med-Explainer</button>
        </>}

        {tab==="details"&&<>
          <div style={{...S.card,background:"#FFFBEB",border:"1px solid #FDE68A"}}>
            <p style={{margin:0,fontSize:13,color:"#92400E",lineHeight:1.5}}><strong>Important:</strong> These results are informational only. Always consult your doctor before making health decisions.</p>
          </div>
          {BM.map((b,i)=>(
            <div key={i} style={{...S.card,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>{b.name}</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>Reference: {b.min}–{b.max} {b.unit}</div></div>
                <div style={{fontSize:22,fontWeight:700,color:b.status==="high"?T.red:T.text}}>{b.value} <span style={{fontSize:12,color:T.muted,fontWeight:400}}>{b.unit}</span></div>
              </div>
              <PBar {...b}/>
              <div style={{marginTop:10,padding:"10px 12px",background:T.bg,borderRadius:8,fontSize:13,color:"#374151",lineHeight:1.5}}>{b.note}</div>
            </div>
          ))}
          <button onClick={()=>openChat()} style={{...S.btnP,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><PulseIcon size={20}/>Open AI Med-Explainer</button>
        </>}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE B — PRE-VISIT DIGITAL NURSE
// ══════════════════════════════════════════════════════════════════════════════
const BSTEPS=["Preparation","Medical","Symptoms","Handover"];

function FeatureB({onBack}) {
  const [step,setStep]=useState(0);
  const [chat,setChat]=useState(false);
  const [alert,setAlert]=useState(false);
  const [fasting,setFasting]=useState(null);
  const [samples,setSamples]=useState({urine:false,stool:false,blood:false});
  const [docs,setDocs]=useState({vacc:false,child:false,id:false});
  const [concern,setConcern]=useState("");
  const [meds,setMeds]=useState([{name:"Metformin 500mg"},{name:"Vitamin D 1000IU"}]);
  const [newMed,setNewMed]=useState("");
  const [noMedChg,setNoMedChg]=useState(false);
  const [allergies,setAllergies]=useState([{name:"Penicillin"}]);
  const [newAl,setNewAl]=useState("");
  const [hasSymptom,setHasSymptom]=useState(null);
  const [symptom,setSymptom]=useState("");
  const [location,setLocation]=useState("");
  const [duration,setDuration]=useState("");
  const [chars,setChars]=useState([]);
  const [aggravating,setAggravating]=useState([]);
  const [relieving,setRelieving]=useState([]);
  const [treatment,setTreatment]=useState("");
  const [severity,setSeverity]=useState(0);
  const [sleep,setSleep]=useState(6);
  const [stress,setStress]=useState(5);
  const tog=(arr,set,v)=>set(p=>p.includes(v)?p.filter(x=>x!==v):[...p,v]);
  const chk=v=>{if(["chest pain","shortness of breath","heart attack","stroke"].some(k=>v.toLowerCase().includes(k)))setAlert(true);};

  const SBar=()=>(
    <div style={{background:T.white,padding:"10px 16px 8px",borderBottom:`1px solid ${T.border}`}}>
      <div style={{display:"flex",alignItems:"center"}}>
        {BSTEPS.map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",flex:i<BSTEPS.length-1?1:"none"}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
              <div style={{width:22,height:22,borderRadius:11,background:step>i?T.green:step===i?T.blue:T.border,color:step>=i?T.white:T.muted,fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>{step>i?"✓":i+1}</div>
              <div style={{fontSize:8,color:step===i?T.blue:T.muted,fontWeight:step===i?700:400,whiteSpace:"nowrap"}}>{s}</div>
            </div>
            {i<BSTEPS.length-1&&<div style={{flex:1,height:2,background:step>i?T.green:T.border,margin:"0 3px",marginBottom:14}}/>}
          </div>
        ))}
      </div>
    </div>
  );

  if(chat) return <AIChat onClose={()=>setChat(false)} context="Patient is preparing for a GP visit. Help with pre-visit questions about preparation, medications, or what to expect." quickActions={[{label:"What to expect",prompt:"What typically happens during a GP check-up?"},{label:"Fasting blood test",prompt:"How should I prepare for a fasting blood test?"},{label:"About Metformin",prompt:"Can you explain what Metformin is used for?"}]}/>;

  const S0=()=>(
    <>
      <div style={{...S.card,background:T.blueLight,border:`1px solid #BFDBFE`}}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <PulseIcon size={32}/>
          <div><div style={{fontSize:14,fontWeight:700,color:T.blue}}>Good morning, Lucie</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>Your GP visit is in <strong style={{color:T.blue}}>2 hours</strong>. Let's prepare together.</div></div>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.sl}>Primary concern</div>
        <textarea value={concern} onChange={e=>{setConcern(e.target.value);chk(e.target.value);}} placeholder="What is the #1 reason for today's visit?" style={{width:"100%",minHeight:72,padding:"10px 12px",borderRadius:8,border:`1px solid ${T.border}`,fontSize:13,lineHeight:1.5,resize:"none",outline:"none",background:T.bg,boxSizing:"border-box",color:T.text,fontFamily:"inherit"}}/>
      </div>
      <div style={S.card}>
        <div style={S.sl}>Fasting status</div>
        <div style={{display:"flex",gap:8}}>
          {["Yes — I am fasting","No — I have eaten"].map(opt=>(
            <button key={opt} onClick={()=>setFasting(opt.startsWith("Yes"))} style={{flex:1,padding:"9px 6px",borderRadius:10,border:`1px solid ${fasting===(opt.startsWith("Yes"))?T.blue:T.border}`,background:fasting===(opt.startsWith("Yes"))?T.blue:"transparent",color:fasting===(opt.startsWith("Yes"))?T.white:T.muted,fontWeight:700,fontSize:11,cursor:"pointer"}}>{opt}</button>
          ))}
        </div>
      </div>
      <div style={S.card}>
        <div style={S.sl}>Samples prepared</div>
        {[["urine","🧪","Urine sample"],["stool","🟤","Stool sample"],["blood","🩸","Blood draw (in-clinic)"]].map(([k,ic,lbl])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
            <input type="checkbox" checked={samples[k]} onChange={e=>setSamples(s=>({...s,[k]:e.target.checked}))} style={{accentColor:T.blue,width:16,height:16}}/>
            <span style={{fontSize:13,color:T.text}}>{ic} {lbl}</span>
          </label>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.sl}>Documentation</div>
        {[["vacc","💉","Vaccination card"],["child","📗","Child health book"],["id","🪪","Insurance / ID card"]].map(([k,ic,lbl])=>(
          <label key={k} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
            <input type="checkbox" checked={docs[k]} onChange={e=>setDocs(d=>({...d,[k]:e.target.checked}))} style={{accentColor:T.blue,width:16,height:16}}/>
            <span style={{fontSize:13,color:T.text}}>{ic} {lbl}</span>
          </label>
        ))}
      </div>
      <button onClick={()=>setStep(1)} style={S.btnP}>Continue to Medical History</button>
    </>
  );

  const S1=()=>(
    <>
      <div style={S.card}>
        <div style={S.sl}>Current medications</div>
        {meds.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <div><div style={{fontSize:13,fontWeight:600,color:T.text}}>{m.name}</div><div style={{fontSize:11,color:T.muted}}>As previously recorded</div></div>
            <span style={S.tag("g")}>✓ Confirmed</span>
          </div>
        ))}
        <label style={{display:"flex",alignItems:"center",gap:8,marginTop:10,marginBottom:8,cursor:"pointer"}}>
          <input type="checkbox" checked={noMedChg} onChange={e=>setNoMedChg(e.target.checked)} style={{accentColor:T.blue,width:16,height:16}}/>
          <span style={{fontSize:13,color:T.text}}>No changes since last visit</span>
        </label>
        {!noMedChg&&<div style={{display:"flex",gap:8}}>
          <input value={newMed} onChange={e=>setNewMed(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(setMeds(m=>[...m,{name:newMed.trim()}]),setNewMed(""))} placeholder="Add new medication…" style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.border}`,fontSize:13,outline:"none",background:T.bg}}/>
          <button onClick={()=>{if(newMed.trim()){setMeds(m=>[...m,{name:newMed.trim()}]);setNewMed("");}}} style={{padding:"8px 14px",borderRadius:8,background:T.blue,border:"none",color:T.white,fontWeight:700,fontSize:13,cursor:"pointer"}}>Add</button>
        </div>}
      </div>
      <div style={S.card}>
        <div style={S.sl}>Known allergies</div>
        {allergies.map((a,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
            <span style={{fontSize:13,fontWeight:600,color:T.text}}>{a.name}</span>
            <span style={S.tag("o")}>⚠ Allergy</span>
          </div>
        ))}
        <div style={{display:"flex",gap:8,marginTop:10}}>
          <input value={newAl} onChange={e=>setNewAl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(setAllergies(a=>[...a,{name:newAl.trim()}]),setNewAl(""))} placeholder="Add allergy or intolerance…" style={{flex:1,padding:"8px 12px",borderRadius:8,border:`1px solid ${T.border}`,fontSize:13,outline:"none",background:T.bg}}/>
          <button onClick={()=>{if(newAl.trim()){setAllergies(a=>[...a,{name:newAl.trim()}]);setNewAl("");}}} style={{padding:"8px 14px",borderRadius:8,background:T.red,border:"none",color:T.white,fontWeight:700,fontSize:13,cursor:"pointer"}}>Add</button>
        </div>
      </div>
      <button onClick={()=>setStep(2)} style={S.btnP}>Continue to Symptom Triage</button>
    </>
  );

  const S2=()=>(
    <>
      <div style={S.card}>
        <div style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:8}}>Any new or worsening symptoms?</div>
        <div style={{display:"flex",gap:8}}>
          {["Yes","No — feeling stable"].map(opt=>(
            <button key={opt} onClick={()=>setHasSymptom(opt==="Yes")} style={{flex:1,padding:"10px",borderRadius:10,border:`1px solid ${hasSymptom===(opt==="Yes")?T.blue:T.border}`,background:hasSymptom===(opt==="Yes")?T.blue:"transparent",color:hasSymptom===(opt==="Yes")?T.white:T.muted,fontWeight:700,fontSize:12,cursor:"pointer"}}>{opt}</button>
          ))}
        </div>
      </div>
      {hasSymptom&&<>
        <div style={{...S.card,border:`1.5px solid ${T.blue}`}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
            <div style={{width:4,height:26,borderRadius:2,background:T.blue,flexShrink:0}}/>
            <div><div style={{fontSize:14,fontWeight:700,color:T.blue}}>OLD CARTS Symptom Triage</div><div style={{fontSize:11,color:T.muted}}>Standardised clinical framework</div></div>
          </div>
          {[{lbl:"Onset — Main symptom",ph:"e.g. Lower back pain",val:symptom,set:v=>{setSymptom(v);chk(v);}},{lbl:"Location — Where exactly?",ph:"e.g. Left lower back, radiating to leg",val:location,set:setLocation},{lbl:"Duration — How long?",ph:"e.g. 3 days, started suddenly",val:duration,set:setDuration},{lbl:"Treatment tried",ph:"e.g. Ibuprofen 400mg, ice pack",val:treatment,set:setTreatment}].map(f=>(
            <div key={f.lbl} style={{marginBottom:10}}>
              <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:4}}>{f.lbl}</div>
              <input value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${T.border}`,fontSize:13,outline:"none",background:T.bg,boxSizing:"border-box"}}/>
            </div>
          ))}
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:6}}>Character — How does it feel?</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Dull","Sharp","Burning","Throbbing","Aching","Pressure","Cramping","Stabbing"].map(c=><button key={c} onClick={()=>tog(chars,setChars,c)} style={S.chip(chars.includes(c))}>{c}</button>)}</div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:6}}>Aggravating factors</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Movement","Sitting","Standing","Eating","Stress","Cold","Heat"].map(c=><button key={c} onClick={()=>tog(aggravating,setAggravating,c)} style={S.chip(aggravating.includes(c))}>{c}</button>)}</div>
          </div>
          <div style={{marginBottom:10}}>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:6}}>Relieving factors</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Rest","Ice","Heat","Medication","Elevation","Massage"].map(c=><button key={c} onClick={()=>tog(relieving,setRelieving,c)} style={S.chip(relieving.includes(c))}>{c}</button>)}</div>
          </div>
          <div>
            <div style={{fontSize:12,fontWeight:600,color:T.text,marginBottom:8}}>Severity (1–10)</div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
              {[1,2,3,4,5,6,7,8,9,10].map(n=>{const cs=["#22A06B","#22A06B","#22A06B","#F59E0B","#F59E0B","#F97316","#F97316","#EF4444","#DC2626","#B91C1C"];return<div key={n} onClick={()=>setSeverity(n)} style={{width:26,height:26,borderRadius:13,background:severity===n?cs[n-1]:T.bg,border:severity===n?`2px solid ${cs[n-1]}`:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,cursor:"pointer",color:severity===n?T.white:T.muted}}>{n}</div>;})}
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:T.green,fontWeight:600}}>No pain</span><span style={{fontSize:10,color:"#B91C1C",fontWeight:600}}>Worst pain</span></div>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.sl}>Lifestyle check</div>
          {[{lbl:"Sleep quality",val:sleep,set:setSleep,L:"Very poor",R:"Excellent"},{lbl:"Stress level",val:stress,set:setStress,L:"Very low",R:"Extreme"}].map(s=>(
            <div key={s.lbl} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13,fontWeight:600,color:T.text}}>{s.lbl}</span><span style={{fontSize:13,fontWeight:700,color:T.blue}}>{s.val}/10</span></div>
              <input type="range" min="1" max="10" step="1" value={s.val} onChange={e=>s.set(Number(e.target.value))} style={{width:"100%",accentColor:T.blue}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:10,color:T.muted}}>{s.L}</span><span style={{fontSize:10,color:T.muted}}>{s.R}</span></div>
            </div>
          ))}
        </div>
      </>}
      <button onClick={()=>setStep(3)} style={{...S.btnP,opacity:hasSymptom!==null?1:0.4}}>Generate Doctor's Handover</button>
    </>
  );

  const S3=()=>(
    <>
      <div style={{...S.card,background:T.blueLight,border:`1px solid #BFDBFE`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",gap:8,alignItems:"center"}}><Leaf size={18}/><div><div style={{fontSize:13,fontWeight:700,color:T.blue}}>Doctor's Handover</div><div style={{fontSize:11,color:T.muted}}>MUDr. Vostradovská · 10:00 today</div></div></div>
          <span style={S.tag("g")}>✓ Transmitted</span>
        </div>
      </div>
      {[[concern||null,"Primary concern"],[null,"Preparation"],[null,"Medications"],[null,"Allergies"]].map((_,idx)=>{
        if(idx===0) return concern?(<div key={0} style={S.card}><div style={S.sl}>Primary concern</div><p style={{margin:0,fontSize:13,color:T.text,lineHeight:1.5}}>{concern}</p></div>):null;
        if(idx===1) return(
          <div key={1} style={S.card}><div style={S.sl}>Preparation</div>
            {fasting!==null&&<div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:13,color:T.text}}>Fasting</span><span style={S.tag(fasting?"g":"o")}>{fasting?"Yes ✓":"No"}</span></div>}
            {Object.entries(samples).filter(([,v])=>v).map(([k])=><div key={k} style={{padding:"5px 0",fontSize:13,color:T.text}}>✓ {k.charAt(0).toUpperCase()+k.slice(1)} sample</div>)}
            {Object.entries(docs).filter(([,v])=>v).map(([k])=><div key={k} style={{padding:"5px 0",fontSize:13,color:T.text}}>✓ {k==="vacc"?"Vaccination card":k==="child"?"Child health book":"ID / Insurance"}</div>)}
          </div>);
        if(idx===2) return(<div key={2} style={S.card}><div style={S.sl}>Medications</div>{meds.map((m,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:13,color:T.text}}>{m.name}</span><span style={S.tag("g")}>Confirmed</span></div>)}{noMedChg&&<div style={{fontSize:12,color:T.green,marginTop:6,fontWeight:600}}>✓ No changes confirmed</div>}</div>);
        if(idx===3) return(<div key={3} style={S.card}><div style={S.sl}>Allergies</div>{allergies.map((a,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:13,color:T.text}}>{a.name}</span><span style={S.tag("o")}>⚠ Allergy</span></div>)}</div>);
        return null;
      })}
      {hasSymptom&&symptom&&(
        <div style={{...S.card,border:`1px solid ${T.blue}`}}>
          <div style={S.sl}>Symptom Triage — OLD CARTS</div>
          {[["Symptom",symptom],["Location",location],["Duration",duration],["Character",chars.join(", ")],["Aggravating",aggravating.join(", ")],["Relieving",relieving.join(", ")],["Treatment",treatment],["Severity",severity?`${severity}/10`:""]].filter(([,v])=>v).map(([k,v])=>(
            <div key={k} style={{display:"flex",gap:8,padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{fontSize:12,color:T.muted,fontWeight:600,minWidth:90}}>{k}</span>
              <span style={{fontSize:13,color:k==="Severity"&&severity>=8?T.red:T.text,fontWeight:k==="Severity"&&severity>=8?700:400}}>{v}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{...S.card,background:"#D1FAE5",border:"1px solid #6EE7B7",marginBottom:12}}>
        <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
          <p style={{margin:0,fontSize:13,color:"#065F46",lineHeight:1.5}}>Handover complete. Your doctor has been notified and will review this brief before your appointment.</p>
        </div>
      </div>
      <button onClick={()=>setChat(true)} style={{...S.btnO,marginBottom:10}}>Ask CM Assistant a question</button>
      <button style={S.btnP}>Confirm Arrival</button>
    </>
  );

  return(
    <>{alert&&<EmAlert onDismiss={()=>setAlert(false)}/>}
      <div style={S.hdr}><Back onClick={()=>step>0?setStep(s=>s-1):onBack()}/><span style={S.ht}>Digital Nurse</span><div style={{fontSize:11,color:T.muted}}>GP Visit</div></div>
      <SBar/>
      <div style={S.sc}>{step===0&&<S0/>}{step===1&&<S1/>}{step===2&&<S2/>}{step===3&&<S3/>}</div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// FEATURE C — POST-VISIT CARE JOURNEY
// ══════════════════════════════════════════════════════════════════════════════
function FeatureC({onBack}) {
  const [chat,setChat]=useState(false);
  const [tab,setTab]=useState("plan");
  const [rxR,setRxR]=useState({});
  const [rehab,setRehab]=useState({});
  const [diet,setDiet]=useState({});
  const rxList=[{name:"Amoxicillin 500mg",dose:"1 capsule",freq:"3× daily · 7 days",urgency:"r"},{name:"Ibuprofen 400mg",dose:"1 tablet",freq:"As needed · max 3×/day",urgency:"o"},{name:"Probiotic (Linex)",dose:"1 capsule",freq:"2× daily · 14 days",urgency:"g"}];
  const refs=[{spec:"Orthopaedics",reason:"L5-S1 disc follow-up",clinic:"Praha 5 — Waltrovka",priority:"Within 4 weeks",urgency:"r"},{spec:"Physiotherapy",reason:"Lower back rehabilitation",clinic:"CM Rehab Centre",priority:"Within 2 weeks",urgency:"o"}];
  const rehabItems=["10 min morning stretching","Cat-cow spine mobility × 15 reps","Glute bridges × 20 reps","30 min walking daily","Avoid sitting >45 min continuously"];
  const dietItems=["Increase water intake to 2.5L/day","Reduce processed foods and salt","Add Omega-3 rich foods (fish, flax)","Avoid alcohol during antibiotic course"];
  const daysLeft=18;
  const prog=Math.round((30-daysLeft)/30*100);

  if(chat) return <AIChat onClose={()=>setChat(false)} context="Patient completed a GP visit. Care plan: Amoxicillin, Ibuprofen, Probiotic. Referrals to Orthopaedics and Physiotherapy. Follow-up in 18 days." quickActions={[{label:"Explain Amoxicillin",prompt:"What is Amoxicillin used for and what are the common side effects?"},{label:"Rehab tips",prompt:"Any tips for sticking to a daily physiotherapy routine at home?"},{label:"Ortho appointment",prompt:"What should I prepare for my orthopaedics appointment?"}]}/>;

  return(
    <>
      <div style={S.hdr}>
        <Back onClick={onBack}/>
        <span style={S.ht}>Care Journey</span>
        <button onClick={()=>setChat(true)} style={{display:"flex",alignItems:"center",gap:5,background:T.blueLight,border:"none",borderRadius:8,padding:"5px 10px",cursor:"pointer"}}>
          <PulseIcon size={16}/><span style={{fontSize:11,fontWeight:700,color:T.blue}}>Ask AI</span>
        </button>
      </div>
      <div style={{background:T.white,borderBottom:`1px solid ${T.border}`,display:"flex"}}>
        {[["plan","My Plan"],["rx","Prescriptions"],["referrals","Referrals"]].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:"11px 0",border:"none",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:tab===t?700:400,color:tab===t?T.blue:T.muted,borderBottom:tab===t?`2px solid ${T.blue}`:"2px solid transparent"}}>{l}</button>
        ))}
      </div>
      <div style={S.sc}>
        {tab==="plan"&&<>
          {/* Countdown card — matches appointment detail card style */}
          <div style={{...S.card,background:T.blue,border:"none"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.65)",textTransform:"uppercase",letterSpacing:0.8}}>Next appointment</div>
                <div style={{fontSize:26,fontWeight:700,color:T.white,marginTop:2,lineHeight:1}}>{daysLeft} <span style={{fontSize:14,fontWeight:400}}>days</span></div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",marginTop:2}}>Follow-up GP · 23 May 2025</div>
              </div>
              <div style={{width:52,height:52,borderRadius:26,background:"rgba(255,255,255,0.15)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                <div style={{fontSize:16,fontWeight:700,color:T.white}}>{prog}%</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.65)"}}>recovered</div>
              </div>
            </div>
            <div style={{height:4,background:"rgba(255,255,255,0.2)",borderRadius:2}}>
              <div style={{height:"100%",background:T.white,borderRadius:2,width:`${prog}%`}}/>
            </div>
          </div>
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={S.sl}>Daily rehab exercises</div>
              <span style={S.tag("b")}>{Object.values(rehab).filter(Boolean).length}/{rehabItems.length} done</span>
            </div>
            {rehabItems.map((item,i)=>(
              <label key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                <div onClick={()=>setRehab(r=>({...r,[i]:!r[i]}))} style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${rehab[i]?T.blue:T.border}`,background:rehab[i]?T.blue:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:"pointer"}}>
                  {rehab[i]&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.white} strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                </div>
                <span style={{fontSize:13,color:rehab[i]?T.muted:T.text,textDecoration:rehab[i]?"line-through":"none",lineHeight:1.4}}>{item}</span>
              </label>
            ))}
          </div>
          <div style={S.card}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={S.sl}>Dietary guidelines</div>
              <span style={S.tag("g")}>{Object.values(diet).filter(Boolean).length}/{dietItems.length} followed</span>
            </div>
            {dietItems.map((item,i)=>(
              <label key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.border}`,cursor:"pointer"}}>
                <div onClick={()=>setDiet(d=>({...d,[i]:!d[i]}))} style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${diet[i]?T.green:T.border}`,background:diet[i]?T.green:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1,cursor:"pointer"}}>
                  {diet[i]&&<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.white} strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                </div>
                <span style={{fontSize:13,color:diet[i]?T.muted:T.text,textDecoration:diet[i]?"line-through":"none",lineHeight:1.4}}>{item}</span>
              </label>
            ))}
          </div>
        </>}
        {tab==="rx"&&<>
          <div style={{...S.card,background:"#FFFBEB",border:`1px solid #FDE68A`,marginBottom:12}}>
            <p style={{margin:0,fontSize:12,color:"#92400E",lineHeight:1.5}}><strong>Parsed from your visit notes</strong> — 5 May 2025, MUDr. Vostradovská. Tap "Set Reminder" to add to your schedule.</p>
          </div>
          {rxList.map((rx,i)=>(
            <div key={i} style={{...S.card,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>{rx.name}</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>{rx.dose} · {rx.freq}</div></div>
                <span style={S.tag(rx.urgency)}>{rx.urgency==="r"?"Urgent":rx.urgency==="o"?"Regular":"Supportive"}</span>
              </div>
              <button onClick={()=>setRxR(r=>({...r,[i]:!r[i]}))} style={{width:"100%",padding:"9px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:700,border:`1px solid ${rxR[i]?T.green:T.blue}`,background:rxR[i]?"#D1FAE5":"transparent",color:rxR[i]?T.green:T.blue,transition:"all 0.15s"}}>{rxR[i]?"✓ Reminder set":"🔔 Set Reminder"}</button>
            </div>
          ))}
        </>}
        {tab==="referrals"&&<>
          <div style={{...S.card,background:T.blueLight,border:`1px solid #BFDBFE`,marginBottom:12}}>
            <p style={{margin:0,fontSize:12,color:"#1E40AF",lineHeight:1.5}}><strong>2 referrals extracted</strong> from your visit notes. Book within the recommended timeframes.</p>
          </div>
          {refs.map((r,i)=>(
            <div key={i} style={{...S.card,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text}}>{r.spec}</div>
                <span style={S.tag(r.urgency)}>{r.priority}</span>
              </div>
              <div style={{fontSize:13,color:T.muted,marginBottom:4}}>{r.reason}</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:12}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{fontSize:12,color:T.muted}}>{r.clinic}</span>
              </div>
              <button style={{...S.btnP,fontSize:13,padding:"10px"}}>Book Now →</button>
            </div>
          ))}
        </>}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// HOME + SHELL
// ══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,setScreen]=useState("home");
  const [navTab,setNavTab]=useState("Moje zdraví");

  const Nav=()=>(
    <div style={S.nav}>
      {[["🏠","Události"],["♥","Moje zdraví"],null,["✉","Novinky"],["👤","Profil"]].map((item,i)=>item===null
        ?<button key="fab" style={S.fab} onClick={()=>setScreen("home")}>+</button>
        :<div key={i} onClick={()=>{setNavTab(item[1]);setScreen("home");}} style={S.ni(navTab===item[1])}>
          <span style={{fontSize:16}}>{item[0]}</span><span>{item[1]}</span>
        </div>
      )}
    </div>
  );

  const Shell=({children})=>(
    <div style={{background:"#111827",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={S.phone}>
        <div style={S.sb}><span>9:41</span><span>▶ ◀ ■ 95%</span></div>
        {children}<Nav/>
      </div>
    </div>
  );

  if(screen==="A") return <Shell><FeatureA onBack={()=>setScreen("home")}/></Shell>;
  if(screen==="B") return <Shell><FeatureB onBack={()=>setScreen("home")}/></Shell>;
  if(screen==="C") return <Shell><FeatureC onBack={()=>setScreen("home")}/></Shell>;

  return(
    <Shell>
      {/* App bar — exact style from home screen screenshot */}
      <div style={{background:T.white,padding:"18px 20px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
        <Leaf size={26}/>
        <div style={{fontSize:13,fontWeight:700,color:T.blue,letterSpacing:1.2,textTransform:"uppercase"}}>Canadian Medical</div>
        <div style={{fontSize:11,color:T.muted}}>Patient Engagement Suite</div>
      </div>
      <div style={{...S.sc,paddingBottom:90}}>
        {/* Greeting */}
        <div style={{...S.card,background:T.blueLight,border:`1px solid #BFDBFE`,marginTop:4}}>
          <div style={{fontSize:15,fontWeight:700,color:T.blue}}>Good morning, Lucie 👋</div>
          <div style={{fontSize:13,color:T.muted,marginTop:4,lineHeight:1.5}}>You have <strong style={{color:T.blue}}>1 upcoming visit</strong> and an active care plan. Select a feature below.</div>
        </div>

        <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:0.8,textTransform:"uppercase",margin:"4px 0 10px"}}>Features</div>

        {/* Feature cards — white, bordered, no coloured bands */}
        {[
          { key:"A", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>, title:"AI Lab Insight", sub:"AI Med-Explainer", desc:"Your latest results are ready. 1 marker flagged — review and ask AI.", badge:"NEW", badgeC:"r", meta:"28 Apr 2025" },
          { key:"B", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, title:"My Upcoming Visit", sub:"Digital Nurse Intake", desc:"Complete your pre-visit intake for your GP appointment at 10:00.", badge:"TODAY", badgeC:"r", meta:"4 steps" },
          { key:"C", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.red} strokeWidth="2"><path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"/></svg>, title:"My Recovery Plan", sub:"Post-Visit Care Journey", desc:"3 prescriptions, 2 referrals, and your daily rehab checklist.", badge:"18 days left", badgeC:"b", meta:"Follow-up: 23 May" },
        ].map(f=>(
          <div key={f.key} onClick={()=>setScreen(f.key)} style={{...S.card,cursor:"pointer",marginBottom:10}}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              {/* Icon block — matches app's outlined icon grid */}
              <div style={{width:44,height:44,borderRadius:10,background:T.bg,border:`1px solid ${T.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{f.icon}</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>{f.title}</div>
                    <div style={{fontSize:11,color:T.muted,marginTop:1}}>{f.sub}</div>
                  </div>
                  <span style={{...S.tag(f.badgeC),flexShrink:0}}>{f.badge}</span>
                </div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.5,marginTop:6}}>{f.desc}</div>
              </div>
            </div>
            <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:T.label}}>{f.meta}</span>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{fontSize:12,fontWeight:700,color:T.blue}}>Open</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.blue} strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </div>
          </div>
        ))}

        {/* Emergency — matches exact styling from screenshots */}
        <div style={{marginTop:8,textAlign:"center",padding:"10px 0"}}>
          <div style={{fontSize:11,color:T.muted}}>Život ohrožující situace:</div>
          <div style={{fontSize:14,fontWeight:700,color:T.text}}>Vždy volejte <span style={{color:T.red}}>112</span> nebo <span style={{color:T.red}}>155</span>!</div>
        </div>
      </div>
    </Shell>
  );
}