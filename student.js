import {auth,db} from './firebase-config.js';
import {$,esc,tabs,tbl,rws,av,card,pop,full,fm,age,week,t12,AYS,SEMS,eq,NOTES,remark} from './common.js';
import {onAuthStateChanged,signOut,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {arrayUnion,arrayRemove,doc,getDoc,setDoc,updateDoc,collection,query,where,getDocs} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
tabs();const out=()=>signOut(auth).then(()=>location='index.html');$('#out').onclick=out;
const pull=async q=>(await getDocs(q)).docs.map(d=>({id:d.id,...d.data()}));
onAuthStateChanged(auth,async u=>{if(!u)return location='index.html';
 const p=(await getDoc(doc(db,'users',u.uid))).data();
 if(!p||p.role!=='student')return location=p?.role==='staff'?'staff.html':'index.html';
 // public classmate card (name, ID, photo only) - kept in sync every login
 const sync=()=>setDoc(doc(db,'directory',u.uid),{firstName:p.firstName,middleName:p.middleName||'',lastName:p.lastName,studentId:p.studentId,photoURL:p.photoURL||'',course:p.course,yearLevel:p.yearLevel,section:p.section});
 await sync().catch(()=>{});
 const top=()=>$('#who').innerHTML=av(p)+esc(p.firstName);top();
 pop($('#who'),$('#pop'),p,[['College',p.college],['Course',p.course],['Year Level',p.yearLevel],['Section',p.section],['Academic Year',p.ay],['Semester',p.sem],['Email',p.email],['Mobile',fm(p.mobile)],['Status',p.status||'Enrolled']],
  async url=>{await updateDoc(doc(db,'users',u.uid),{photoURL:url});await sync();top()},
  [['My Profile',()=>$('[data-t=tp]').click()],['Change Password',async()=>{await sendPasswordResetEmail(auth,p.email);alert('Password reset link sent to '+p.email)}],['Logout',out,'red']]);
 const bd=p.birthday?new Date(p.birthday+'T00:00').toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})+` (${age(p.birthday)} years old)`:'';
 $('#tp').innerHTML=rws([['Student ID',p.studentId],['Name',full(p)],['College',p.college],['Course',p.course],['Year · Section',p.yearLevel+' · '+p.section],['Academic Year',p.ay],['Semester',p.sem],['Enrollment',p.status||'Enrolled'],['Birthdate',bd],['Gender',p.gender],['Nationality',p.nationality],['Address',p.address],['Email',p.email],['Username',p.username],['Mobile',fm(p.mobile)],['Guardian',p.guardian],['Guardian Mobile',fm(p.guardianMobile)]])+'<p class="hint">To change your college, course, year level or section, please ask the school admin.</p>';
 const S=Object.fromEntries((await pull(collection(db,'subjects'))).map(s=>[s.id,s]));
 const sec=[where('course','==',p.course),where('yearLevel','==',p.yearLevel),where('section','==',p.section)];
 const cl=await pull(query(collection(db,'classes'),...sec)),cm=await pull(query(collection(db,'directory'),...sec)),gr=await pull(query(collection(db,'grades'),where('studentUid','==',u.uid)));
 // AY + semester filter bar shared by Schedule and Grades
 const fil=(el,draw,extra='')=>{el.innerHTML=`<div class="bar"><select class="ay">${AYS.map(a=>`<option ${a===p.ay?'selected':''}>${a}</option>`).join('')}</select><select class="sm">${SEMS.map(s=>`<option ${s===p.sem?'selected':''}>${s}</option>`).join('')}</select>${extra}</div><div class="out"></div>`;
  const go=()=>draw($('.out',el),$('.ay',el).value,$('.sm',el).value);el.querySelectorAll('select').forEach(s=>s.onchange=go);go()};
 fil($('#ts'),(o,ay,sm)=>{const c=cl.filter(x=>x.ay===ay&&x.sem===sm);
  o.innerHTML=!c.length?'<p class="hint">No schedule has been posted for your section in this semester.</p>':$('#ts .vw').value==='Table'?tbl(['Subject','Days','Time','Instructor','Room'],c.map(x=>{const s=S[x.subjectId]||{};return`<tr><td>${esc(s.code)} – ${esc(s.name)}</td><td>${(x.days||[]).join(', ')}</td><td>${t12(x.start)} - ${t12(x.end)}</td><td>${esc(x.instructor)}</td><td>${esc(x.room)}</td></tr>`})):week(c,S)},'<select class="vw"><option>Weekly</option><option>Table</option></select>');
 $('#tc').innerHTML=`<p class="hint">${esc(p.course)} · ${esc(p.yearLevel)} · Section ${esc(p.section)}. For privacy, only photos, names and student IDs are shown.</p><div class="bar"><input id="q" placeholder="Search by name or student ID"></div><div id="cl"></div>`;
 cm.sort((a,b)=>a.lastName.localeCompare(b.lastName));
 const drawC=()=>{const q=$('#q').value.toLowerCase();$('#cl').innerHTML=tbl(['Name','Student ID'],cm.filter(x=>(full(x)+x.studentId).toLowerCase().includes(q)).map(x=>`<tr><td>${av(x)}${esc(full(x))}</td><td>${esc(x.studentId)}</td></tr>`))};$('#q').oninput=drawC;drawC();
 fil($('#tg'),(o,ay,sm)=>{
  const rows=[...new Map(cl.filter(x=>x.ay===ay&&x.sem===sm).map(x=>[x.subjectId,x])).values()].map(x=>({x,s:S[x.subjectId]||{},g:gr.find(y=>y.subjectId===x.subjectId&&y.ay===ay&&y.sem===sm)?.grade}));
  const gd=rows.filter(r=>r.g!=null),un=r=>+r.s.units||1,units=rows.reduce((a,r)=>a+(+r.s.units||0),0);
  const avg=gd.length?(gd.reduce((a,r)=>a+r.g,0)/gd.length).toFixed(1):'—',gpa=gd.length?(gd.reduce((a,r)=>a+eq(r.g)*un(r),0)/gd.reduce((a,r)=>a+un(r),0)).toFixed(2):'—';
  o.innerHTML=`<div class="card" style="max-width:none"><b>${esc(full(p))} · ${esc(p.studentId)}</b><br><small>${esc(p.course)} · ${esc(p.yearLevel)} · Section ${esc(p.section)} · ${ay} · ${sm}</small></div>`
  +tbl(['Subject Code','Description','Course No.','Instructor','Units','Grade','Equivalent','Remarks'],rows.map(r=>`<tr><td>${esc(r.s.code)}</td><td>${esc(r.s.name)}</td><td>${esc(r.s.courseNo)}</td><td>${esc(r.x.instructor)}</td><td>${esc(r.s.units)}</td><td>${r.g==null?'No grade yet':r.g}</td><td>${r.g==null?'—':eq(r.g).toFixed(2)}</td><td>${r.g==null?'—':remark(r.g)}</td></tr>`))
  +`<p class="hint">Subjects: <b>${rows.length}</b> · Total Units: <b>${units}</b> · Average: <b>${avg}</b> · GPA: <b>${gpa}</b> · Passing grade: <b>75</b></p><h3>Grade Notes</h3>`+tbl(['Equivalent','Grade','Meaning'],NOTES.map(n=>`<tr>${n.map(v=>`<td>${v}</td>`).join('')}</tr>`))});
 const ann=(await pull(collection(db,'announcements'))).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
 const drawA=()=>$('#ta').innerHTML=ann.map(a=>{const on=(a.likedBy||[]).includes(u.uid);return card(a,`<button class="like ${on?'on':''}" data-id="${a.id}">👍 ${on?'Liked':'Like'} · ${(a.likedBy||[]).length}</button>`)}).join('')||'<p class="hint">No announcements yet.</p>';drawA();
 $('#ta').onclick=async e=>{const b=e.target.closest('.like');if(!b)return;const a=ann.find(x=>x.id===b.dataset.id),on=(a.likedBy||[]).includes(u.uid);
  try{await updateDoc(doc(db,'announcements',a.id),{likedBy:on?arrayRemove(u.uid):arrayUnion(u.uid)});a.likedBy=on?a.likedBy.filter(x=>x!==u.uid):[...(a.likedBy||[]),u.uid];drawA()}catch{alert('Could not save your response.')}}});
