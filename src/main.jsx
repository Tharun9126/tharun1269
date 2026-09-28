import React, {useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import {
  Activity, AlertTriangle, BusFront, Camera, CheckCircle2, ChevronRight,
  CircleDot, Clock3, Cpu, FileCheck2, Gauge, Home, Layers3, MapPin,
  Menu, Navigation, Play, RefreshCw, Search, Settings, ShieldCheck,
  Sparkles, Truck, UserRound, Wrench, X, Zap
} from "lucide-react";
import "./styles.css";

const detections = [
  {id:"RM-1042", type:"Pothole", severity:"High", confidence:0.94, bus:"BUS-17", ward:"Ward 12", time:"10:24:18", lat:"17.3856", lng:"78.4867", status:"Verified", color:"danger"},
  {id:"RM-1041", type:"Longitudinal Crack", severity:"Medium", confidence:0.91, bus:"BUS-09", ward:"Ward 8", time:"10:23:44", lat:"17.3921", lng:"78.4781", status:"Verified", color:"warning"},
  {id:"RM-1040", type:"Pothole", severity:"High", confidence:0.92, bus:"BUS-21", ward:"Ward 5", time:"10:22:51", lat:"17.3712", lng:"78.4922", status:"Verified", color:"danger"},
  {id:"RM-1039", type:"Patch / Surface Damage", severity:"Low", confidence:0.87, bus:"BUS-04", ward:"Ward 15", time:"10:21:09", lat:"17.4011", lng:"78.4698", status:"Review", color:"info"},
  {id:"RM-1038", type:"Pothole", severity:"Medium", confidence:0.90, bus:"BUS-12", ward:"Ward 3", time:"10:19:33", lat:"17.3638", lng:"78.4742", status:"Verified", color:"warning"}
];

const buses = [
  {id:"BUS-17", route:"R-17 · Central ↔ East", ward:"Ward 12", speed:"31 km/h", detections:14, health:"Online"},
  {id:"BUS-09", route:"R-09 · North ↔ Central", ward:"Ward 8", speed:"24 km/h", detections:8, health:"Online"},
  {id:"BUS-21", route:"R-21 · West ↔ South", ward:"Ward 5", speed:"28 km/h", detections:11, health:"Online"},
  {id:"BUS-04", route:"R-04 · University ↔ Central", ward:"Ward 15", speed:"19 km/h", detections:5, health:"Online"},
  {id:"BUS-12", route:"R-12 · Ring Road", ward:"Ward 3", speed:"36 km/h", detections:9, health:"Online"}
];

const pipeline = [
  ["01","BUS CCTV + GPS","Existing cameras continuously capture frames and GPS trail.","Camera + GPS"],
  ["02","YOLOv8 DETECTION","Detect potholes, cracks and surface damage on-device.","Edge AI"],
  ["03","BYTETRACK","Track the same road defect across frames to prevent duplicate alerts.","Tracking"],
  ["04","VLM VERIFICATION","Cross-check detections and remove likely false alarms.","AI verification"],
  ["05","GEO-TAGGED EVIDENCE","Attach photo, location, time and confidence to the incident.","Evidence"],
  ["06","LIVE WARD MAP","Officials see priority road issues and create work orders.","Action"]
];

function Badge({children,tone="neutral"}) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function App(){
  const [page,setPage] = useState("Dashboard");
  const [selected,setSelected] = useState(detections[0]);
  const [running,setRunning] = useState(true);
  const [query,setQuery] = useState("");
  const [sidebar,setSidebar] = useState(true);
  const [toast,setToast] = useState("");

  const filtered = useMemo(()=>detections.filter(d =>
    `${d.id} ${d.type} ${d.bus} ${d.ward}`.toLowerCase().includes(query.toLowerCase())
  ),[query]);

  const notify = (msg)=>{
    setToast(msg);
    setTimeout(()=>setToast(""),2200);
  };

  const nav = [
    ["Dashboard", Home], ["Live Map", MapPin], ["Detections", AlertTriangle],
    ["Bus Fleet", BusFront], ["Work Orders", Wrench], ["Evidence", FileCheck2]
  ];

  return <div className="app">
    <aside className={`sidebar ${sidebar?"open":""}`}>
      <div className="brand">
        <div className="brandMark"><Navigation size={22}/></div>
        <div><b>RoadMitra</b><span>AI Road Intelligence</span></div>
      </div>
      <div className="sideLabel">OPERATIONS</div>
      <nav>{nav.map(([name,Icon])=>
        <button key={name} className={page===name?"active":""} onClick={()=>setPage(name)}>
          <Icon size={18}/><span>{name}</span>
          {name==="Detections" && <em>14</em>}
        </button>
      )}</nav>
      <div className="sideLabel">SYSTEM</div>
      <nav>
        <button onClick={()=>notify("Analytics module is ready for integration.")}><Gauge size={18}/>Analytics</button>
        <button onClick={()=>notify("Settings panel opened.")}><Settings size={18}/>Settings</button>
      </nav>
      <div className="sideCard">
        <div className="miniIcon"><ShieldCheck size={18}/></div>
        <b>Dual-AI verification</b>
        <p>Only high-confidence, geo-tagged incidents reach the authority dashboard.</p>
      </div>
      <div className="profile"><div className="avatar"><UserRound size={18}/></div><div><b>Ward Operations</b><span>Municipal Control Room</span></div></div>
    </aside>

    <main className="main">
      <header className="topbar">
        <div className="topLeft">
          <button className="iconBtn mobileOnly" onClick={()=>setSidebar(!sidebar)}><Menu size={20}/></button>
          <div><span className="eyebrow">SMART CITY OPERATIONS</span><h1>{page}</h1></div>
        </div>
        <div className="topActions">
          <div className="live"><span className={running?"pulse":""}></span>{running?"Pipeline live":"Pipeline paused"}</div>
          <button className="outlineBtn" onClick={()=>{setRunning(!running);notify(running?"Edge pipeline paused":"Edge pipeline resumed")}}>{running?<><span>Pause</span></>:<><Play size={15}/> Resume</>}</button>
          <button className="primaryBtn" onClick={()=>notify("New road scan session started.")}><Sparkles size={16}/> New Scan</button>
        </div>
      </header>

      <div className="content">
        {page==="Dashboard" && <Dashboard selected={selected} setSelected={setSelected} notify={notify} />}
        {page==="Live Map" && <MapPage selected={selected} setSelected={setSelected} notify={notify}/>}
        {page==="Detections" && <DetectionsPage selected={selected} setSelected={setSelected} query={query} setQuery={setQuery} filtered={filtered} notify={notify}/>}
        {page==="Bus Fleet" && <FleetPage notify={notify}/>}
        {page==="Work Orders" && <WorkOrdersPage notify={notify}/>}
        {page==="Evidence" && <EvidencePage selected={selected} setSelected={setSelected}/>}
      </div>
      {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
    </main>
  </div>
}

function Dashboard({selected,setSelected,notify}){
 return <div className="page">
   <div className="hero">
     <div><Badge tone="blue">ROADMITRA PILOT · 20 BUSES</Badge><h2>From wheel motion to a verified road alert.</h2><p>Public buses act as mobile road scanners using existing CCTV + GPS. The prototype mirrors the five-second detection → verification → geo-tag → ward action loop described in the solution.</p></div>
     <div className="heroStat"><span>LAST ALERT</span><b>10:24:18</b><small>2.1s end-to-end latency</small></div>
   </div>

   <div className="metrics">
     <Metric icon={AlertTriangle} label="Verified incidents" value="14" delta="+4 today" tone="red"/>
     <Metric icon={BusFront} label="Buses online" value="20/20" delta="100% fleet" tone="blue"/>
     <Metric icon={ShieldCheck} label="Avg. confidence" value="92.1%" delta="+3.4% vs. yesterday" tone="green"/>
     <Metric icon={Clock3} label="Median detection" value="2.4s" delta="edge pipeline" tone="purple"/>
   </div>

   <div className="grid2">
     <section className="panel mapPanel">
       <PanelHead title="Live ward heat-map" sub="Verified road issues · Hyderabad pilot view" action="Open full map" onAction={()=>{}}/>
       <MiniMap selected={selected}/>
       <div className="mapLegend"><span><i className="dot red"></i>High</span><span><i className="dot orange"></i>Medium</span><span><i className="dot blue"></i>Review</span><span className="mapNote">Click an incident below to inspect evidence</span></div>
     </section>
     <section className="panel">
       <PanelHead title="Latest verified alerts" sub="AI-verified and geo-tagged" action="View all" onAction={()=>{}}/>
       <div className="alertList">{detections.slice(0,4).map(d=>
         <button className={`alertRow ${selected.id===d.id?"selected":""}`} key={d.id} onClick={()=>setSelected(d)}>
           <div className={`alertIcon ${d.color}`}><AlertTriangle size={16}/></div>
           <div className="alertMain"><b>{d.type}</b><span>{d.bus} · {d.ward} · {d.time}</span></div>
           <div className="alertRight"><Badge tone={d.color}>{Math.round(d.confidence*100)}%</Badge><ChevronRight size={16}/></div>
         </button>
       )}</div>
     </section>
   </div>

   <div className="grid2">
     <section className="panel">
       <PanelHead title="Detection pipeline" sub="Current edge-to-authority status"/>
       <div className="pipeline">{pipeline.map(([n,t,desc,label],i)=>
         <div className="pipe" key={n}><div className="pipeNum">{n}</div><div className="pipeBody"><b>{t}</b><span>{desc}</span></div><Badge tone={i===3?"green":"blue"}>{label}</Badge>{i<5&&<div className="pipeLine"/>}</div>
       )}</div>
     </section>
     <section className="panel evidenceCard">
       <PanelHead title="Selected evidence" sub={`${selected.id} · captured ${selected.time}`}/>
       <EvidenceVisual detection={selected}/>
       <div className="evidenceMeta">
         <div><span>LOCATION</span><b>{selected.lat}, {selected.lng}</b></div>
         <div><span>BUS</span><b>{selected.bus}</b></div>
         <div><span>STATUS</span><b><Badge tone="green">VLM verified</Badge></b></div>
       </div>
       <button className="primaryBtn wide" onClick={()=>notify(`Work order created for ${selected.id}`)}><Wrench size={16}/> Create work order</button>
     </section>
   </div>
 </div>
}

function Metric({icon:Icon,label,value,delta,tone}){return <div className="metric panel"><div className={`metricIcon ${tone}`}><Icon size={19}/></div><div><span>{label}</span><b>{value}</b><small>{delta}</small></div></div>}

function PanelHead({title,sub,action,onAction}){return <div className="panelHead"><div><h3>{title}</h3><span>{sub}</span></div>{action&&<button className="textBtn" onClick={onAction}>{action}<ChevronRight size={14}/></button>}</div>}

function MiniMap({selected}){
 return <div className="miniMap">
   <div className="roads r1"/><div className="roads r2"/><div className="roads r3"/><div className="roads r4"/>
   <div className="water"/><div className="park p1"/><div className="park p2"/>
   {detections.map((d,i)=><button key={d.id} className={`pin ${d.color} ${selected.id===d.id?"focus":""}`} style={{left:`${18+i*16}%`,top:`${62-i*10}%`}} title={d.id}><span></span></button>)}
   <div className="mapLabel">WARD 12</div><div className="mapLabel l2">WARD 8</div><div className="mapLabel l3">WARD 5</div>
 </div>
}

function EvidenceVisual({detection}){return <div className="evidenceVisual"><div className="roadScene"><div className="road"></div><div className="lane lA"></div><div className="lane lB"></div><div className={`damage ${detection.type.includes("Crack")?"crack":""}`}></div><div className="bbox"><span>YOLOv8 · {Math.round(detection.confidence*100)}%</span></div><div className="busSil"></div></div><div className="scanTag"><CircleDot size={13}/>VLM VERIFIED</div></div>}

function DetectionsPage({selected,setSelected,query,setQuery,filtered,notify}){
 return <div className="page"><div className="sectionIntro"><div><Badge tone="blue">AI DETECTION INBOX</Badge><h2>Verified road incidents</h2><p>Every alert combines visual evidence, GPS, timestamp and confidence before reaching the control room.</p></div><div className="search"><Search size={17}/><input placeholder="Search incident, bus or ward..." value={query} onChange={e=>setQuery(e.target.value)}/></div></div>
 <div className="tablePanel panel"><div className="tableTop"><span>{filtered.length} incidents</span><div><Badge tone="green">Verified</Badge> <Badge tone="warning">Review</Badge></div></div>
 <div className="tableWrap"><table><thead><tr><th>Incident</th><th>Type</th><th>Location</th><th>Bus</th><th>Confidence</th><th>Status</th></tr></thead><tbody>{filtered.map(d=><tr className={selected.id===d.id?"rowSelected":""} onClick={()=>setSelected(d)} key={d.id}><td><b>{d.id}</b><span>{d.time}</span></td><td>{d.type}<small>{d.severity} severity</small></td><td>{d.ward}<small>{d.lat}, {d.lng}</small></td><td>{d.bus}</td><td><div className="confidence"><span style={{width:`${d.confidence*100}%`}}></span></div>{Math.round(d.confidence*100)}%</td><td><Badge tone={d.status==="Verified"?"green":"info"}>{d.status}</Badge></td></tr>)}</tbody></table></div></div>
 <div className="detailStrip panel"><EvidenceVisual detection={selected}/><div><Badge tone="green">Dual-AI verified</Badge><h3>{selected.type} detected by {selected.bus}</h3><p>Geo-tagged evidence captured at {selected.time}. YOLOv8 confidence is {Math.round(selected.confidence*100)}%; the verification stage has accepted this alert for municipal review.</p><div className="facts"><span><MapPin size={14}/>{selected.lat}, {selected.lng}</span><span><BusFront size={14}/>{selected.bus}</span><span><Clock3 size={14}/>{selected.time}</span></div><button className="primaryBtn" onClick={()=>notify(`Work order created for ${selected.id}`)}><Wrench size={16}/> Create work order</button></div></div>
 </div>
}

function MapPage({selected,setSelected,notify}){
 return <div className="page"><div className="sectionIntro"><div><Badge tone="blue">LIVE WARD MAP</Badge><h2>Road issues across the pilot city</h2><p>Heat-map view for ward-level prioritization and one-click work order generation.</p></div><div className="mapControls"><Badge tone="green"><span className="pulse"></span> Live GPS</Badge><button className="outlineBtn" onClick={()=>notify("Map refreshed from latest bus telemetry.")}><RefreshCw size={15}/> Refresh</button></div></div>
 <div className="bigMap panel"><div className="mapToolbar"><span><Layers3 size={16}/> Verified incidents</span><span>Heat intensity: <b>High → Low</b></span></div><MiniMap selected={selected}/><div className="mapPinsList">{detections.map(d=><button key={d.id} onClick={()=>setSelected(d)} className={selected.id===d.id?"sel":""}><span className={`dot ${d.color}`}></span><b>{d.id}</b><span>{d.ward}</span><Badge tone={d.color}>{d.severity}</Badge></button>)}</div></div>
 </div>
}

function FleetPage({notify}){return <div className="page"><div className="sectionIntro"><div><Badge tone="blue">CONNECTED FLEET</Badge><h2>Bus-as-scanner fleet</h2><p>Existing public transport cameras and GPS become a distributed road monitoring network.</p></div><button className="primaryBtn" onClick={()=>notify("Fleet sync completed.")}><RefreshCw size={16}/> Sync fleet</button></div>
 <div className="fleetGrid">{buses.map(b=><div className="panel busCard" key={b.id}><div className="busTop"><div className="busIcon"><BusFront size={21}/></div><Badge tone="green"><span className="pulse"></span>{b.health}</Badge></div><h3>{b.id}</h3><p>{b.route}</p><div className="busStats"><div><span>WARD</span><b>{b.ward}</b></div><div><span>SPEED</span><b>{b.speed}</b></div><div><span>ALERTS</span><b>{b.detections}</b></div></div><div className="signal"><span>Camera</span><div><i/><i/><i/><i/></div><span>GPS</span><div><i/><i/><i/><i/></div></div></div>)}</div>
 </div>}

function WorkOrdersPage({notify}){const orders=[["WO-204","Pothole repair","Ward 12","High","Assigned"],["WO-203","Surface crack","Ward 8","Medium","In progress"],["WO-202","Pothole repair","Ward 5","High","Pending"],["WO-201","Road patch","Ward 15","Low","Completed"]]; return <div className="page"><div className="sectionIntro"><div><Badge tone="blue">REPAIR OPERATIONS</Badge><h2>Work orders</h2><p>Turn verified road evidence into trackable municipal repair actions.</p></div><button className="primaryBtn" onClick={()=>notify("New work order form opened.")}><Wrench size={16}/> New work order</button></div>
 <div className="orders panel"><div className="orderSummary"><div><span>Open</span><b>3</b></div><div><span>In progress</span><b>1</b></div><div><span>Completed</span><b>18</b></div><div><span>Avg. response</span><b>1.8 days</b></div></div><div className="tableWrap"><table><thead><tr><th>Order</th><th>Issue</th><th>Ward</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>{orders.map(o=><tr key={o[0]}><td><b>{o[0]}</b></td><td>{o[1]}</td><td>{o[2]}</td><td><Badge tone={o[3]==="High"?"danger":o[3]==="Medium"?"warning":"info"}>{o[3]}</Badge></td><td><Badge tone={o[4]==="Completed"?"green":"blue"}>{o[4]}</Badge></td><td><button className="iconBtn" onClick={()=>notify(`${o[0]} opened`)}><ChevronRight size={16}/></button></td></tr>)}</tbody></table></div></div>
 </div>}

function EvidencePage({selected,setSelected}){return <div className="page"><div className="sectionIntro"><div><Badge tone="blue">GEO-TAGGED EVIDENCE</Badge><h2>Evidence library</h2><p>Photo + location + timestamp + confidence form the audit trail for every alert.</p></div></div><div className="evidenceGrid">{detections.map(d=><button className={`eCard panel ${selected.id===d.id?"selected":""}`} key={d.id} onClick={()=>setSelected(d)}><EvidenceVisual detection={d}/><div className="eCardBody"><div><b>{d.id}</b><Badge tone={d.color}>{Math.round(d.confidence*100)}%</Badge></div><h3>{d.type}</h3><span><MapPin size={13}/>{d.ward} · {d.time}</span></div></button>)}</div></div>}

createRoot(document.getElementById("root")).render(<App/>);
