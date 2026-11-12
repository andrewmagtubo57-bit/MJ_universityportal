import {auth,db,cfg} from './firebase-config.js';
import {$,esc,tabs,tbl,rws,COLLEGES,PW,MOBILE,SID,av,card,pop,full,fm,week,DAYS,AYS,SEMS,AYNOW,SEMNOW} from './common.js';
import {initializeApp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {getAuth,onAuthStateChanged,signOut,createUserWithEmailAndPassword,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {doc,getDoc,setDoc,addDoc,updateDoc,deleteDoc,collection,query,where,getDocs,serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
tabs();const out=()=>signOut(auth).then(()=>location='index.html');$('#out').onclick=out;
let me,uid,students=[],subjects=[],classes=[],grades=[],ann=[],S={};
const sch={ay:AYNOW,sem:SEMNOW,college:'',course:'',year:'1st Year',sec:''},gf={ay:AYNOW,sem:SEMNOW};
const get=async q=>(await getDocs(q)).docs.map(d=>({id:d.id,...d.data()}));
const load=async()=>{students=await get(query(collection(db,'users'),where('role','==','student')));subjects=await get(collection(db,'subjects'));classes=await get(collection(db,'classes'));grades=await get(collection(db,'grades'));
 ann=(await get(collection(db,'announcements'))).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));S=Object.fromEntries(subjects.map(s=>[s.id,s]));render()};
const opts=a=>a.map(x=>[x,x]),COURSES=Object.values(COLLEGES).flat(),YL=['1st Year','2nd Year','3rd Year','4th Year'];
const nm=s=>s.lastName+', '+s.firstName+' '+(s.middleName||'');
const sel=(id,a,v)=>`<select id="${id}">${a.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
const btn=(a,id,t,c='')=>`<button class="btn sm ${c}" data-a="${a}" data-id="${esc(id)}">${t}</button>`;
const gid=(s,ay,sm,j)=>`${s}_${ay}_${sm}_${j}`.replace(/[^\w]/g,'');
const secCls=(s,ay,sm)=>[...new Map(classes.filter(c=>c.ay===ay&&c.sem===sm&&c.course===s.course&&c.yearLevel===s.yearLevel&&c.section===s.section).map(c=>[c.subjectId,c])).values()];
const top=()=>$('#who').innerHTML=av(me)+esc(me.firstName);
function modal(title,fields,v,save){const d=$('#dlg');
 d.innerHTML=`<h2>${title}</h2><form method="dialog">${fields.map(([k,l,t,o])=>`<label>${l}</label>`+(t==='select'?`<select name="${k}">${o.map(([a,b])=>`<option value="${esc(a)}">${esc(b)}</option>`).join('')}</select>`:t==='area'?`<textarea name="${k}" rows="5" required>${esc(v[k])}</textarea>`:`<input name="${k}" type="${t}" step="any" required value="${esc(v[k])}">`)).join('')}<div class="row"><button class="btn" value="ok">Save</button><button class="btn ghost" value="x" formnovalidate>Cancel</button></div></form>`;
 d.querySelectorAll('select').forEach(s=>{if(v[s.name])s.value=v[s.name]});
 d.returnValue='';d.onclose=async()=>{if(d.returnValue!=='ok')return;try{await save(Object.fromEntries(new FormData(d.querySelector('form'))));await load()}catch(e){alert(e.message||e)}};d.showModal()}
function render(){
 $('#tan').innerHTML=`<button class="btn sm" data-a="addA">+ Post announcement</button>`+(ann.map(a=>{const L=a.likedBy||[],n=students.filter(s=>L.includes(s.id)).map(nm).join('; ');return card(a,`<span class="hint">👍 ${L.length} liked${n?': '+esc(n):''}</span><div style="margin-top:8px">${btn('eA',a.id,'Edit')}${btn('dA',a.id,'Delete','red')}</div>`)}).join('')||'<p class="hint">No announcements yet.</p>');
 $('#tst').innerHTML=`<button class="btn sm" data-a="addS">+ Add student</button>`+tbl(['ID','Name','College / Course','Yr-Sec','Status','Mobile',''],students.map(s=>`<tr><td>${esc(s.studentId)}</td><td>${av(s)}${esc(nm(s))}</td><td>${esc(s.college)}<br><small>${esc(s.course)}</small></td><td>${esc(s.yearLevel)}-${esc(s.section)}</td><td>${esc(s.status||'Enrolled')}</td><td>${esc(fm(s.mobile))}</td><td>${btn('eS',s.id,'Edit')}${btn('dS',s.id,'Delete','red')}</td></tr>`));
 $('#tsu').innerHTML=`<button class="btn sm" data-a="addU">+ Add subject</button>`+tbl(['Code','Description','Course No.','Units','Year','Course',''],subjects.map(s=>`<tr><td>${esc(s.code)}</td><td>${esc(s.name)}</td><td>${esc(s.courseNo)}</td><td>${s.units}</td><td>${esc(s.yearLevel||'—')}</td><td>${esc(s.course)}</td><td>${btn('eU',s.id,'Edit')}${btn('dU',s.id,'Delete','red')}</td></tr>`));
 $('#tme').innerHTML=rws([['Name',full(me)],['Role','Faculty / Admin'],['Email',me.email],['Mobile',fm(me.mobile)]]);
 drawSch();drawGr()}
// ---------- Schedules (by college > course > year > section) ----------
function drawSch(){const el=$('#tsch'),k=sch,cols=['#facc15','#fb923c','#38bdf8','#a3a3a3','#3b82f6','#2dd4bf'],ic=['💻','🏗️','📚','📊','🔧','🎨'],cs=Object.keys(COLLEGES);
 const c=classes.filter(x=>x.ay===k.ay&&x.sem===k.sem&&x.course===k.course&&x.yearLevel===k.year&&x.section===k.sec);
 const secs=[...new Set(students.filter(s=>s.course===k.course&&s.yearLevel===k.year).map(s=>s.section))];
 el.innerHTML=`<p class="hint">Pick a college, course, year and section. Every student of that section automatically gets this schedule and these subjects.</p><div class="bar">${sel('sAy',AYS,k.ay)}${sel('sSm',SEMS,k.sem)}</div>`
 +`<div class="cards">${cs.map((n,i)=>`<div class="cc ${k.college===n?'on':''}" style="background:${cols[i]}" data-a="pickC" data-id="${esc(n)}"><span class="n">🎓 ${students.filter(s=>s.college===n).length}</span><div style="font-size:26px">${ic[i]}</div><b>${esc(n)}</b><br><small>${COLLEGES[n].length} program(s)</small></div>`).join('')}</div>`
 +(k.college?`<div class="bar" style="margin-top:12px">${sel('sCo',COLLEGES[k.college],k.course)}${sel('sYr',YL,k.year)}<input id="sSc" list="secs" placeholder="Section (e.g. A)" value="${esc(k.sec)}"><datalist id="secs">${secs.map(x=>`<option>${esc(x)}</option>`).join('')}</datalist></div>`:'')
 +(k.college&&k.sec?`<h3>${esc(k.course)} · ${k.year} · Section ${esc(k.sec)} <small>(${students.filter(s=>s.course===k.course&&s.yearLevel===k.year&&s.section===k.sec).length} student/s)</small></h3><button class="btn sm" data-a="addC">+ Add class</button><div style="margin-top:10px">${c.length?week(c,S,x=>`<div style="margin-top:6px">${btn('eC',x.id,'Edit')}${btn('dC',x.id,'Delete','red')}</div>`):'<p class="hint">No classes yet for this section and semester.</p>'}</div>`:'');
 el.querySelectorAll('select,input').forEach(x=>x.onchange=()=>{k.ay=$('#sAy').value;k.sem=$('#sSm').value;if($('#sCo')){k.course=$('#sCo').value;k.year=$('#sYr').value;k.sec=$('#sSc').value.trim().toUpperCase()}drawSch()})}
function clsModal(x={}){const d=$('#dlg'),k=sch;
 d.innerHTML=`<h2>${x.id?'Edit':'Add'} class</h2><p class="hint">${esc(k.course)} · ${k.year} · Section ${esc(k.sec)} · ${k.ay} · ${k.sem}</p><form method="dialog"><label>Subject</label><select name="subjectId">${subjects.map(s=>`<option value="${s.id}" ${s.id===x.subjectId?'selected':''}>${esc(s.code)} – ${esc(s.name)}</option>`).join('')}</select><label>Instructor</label><input name="instructor" required value="${esc(x.instructor)}"><label>Days</label><div class="days">${DAYS.map(a=>`<label><input type="checkbox" name="days" value="${a}" ${(x.days||[]).includes(a)?'checked':''}> ${a}</label>`).join('')}</div><div class="row"><div><label>Start</label><input type="time" name="start" required value="${x.start||''}"></div><div><label>End</label><input type="time" name="end" required value="${x.end||''}"></div></div><label>Room</label><input name="room" required value="${esc(x.room)}"><div class="row"><button class="btn" value="ok">Save</button><button class="btn ghost" value="x" formnovalidate>Cancel</button></div></form>`;
 d.returnValue='';d.onclose=async()=>{if(d.returnValue!=='ok')return;const fd=new FormData(d.querySelector('form')),f=Object.fromEntries(fd);f.days=fd.getAll('days');
  try{if(!f.days.length)throw'Pick at least one day';if(f.end<=f.start)throw'End time must be after start time';
   if(classes.find(c=>c.id!==x.id&&c.ay===k.ay&&c.sem===k.sem&&c.course===k.course&&c.yearLevel===k.year&&c.section===k.sec&&c.days.some(a=>f.days.includes(a))&&c.start<f.end&&f.start<c.end))throw'Time conflict with another class of this section';
   const data={...f,ay:k.ay,sem:k.sem,course:k.course,college:k.college,yearLevel:k.year,section:k.sec};
   x.id?await updateDoc(doc(db,'classes',x.id),data):await addDoc(collection(db,'classes'),data);await load()}catch(e){alert(e.message||e)}};d.showModal()}
// ---------- Grades (0-100, per student, per AY + semester) ----------
function drawGr(){const el=$('#tgr');
 el.innerHTML=`<div class="bar">${sel('gAy',AYS,gf.ay)}${sel('gSm',SEMS,gf.sem)}</div>`+tbl(['ID','Name','Yr-Sec','Subjects','Graded','Average',''],students.map(s=>{const c=secCls(s,gf.ay,gf.sem),g=c.map(x=>grades.find(y=>y.id===gid(s.id,gf.ay,gf.sem,x.subjectId))).filter(Boolean);
  return`<tr><td>${esc(s.studentId)}</td><td>${esc(nm(s))}</td><td>${esc(s.yearLevel)}-${esc(s.section)}</td><td>${c.length}</td><td>${g.length}</td><td>${g.length?(g.reduce((t,y)=>t+y.grade,0)/g.length).toFixed(1):'—'}</td><td>${btn('gS',s.id,'Enter grades')}</td></tr>`}));
 el.querySelectorAll('select').forEach(x=>x.onchange=()=>{gf.ay=$('#gAy').value;gf.sem=$('#gSm').value;drawGr()})}
function gradeModal(id){const s=students.find(x=>x.id===id),c=secCls(s,gf.ay,gf.sem),d=$('#dlg');
 d.innerHTML=`<h2>Grades – ${esc(nm(s))}</h2><p class="hint">${esc(s.course)} · ${s.yearLevel} · Section ${esc(s.section)} · ${gf.ay} · ${gf.sem}</p><form method="dialog">${c.map(x=>{const j=S[x.subjectId]||{},g=grades.find(y=>y.id===gid(id,gf.ay,gf.sem,x.subjectId));return`<label>${esc(j.code)} – ${esc(j.name)} (${esc(j.units)} units)</label><input type="number" min="0" max="100" step="0.01" name="${x.subjectId}" value="${g?g.grade:''}" placeholder="0-100 (empty = no grade yet)">`}).join('')||'<p>No subjects yet. Add classes for this section in the Schedules tab.</p>'}<div class="row"><button class="btn" value="ok">Save</button><button class="btn ghost" value="x" formnovalidate>Cancel</button></div></form>`;
 d.returnValue='';d.onclose=async()=>{if(d.returnValue!=='ok')return;const fd=new FormData(d.querySelector('form'));
  try{await Promise.all(c.map(x=>{const v=fd.get(x.subjectId),r=doc(db,'grades',gid(id,gf.ay,gf.sem,x.subjectId));return v===''?deleteDoc(r):setDoc(r,{studentUid:id,studentName:nm(s),subjectId:x.subjectId,ay:gf.ay,sem:gf.sem,grade:+v})}));await load()}catch(e){alert(e.message)}};d.showModal()}
// ---------- forms ----------
const SF=[['firstName','First name','text'],['middleName','Middle name','text'],['lastName','Last name','text'],['studentId','Student ID (e.g. 2024-0188E)','text'],['username','Username','text'],['birthday','Birthday','date'],['gender','Gender','select',opts(['Male','Female','Prefer not to say'])],['nationality','Nationality','text'],['address','Address','text'],['mobile','Mobile (11 digits)','tel'],['guardian','Guardian','text'],['guardianMobile','Guardian mobile (11 digits)','tel'],['college','College','select',opts(Object.keys(COLLEGES))],['course','Course','select',opts(COURSES)],['yearLevel','Year level','select',opts(YL)],['section','Section','text'],['ay','Academic year','select',opts(AYS)],['sem','Semester','select',opts(SEMS)],['status','Enrollment','select',opts(['Enrolled','Not Enrolled','Dropped','Graduated'])]];
const chk=f=>{f.studentId=f.studentId.trim().toUpperCase();f.section=f.section.trim().toUpperCase();if(!SID.test(f.studentId))throw'Student ID format: 2024-0188E';if(!MOBILE.test(f.mobile)||!MOBILE.test(f.guardianMobile))throw'Mobile numbers must be 11 digits starting with 09'};
const dir=(id,s)=>setDoc(doc(db,'directory',id),{firstName:s.firstName,middleName:s.middleName||'',lastName:s.lastName,studentId:s.studentId,photoURL:s.photoURL||'',course:s.course,yearLevel:s.yearLevel,section:s.section});
const AF=[['title','Title','text'],['body','Message','area']];
const UF=[['code','Subject code','text'],['name','Description','text'],['courseNo','Course No.','text'],['units','Units','number'],['course','Course','select',opts(COURSES)],['yearLevel','Year level','select',opts(YL)]];
const A={
 pickC:id=>{sch.college=id;sch.course=COLLEGES[id][0];drawSch()},
 addC:()=>subjects.length?clsModal():alert('Add subjects first (Subjects tab).'),
 eC:id=>clsModal(classes.find(x=>x.id===id)),
 dC:async id=>{if(confirm('Delete this class?')){await deleteDoc(doc(db,'classes',id));load()}},
 gS:gradeModal,
 addA:()=>modal('Post announcement',AF,{},f=>addDoc(collection(db,'announcements'),{...f,author:full(me),createdAt:serverTimestamp(),likedBy:[]})),
 eA:id=>modal('Edit announcement',AF,ann.find(x=>x.id===id),f=>updateDoc(doc(db,'announcements',id),f)),
 dA:async id=>{if(confirm('Delete this announcement?')){await deleteDoc(doc(db,'announcements',id));load()}},
 addS:()=>modal('Add student',[...SF,['email','Email','email'],['password','Temporary password','text']],{nationality:'Filipino',ay:AYNOW,sem:SEMNOW,status:'Enrolled'},async f=>{
  chk(f);if(!PW.test(f.password))throw'Weak password (8+, upper, lower, number, symbol)';
  const {email,password,...p}=f,sec=getAuth(initializeApp(cfg,'sec'+Date.now())),u=(await createUserWithEmailAndPassword(sec,email,password)).user;
  await setDoc(doc(db,'users',u.uid),{...p,email,role:'student',createdAt:serverTimestamp()});await dir(u.uid,p);await signOut(sec)}),
 eS:id=>modal('Edit student',SF,students.find(x=>x.id===id),async f=>{chk(f);await updateDoc(doc(db,'users',id),f);await dir(id,{...students.find(x=>x.id===id),...f})}),
 dS:async id=>{if(confirm('Delete this student and their grades?')){await Promise.all(grades.filter(g=>g.studentUid===id).map(g=>deleteDoc(doc(db,'grades',g.id))));await deleteDoc(doc(db,'directory',id));await deleteDoc(doc(db,'users',id));load()}},
 addU:()=>modal('Add subject',UF,{},f=>addDoc(collection(db,'subjects'),{...f,units:+f.units})),
 eU:id=>modal('Edit subject',UF,subjects.find(x=>x.id===id),f=>updateDoc(doc(db,'subjects',id),{...f,units:+f.units})),
 dU:async id=>{if(confirm('Delete this subject and remove it from all schedules?')){await Promise.all(classes.filter(c=>c.subjectId===id).map(c=>deleteDoc(doc(db,'classes',c.id))));await deleteDoc(doc(db,'subjects',id));load()}}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)A[b.dataset.a](b.dataset.id)});
onAuthStateChanged(auth,async u=>{if(!u)return location='index.html';const s=await getDoc(doc(db,'users',u.uid));me=s.data();uid=u.uid;
 if(!me||me.role!=='staff')return location='student.html';top();
 pop($('#who'),$('#pop'),me,[['Role','Faculty / Admin'],['Email',me.email],['Mobile',fm(me.mobile)]],async url=>{await updateDoc(doc(db,'users',uid),{photoURL:url});top()},
  [['My Profile',()=>$('[data-t=tme]').click()],['Change Password',async()=>{await sendPasswordResetEmail(auth,me.email);alert('Reset link sent to '+me.email)}],['Logout',out,'red']]);load()});
