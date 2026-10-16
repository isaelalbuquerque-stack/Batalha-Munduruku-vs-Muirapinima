/* V1.5 — Rotas e descobertas: missões offline de exploração livre. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const POINTS = Object.freeze([
    {id:'igarape', name:'Acampamento do Igarapé', x:-27, z:-28, emoji:'🏕', xp:90, desc:'Encontre o acampamento e observe as rotas de abastecimento.'},
    {id:'varzea', name:'Mirante da Várzea', x:-31, z:16, emoji:'🌊', xp:130, desc:'Cruze a região do rio e alcance o mirante.'},
    {id:'sumauma', name:'Clareira da Sumaúma', x:8, z:33, emoji:'🌳', xp:170, desc:'Reconheça a clareira nas trilhas da floresta.'},
    {id:'serras', name:'Trilha das Serras', x:33, z:-26, emoji:'⛰', xp:220, desc:'Descubra a rota distante e retorne com experiência.'}
  ]);
  let S=null, visited=[], selected='igarape', time=0, cooldown=0;
  const key=()=>`batalha_rotas_v15_${S.tribe}_${S.arena}`;
  function save(){if(!S)return;try{localStorage.setItem(key(),JSON.stringify({visited,selected}));}catch{}}
  function activePoint(){return POINTS.find(p=>p.id===selected&&!visited.includes(p.id))||POINTS.find(p=>!visited.includes(p.id))||null;}
  function update(){
    const n=visited.length;
    $('expTrailCount').textContent=`${n}/${POINTS.length}`;
    const p=activePoint();
    if(!p){$('expWaypoint').textContent='✓ TODAS AS ROTAS DESCOBERTAS';$('expWaypointArrow').style.transform='rotate(0deg)';return;}
    const d=Math.hypot(p.x-S.x,p.z-S.z);
    const heading=Math.atan2(p.x-S.x,p.z-S.z);
    let diff=heading-S.yaw;
    diff=Math.atan2(Math.sin(diff),Math.cos(diff));
    $('expWaypointArrow').style.transform=`rotate(${diff}rad)`;
    $('expWaypoint').textContent=`${p.name} · ${Math.ceil(d)} m`;
  }
  function start(state){
    S=state;let old={};try{old=JSON.parse(localStorage.getItem(key())||'{}')||{};}catch{}
    visited=Array.isArray(old.visited)?old.visited.filter(id=>POINTS.some(p=>p.id===id)):[];
    selected=POINTS.some(p=>p.id===old.selected)?old.selected:'igarape';
    if(visited.includes(selected)&&activePoint())selected=activePoint().id;
    time=0;cooldown=0;update();
  }
  function showMessage(t){
    // A Expedição controla a duração da notificação e evita conflitos de HUD.
    if(typeof window.Expedition?.notify==='function')window.Expedition.notify(t,4.5);
    else {const el=$('expMessage');el.textContent=t;el.classList.add('visible');}
  }
  function tick(dt){
    if(!S)return;
    cooldown=Math.max(0,cooldown-dt);
    for(const p of POINTS){
      if(visited.includes(p.id))continue;
      if(Math.hypot(S.x-p.x,S.z-p.z)>4.2)continue;
      visited.push(p.id);S.score+=p.xp;
      window.GuardianV14?.addXP(p.xp);
      if(selected===p.id){const next=POINTS.find(q=>!visited.includes(q.id));if(next)selected=next.id;}
      save();window.Expedition?.save?.();showMessage(`${p.emoji} ROTA DESCOBERTA: ${p.name}! +${p.xp} XP`);break;
    }
    time+=dt;if(time>.16){update();time=0;}
  }
  function mark(id){
    const point=POINTS.find(p=>p.id===id);
    if(!S||!point||visited.includes(id))return;
    selected=id;save();update();
    $('expTrailsDialog').close();
  }
  function open(){
    if(!S)return;
    $('expTrailCards').innerHTML=POINTS.map(p=>{
      const done=visited.includes(p.id),distance=Math.ceil(Math.hypot(p.x-S.x,p.z-S.z));
      return `<article class="exp-trail-card ${done?'done':''}"><div class="exp-trail-emoji">${p.emoji}</div><div class="exp-trail-info"><strong>${p.name}</strong><p>${p.desc}</p><small>${done?'✓ Descoberta':'◈ '+distance+' m de distância'} · ${p.xp} XP</small></div><button type="button" data-trail="${p.id}" ${done?'disabled':''}>${done?'FEITO':selected===p.id?'MARCADA':'MARCAR'}</button></article>`;
    }).join('');
    $('expTrailCards').querySelectorAll('[data-trail]').forEach(b=>b.addEventListener('click',()=>mark(b.dataset.trail)));
    $('expTrailsDialog').showModal();
  }
  function mapDraw(ctx,cx,cy,unit,side){
    if(!S)return;
    for(const p of POINTS){
      const done=visited.includes(p.id),x=cx+p.x*unit,y=cy-p.z*unit;
      ctx.beginPath();ctx.arc(x,y,Math.max(3,side*.019),0,Math.PI*2);
      ctx.fillStyle=done?'#629b7e':p.id===selected?'#ffe28b':'#ff9d56';ctx.fill();
      ctx.lineWidth=2;ctx.strokeStyle='#121f30';ctx.stroke();
      if(side>230){ctx.fillStyle='#fff8d7';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.fillText(done?'✓':p.emoji,x,y-10);}
    }
  }
  function draw(ctx,p,proj,clamp){
    if(visited.includes(p.id))return;
    const base=proj(p.x,0,p.z),top=proj(p.x,3.6,p.z);
    if(!base||!top||base.d>54)return;
    const h=clamp(base.y-top.y,12,260),r=clamp(h*.18,5,45);
    ctx.save();const cy=top.y+Math.sin(S.elapsed*2.2)*r*.22;
    const grad=ctx.createRadialGradient(base.x,cy,1,base.x,cy,r*3.4);
    grad.addColorStop(0,'#ffdf9dc4');grad.addColorStop(.6,'#ffc65b33');grad.addColorStop(1,'#ffc65b00');
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(base.x,cy,r*3.4,0,7);ctx.fill();
    ctx.strokeStyle='#ffdb84';ctx.lineWidth=Math.max(2,r*.12);ctx.beginPath();ctx.moveTo(base.x,cy+r*.7);ctx.lineTo(base.x,base.y);ctx.stroke();
    ctx.font=`${clamp(h*.28,13,37)}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(p.emoji,base.x,cy);
    if(base.d<17){ctx.fillStyle='#ffe3aa';ctx.font='bold 10px system-ui';ctx.fillText(p.name,base.x,cy-r*1.5);}
    ctx.restore();
  }
  function onClose(){const d=$('expTrailsDialog');if(d?.open)d.close();}
  function resetProfile(){for(const tribe of ['munduruku','muirapinima'])for(const arena of ['munduruku','muirapinima'])try{localStorage.removeItem(`batalha_rotas_v15_${tribe}_${arena}`);}catch{}}
  $('expTrails').onclick=open;
  $('expCloseTrails').onclick=()=>$('expTrailsDialog').close();
  window.TrailsV15={start,tick,mapDraw,draw,onClose,resetProfile,open,POINTS,get visited(){return visited.slice();},get active(){return !!S}};
})();
