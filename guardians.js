/* V1.4 — Guardiões da Floresta: progressão offline de fantasia.
 * Jurupari e outras figuras do imaginário popular aparecem aqui como ficção do jogo,
 * não como retratos fiéis de tradições indígenas ou seres espirituais reais.
 */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const BOSS = [
    {id:'saci',name:'Saci',kind:'Guardião do Vento',emoji:'🌀',color:'#e5ac45',x:-29,z:-11,hp:100,team:1,solo:3,damage:7,reward:'Amuleto do Vento',bonus:6,xp:180,desc:'Redemoinhos, teleporte breve e esquiva veloz.',weak:'Arco ou ataque rápido; mantenha a equipe perto.'},
    {id:'curupira',name:'Curupira',kind:'Guardião das Trilhas',emoji:'🌿',color:'#76cd80',x:-29,z:28,hp:160,team:3,solo:5,damage:9,reward:'Amuleto das Trilhas',bonus:10,xp:260,desc:'Distorce o rumo da bússola e desaparece entre árvores.',weak:'Rastreador e ataques em sequência.'},
    {id:'matinta',name:'Matinta Perera',kind:'Guardiã do Assobio',emoji:'🌙',color:'#cf9ee8',x:28,z:-7,hp:220,team:5,solo:8,damage:12,reward:'Amuleto da Noite',bonus:14,xp:360,desc:'Névoa noturna e assobio que drena energia.',weak:'Use escudo e recupere a energia antes de avançar.'},
    {id:'mapinguari',name:'Mapinguari',kind:'Guardião da Mata Profunda',emoji:'🐾',color:'#ee956b',x:27,z:32,hp:330,team:8,solo:12,damage:17,reward:'Amuleto da Força',bonus:20,xp:520,desc:'Grande resistência, investida e rugido de impacto.',weak:'Três aliados com boa defesa ou herói muito evoluído.'},
    {id:'jurupari',name:'Jurupari',kind:'Guardião do Enigma',emoji:'✦',color:'#67b9ff',x:31,z:-30,hp:430,team:11,solo:16,damage:20,reward:'Amuleto da Visão',bonus:30,xp:750,desc:'Desafio de ilusões, ecos e caminhos enganosos.',weak:'Reúna os quatro amuletos anteriores e use a equipe fortalecida.'},
  ];
  let S=null,P=null,mode='team',selected='saci',uiTime=0,alertCD=0,changed=false;
  const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
  const saveKey=()=>`batalha_guardioes_v14_${S?.tribe||'munduruku'}`;
  const getLevel=()=>Math.min(30,1+Math.floor((P?.xp||0)/160));
  const power=()=>32+getLevel()*13+(P?BOSS.filter(b=>P.defeated.includes(b.id)).reduce((sum,b)=>sum+b.bonus,0):0)+(mode==='team'?34:0);
  const win=(b)=>P.defeated.includes(b.id);
  const indexOfBoss=(b)=>BOSS.findIndex(q=>q.id===b.id);
  const ready=(b)=>{const ix=indexOfBoss(b);return ix>=0&&getLevel()>=(mode==='team'?b.team:b.solo)&&(ix===0||win(BOSS[ix-1]));};
  const current=()=>BOSS.find(b=>!win(b))||BOSS[BOSS.length-1];
  function save(){if(!S||!P)return;try{localStorage.setItem(saveKey(),JSON.stringify({xp:P.xp,defeated:P.defeated,mode,marked:selected}));}catch{}}
  function start(state){
    S=state;let old={};try{old=JSON.parse(localStorage.getItem(saveKey())||'{}')||{};}catch{}
    P={xp:Number.isFinite(old.xp)?Math.max(0,old.xp):Math.max(0,S.score||0),defeated:Array.isArray(old.defeated)?old.defeated.filter(x=>BOSS.some(b=>b.id===x)):[],bosses:BOSS.map(b=>({...b,life:b.hp,cd:2,phase:0,surge:0,shock:0}))};
    mode=old.mode==='solo'?'solo':old.mode==='team'?'team':mode;selected=BOSS.some(b=>b.id===old.marked)?old.marked:'saci';
    uiTime=0;alertCD=0;changed=true;save();updateHUD();
  }
  function addXP(n){if(!S||!P)return;const oldLevel=getLevel();P.xp=Math.max(0,P.xp+n);save();if(getLevel()>oldLevel) message(`⭐ Evolução! Nível ${getLevel()} alcançado. Sua equipe ficou mais forte.`);}
  function message(t){const note=$('expMessage');if(!note)return;note.textContent=t;note.classList.add('visible');setTimeout(()=>{if(note.textContent===t)note.classList.remove('visible')},2600);}
  const near=()=>!S||!P?null:P.bosses.filter(b=>!win(b)&&dist(S,b)<11).sort((a,b)=>dist(S,a)-dist(S,b))[0]||null;
  function damageBoss(b){
    if(!ready(b)){
      const req=mode==='team'?b.team:b.solo,prev=BOSS[indexOfBoss(b)-1];
      message(`🔒 ${b.name}: nível ${req} ${mode==='solo'?'individual':'de equipe'}${prev&&!win(prev)?` e vencer ${prev.name}`:''}.`);return true;
    }
    const hit=14+getLevel()*1.7+(S.tool==='arco'?4:0)+(S.role==='guerreira'?3:0)+(mode==='team'?11:0);
    b.life=Math.max(0,b.life-hit);b.shock=.25;
    if(b.life<=0){
      if(!win(b)){P.defeated.push(b.id);P.xp+=b.xp;S.score+=b.xp;save();message(`🏆 ${b.name} superado! ${b.reward} conquistado. +${b.xp} XP`);}
      b.life=0;
    }else message(`⚔ ${b.name} recebeu ${Math.round(hit)} de dano. ${Math.ceil(b.life)}/${b.hp} de vida.`);
    changed=true;updateHUD();return true;
  }
  function combat(){if(!S||!P)return false;
    const r=S.tool==='arco'?9:4.1;
    const b=P.bosses.filter(q=>!win(q)&&dist(S,q)<r).sort((a,b)=>dist(S,a)-dist(S,b))[0];
    if(!b)return false;
    if(S.tool==='escudo'){S.hp=Math.min(100,S.hp+10);message('🛡 Defesa reforçada contra o Guardião.');return true;}
    if(S.tool==='bolsa'){message('Equipe a lança ou o arco antes de desafiar o Guardião.');return true;}
    return damageBoss(b);
  }
  function tick(dt){if(!S||!P)return;const b=near();alertCD=Math.max(0,alertCD-dt);
    if(b&&ready(b)){
      b.phase+=dt;b.cd-=dt;
      const d=dist(S,b);
      if(d<5.3&&b.cd<=0){
        b.cd=Math.max(1.75,3.5-b.team*.075);
        let hurt=b.damage;
        if(mode==='team'&&S.squad.some(a=>dist(a,b)<7))hurt=Math.round(hurt*.63);
        if(S.tool==='escudo')hurt=Math.round(hurt*.48);
        S.hp=Math.max(0,S.hp-hurt);S.hit=.24;
        if(b.id==='saci'){b.surge=1.3;message('🌀 Redemoinho! Saci mudou de posição.');}
        else if(b.id==='curupira'){S.yaw+=.52;message('🌿 Trilhas confusas! A direção da câmera mudou.');}
        else if(b.id==='matinta'){S.stamina=Math.max(0,S.stamina-23);message('🌙 Assobio misterioso! Energia reduzida.');}
        else if(b.id==='mapinguari'){S.stamina=Math.max(0,S.stamina-14);message('🐾 Rugido do Mapinguari! Proteja sua equipe.');}
        else {S.stamina=Math.max(0,S.stamina-35);message('✦ Eco do enigma! Resistência drenada.');}
        if(S.hp<=0){S.hp=100;S.stamina=100;S.x=-8;S.z=-26;b.life=b.hp;message('Sua equipe retornou à base; o Guardião recuperou a resistência.');}
        changed=true;
      }
    }
    if(b&&b.id==='saci'&&b.surge>0){b.surge=Math.max(0,b.surge-dt);b.x=b.x+(b.x<-22?1:-1)*dt*2;}
    if(b&&uiTime<=0){changed=true;uiTime=.18;}
    uiTime-=dt;if(changed&&uiTime<=0){updateHUD();uiTime=.18;changed=false;}
  }
  function updateHUD(){const tag=$('expLevelLabel'),n=$('expGuardianCount'),hud=$('expBossHud');if(!tag)return;
    tag.textContent=`NÍVEL ${getLevel()} · PODER ${Math.round(power())}`;
    n.textContent=`${P?.defeated.length||0}/5`;
    const b=near();if(!b){hud.hidden=true;return;}
    hud.hidden=false;$('expBossName').textContent=`${b.emoji} ${b.name.toUpperCase()}`;
    $('expBossInfo').textContent=ready(b)?`${b.kind} · ${Math.ceil(b.life)}/${b.hp} de vida`:`BLOQUEADO · nível ${mode==='team'?b.team:b.solo}${indexOfBoss(b)>0&&!win(BOSS[indexOfBoss(b)-1])?' · prova anterior pendente':''}`;
    $('expBossFill').style.width=Math.max(0,100*b.life/b.hp)+'%';
  }
  function draw(ctx,b,proj,clamp){
    const base=proj(b.x,0,b.z),head=proj(b.x,3.6,b.z);if(!base||!head||base.d>55)return;
    const h=clamp(base.y-head.y,35,420),w=h*.37;
    ctx.save();ctx.translate(base.x,base.y);ctx.fillStyle='#000a';ctx.beginPath();ctx.ellipse(0,4,w*.9,w*.20,0,0,7);ctx.fill();
    const flicker=Math.sin((P.xp/700)+b.phase*3)*3;
    ctx.fillStyle=b.color+'33';ctx.beginPath();ctx.ellipse(0,-h*.55,w*.89,h*.64,0,0,7);ctx.fill();
    ctx.fillStyle='#19212a';ctx.strokeStyle=b.color;ctx.lineWidth=Math.max(2,h*.025);
    ctx.beginPath();ctx.moveTo(-w*.42,0);ctx.lineTo(-w*.37,-h*.57);ctx.lineTo(0,-h*.77);ctx.lineTo(w*.35,-h*.54);ctx.lineTo(w*.42,0);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle=b.id==='mapinguari'?'#3b261c':b.id==='curupira'?'#684735':'#9b674a';
    ctx.beginPath();ctx.arc(0,-h*.79,w*.38,0,7);ctx.fill();
    ctx.strokeStyle=b.color;ctx.lineWidth=Math.max(2,w*.09);
    for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(i*w*.09,-h*.92);ctx.lineTo(i*w*.20,-h*(1.13+(i%2)*.06));ctx.stroke();}
    ctx.fillStyle='#f8edc3';ctx.font=`900 ${Math.max(10,Math.min(h*.17,43))}px system-ui`;ctx.textAlign='center';ctx.fillText(b.emoji,0,-h*.34+flicker);
    ctx.fillStyle='#130f16dd';ctx.fillRect(-w*.95,-h*1.30,w*1.9,h*.16);
    ctx.fillStyle=b.color;ctx.fillRect(-w*.94,-h*1.29,w*1.88*(b.life/b.hp),h*.10);
    ctx.fillStyle='#fff5d7';ctx.font=`bold ${Math.max(9,Math.min(h*.13,18))}px system-ui`;ctx.fillText(b.name.toUpperCase(),0,-h*1.39);
    ctx.restore();
  }
  function mapDraw(ctx,cx,cy,unit,side){if(!S||!P)return;
    for(const b of P.bosses){if(win(b))continue;
      const x=cx+b.x*unit,y=cy-b.z*unit;
      ctx.fillStyle=b.id===selected?'#fff1bc':b.color;ctx.strokeStyle='#15101b';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x+5,y);ctx.lineTo(x,y+6);ctx.lineTo(x-5,y);ctx.closePath();ctx.fill();ctx.stroke();
      if(side>230){ctx.font='bold 9px system-ui';ctx.fillStyle='#ffffff';ctx.textAlign='center';ctx.fillText(b.name,x,y-10);}
    }
  }
  function cardHTML(b){const done=P&&win(b),can=P&&ready(b),req=mode==='team'?b.team:b.solo;
    return `<article class="guardian-card ${done?'completed':can?'available':'locked'}" style="--boss-color:${b.color}">
      <div class="guardian-card-top"><div class="guardian-emblem">${b.emoji}</div><div><strong>${b.name}</strong><small>${b.kind}</small></div><span class="guardian-status">${done?'✓ SUPERADO':can?'DISPONÍVEL':'🔒 BLOQUEADO'}</span></div>
      <p>${b.desc}</p><div class="guardian-stats"><span>❤ ${b.hp} vida</span><span>⚔ ${b.damage} dano</span><span>⭐ Nível ${req}+</span></div>
      <small>Fraqueza: ${b.weak}</small><div class="guardian-reward">💎 ${b.reward} · +${b.xp} XP · +${b.bonus} poder permanente</div>
      <button data-mark-boss="${b.id}" class="secondary-btn" ${done?'disabled':''}>${done?'CONCLUÍDO':'MARCAR NO MAPA ◈'}</button>
    </article>`;
  }
  function open(){const dialog=$('expGuardianDialog');if(!dialog)return;
    $('guardianTeamMode').classList.toggle('selected',mode==='team');$('guardianSoloMode').classList.toggle('selected',mode==='solo');
    $('guardianCurrentLevel').textContent=P?`Nível ${getLevel()} • ${Math.round(power())} poder • ${P.xp} XP`:'Escolha uma tribo e inicie a Expedição para evoluir';
    $('expGuardianList').innerHTML=BOSS.map(cardHTML).join('');
    dialog.querySelectorAll('[data-mark-boss]').forEach(b=>b.onclick=()=>{selected=b.dataset.markBoss;save();if(P)message('◈ Guardião marcado no minimapa: '+BOSS.find(q=>q.id===selected).name);dialog.close();});
    if(!dialog.open)dialog.showModal();
  }
  function setMode(m){mode=m;save();updateHUD();open();}
  $('expGuardians').onclick=open;
  $('guardianGuide').onclick=open;
  $('guardianTeamMode').onclick=()=>setMode('team');$('guardianSoloMode').onclick=()=>setMode('solo');
  $('guardianClose').onclick=()=>$('expGuardianDialog').close();
  $('guardianReset').onclick=()=>{if(!P||!confirm('Apagar níveis, amuletos dos Guardiões e vitórias desta tribo? As coletas de expedição ficam preservadas.'))return;P.xp=0;P.defeated=[];P.bosses.forEach(b=>{b.life=b.hp;b.cd=2;});save();updateHUD();open();};
  const inventoryHTML=()=>!P?'':`<div class="guardian-owned"><strong>✦ Progressão mística: nível ${getLevel()} · ${P.xp} XP · ${P.defeated.length}/5 provas</strong><p>${P.defeated.length?BOSS.filter(b=>win(b)).map(b=>`💎 ${b.reward}`).join(' · '):'Nenhum amuleto de Guardião conquistado ainda.'}</p></div>`;
  const onClose=()=>{const d=$('expGuardianDialog');if(d.open)d.close();};
  const resetProfile=()=>{for(const tribe of ['munduruku','muirapinima'])try{localStorage.removeItem(`batalha_guardioes_v14_${tribe}`);}catch{};};
  window.GuardianV14={start,tick,combat,addXP,draw,mapDraw,open,onClose,resetProfile,inventoryHTML,get mode(){return mode},get active(){return Boolean(S)},get level(){return getLevel()},get data(){return P},bosses:BOSS};
})();
