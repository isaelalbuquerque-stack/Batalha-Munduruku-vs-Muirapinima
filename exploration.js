/* EXPEDIÇÃO AMAZÔNICA — V1.5.
 * Protótipo offline: mundo 3D por projeção em Canvas 2D, IA local e missão jogável.
 * Não é multiplayer em mundo aberto, nem representação etnográfica de povos reais.
 */
'use strict';
(() => {
  const $=id=>document.getElementById(id), clamp=(a,b,c)=>Math.max(b,Math.min(c,a));
  const TA={munduruku:{name:'MUNDURUKU',region:'UNIVERSO MUNDURUKU',primary:'#e34a37',secondary:'#f4c34b',ground:'#59412e',canopy:'#38614a'},muirapinima:{name:'MUIRAPINIMA',region:'ALDEIA MUIRAPINIMA',primary:'#2189f1',secondary:'#ed425a',ground:'#284c45',canopy:'#23686a'}};
  const OBJ={food:5,fish:2,hunt:2,amulet:3};
  const assets={};['munduruku','muirapinima'].forEach(t=>{const img=new Image();img.src='./assets/'+(t==='munduruku'?'universo-munduruku':'aldeia-muirapinima')+'.webp';assets[t]=img;});
  let active=false,S=null,keys={},joy={x:0,y:0},stickId=null,lookId=null,lookX=0,messageUntil=0,UIclock=0,sessionStarted=0;
  const c0=(key,seed=0)=>{const n=Math.sin(key*127.17+seed*29.81)*45987.13;return n-Math.floor(n);};
  function placeItems(){
    const pos={food:[[-13,-18],[-1,-17],[8,-14],[-21,-3],[-6,4],[21,-1],[5,31],[25,23]],fish:[[-9,14],[9,20],[23,15],[-24,20]],hunt:[[14,-9],[-23,6],[19,26],[-14,31]],amulet:[[-27,19],[24,-2],[5,32],[-4,-35]],enemy:[[8,1],[23,13],[-13,28]]};
    const arr=[];for(const [type,spots] of Object.entries(pos))spots.forEach(([x,z],i)=>arr.push({id:type+i,type,x,z,done:false,t:c0(i),hp:2}));return arr;
  }
  function getSaveKey(){return S.profile==='explorador'?'batalha_expedicao_v18_explorador_'+S.tribe+'_'+S.arena:'batalha_expedicao_v13_'+S.tribe+'_'+S.arena;}
  function save(){try{const collected=S.items.filter(i=>i.done).map(i=>i.id);localStorage.setItem(getSaveKey(),JSON.stringify({collected,score:S.score,goalDone:S.goalDone}));}catch{}}
  function load(){try{const saved=JSON.parse(localStorage.getItem(getSaveKey())||'{}');if(Array.isArray(saved.collected)){S.items.forEach(i=>{i.done=saved.collected.includes(i.id)});S.score=Number(saved.score)||0;S.goalDone=saved.goalDone===undefined?Object.keys(OBJ).every(k=>S.items.filter(i=>i.done&&i.type===k).length>=OBJ[k]):Boolean(saved.goalDone);}}catch{}}
  function start({tribe,arena,role,profile}){
    const safe=TA[tribe]?tribe:'munduruku',rival=safe==='munduruku'?'muirapinima':'munduruku';
    S={tribe:safe,rival,arena:TA[arena]?arena:safe,role,profile:profile==='explorador'?'explorador':'guerreiro',x:-8,z:-26,yaw:0,hp:100,stamina:100,score:0,hit:0,camdrag:0,tool:'lança',aiMode:'seguir',squad:[{x:-10,z:-29,hp:100,angle:0},{x:-5,z:-30,hp:100,angle:0}],items:placeItems(),enemy:[],animals:[],goalDone:false,elapsed:0,lastCombat:0,autoSave:0,cloud:[],objective:'Explore os caminhos e colete alimentos'};
    S.enemy=S.items.filter(i=>i.type==='enemy').map((i,index)=>({id:i.id,x:i.x,z:i.z,homeX:i.x,homeZ:i.z,hp:75,t:index+2,respawn:0,cd:0}));
    S.animals=S.items.filter(i=>i.type==='hunt').map((i,index)=>({id:i.id,x:i.x,z:i.z,homeX:i.x,homeZ:i.z,phase:index*2.13}));
    load();window.GuardianV14?.start(S);window.TrailsV15?.start(S);window.FaunaV17?.start(S);window.AdventureV18?.start(S);window.SurvivalV19?.start(S);window.MythosV18?.start(S);active=true;sessionStarted=performance.now();keys={};joy={x:0,y:0};
    $('expTribe').textContent=S.profile==='explorador'?'EXPLORADOR':TA[safe].name;$('expRegion').textContent=TA[S.arena].region;
    /* O cocar do cabeçalho já vem do HTML, conservando seu cache PWA. */
    document.querySelectorAll('[data-exp-tool]').forEach(b=>b.classList.toggle('selected',b.dataset.expTool===S.tool));
    notify(S.profile==='explorador'?'🧭 EXPEDIÇÃO: equipamentos carregados. Observe a fauna e explore a floresta!':'🌿 EXPEDIÇÃO: proteja a floresta e explore os caminhos!',4);
    updateUI();drawMap();
  }
  function notify(t,seconds=2.4){$('expMessage').textContent=t;$('expMessage').classList.add('visible');messageUntil=performance.now()+seconds*1000;}
  function getCounts(){const n={food:0,fish:0,hunt:0,amulet:0};S.items.forEach(i=>{if(i.done&&i.type in n)n[i.type]++;});return n;}
  function nearest(){let item=null,min=Infinity;for(const e of S.items){if(e.done||e.type==='enemy')continue;const d=Math.hypot(e.x-S.x,e.z-S.z);if(d<min){min=d;item=e;}}return {item,d:min};}
  function interact(){if(!active||!S)return;if(window.SurvivalV19?.interact())return;const {item,d}=nearest();if(d>3.0&&window.FaunaV17?.interact())return;if(!item||d>4){notify('Aproxime-se de um brilho no cenário para coletar ou pescar.');return;}
    if(item.type==='hunt'){if(S.profile==='explorador'){item.done=true;S.score+=110;window.GuardianV14?.addXP(110);notify('🔭 Registro de fauna realizado sem abate! +110 XP');save();updateUI();checkComplete();return;}notify('Para caça simulada, equipe o arco e use CONFRONTO próximo ao animal.');return;}
    item.done=true;window.AdventureV18?.onCollect(item.type);const gain=item.type==='amulet'?150:item.type==='fish'?70:50;S.score+=gain;window.GuardianV14?.addXP(gain);
    notify(item.type==='food'?'🌿 Alimento coletado! +50':item.type==='fish'?'🐟 Pescaria concluída! +70':'💎 Amuleto de fantasia encontrado! +150');
    save();updateUI();checkComplete();
  }
  function combat(){if(!active||!S)return;const t=performance.now();if(t-S.lastCombat<600)return;S.lastCombat=t;
    if(window.AdventureV18?.attack())return;
    if(window.GuardianV14?.combat())return;
    if(window.FaunaV17?.combat())return;
    let nearestEnemy=null,min=Infinity;for(const e of S.enemy){if(e.hp<=0)continue;const d=Math.hypot(S.x-e.x,S.z-e.z);if(d<min){min=d;nearestEnemy=e;}}
    const animals=S.animals.filter(a=>!S.items.find(i=>i.id===a.id).done);
    let wild=null,wDist=Infinity;for(const a of animals){const d=Math.hypot(S.x-a.x,S.z-a.z);if(d<wDist){wDist=d;wild=a;}}
    if(S.tool==='arco'&&wild&&wDist<7&&(wDist<min||min>3.0)){
      const i=S.items.find(i=>i.id===wild.id);i.hp--;if(i.hp<=0){i.done=true;S.score+=110;window.GuardianV14?.addXP(110);notify('🏹 Caçada de fantasia concluída! +110');save();checkComplete();}else notify('Acertou o alvo fictício. Mais um disparo!');updateUI();return;
    }
    const reach=S.tool==='arco'?8:S.tool==='lança'?3.5:2.7;
    if(S.tool==='escudo'){S.hp=Math.min(100,S.hp+6);notify('🛡 Defesa ativada. +6 resistência');return;}
    if(nearestEnemy&&min<reach){nearestEnemy.hp=Math.max(0,nearestEnemy.hp-(S.tool==='arco'?20:34));notify('⚔ Confronto de fantasia: adversário recuando!');
      if(!nearestEnemy.hp){S.score+=85;window.GuardianV14?.addXP(85);nearestEnemy.respawn=12;notify('🏆 Equipe rival derrotada nesta área! +85');save();}updateUI();return;}
    if(wild&&wDist<6){notify('Equipe o ARCO para concluir a caçada de fantasia.');return;}
    notify('Nenhum alvo ao alcance. Explore outras áreas.');
  }
  function tick(dt){if(!active||!S)return;
    S.elapsed+=dt;UIclock+=dt;const f=Math.sin(S.yaw),g=Math.cos(S.yaw);
    let ax=joy.x + Number(!!(keys.d||keys.arrowright))-Number(!!(keys.a||keys.arrowleft));
    let az=-joy.y + Number(!!(keys.w||keys.arrowup))-Number(!!(keys.s||keys.arrowdown));
    const length=Math.hypot(ax,az);if(length>1){ax/=length;az/=length;}
    const moving=Math.hypot(ax,az)>.1;const sprint=keys.shift||keys.run;
    const speed=(sprint&&S.stamina>2?8:4.4)*(S.z>13&&S.z<22?.72:1)*(window.FaunaV17?.speedMultiplier()||1);
    S.x=clamp(S.x+(f*az+g*ax)*dt*speed,-43,43);
    S.z=clamp(S.z+(g*az-f*ax)*dt*speed,-43,43);
    S.stamina=clamp(S.stamina+(moving&&sprint?-22:14)*dt,0,100);
    S.hit=Math.max(0,S.hit-dt);
    S.squad.forEach((a,i)=>{
      const angle=S.yaw+Math.PI;const offsetX=Math.sin(angle+i*.85-.38)*(3+i*.7), offsetZ=Math.cos(angle+i*.85-.38)*(3+i*.7);
      const targetX=S.aiMode==='seguir'?S.x+offsetX:a.x, targetZ=S.aiMode==='seguir'?S.z+offsetZ:a.z;
      let dx=targetX-a.x,dz=targetZ-a.z,len=Math.hypot(dx,dz);if(len>.1){a.x+=dx/len*Math.min(len,dt*6);a.z+=dz/len*Math.min(len,dt*6);}a.angle=S.yaw;
    });
    for(const a of S.animals){const i=S.items.find(q=>q.id===a.id);if(i.done)continue; a.phase+=dt*.9;a.x=a.homeX+Math.sin(a.phase)*2.4;a.z=a.homeZ+Math.cos(a.phase*.7)*2.0;}
    for(const e of S.enemy){
      if(e.hp<=0){e.respawn-=dt;if(e.respawn<=0){e.hp=75;e.x=e.homeX;e.z=e.homeZ;}continue;}
      const d=Math.hypot(e.x-S.x,e.z-S.z);
      if(d<13){
        const dx=S.x-e.x,dz=S.z-e.z;
        if(d>3.1){e.x+=dx/d*dt*1.3;e.z+=dz/d*dt*1.3;}
        e.cd-=dt;
        if(d<3.6&&e.cd<=0){e.cd=2.7;
          const ally=(window.GuardianV14?.mode==='solo'?[]:S.squad).find(a=>Math.hypot(a.x-e.x,a.z-e.z)<3.4);
          if(ally){e.hp=Math.max(0,e.hp-10);if(e.hp===0){e.respawn=12;S.score+=85;window.GuardianV14?.addXP(85);save();notify('Seus aliados defenderam a aldeia! +85');}}else{S.hp=Math.max(0,S.hp-8);S.hit=.25;notify('⚔ Um rival atingiu sua equipe. Afaste-se ou defenda!');}
          if(S.hp<=0){S.hp=100;S.x=-8;S.z=-26;S.stamina=100;notify('Sua equipe retornou à base para se recuperar.',4);}
        }
      }else {e.x+=Math.sin(S.elapsed*.5+e.t)*dt*.32;e.z+=Math.cos(S.elapsed*.6+e.t)*dt*.32;}
    }
    window.GuardianV14?.tick(dt);window.TrailsV15?.tick(dt);window.FaunaV17?.tick(dt);window.AdventureV18?.tick(dt);window.SurvivalV19?.tick(dt);window.MythosV18?.tick(dt);
    if(UIclock>.25){updateUI();drawMap();UIclock=0;}
    if(performance.now()>messageUntil)$('expMessage').classList.remove('visible');
  }
  function checkComplete(){const a=getCounts(),all=Object.keys(OBJ).every(k=>a[k]>=OBJ[k]);if(all&&!S.goalDone){S.goalDone=true;S.score+=500;window.GuardianV14?.addXP(500);notify('🏆 MISSÃO CONCLUÍDA! Aldeia abastecida. +500 pontos!',7);save();} }
  function updateUI(){if(!S)return;const a=getCounts(),quota=Object.keys(OBJ).reduce((v,k)=>v+Math.min(a[k],OBJ[k]),0);
    $('expProgress').style.width=(quota/12*100)+'%';$('expMissionCount').textContent=`${a.food}/5 alimentos · ${a.fish}/2 peixes · ${a.hunt}/2 ${S.profile==='explorador'?'registros':'caças'} · ${a.amulet}/3 amuletos`;
    $('expObjective').textContent=S.goalDone?'MISSÃO CONCLUÍDA · +500 XP':`${S.profile==='explorador'?'Explorador · '+TA[S.arena].region:'Equipe '+TA[S.tribe].name} · ${S.score} pontos`;
    const near=nearest();const kind={food:'alimentos',fish:'ponto de pesca',hunt:S.profile==='explorador'?'observação de fauna':'animal fictício',amulet:'amuleto'};
    $('expHint').textContent=near.item?`Perto de ${kind[near.item.type]} · ${Math.round(near.d)} m | Vida ${Math.ceil(S.hp)} · Energia ${Math.ceil(S.stamina)} · ${S.aiMode==='seguir'?'equipe seguindo':'equipe defendendo'}`:'Explore o mapa para localizar recursos.';
    const name=S.tribe==='munduruku'?'Munduruku':'Muirapinima';
    $('expSquad').textContent=window.GuardianV14?.mode==='solo'?`♙ ${S.profile==='explorador'?'EXPLORADOR':name} SOLO | ${Math.ceil(S.hp)} ♥`:`◈ ${S.profile==='explorador'?'EXPEDIÇÃO CIVIL':name} 3/3 | ${Math.ceil(S.hp)} ♥ · 2 aliados IA`;
  }
  const mapCircle=(ctx,x,y,r,col)=>{ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fillStyle=col;ctx.fill()};
  function mapDraw(canvas){if(!S)return;const context=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
    context.clearRect(0,0,w,h);const side=Math.min(w,h),unit=side/90,cx=w/2,cy=h/2;
    context.fillStyle=S.arena==='munduruku'?'#263c2f':'#1e4f50';context.fillRect(0,0,w,h);
    for(let i=0;i<32;i++){const x=(c0(i,3)-.5)*80,z=(c0(i,7)-.5)*80;mapCircle(context,cx+x*unit,cy-z*unit,2+c0(i,5)*4,'#396b4d');}
    context.fillStyle='#267eb2';context.fillRect(0,cy-22*unit,w,9*unit);
    const color={food:'#f5d371',fish:'#44bfff',hunt:'#f5a16e',amulet:'#d99aff'};
    for(const item of S.items){if(item.done||item.type==='enemy')continue;mapCircle(context,cx+item.x*unit,cy-item.z*unit,Math.max(2,side*.012),color[item.type]);}
    window.GuardianV14?.mapDraw(context,cx,cy,unit,side);window.TrailsV15?.mapDraw(context,cx,cy,unit,side);window.FaunaV17?.mapDraw(context,cx,cy,unit,side);window.SurvivalV19?.mapDraw(context,cx,cy,unit,side);
    for(const e of S.enemy)if(e.hp>0)mapCircle(context,cx+e.x*unit,cy-e.z*unit,Math.max(2,side*.012),'#ff5359');
    for(const a of S.squad)mapCircle(context,cx+a.x*unit,cy-a.z*unit,3,'#e9f6ff');
    mapCircle(context,cx+S.x*unit,cy-S.z*unit,Math.max(4,side*.016),'#ffffff');
    context.strokeStyle='#ffffff';context.lineWidth=2;context.beginPath();context.moveTo(cx+S.x*unit,cy-S.z*unit);context.lineTo(cx+(S.x+Math.sin(S.yaw)*5)*unit,cy-(S.z+Math.cos(S.yaw)*5)*unit);context.stroke();
    context.strokeStyle='#f7c575';context.lineWidth=2;context.strokeRect(1,1,w-2,h-2);
  }
  function drawMap(){mapDraw($('expMinimap'));if($('expFullMap').open)mapDraw($('expBigMap'));}
  function inventory(){if(!S)return;const a=getCounts();$('expInventoryContent').innerHTML=
    `<div class="exp-inventory-counters"><div>🌿 Alimentos <b>${a.food}/5</b></div><div>🐟 Pesca <b>${a.fish}/2</b></div><div>${S.profile==='explorador'?'🔭 Registros de fauna':'🏹 Caçada fictícia'} <b>${a.hunt}/2</b></div><div>💎 Amuletos <b>${a.amulet}/3</b></div></div><p>🏆 Pontuação: <strong>${S.score}</strong> · Perfil: ${S.profile==='explorador'?'Explorador':'Guerreiro'} · Região: ${TA[S.arena].region}</p><p>Use os ícones da barra inferior para selecionar seu equipamento.</p>${window.AdventureV18?.inventoryHTML()||''}<p><button type="button" id="expInventoryMedical" class="secondary-btn">🧰 ABRIR KIT MÉDICO E BOTÂNICO</button></p>${window.GuardianV14?.inventoryHTML()||''}<div class="fauna-firstaid"><p>🌿 Kit de primeiros socorros: <b>${window.FaunaV17?.kits??0}</b> restantes. Recupera 45 de vida e remove efeitos temporários.</p><button type="button" id="expHeal" class="secondary-btn">🌿 USAR KIT</button></div><p>Os amuletos dos Guardiões são salvos por tribo e não são apagados ao reiniciar coletas.</p><button id="expRestart" class="secondary-btn">REINICIAR EXPEDIÇÃO E COLETAS</button>`;
    $('expHeal').onclick=()=>window.FaunaV17?.heal();window.AdventureV18?.bindInventory();$('expInventoryMedical')?.addEventListener('click',()=>{ $('expInventory').close();window.SurvivalV19?.open();});
    $('expRestart').onclick=()=>{if(confirm('Reiniciar esta expedição? Pontuação e coletas locais serão apagadas.')){try{localStorage.removeItem(getSaveKey());window.SurvivalV19?.resetCurrent();}catch{}const opts={tribe:S.tribe,arena:S.arena,role:S.role,profile:S.profile};start(opts);$('expInventory').close();}};
    $('expInventory').showModal();
  }
  // ─── Projection: simple third-person perspective of XYZ landscape
  let cam;
  function camera(W,H){const sn=Math.sin(S.yaw),cs=Math.cos(S.yaw),upPitch=.25;
    const pos=[S.x-sn*9,5.4,S.z-cs*9],target=[S.x+sn*11,1.7,S.z+cs*11];
    let fw=target.map((v,i)=>v-pos[i]);const l=Math.hypot(...fw);fw=fw.map(v=>v/l);
    const rt=[cs,0,-sn],up=[fw[1]*rt[2]-fw[2]*rt[1],fw[2]*rt[0]-fw[0]*rt[2],fw[0]*rt[1]-fw[1]*rt[0]];
    cam={pos,fw,rt,up,focus:Math.min(W*1.35,H*1.32),W,H,cy:H*.33};
  }
  function proj(x,y,z){const v=[x-cam.pos[0],y-cam.pos[1],z-cam.pos[2]],depth=v[0]*cam.fw[0]+v[1]*cam.fw[1]+v[2]*cam.fw[2];if(depth<.8)return null;
    const scale=cam.focus/depth;return {x:cam.W*.5+(v[0]*cam.rt[0]+v[2]*cam.rt[2])*scale,y:cam.cy-(v[0]*cam.up[0]+v[1]*cam.up[1]+v[2]*cam.up[2])*scale,d:depth,s:scale};
  }
  function polygon(ctx,points,color){if(points.some(p=>!p))return;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=color;ctx.fill();}
  function ground(ctx,W,H){const near=40,firstX=Math.floor((S.x-near)/5)*5,lastX=Math.ceil((S.x+near)/5)*5,firstZ=Math.floor((S.z-near)/5)*5,lastZ=Math.ceil((S.z+near)/5)*5;
    for(let z=firstZ;z<lastZ;z+=5)for(let x=firstX;x<lastX;x+=5){const water=z>=13&&z<23;const rand=c0(x/5+55,z/5+3);const col=water?(rand>.5?'#287da2':'#278cac'):(S.arena==='munduruku'?(rand>.5?'#68563a':'#65573e'):(rand>.5?'#356956':'#457863'));polygon(ctx,[proj(x,-.27,z),proj(x+5,-.27,z),proj(x+5,-.27,z+5),proj(x,-.27,z+5)],col);}
    for(let x=-40;x<40;x+=8){polygon(ctx,[proj(x,-.24,13),proj(x+1.9,-.24,13),proj(x+1.9,-.24,23),proj(x,-.24,23)],'#325064');}
  }
  const colors={munduruku:['#e24232','#eebf4d','#af342c'],muirapinima:['#1e7edb','#e74953','#284fa0']};
  function drawChar(ctx,x,z,team,scale=1,isHero=false,phase=0){const foot=proj(x,0,z),head=proj(x,2.55*scale,z);if(!foot||!head||foot.d>58)return;
    const t=colors[team]||['#7c8254','#c4b78d','#40574b'],w=clamp(foot.s*.34*scale,6,160),h=clamp(foot.y-head.y,24,360);if(foot.x<-w*2||foot.x>cam.W+w*2)return;
    ctx.save();ctx.translate(foot.x,foot.y);
    ctx.fillStyle='#0006';ctx.beginPath();ctx.ellipse(0,2,w*.59,w*.16,0,0,Math.PI*2);ctx.fill();
    const yy=-h;
    ctx.fillStyle='#503c30';ctx.fillRect(-w*.23,-h*.32,w*.17,h*.31);ctx.fillRect(w*.07,-h*.32,w*.17,h*.31);
    ctx.fillStyle=t[0];ctx.fillRect(-w*.41,-h*.64,w*.82,h*.36);
    ctx.fillStyle='#c68658';ctx.fillRect(-w*.51,-h*.58,w*.16,h*.3);ctx.fillRect(w*.35,-h*.58,w*.16,h*.3);
    ctx.fillStyle='#ba7d53';ctx.beginPath();ctx.arc(0,-h*.76,w*.29,0,Math.PI*2);ctx.fill();
    for(let j=(team==='explorador'?0:-4);j<=(team==='explorador'?-1:4);j++){
      const angle=j/4,fx=Math.sin(angle*1.3)*w*.7;
      ctx.beginPath();ctx.moveTo(fx*.32,-h*.88);ctx.quadraticCurveTo(fx*1.17,-h*(1.10+Math.cos(angle*1.4)*.1),fx,-h*(1.21+Math.cos(angle)*.1));ctx.quadraticCurveTo(fx*.44,-h*1.02,fx*.32,-h*.88);ctx.fillStyle=t[Math.abs(j)%3];ctx.fill();
    }
    ctx.fillStyle=t[1];ctx.fillRect(-w*.34,-h*.94,w*.68,h*.065);if(team==='explorador'){ctx.fillStyle='#4b5136';ctx.fillRect(-w*.40,-h*.91,w*.80,h*.08);ctx.fillRect(-w*.18,-h*.97,w*.36,h*.10);ctx.fillStyle='#3d4c43';ctx.fillRect(-w*.57,-h*.65,w*.22,h*.24);}
    if(isHero){ctx.strokeStyle='#fff8cd';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-h*.56,w*.50,h*.36,0,0,Math.PI*2);ctx.stroke();}
    ctx.restore();
  }
  function tree(ctx,x,z,i){const f=proj(x,0,z),top=proj(x,4.2,z);if(!f||!top||f.d>56)return;const h=f.y-top.y;if(h<6||f.x< -170||f.x>cam.W+170)return;
    const w=clamp(h*.12,2,23);
    ctx.strokeStyle='#614932';ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(top.x,top.y+h*.16);ctx.stroke();
    let leafCol=i%4===0?'#456b3c':i%5===0?'#3a684d':'#264f41';if(S.arena==='muirapinima')leafCol=i%3===0?'#397969':'#235d58';
    ctx.fillStyle=leafCol;
    for(let k=0;k<4;k++){const bx=top.x+(k-1.5)*h*.20,by=top.y+h*(k%2)*.085,r=clamp(h*(.19+(k%3)*.03),8,130);
      ctx.beginPath();ctx.ellipse(bx,by,r,r*.71,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#ffffff08';ctx.beginPath();ctx.ellipse(top.x-h*.12,top.y-h*.1,h*.16,h*.11,0,0,6.29);ctx.fill();
  }
  function house(ctx,x,z){const f=proj(x,0,z),up=proj(x,3.5,z);if(!f||!up||f.d>55)return;const h=f.y-up.y,w=h*.66;if(w<10)return;
    ctx.fillStyle='#886a49';ctx.fillRect(f.x-w*.4,up.y+h*.37,w*.8,h*.63);
    polygon(ctx,[{x:f.x-w*.62,y:up.y+h*.36},{x:f.x,y:up.y},{x:f.x+w*.62,y:up.y+h*.36}],S.arena==='munduruku'?'#ae7145':'#9f7958');
    ctx.fillStyle='#3b2b22';ctx.fillRect(f.x-w*.12,f.y-h*.32,w*.25,h*.32);
    ctx.fillStyle=S.tribe==='munduruku'?'#d45a3c':'#2266a4';ctx.fillRect(f.x-w*.6,up.y+h*.36,w*.12,h*.48);
  }
  function drawItem(ctx,i){const f=proj(i.x,.05,i.z),above=proj(i.x,1.3,i.z);if(!f||!above||f.d>55)return;const t=S.elapsed*2+i.t;const r=clamp(f.s*.19,4,20);
    const col={food:'#f2c966',fish:'#59cdff',amulet:'#dfa5ff',hunt:'#d7a979'}[i.type];
    ctx.fillStyle=col+'55';ctx.beginPath();ctx.arc(f.x,above.y+Math.sin(t)*6,r*2.1,0,6.283);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(f.x,above.y+Math.sin(t)*6,r,0,6.283);ctx.stroke();
    ctx.fillStyle=col;ctx.font=`${clamp(r*1.6,13,28)}px system-ui`;ctx.textAlign='center';ctx.fillText(({food:'✦',fish:'◆',amulet:'◈',hunt:'♧'})[i.type],f.x,above.y+Math.sin(t)*6+r*.53);
    if(f.d<23){ctx.font='bold 11px system-ui';ctx.fillStyle='#fff5db';ctx.fillText(({food:'ALIMENTO',fish:'PESCA',amulet:'AMULETO',hunt:'CAÇA SIMULADA'})[i.type],f.x,above.y-r-14);}
  }
  function render(ctx,W,H,time){if(!S)return;ctx.save();ctx.clearRect(0,0,W,H);
    const sky=ctx.createLinearGradient(0,0,0,H);const warm=S.arena==='munduruku';sky.addColorStop(0,warm?'#36263a':'#122b4d');sky.addColorStop(.55,warm?'#9b593b':'#366e83');sky.addColorStop(1,warm?'#281d22':'#102a31');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    const art=assets[S.arena];if(art?.complete&&art.naturalWidth){ctx.globalAlpha=.18;const ar=art.width/art.height;const drawH=H*.67,drawW=drawH*ar;ctx.drawImage(art,(W-drawW)/2,-drawH*.09,drawW,drawH);ctx.globalAlpha=1;}
    const sun=ctx.createRadialGradient(W*.72,H*.25,2,W*.72,H*.25,W*.37);sun.addColorStop(0,warm?'#fcbf7764':'#57aaff3a');sun.addColorStop(1,'#00000000');ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
    camera(W,H);ground(ctx,W,H);
    // depth-sort scenery and interactive sprites as impostors in a freely traversable XYZ map
    const sprites=[];for(let i=0;i<73;i++){let x=(c0(i,4)-.5)*85,z=(c0(i,9)-.5)*85;if(z>9&&z<24)continue;if(Math.hypot(x-S.x,z-S.z)<5)continue;sprites.push({x,z,draw:()=>tree(ctx,x,z,i)});}
    for(const h of [[-24,-30],[27,-29],[-28,33],[27,34]])sprites.push({x:h[0],z:h[1],draw:()=>house(ctx,...h)});
    for(const i of S.items)if(!i.done&&i.type!=='enemy')sprites.push({x:i.x,z:i.z,draw:()=>drawItem(ctx,i)});
    for(const b of (window.GuardianV14?.data?.bosses||[]))if(!window.GuardianV14.data.defeated.includes(b.id))sprites.push({x:b.x,z:b.z,draw:()=>window.GuardianV14.draw(ctx,b,proj,clamp)});
    for(const p of (window.TrailsV15?.POINTS||[]))sprites.push({x:p.x,z:p.z,draw:()=>window.TrailsV15.draw(ctx,p,proj,clamp)});
    for(const e of S.enemy)if(e.hp>0)sprites.push({x:e.x,z:e.z,draw:()=>drawChar(ctx,e.x,e.z,S.rival,.92)});
    for(const a of (window.GuardianV14?.mode==='solo'?[]:S.squad))sprites.push({x:a.x,z:a.z,draw:()=>drawChar(ctx,a.x,a.z,S.profile==='explorador'?'explorador':S.tribe,.94)});
    for(const a of S.animals){if(S.items.find(i=>i.id===a.id).done)continue; sprites.push({x:a.x,z:a.z,draw:()=>{let p=proj(a.x,.25,a.z);if(!p)return;const r=clamp(p.s*.23,4,28);ctx.fillStyle='#9b7a4c';ctx.beginPath();ctx.ellipse(p.x,p.y,r*1.4,r*.70,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x+r*.9,p.y-r*.3,r*.48,0,6.283);ctx.fill();}});}
    sprites.push({x:S.x,z:S.z,draw:()=>drawChar(ctx,S.x,S.z,S.profile==='explorador'?'explorador':S.tribe,1.08,true)});
    sprites.sort((a,b)=>{const pa=proj(a.x,0,a.z),pb=proj(b.x,0,b.z);return (pb?.d||0)-(pa?.d||0)});
    for(const o of sprites)o.draw();
    window.FaunaV17?.draw2D(ctx,proj,clamp);window.SurvivalV19?.draw2D(ctx,proj,clamp);window.MythosV18?.render2D(ctx,W,H);
    if(S.hit>0){ctx.fillStyle='#f2353a35';ctx.fillRect(0,0,W,H);}
    const fog=ctx.createLinearGradient(0,0,0,H);fog.addColorStop(0,'#07101c36');fog.addColorStop(.75,'#09142500');fog.addColorStop(1,'#05101a70');ctx.fillStyle=fog;ctx.fillRect(0,0,W,H);
    ctx.restore();
  }
  // Touch joystick, drag camera + keyboard: controls all functional and do not trigger page scrolling.
  const joyArea=$('expJoystick'),stick=$('expStick');
  function updateJoy(e){const rect=joyArea.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
    const dx=e.clientX-cx,dy=e.clientY-cy,dist=Math.hypot(dx,dy),rad=rect.width*.32,scale=Math.min(1,rad/(dist||1));
    joy.x=dx*scale/rad;joy.y=dy*scale/rad;stick.style.transform=`translate(${joy.x*rad}px,${joy.y*rad}px)`;
  }
  joyArea.addEventListener('pointerdown',e=>{e.preventDefault();stickId=e.pointerId;joyArea.setPointerCapture(e.pointerId);updateJoy(e);});
  joyArea.addEventListener('pointermove',e=>{if(e.pointerId===stickId)updateJoy(e);});
  function stopJoy(e){if(stickId===null||e&&e.pointerId!==stickId)return;stickId=null;joy={x:0,y:0};stick.style.transform='translate(0px,0px)';}
  ['pointerup','pointercancel','lostpointercapture'].forEach(k=>joyArea.addEventListener(k,stopJoy));
  // Camera look by dragging the game world outside interactive HUD
  const stage=$('expLookArea');stage.addEventListener('pointerdown',e=>{if(!active||lookId!==null)return;lookId=e.pointerId;lookX=e.clientX;try{stage.setPointerCapture(e.pointerId);}catch{}});
  stage.addEventListener('pointermove',e=>{if(!active||lookId!==e.pointerId||!S)return;S.yaw=clamp(S.yaw+(e.clientX-lookX)*.005,-1000,1000);lookX=e.clientX;});
  const stopLook=e=>{if(e.pointerId===lookId)lookId=null;};['pointerup','pointercancel','lostpointercapture'].forEach(k=>stage.addEventListener(k,stopLook));
  window.addEventListener('keydown',e=>{if(!active||!S||document.activeElement?.tagName==='INPUT')return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown',' ','shift'].includes(k))e.preventDefault();keys[k]=true;
    if(e.repeat)return;if(k===' '||k==='f')interact();if(k==='j')combat();if(k==='e')toggleCommand();if(k==='q')S.yaw-=.18;if(k==='r')S.yaw+=.18;if(k==='i')inventory();if(k==='m')openMap();if(k==='escape')exit();});
  window.addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
  window.addEventListener('blur',()=>{keys={};stopJoy();});
  $('expInteract').onclick=interact;$('expAttack').onclick=combat;
  function toggleCommand(){if(!S)return;if(window.GuardianV14?.mode==='solo'){notify('No desafio solo você enfrenta os Guardiões sozinho. Selecione equipe no painel GUARDIÕES.');return;}S.aiMode=S.aiMode==='seguir'?'defender':'seguir';notify(S.aiMode==='seguir'?'♟ Equipe seguindo você':'🛡 Equipe defendendo a posição');}
  $('expCommand').onclick=toggleCommand;
  $('expRun').addEventListener('pointerdown',e=>{e.preventDefault();keys.run=true;try{$('expRun').setPointerCapture(e.pointerId);}catch{}});
  ['pointerup','pointercancel','lostpointercapture'].forEach(k=>$('expRun').addEventListener(k,()=>keys.run=false));
  document.querySelectorAll('[data-exp-tool]').forEach(b=>b.onclick=()=>{if(!S)return;S.tool=b.dataset.expTool;document.querySelectorAll('[data-exp-tool]').forEach(x=>x.classList.toggle('selected',x===b));if(S.tool==='bolsa')inventory();else notify('Ferramenta selecionada: '+b.textContent.trim());});
  function openMap(){if(!S)return;$('expFullMap').showModal();drawMap();}
  $('expMapBtn').onclick=openMap;$('expCloseMap').onclick=()=>$('expFullMap').close();
  $('expCloseInventory').onclick=()=>$('expInventory').close();
  function exit(){keys={};stopJoy();active=false;window.GuardianV14?.onClose();window.TrailsV15?.onClose();window.FaunaV17?.close();window.AdventureV18?.close();window.SurvivalV19?.close();window.MythosV18?.close();$('expInventory').close();$('expFullMap').close();window.BattleV13.home();}
  $('expLeave').onclick=exit;
  window.Expedition={start,tick,render,notify,save,refreshInventory:()=>{if(S&&$('expInventory').open){$('expInventory').close();inventory();}},getState:()=>active?S:null,get active(){return active},set active(v){active=Boolean(v)}};
})();
