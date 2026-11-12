export const $=(s,r=document)=>r.querySelector(s);
export const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
export const PW=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;   // 8+ chars, upper, lower, number, symbol
export const SID=/^\d{4}-\d{4,5}[A-Za-z]?$/;                               // any year, e.g. 2024-0188E
export const MOBILE=/^09\d{9}$/;                                         // exactly 11 digits
export const COLLEGES={
"College of Informatics and Computing Sciences":["BS Computer Science","BS Information Technology","BS Information Systems"],
"College of Engineering":["BS Civil Engineering","BS Computer Engineering","BS Electrical Engineering","BS Electronics Engineering","BS Mechanical Engineering"],
"College of Education":["Bachelor of Elementary Education","BSEd Major in English","BSEd Major in Mathematics","BSEd Major in Science","BSEd Major in Filipino","Bachelor of Physical Education"],
"College of Business Administration":["BS Accountancy","BSBA Major in Marketing Management","BSBA Major in Financial Management","BSBA Major in Human Resource Management","BS Entrepreneurship"],
"College of Industrial Technology":["BSIndTech Major in Automotive Technology","BSIndTech Major in Electrical Technology","BSIndTech Major in Electronics Technology","BSIndTech Major in Mechanical Technology","BSIndTech Major in Welding and Fabrication"],
"College of Arts and Sciences":["BS Psychology","AB Communication","BS Biology","BS Mathematics","BS Social Work"]};
export const eyes=()=>document.querySelectorAll('.eye').forEach(b=>b.onclick=()=>{const i=b.previousElementSibling;i.type=i.type==='password'?'text':'password';b.textContent=i.type==='password'?'👁':'🙈'});
export const tabs=()=>{const b=[...document.querySelectorAll('.tabs button')];b.forEach(x=>x.onclick=()=>{b.forEach(y=>y.classList.toggle('on',y===x));document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('hide',t.id!==x.dataset.t))})};
export const tbl=(h,r)=>`<div class="tw"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r.join('')||'<tr><td colspan=9>No records yet</td></tr>'}</table></div>`;
export const info=o=>`<div class="grid">${o.map(([k,v])=>`<div><small>${k}</small>${esc(v)||'—'}</div>`).join('')}</div>`;
export const remark=g=>g>=75?'Passed':'Failed';

// ---- profile photo (stored as a small JPEG data-URL in Firestore, no Storage needed) ----
export const av=(p,c='')=>p.photoURL?`<img class="av ${c}" src="${p.photoURL}" alt="">`:`<span class="av ${c}">${esc(((p.firstName||'?')[0]+(p.lastName||'')[0]).toUpperCase())}</span>`;
const shrink=f=>new Promise((ok,no)=>{const i=new Image,u=URL.createObjectURL(f);i.onload=()=>{const c=document.createElement('canvas');c.width=c.height=200;const s=Math.min(i.width,i.height);c.getContext('2d').drawImage(i,(i.width-s)/2,(i.height-s)/2,s,s,0,0,200,200);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.8))};i.onerror=()=>no('bad image');i.src=u});
export function photoBox(el,p,save){
 const draw=()=>{el.innerHTML=`<div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">${av(p,'lg')}<div><button class="btn sm" id="pbtn">Change photo</button>${p.photoURL?'<button class="btn sm ghost" id="prem">Remove</button>':''}<input type="file" id="pfile" accept="image/*" hidden><div class="hint">JPG or PNG. It is cropped to a square and resized automatically.</div></div></div>`;
  $('#pbtn',el).onclick=()=>$('#pfile',el).click();
  $('#pfile',el).onchange=async e=>{const f=e.target.files[0];if(!f)return;const old=p.photoURL;try{p.photoURL=await shrink(f);await save(p.photoURL)}catch{p.photoURL=old;alert('Could not save the photo. Try another image.')}draw()};
  const r=$('#prem',el);if(r)r.onclick=async()=>{const old=p.photoURL;try{p.photoURL='';await save('')}catch{p.photoURL=old}draw()}};
 draw()}

// ---- announcements ----
export const when=t=>t&&t.toDate?t.toDate().toLocaleString([],{dateStyle:'medium',timeStyle:'short'}):'';
export const card=(a,extra='')=>`<div class="ann"><b>${esc(a.title)}</b><small>${esc(a.author)} · ${when(a.createdAt)}</small><p>${esc(a.body)}</p>${extra}</div>`;

// ---- schedule / grading / profile helpers ----
export const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat'];
export const SEMS=['1st Semester','2nd Semester','Summer'];
const _d=new Date(),_m=_d.getMonth()+1,_y=_d.getFullYear(),_s=_m>=8?_y:_y-1;
export const AYNOW=`${_s}–${_s+1}`,SEMNOW=_m>=8?SEMS[0]:_m<=5?SEMS[1]:SEMS[2];
export const AYS=[...Array(_s+2-2024)].map((_,i)=>`${2024+i}–${2025+i}`);
export const t12=t=>{if(!t)return'';let[h,m]=t.split(':');const a=h>=12?'PM':'AM';return`${h%12||12}:${m} ${a}`};
export const eq=g=>g>=97?1:g>=94?1.25:g>=91?1.5:g>=88?1.75:g>=85?2:g>=82?2.25:g>=79?2.5:g>=76?2.75:g>=75?3:5;
export const NOTES=[['1.00','97 - 100','Excellent'],['1.25','94 - 96','Superior'],['1.50','91 - 93','Very Good'],['1.75','88 - 90','Good'],['2.00','85 - 87','Meritorious'],['2.25','82 - 84','Very Satisfactory'],['2.50','79 - 81','Satisfactory'],['2.75','76 - 78','Fairly Satisfactory'],['3.00','75','Passing'],['5.00','Below 75','Failed']];
export const fm=m=>String(m||'').replace(/^(\d{4})(\d{3})(\d{4})$/,'$1 $2 $3');
export const age=b=>b?Math.floor((Date.now()-new Date(b))/31557600000):'';
export const full=p=>[p.firstName,p.middleName,p.lastName].filter(Boolean).join(' ');
export const rws=a=>`<div class="card" style="max-width:none">${a.map(([k,v])=>`<div class="rw"><span>${k}</span><b>${esc(v)||'—'}</b></div>`).join('')}</div>`;
export const week=(cl,S,extra=()=>'')=>`<div class="wk">${DAYS.map(d=>`<div><h4>${d}</h4>${cl.filter(c=>(c.days||[]).includes(d)).sort((a,b)=>a.start.localeCompare(b.start)).map(c=>{const s=S[c.subjectId]||{};return`<div class="cls"><b>${esc(s.name||'(deleted subject)')}</b><small>${t12(c.start)} - ${t12(c.end)}</small><small>${esc(c.instructor)}</small><small>${esc(c.room)}</small>${extra(c)}</div>`}).join('')}</div>`).join('')}</div>`;
// small profile window (opens when the name/photo in the top bar is clicked)
export function pop(trg,box,p,rows,save,btns){
 box.innerHTML=`<button class="x">✕</button><div class="ph"></div><div style="text-align:center"><b>${esc(full(p))}</b><br><small>${esc(p.studentId||p.email)}</small></div><div style="margin-top:8px">${rows.map(([k,v])=>`<div class="rw"><span>${k}</span><b>${esc(v)||'—'}</b></div>`).join('')}</div><div class="pb">${btns.map(([t,,c],i)=>`<button class="btn sm ${c||''}" data-i="${i}">${t}</button>`).join('')}</div>`;
 photoBox($('.ph',box),p,save);$('.x',box).onclick=()=>box.classList.add('hide');
 box.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{box.classList.add('hide');btns[b.dataset.i][1]()});
 trg.onclick=()=>box.classList.toggle('hide')}
