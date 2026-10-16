/* BATALHA MUNDURUKU VS MUIRAPINIMA — V1.8
 * Arena herdada em Canvas 2D; Expedição opcional com WebGL 3D.
 * Sem bibliotecas externas: funciona no GitHub Pages e offline depois do cache.
 * Todas as habilidades e confrontos são ficcionais.
 */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const TA = {
    munduruku: { name: 'Munduruku', short: 'MUNDURUKU', arena: 'Universo Munduruku', primary: '#f14745', secondary: '#ffce4e', dark: '#90202c', skin: '#ad6840' },
    muirapinima: { name: 'Muirapinima', short: 'MUIRAPINIMA', arena: 'Aldeia Muirapinima', primary: '#328dec', secondary: '#f44965', dark: '#0d3f8d', skin: '#bc7c4b' }
  };
  const ROLES = [
    { key: 'tuxaua', name: 'Tuxaua', line: 'equilíbrio', attack: 13, speed: 1.0, range: 1.50 },
    { key: 'paje', name: 'Pajé', line: 'poder especial', attack: 11, speed: .89, range: 1.7 },
    { key: 'guerreira', name: 'Guerreira', line: 'mais agilidade', attack: 10, speed: 1.25, range: 1.42 }
  ];
  const ACTS = ['CANTO & DANÇA', 'RITUAL ENCENADO', 'EVOLUÇÃO COREOGRÁFICA'];
  const canvas = $('world'), ctx = canvas.getContext('2d', { alpha: false });
  let W = 0, H = 0, dpr = 1, lastFrame = 0, now = 0, screen = 'home', mode = 'festival';
  let tribe = 'munduruku', arena = 'munduruku', role = ROLES[0], audioOn = true, audioCtx = null;
  let state = null, toastUntil = 0, statusTimeout = 0;
  const pressed = { left: false, right: false, defend: false };

  const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
  const mix = (a,b,t) => a + (b-a)*t;
  const rnd = (n) => { const x=Math.sin(n*78.233+15.72)*43758.5453;return x-Math.floor(x); };
  const enemyTeam = () => tribe === 'munduruku' ? 'muirapinima' : 'munduruku';
  function showScreen(name) {
    screen = name;
    for (const id of ['home','select','play','result','expedition']) {
      const el = $(id+'Screen');
      el.classList.toggle('active',id===name);
      if (id!=='home') el.setAttribute('aria-hidden',String(id!==name));
    }
    document.querySelector('.footer').style.display = (name==='play'||name==='expedition')?'none':'flex';
    if(window.Expedition)window.Expedition.active=name==='expedition';
    if(name!=='expedition')window.Expedition3D?.deactivate();
  }
  function setStatus(s) { $('statusLine').textContent = s; clearTimeout(statusTimeout); statusTimeout=setTimeout(()=>{ $('statusLine').textContent='Kit de Sobrevivência e Rios · V1.9'; },4500); }
  function sound(kind) {
    if (!audioOn) return;
    try {
      audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      const t=audioCtx.currentTime;
      const notes={select:430,hit:270,perfect:700,bad:160,special:110,win:540};
      o.type=kind==='special'?'sawtooth':kind==='hit'?'triangle':'sine';
      o.frequency.setValueAtTime(notes[kind]||360,t);
      if(kind==='special')o.frequency.exponentialRampToValueAtTime(58,t+.3);
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.065,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+(kind==='special'?.34:.14));
      o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+(kind==='special'?.36:.16));
    } catch (_e) { /* navegadores podem bloquear áudio */ }
  }
  function announce(txt, time=.6){$('toast').textContent=txt;$('toast').classList.add('show');toastUntil=now+time;}
  function selectMode(value){ mode=value;document.getElementById('expEditionSelector').hidden=value!=='expedition';document.getElementById('selectScreen').classList.remove('explorer-choice'); $('modeEyebrow').textContent=value==='festival'?'MODO DISPUTA FOLCLÓRICA':value==='expedition'?'MODO EXPEDIÇÃO / SOBREVIVÊNCIA':'MODO CONFRONTO DE FANTASIA';$('selectScreen').querySelector('h2').textContent=value==='festival'?'Prepare sua apresentação':value==='expedition'?'Escolha seu território e equipe':'Escolha seu guerreiro';updateSelection();window.AdventureV18?.paintSelection();showScreen('select');sound('select');}
  function updateSelection(){
    document.querySelectorAll('[data-tribe]').forEach(e=>{const yes=e.dataset.tribe===tribe;e.classList.toggle('selected',yes);e.setAttribute('aria-pressed',String(yes));});
    document.querySelectorAll('[data-arena]').forEach(e=>e.classList.toggle('selected',e.dataset.arena===arena));
    $('roles').innerHTML='';
    ROLES.forEach(r=>{const b=document.createElement('button');b.className='role-btn'+(role.key===r.key?' selected':'');b.innerHTML=r.name+'<small>'+r.line+'</small>';b.onclick=()=>{role=r;updateSelection();sound('select');};$('roles').appendChild(b);});
  }
  $('festivalMode').onclick=()=>selectMode('festival'); $('duelMode').onclick=()=>selectMode('duel'); $('expeditionMode').onclick=()=>selectMode('expedition');
  $('backSelect').onclick=()=>{showScreen('home');sound('select');};
  document.querySelectorAll('[data-tribe]').forEach(b=>b.onclick=()=>{tribe=b.dataset.tribe;arena=tribe;updateSelection();sound('select');});
  document.querySelectorAll('[data-arena]').forEach(b=>b.onclick=()=>{arena=b.dataset.arena;updateSelection();sound('select');});
  $('startBtn').onclick=startGame;
  $('leaveBtn').onclick=()=>{pressed.left=pressed.right=pressed.defend=false;showScreen('home');};
  $('returnHomeBtn').onclick=()=>showScreen('home');
  $('rematchBtn').onclick=startGame;
  $('muteBtn').onclick=()=>{audioOn=!audioOn;$('muteBtn').classList.toggle('muted',!audioOn);$('muteBtn').textContent=audioOn?'♫':'♪';setStatus(audioOn?'Som ativado':'Som desativado');};

  function startGame() {
    if(mode==='expedition'){window.Expedition.start({tribe,arena,role:role.key,profile:window.AdventureV18?.getSelection()||'guerreiro'});showScreen('expedition');sound('select');return;}
    const roster = [role,...ROLES.filter(r => r.key!==role.key)];
    const enemyRoster = [ROLES[1],ROLES[2],ROLES[0]];
    const player = {x:-2.0,hp:100,power:0,cd:0,attackTime:0,hitTime:0,defend:false,role:roster[0]};
    const cpu = {x:2.0,hp:100,power:0,cd:0,attackTime:0,hitTime:0,defend:false,role:enemyRoster[0]};
    state = {player,cpu,roster,enemyRoster,playerIndex:0,cpuIndex:0,time:0,remaining:120, round:0, roundTime:0, roundLen:21, score:0, cpuScore:0, combo:0, charge:0, lastBeat:-999, lastCpuBeat:-999, lastUi:0, particles:[], actScores:[], lastActScore:0, lastActCpu:0, result:false};
    $('festivalPanel').classList.toggle('hidden',mode!=='festival');$('duelPanel').classList.toggle('hidden',mode!=='duel');
    $('playerLabel').textContent=TA[tribe].name;$('cpuLabel').textContent=TA[enemyTeam()].name;
    pressed.left=pressed.right=pressed.defend=false;
    showScreen('play');updateHUD();sound('select');announce(mode==='festival'?'PREPARE-SE PARA DANÇAR!':'QUE COMECE O CONFRONTO!',1.2);
  }
  function endGame(){
    if(!state||state.result)return;
    state.result=true;
    const me = mode==='festival'?state.score:Math.round(state.player.hp)+Math.max(0,2-state.playerIndex)*100, them = mode==='festival'?state.cpuScore:Math.round(state.cpu.hp)+Math.max(0,2-state.cpuIndex)*100;
    const victory=me>them,tie=me===them;
    $('resultHeading').textContent=tie?'EMPATE!':victory?'VITÓRIA!':'A RIVAL VENCEU!';
    $('resultSubtitle').textContent=mode==='festival'?'RESULTADO DA DISPUTA FOLCLÓRICA':'RESULTADO DO CONFRONTO';
    $('resultDescription').textContent=tie?'As tribos terminaram em igualdade.':victory?TA[tribe].name+' conquistou a arena!':'A tribo '+TA[enemyTeam()].name+' levou esta rodada.';
    $('finalPlayer').textContent=me;$('finalCpu').textContent=them;
    const key = mode==='festival'?'batalha_best_festival':'batalha_wins';
    let line = '';
    try{
      const old=Number(localStorage.getItem(key))||0;
      if(mode==='festival') {const best=Math.max(old,me);localStorage.setItem(key,String(best));line='Seu recorde no festival: '+best+' pontos';}
      else {const wins=old+(victory?1:0);localStorage.setItem(key,String(wins));line='Vitórias registradas neste aparelho: '+wins;}
    }catch(_e){line='Resultado registrado nesta partida.';}
    $('recordLine').textContent=line;
    const board=$('judgeBoard');board.classList.toggle('hidden',mode!=='festival');
    if(mode==='festival'){
      board.innerHTML='<div class="judge-title">AVALIAÇÃO SIMULADA · 3 ATOS</div>'+
        state.actScores.map(a=>'<div class="judge-row"><span>'+a.act+'</span><b>'+a.me+'</b><b>'+a.cpu+'</b></div>').join('')+
        '<div class="judge-foot">Pontos do minijogo (não são notas oficiais)</div>';
    }
    showScreen('result');sound(victory?'win':'bad');
  }
  function updateHUD(){
    if(!state)return;
    if(mode==='festival'){
      $('roundLabel').textContent=`ATO ${state.round+1} DE 3 · ${state.player.role.name.toUpperCase()}`;
      $('actLabel').textContent=ACTS[Math.min(2,state.round)];
      $('timerLabel').textContent='00:'+String(Math.ceil(Math.max(0,state.roundLen-state.roundTime))).padStart(2,'0');
      $('playerStat').textContent=state.score+' pontos';$('cpuStat').textContent=state.cpuScore+' pontos';
      $('playerBar').style.width=Math.min(100,state.charge)+'%';$('cpuBar').style.width=clamp((state.cpuScore/Math.max(1,state.score+state.cpuScore))*175,8,100)+'%';
      $('comboLabel').textContent='COMBO × '+state.combo;$('festivalCharge').textContent=Math.floor(state.charge)+'%';
      $('festivalPower').disabled=state.charge<100;
      const beat=.82, offset=1.2;
      let next=Math.ceil((state.roundTime-offset)/beat)*beat+offset;
      if(next<offset)next=offset;
      const dist=next-state.roundTime;
      $('beatCue').style.left=`calc(${clamp(50+dist/beat*47,50,96)}% - 11px)`;
      $('beatCue').style.transform='scale('+(dist<.16?1.28:1)+')';
    }else{
      $('roundLabel').textContent=`EQUIPE ${state.playerIndex+1}/3`; $('actLabel').textContent=`${state.player.role.name} × ${state.cpu.role.name}`;
      const s=Math.ceil(Math.max(0,state.remaining));$('timerLabel').textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');
      $('playerStat').textContent=Math.ceil(Math.max(0,state.player.hp))+' HP · '+(3-state.playerIndex)+' lutadores';$('cpuStat').textContent=Math.ceil(Math.max(0,state.cpu.hp))+' HP · '+(3-state.cpuIndex)+' lutadores';
      $('playerBar').style.width=clamp(state.player.hp,0,100)+'%';$('cpuBar').style.width=clamp(state.cpu.hp,0,100)+'%';
      $('duelCharge').textContent=Math.floor(state.player.power)+'%';$('specialBtn').disabled=state.player.power<60;
      $('defendBtn').classList.toggle('engaged',pressed.defend);
    }
  }
  function tapRhythm() {
    if(screen!=='play'||mode!=='festival')return;
    const beat=.82,offset=1.2;
    const n=Math.round((state.roundTime-offset)/beat), diff=Math.abs(state.roundTime-(offset+n*beat));
    if(n>=0 && diff<.265 && n!==state.lastBeat){
      state.lastBeat=n;
      const perfect=diff<.12;state.combo++;
      const points=(perfect?120:80)+Math.min(state.combo,15)*5;
      state.score+=points;state.charge=clamp(state.charge+(perfect?13:9),0,100);
      announce(perfect?'PERFEITO! +'+points:'BOM! +'+points,.46);sound(perfect?'perfect':'select');
      burst(state.player.x,1.9,0,TA[tribe].secondary,perfect?15:8);
    }else{state.combo=0;announce('FORA DO RITMO!',.34);sound('bad');}
    updateHUD();
  }
  function festivalSpecial(){if(screen!=='play'||mode!=='festival'||state.charge<100)return;state.charge=0;state.score+=350;announce('APRESENTAÇÃO ESPECIAL! +350',1.1);burst(state.player.x,2,0,TA[tribe].primary,28);sound('special');updateHUD();}
  $('beatBtn').addEventListener('pointerdown',e=>{e.preventDefault();tapRhythm();});
  $('festivalPower').onclick=festivalSpecial;
  function duelAttack(who,special=false){
    if(screen!=='play'||mode!=='duel'||!state||state.result)return;
    const src=who==='player'?state.player:state.cpu, tgt=who==='player'?state.cpu:state.player;
    if(src.cd>0||src.hp<=0||(special&&src.power<60))return;
    const isPlayer=who==='player';
    src.cd=special?.95:.46;src.attackTime=special?.44:.20;
    if(special)src.power-=60;
    const range=special?3.35:src.role.range;
    if(Math.abs(src.x-tgt.x)<range){
      const damage=(special?29:src.role.attack)*(tgt.defend?.27:1);
      tgt.hp=Math.max(0,tgt.hp-damage);tgt.hitTime=.28;
      src.power=clamp(src.power+(special?0:15),0,100);tgt.power=clamp(tgt.power+6,0,100);
      burst(tgt.x,1.2,0,special?TA[isPlayer?tribe:enemyTeam()].secondary:'#fff3b2',special?21:9);
      if(isPlayer)announce(special?'PODER DA ARENA!':'ACERTO!',.46);
      sound(special?'special':'hit');
    } else if(isPlayer)announce('FORA DE ALCANCE',.37);
    updateHUD();
    if(state.player.hp<=0||state.cpu.hp<=0)progressTeams();
  }
  $('attackBtn').onclick=()=>duelAttack('player');$('specialBtn').onclick=()=>duelAttack('player',true);
  function bindHold(id,key){
    const el=$(id);const release=e=>{pressed[key]=false;el.classList.remove('engaged');};
    el.addEventListener('pointerdown',e=>{e.preventDefault();pressed[key]=true;el.classList.add('engaged');try{el.setPointerCapture(e.pointerId);}catch(_e){}});
    el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
    window.addEventListener('blur',()=>{pressed[key]=false;el.classList.remove('engaged');});
  }
  bindHold('moveLeft','left');bindHold('moveRight','right');bindHold('defendBtn','defend');
  window.addEventListener('keydown',e=>{
    const k=e.key.toLowerCase(), play=screen==='play';
    if(play&&[' ','arrowleft','arrowright','arrowdown'].includes(k))e.preventDefault();
    if(!play)return;
    if(mode==='festival'){
      if((k===' '||k==='enter')&&!e.repeat)tapRhythm();if(k==='e'&&!e.repeat)festivalSpecial();
    } else {
      if(k==='a'||k==='arrowleft')pressed.left=true;
      if(k==='d'||k==='arrowright')pressed.right=true;
      if(k==='k'||k==='arrowdown')pressed.defend=true;
      if(k==='j'&&!e.repeat)duelAttack('player');if(k==='l'&&!e.repeat)duelAttack('player',true);
    }
    if(k==='escape')showScreen('home');
  });
  window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='a'||k==='arrowleft')pressed.left=false;if(k==='d'||k==='arrowright')pressed.right=false;if(k==='k'||k==='arrowdown')pressed.defend=false;});
  window.addEventListener('blur',()=>{pressed.left=pressed.right=pressed.defend=false;});
  document.addEventListener('visibilitychange',()=>{lastFrame=0;});
  function burst(x,y,z,color,n){if(!state)return;for(let i=0;i<n;i++){const a=i*2.4,rad=(.6+rnd(i+now)*1.7);state.particles.push({x,y,z,vx:Math.cos(a)*rad,vy:(1+rnd(i+30))*1.8,vz:Math.sin(a)*rad,ttl:.5+rnd(i+12)*.45,life:1,color});}}
  function progressTeams(){
    if(!state||state.result||mode!=='duel')return;
    let finished=false;
    for(const [key,indexKey,rosterKey,position] of [['player','playerIndex','roster',-2.0],['cpu','cpuIndex','enemyRoster',2.0]]){
      if(state[key].hp>0)continue;
      state[indexKey]++;
      if(state[indexKey]>=3){finished=true;state[indexKey]=3;state[key].hp=0;continue;}
      state[key]={x:position,hp:100,power:0,cd:0.8,attackTime:0,hitTime:0,defend:false,role:state[rosterKey][state[indexKey]]};
      announce('ENTRA '+state[key].role.name.toUpperCase()+' · '+(state[indexKey]+1)+'/3',1.1);
    }
    if(finished)endGame();
  }
  function tick(dt){
    now+=dt;
    if($('toast').classList.contains('show')&&now>toastUntil)$('toast').classList.remove('show');
    if(screen!=='play'||!state||state.result)return;
    state.time+=dt;
    if(mode==='festival'){
      state.roundTime+=dt;
      const b=.82,offset=1.2;
      const beatIndex=Math.floor((state.roundTime-offset+.02)/b);
      if(beatIndex>=0&&beatIndex>state.lastCpuBeat){
        state.lastCpuBeat=beatIndex;
        state.cpuScore+=(Math.random()<.15?30:Math.floor(65+Math.random()*68));
        if(state.roundTime>3 && (beatIndex%3===0))burst(state.cpu.x,1.7,0,TA[enemyTeam()].secondary,6);
      }
      if(state.roundTime>=state.roundLen){
        state.actScores.push({act:ACTS[state.round],me:state.score-state.lastActScore,cpu:state.cpuScore-state.lastActCpu});
        state.lastActScore=state.score;state.lastActCpu=state.cpuScore;
        state.round++;
        if(state.round>=3){endGame();return;}
        state.playerIndex=state.round;state.cpuIndex=state.round;
        state.player.role=state.roster[state.round];state.cpu.role=state.enemyRoster[state.round];
        state.roundTime=0;state.lastBeat=-999;state.lastCpuBeat=-999;state.combo=0;
        announce('ATO '+(state.round+1)+' — '+ACTS[state.round],1.5);
        sound('select');
      }
    } else {
      const p=state.player,c=state.cpu;
      state.remaining=Math.max(0,state.remaining-dt);
      p.cd=Math.max(0,p.cd-dt);c.cd=Math.max(0,c.cd-dt);
      p.attackTime=Math.max(0,p.attackTime-dt);c.attackTime=Math.max(0,c.attackTime-dt);
      p.hitTime=Math.max(0,p.hitTime-dt);c.hitTime=Math.max(0,c.hitTime-dt);
      p.defend=pressed.defend;
      if(!p.defend){const dir=Number(pressed.right)-Number(pressed.left);p.x=clamp(p.x+dir*(2.75*p.role.speed)*dt,-3.6,3.6);}
      const dist=Math.abs(c.x-p.x); c.defend=dist<1.7&&(Math.sin(state.time*4)>0.73);
      if(dist>1.2){ c.x=clamp(c.x+Math.sign(p.x-c.x)*dt*(1.10+Math.sin(state.time*1.3)*.25),-3.6,3.6); }
      else if(dist<.85){ c.x=clamp(c.x-Math.sign(p.x-c.x)*dt*.65,-3.6,3.6); }
      if(dist<1.66&&c.cd<=0){
        if(c.power>=65&&Math.random()<.16)duelAttack('cpu',true);
        else duelAttack('cpu');
      }
      if(p.hp<=0||c.hp<=0)progressTeams();
      if(state.result)return;
      if(state.remaining<=0){endGame();return;}
    }
    state.particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.z+=p.vz*dt;p.vy-=5*dt;p.ttl-=dt;});
    state.particles=state.particles.filter(p=>p.ttl>0);
    state.lastUi+=dt;if(state.lastUi>.065){updateHUD();state.lastUi=0;}
  }

  // ───────────────── 3D ENGINE (software polygons with real XYZ / perspective) ─────────────────
  const V=(x,y,z)=>[x,y,z];
  const add=(a,b)=>V(a[0]+b[0],a[1]+b[1],a[2]+b[2]);
  const sub=(a,b)=>V(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  const mul=(a,n)=>V(a[0]*n,a[1]*n,a[2]*n);
  const cross=(a,b)=>V(a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]);
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const unit=a=>{let l=Math.hypot(...a)||1;return mul(a,1/l);};
  let camera, faces=[];
  function setupCamera(){
    const c=V(Math.sin(now*.12)*.55,7.3,14.8), target=V(0,.85,0);
    const forward=unit(sub(target,c)),right=unit(cross(forward,V(0,1,0))),up=unit(cross(right,forward));
    camera={c,forward,right,up,focal:Math.min(W*1.28,H*1.26),centerY:screen==='play'?H*.52:H*.53};
  }
  function project(p){let r=sub(p,camera.c),z=dot(r,camera.forward);if(z<=.05)return null;const s=camera.focal/z;return [W/2+dot(r,camera.right)*s,camera.centerY-dot(r,camera.up)*s,z];}
  function put(points,color,glow=0){faces.push({points,color,glow});}
  function quad(a,b,c,d,color,glow=0){put([a,b,c,d],color,glow);}
  function rgb(hex){let s=hex.replace('#','');if(s.length===3)s=s.split('').map(c=>c+c).join('');const n=parseInt(s,16);return [(n>>16)&255,(n>>8)&255,n&255];}
  function shade(hex,factor){const col=rgb(hex);return 'rgb('+col.map(x=>Math.round(clamp(x*factor,0,255))).join(',')+')';}
  function box(x,y,z,sx,sy,sz,col,rot=0){
    const cs=Math.cos(rot),sn=Math.sin(rot), pts=[];
    for(const dy of [-1,1]) for(const dz of [-1,1]) for(const dx of [-1,1]){
      const xx=dx*sx/2,zz=dz*sz/2;pts.push(V(x+xx*cs+zz*sn,y+dy*sy/2,z-xx*sn+zz*cs));
    }
    quad(pts[0],pts[1],pts[3],pts[2],col);quad(pts[4],pts[6],pts[7],pts[5],col);
    quad(pts[0],pts[4],pts[5],pts[1],col);quad(pts[2],pts[3],pts[7],pts[6],col);
    quad(pts[0],pts[2],pts[6],pts[4],col);quad(pts[1],pts[5],pts[7],pts[3],col);
  }
  function segment(a,b,rad,color,sides=6){
    const dir=unit(sub(b,a)),base=unit(cross(dir,Math.abs(dir[1])>.92?V(1,0,0):V(0,1,0))),side=unit(cross(dir,base));
    const aa=[],bb=[];
    for(let i=0;i<sides;i++){const t=i/sides*Math.PI*2,v=add(mul(base,Math.cos(t)*rad),mul(side,Math.sin(t)*rad));aa.push(add(a,v));bb.push(add(b,v));}
    for(let i=0;i<sides;i++){const j=(i+1)%sides;quad(aa[i],aa[j],bb[j],bb[i],color);}
    put(aa,color);put(bb,color);
  }
  function sphere(x,y,z,r,col,stacks=4,slices=8,scaleY=1){
    for(let i=0;i<stacks;i++){let lo=-Math.PI/2+i*Math.PI/stacks,hi=-Math.PI/2+(i+1)*Math.PI/stacks;
      for(let j=0;j<slices;j++){let a=j*Math.PI*2/slices,b=(j+1)*Math.PI*2/slices;
        const P=(lat,ang)=>V(x+Math.cos(lat)*Math.cos(ang)*r,y+Math.sin(lat)*r*scaleY,z+Math.cos(lat)*Math.sin(ang)*r);
        quad(P(lo,a),P(lo,b),P(hi,b),P(hi,a),col);
      }
    }
  }
  function disk(x,y,z,outer,inner,color,segments=32){
    for(let i=0;i<segments;i++){const a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments;
      const p=(R,t)=>V(x+Math.sin(t)*R,y,z+Math.cos(t)*R);
      quad(p(inner,a),p(outer,a),p(outer,b),p(inner,b),color);
    }
  }
  function column(x,y,z,h,color){segment(V(x,y,z),V(x,y+h,z),.18,color,7);sphere(x,y+h,z,.26,'#ffe3a0',3,7);}
  function featherFan(x,y,z,palette,scale=1){
    const count=9;
    for(let i=0;i<count;i++){
      let a=-Math.PI*.72+i*(Math.PI*1.44/(count-1));
      const tilt=Math.sin(a)*.83, height=.55+Math.cos(a)*.48;
      const bx=x+Math.sin(a)*.06,by=y,bz=z+.18;
      const tx=x+tilt*.70*scale,ty=y+height*scale,tz=z+.14;
      const mid=V(mix(bx,tx,.56),mix(by,ty,.56),bz+.09);
      let side=.12*scale;
      put([V(bx,by,bz),V(mid[0]-side,mid[1]-.06,mid[2]),V(tx,ty,tz),V(mid[0]+side,mid[1]-.06,mid[2])],palette[i%palette.length],.1);
      quad(V(bx,by,bz+.015),V(bx+.012,by,bz+.02),V(tx+.012,ty,tz+.025),V(tx,ty,tz+.023),'#fff4cc',.2);
    }
    box(x,y-.07,z+.15,.85,.17,.32,'#f6e6b2');
  }
  function character(x,z,team,roleKey,age,active=0,defend=false,hurt=0){
    const t=TA[team],isWarrior=roleKey==='guerreira',isPaje=roleKey==='paje';
    let bounce=screen==='play'&&mode==='festival'?Math.sin(age*8)*.1:Math.sin(age*2.6)*.035;
    if(screen==='play'&&mode==='duel')bounce+=Math.sin(age*4)*.025;
    const y=bounce;
    const scale=isWarrior?.94:1,front=.12;
    // Stage shadow as flattened 3D ellipsoid
    disk(x,-.145,z,.61,0,'#102034',12);
    // sandals, legs, woven sash and torso
    segment(V(x-.23*scale,.83+y,z),V(x-.25*scale,.11+y,z+.11),.145*scale,t.skin);
    segment(V(x+.23*scale,.83+y,z),V(x+.25*scale,.11+y,z+.11),.145*scale,t.skin);
    box(x-.25*scale,.11+y,z+.13,.31,.12,.48,t.dark);
    box(x+.25*scale,.11+y,z+.13,.31,.12,.48,t.dark);
    box(x,.87+y,z,.94,.42,.52,t.dark);
    for(let j=0;j<7;j++){
      const xx=x+(j-3)*.12*scale;
      put([V(xx,.87+y,z+.31),V(xx-.04,.35+y,z+.19),V(xx+.08,.31+y,z+.2)],j%2===0?t.primary:t.secondary);
    }
    box(x,1.49+y,z,.98*scale,.96,.48,isPaje?'#744438':t.skin);
    // clothing graphic diagonal ceremonial sash, not a documentary representation
    quad(V(x-.47,1.95+y,z+.255),V(x-.24,1.96+y,z+.26),V(x+.47,1.10+y,z+.27),V(x+.20,1.10+y,z+.27),t.primary);
    box(x,1.08+y,z,.98,.15,.58,t.secondary);
    let swing=Math.sin(age*(screen==='play'&&mode==='festival'?8:3))*.24;
    let a1=active?Math.sin(age*18)*.55:0;
    const rightHand=V(x+.7,1.22+y+swing+a1,z+.06),leftHand=V(x-.7,1.3+y-swing-a1,z+.05);
    segment(V(x-.50,1.8+y,z),V(x-.61,1.57+y,z),.155,t.skin);
    segment(V(x-.61,1.57+y,z),leftHand,.13,t.skin);
    segment(V(x+.5,1.8+y,z),V(x+.60,1.56+y,z),.155,t.skin);
    segment(V(x+.60,1.56+y,z),rightHand,.13,t.skin);
    if(defend){sphere(x+.28,1.43+y,z+.55,.53,t.secondary,3,8,1.5);}
    sphere(x,2.17+y,z,.38,t.skin,4,8,1.15);
    // facial features and forehead band
    box(x,2.37+y,z+.27,.73,.15,.16,t.secondary);
    box(x-.135,2.2+y,z+.356,.058,.058,.043,'#32251c');box(x+.135,2.2+y,z+.356,.058,.058,.043,'#32251c');
    const pal=team==='munduruku'?[t.primary,t.secondary,t.primary,t.secondary]:[t.secondary,t.primary,t.secondary,t.primary];
    featherFan(x,2.56+y,z,pal,isPaje?.86:1.04);
    if(isPaje){segment(V(x-.84,.72+y,z),V(x-.84,2.8+y,z),.07,'#9c6944',5);sphere(x-.84,2.83+y,z,.14,t.secondary,3,6);}
    if(hurt>0){sphere(x,1.65+y,z+.55,.55,'#f8c66d',3,7,1.2);}
  }
  function house(x,z,roof){
    box(x,.62,z,1.7,1.25,1.55,'#997049');
    box(x,.73,z+.795,.45,.89,.065,'#382f28');
    const peak=V(x,2.37,z),y=1.22,wide=1.3;
    const c=[V(x-wide,y,z-wide),V(x+wide,y,z-wide),V(x+wide,y,z+wide),V(x-wide,y,z+wide)];
    for(let i=0;i<4;i++)put([peak,c[i],c[(i+1)%4]],roof);
  }
  function palm(x,z,seed=0){
    segment(V(x,-.10,z),V(x+.13,2.12,z),.14,'#7b5a43',6);
    for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const ex=x+Math.cos(a)*1.6,ez=z+Math.sin(a)*1.6;
      put([V(x+.13,2.21,z),V(x+.22,2.75,z),V(ex,1.52,ez),V(ex*.6+x*.4,1.83,ez*.6+z*.4)],i%2?'#1b7b65':'#248e65');}
  }
  function renderWorld(){
    if(W<2||H<2)return;
    if(screen==='expedition'&&window.Expedition){
      if(window.Expedition3D?.render(window.Expedition.getState()))return;
      window.Expedition.render(ctx,W,H,now);return;
    }
    const dark=arena==='munduruku';
    const gradient=ctx.createLinearGradient(0,0,0,H);
    if(dark){gradient.addColorStop(0,'#160e32');gradient.addColorStop(.46,'#642b38');gradient.addColorStop(1,'#15111b');}
    else {gradient.addColorStop(0,'#082a4b');gradient.addColorStop(.46,'#175a6e');gradient.addColorStop(1,'#0b293b');}
    ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);
    let halo=ctx.createRadialGradient(W*.53,H*.39,1,W*.53,H*.39,W*.57);halo.addColorStop(0,dark?'#ffac4469':'#58c7e24f');halo.addColorStop(1,'#00000000');ctx.fillStyle=halo;ctx.fillRect(0,0,W,H);
    for(let i=0;i<90;i++){
      const px=rnd(i*14+1)*W,py=rnd(i*25+8)*H*.68;
      ctx.fillStyle=i%3?'#ffebbb69':'#ffffff45';ctx.fillRect(px,py,1.6,1.6);
    }
    setupCamera();faces=[];
    // Stage understructure: sloped low-poly plinth and ceremonial circles
    disk(0,-.5,0,6.4,0,'#162537',40);
    for(let i=0;i<48;i++){const a=i*Math.PI*2/48,b=(i+1)*Math.PI*2/48;
      quad(V(Math.sin(a)*5.85,-.5,Math.cos(a)*5.85),V(Math.sin(b)*5.85,-.5,Math.cos(b)*5.85),V(Math.sin(b)*5.85,-.15,Math.cos(b)*5.85),V(Math.sin(a)*5.85,-.15,Math.cos(a)*5.85),i%2?(dark?'#8b362f':'#15536c'):(dark?'#d78333':'#268ca3'));
    }
    disk(0,-.14,0,5.85,0,dark?'#4b2525':'#12465f',48);
    disk(0,-.125,0,5.4,5.18,dark?'#dca45b':'#50b4b7',48);
    disk(0,-.118,0,4.9,4.81,dark?'#ac4c31':'#83d8de',48);
    disk(0,-.112,0,3.8,3.71,dark?'#c77e3a':'#469db4',48);
    // Geometric radial stage motifs
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6,b=a+.12;
      put([V(Math.sin(a)*4.5,-.10,Math.cos(a)*4.5),V(Math.sin(b)*4.5,-.10,Math.cos(b)*4.5),V(0,-.10,0)],dark?(i%2?'#54272a':'#6c3526'):(i%2?'#19516c':'#145775'));
    }
    for(let i=0;i<23;i++){
      const a=i*Math.PI*2/23,x=Math.cos(a)*7.1,z=Math.sin(a)*7.1;
      if(i%3===0){column(x,-.42,z,2.7,dark?'#a85033':'#437c81');}
      else if(dark){
        box(x,1.12,z,.65,2.45,.60,i%2?'#8e3033':'#9f632b',a);
        box(x,2.3,z,.7,.15,.66,'#edb459',a);
      } else {
        if(i%2===0)palm(x,z,i);else box(x,.37,z,.7,.88,.6,'#277c7a',a);
      }
    }
    if(dark){
      for(const xx of [-9,9]){
        column(xx,-.5,-5,5,'#8f393c');
        for(let j=0;j<3;j++)box(xx+(xx>0?-.3:.3),1+j*1.15,-4.7,.9,.3,.75,j%2?'#efad4b':'#d8493d');
      }
      for(let i=0;i<12;i++){const a=i*Math.PI*2/12;const x=Math.cos(a)*8.5,z=Math.sin(a)*8.5;box(x,1.4,z,.19,2.5,.19,'#bc6c3a');put([V(x,2.6,z),V(x+Math.cos(a+.8)*.85,1.95,z+Math.sin(a+.8)*.85),V(x+Math.cos(a+.8)*.85,2.7,z+Math.sin(a+.8)*.85)],i%2?'#e7c252':'#d5463f');}
    }else{
      house(-8,-4,'#94622f');house(8,-4,'#a57b41');house(-7,6,'#b5904b');house(7,6,'#97704a');
      for(const x of [-10,10])palm(x,4);
      disk(0,-.6,10,12,9,'#1a7997',30);
    }
    // Crowd figures behind the stage
    for(let i=0;i<46;i++){const x=(i-23)*.47,z=-8.2+(i%3)*.22;
      const y=.1+Math.sin(now*2.5+i*.74)*.15;
      sphere(x,.76+y,z,.23,i%2?'#a4634e':'#ce8558',3,5);
      segment(V(x,.58+y,z),V(x,-.4,z),.23,i%3===0?TA.munduruku.dark:TA.muirapinima.dark,5);
    }
    let P={x:-2.0,hitTime:0,attackTime:0,defend:false},C={x:2.0,hitTime:0,attackTime:0,defend:false};
    if(screen==='play'&&state){P=state.player;C=state.cpu;}
    const teamLeft=screen==='play'?tribe:'munduruku', teamRight=screen==='play'?enemyTeam():'muirapinima';
    const roleLeft=screen==='play'?state.player.role.key:'tuxaua',roleRight=screen==='play'?state.cpu.role.key:'guerreira';
    character(P.x,0,teamLeft,roleLeft,now,P.attackTime,P.defend,P.hitTime);
    character(C.x,0,teamRight,roleRight,now+.8,C.attackTime,C.defend,C.hitTime);
    if(state?.particles&&screen==='play')state.particles.forEach(p=>{box(p.x,p.y,p.z,.095,.095,.095,p.color);});
    const visible=[];
    for(const f of faces){
      const pr=f.points.map(project);
      if(pr.some(p=>p===null))continue;
      const dep=pr.reduce((s,p)=>s+p[2],0)/pr.length;
      const ab=sub(f.points[1],f.points[0]),ac=sub(f.points[2],f.points[0]);
      const n=unit(cross(ab,ac));const brightness=clamp(.64+Math.abs(dot(n,unit(V(-.25,.9,.6))))*.32+f.glow,.42,1.15);
      visible.push({pr,dep,color:shade(f.color,brightness)});
    }
    visible.sort((a,b)=>b.dep-a.dep);
    ctx.lineJoin='round';
    for(const f of visible){ctx.beginPath();f.pr.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=f.color;ctx.fill();}
    // Spotlights shimmer over the 3D world
    let rays=ctx.createLinearGradient(0,H*.37,0,H*.81);rays.addColorStop(0,'#ffffff00');rays.addColorStop(.5,dark?'#ffca3910':'#54ddf010');rays.addColorStop(1,'#ffffff00');ctx.fillStyle=rays;ctx.fillRect(0,H*.37,W,H*.44);
  }
  function resize(){const w=window.innerWidth,h=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,1.75);W=w;H=h;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  let renders=0;
  function frame(ts){
    if(!lastFrame)lastFrame=ts;
    const dt=clamp((ts-lastFrame)/1000,0,.05);lastFrame=ts;
    tick(dt);
    if(screen==='expedition'&&window.Expedition)window.Expedition.tick(dt);
    // Paint ~40 FPS max to preserve battery on mobile
    if(ts-renders>24){renderWorld();renders=ts;}
    requestAnimationFrame(frame);
  }
  window.BattleV13={home:()=>showScreen('home'),getTribe:()=>tribe};
  window.addEventListener('resize',resize);resize();updateSelection();requestAnimationFrame(frame);
  if('serviceWorker' in navigator && (location.protocol==='https:' || location.hostname==='localhost')){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.info('PWA não ativado:',e)));
  }
})();
