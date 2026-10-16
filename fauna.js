/* V1.7 · Fauna e lendas da floresta. Encontros fictícios, não simulador de comportamento real.
 * Sem dependências de rede. A fauna é observada/afugentada, não abatida; alguns encontros são amistosos.
 */
'use strict';
(() => {
  const $=id=>document.getElementById(id), PI=Math.PI, TAU=PI*2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rand=n=>{let a=Math.sin(n*107.23+13.78)*41731.234;return a-Math.floor(a);};
  // category, name, emoji, habitat, role, physical style, coords, detection, damage, speed, reward XP, narrative
  const TYPES=[
    ['onca','Onça-pintada','🐆','Mata fechada','predador','cat',-30,-10,10,13,2.7,90,'Aproxime-se com cautela; ela protege seu território.'],
    ['jaguatirica','Jaguatirica','🐈','Trilhas sombreadas','predador','cat',12,-32,7,6,3.1,60,'Felino menor e ágil; foge após ser afugentado.'],
    ['suçuarana','Suçuarana','🐈','Serra','predador','cat',33,-21,10,10,3.0,80,'Um predador silencioso da floresta.'],
    ['sucuri','Sucuri-verde','🐍','Beira do rio','aquatico','snake',-14,19,8,15,1.7,90,'A sucuri é um animal real; no jogo bloqueia a passagem pela água.'],
    ['sucurilenda','Sucuri Lendária','🐍','Enseada profunda','lenda','giantsnake',-5,19,9,16,1.4,165,'Uma sucuri colossal fictícia, diferente da sucuri real, guardiã de um antigo remanso.'],
    ['jararaca','Jararaca','🐍','Folhiço','veneno','snake',1,-13,5,5,1.1,50,'Alerta de serpente venenosa: evite pisar perto.'],
    ['jacare','Jacaré-açu','🐊','Remanso','aquatico','croc',25,17,8,18,1.6,105,'Grande jacaré amazônico; protege o remanso.'],
    ['iguana','Iguana','🦎','Árvore caída','pacifico','lizard',-36,-17,4,0,2.0,45,'Réptil que pode ser observado à distância.'],
    ['sapo','Sapo-cururu','🐸','Poça úmida','pacifico','frog',-18,2,3,0,1.2,45,'Anfíbio noturno; não toque nem perturbe.'],
    ['perereca','Perereca colorida','🐸','Clareira úmida','veneno','frog',29,1,3.6,4,1.0,55,'Na fantasia do jogo, a proximidade causa uma nuvem irritante.'],
    ['harpia','Harpia (gavião-real)','🦅','Dossel','aereo','bird',17,32,10,9,3.2,90,'Ave majestosa; um voo rasante fictício dificulta a travessia.'],
    ['gaviao','Gavião da floresta','🦅','Copas altas','aereo','bird',-8,31,8,7,3.5,65,'Patrulha o céu e faz voos rasantes.'],
    ['caranguejeira','Caranguejeira','🕷','Troncos','veneno','spider',23,-9,4.2,5,1.3,55,'Aranha que protege a toca. Afaste-se com cuidado.'],
    ['escorpiao','Escorpião','🦂','Pedras','veneno','scorpion',-35,28,4,6,1.2,55,'Pequeno e difícil de ver sobre o chão.'],
    ['piranhas','Cardume de piranhas','🐟','Água rasa','aquatico','fish',5,18,5.5,7,2.0,55,'A água esconde um cardume nervoso nesta versão fantasiosa.'],
    ['morcegos','Morcegos','🦇','Gruta','aereo','bird',37,8,6,5,3.6,50,'Revoada noturna ficcional próxima às pedras.'],
    ['boto','Boto-cor-de-rosa','🐬','Canal do rio','amigo','dolphin',-33,18,7,0,1.9,115,'Encontro pacífico: o boto ajuda a recuperar energia.'],
    ['uirapuru','Uirapuru','🐦','Copas da mata','amigo','bird',-21,-31,6,0,2.0,95,'Seu canto indica um caminho seguro na aventura.'],
    ['iara','Iara','🧜','Espelho d’água','lenda','siren',15,20,8,10,1.0,155,'Personagem fantástica que confunde a orientação do viajante.'],
    ['cobragrande','Cobra Grande','🐉','Rio profundo','lenda','giantsnake',36,20,12,21,1.4,210,'Ser lendário colossal e encontro especial de alto risco.'],
    ['boitata','Boitatá','🔥','Trilha encantada','lenda','flamesnake',-4,37,8,12,2.6,135,'Ser fantástico luminoso, guardião dos caminhos nesta história.'],
    ['poraque','Poraquê (puraquê)','⚡','Igarapés e rio','aquatico','eel',-12,19,6,13,1.3,110,'Peixe-elétrico amazônico; descarga é mecânica de fantasia. Evite aproximar-se na água.'],
    ['cobraagua','Cobra-d’água','🐍','Canal e margem','aquatico','snake',30,20,5,5,1.2,65,'Serpente aquática, não necessariamente peçonhenta. Preserve distância e observe.'],
    ['insetosagua','Insetos aquáticos','🪲','Igarapé sombreado','aquatico','waterbug',-26,20,3.9,3,1.1,45,'Pequenos insetos e percevejos aquáticos; o contato do jogo causa irritação.'],
    ['arraia','Arraia de água doce','🐟','Fundo arenoso do rio','aquatico','ray',12,18,4.2,8,1.0,75,'Arraias são fauna real; o risco do cenário é uma simplificação de aventura.'],
    ['marimbondos','Marimbondos','🐝','Colmeia em galhos','veneno','wasp',-2,-4,5,6,2.1,60,'Enxame de marimbondos; não confunda ferroada com picada de cobra.'],
    ['cabas','Cabas (vespas)','🐝','Mata e capoeira','veneno','wasp',19,-3,5,6,2.1,65,'Caba é um nome regional de vespa/marimbondo; mantenha distância de ninhos.'],
    ['pernilongos','Mosquitos','🦟','Beira de igarapé','veneno','mosquito',-23,11,6,2,1.9,45,'Nuvem de mosquitos. Repelente de fantasia previne o encontro durante um tempo.'],
    ['carrapatos','Carrapatos','🕷️','Gramíneas e trilhas','veneno','tick',-11,7,3.8,2,1.0,45,'Parasitas de vegetação, presentes como perigo de exploração.'],
    ['tocandira','Formiga tocandira','🐜','Solo da floresta','veneno','ant',32,29,4.2,5,1.1,65,'Formiga amazônica conhecida por ferroada dolorosa. Evite a colônia.']
  ];
  const entries=Object.freeze(TYPES.map((a,i)=>({id:a[0],name:a[1],emoji:a[2],habitat:a[3],role:a[4],shape:a[5],x:a[6],z:a[7],range:a[8],damage:a[9],speed:a[10],xp:a[11],lore:a[12],idx:i})));
  let state=null, creatures=[], found=new Set(), cooldown=0, currentAlert=null, envTime=0, nextAlertUI=0, ailment={type:'',duration:0,tick:0},kits=3;
  const key=()=>`batalha_fauna_v17_${state.tribe}_${state.arena}`;
  const save=()=>{if(!state)return;try{localStorage.setItem(key(),JSON.stringify({found:[...found]}));}catch(_){}};
  function notify(s,secs=3.5){window.Expedition?.notify?.(s,secs);}
  function start(S){state=S;let stored={};try{stored=JSON.parse(localStorage.getItem(key())||'{}')||{};}catch(_){}
    found=new Set((Array.isArray(stored.found)?stored.found:[]).filter(id=>entries.some(c=>c.id===id)));
    creatures=entries.map(c=>({...c,x:c.x,z:c.z,homeX:c.x,homeZ:c.z,phase:c.idx*1.81,cd:0,retreat:0,alert:0,discovered:found.has(c.id)}));
    cooldown=0;currentAlert=null;nextAlertUI=0;envTime=0;ailment={type:'',duration:0,tick:0};kits=3;
    refreshHUD();
  }
  const distance=c=>Math.hypot(state.x-c.x,state.z-c.z);
  function discover(c){if(found.has(c.id))return;found.add(c.id);c.discovered=true;
    state.score+=c.xp;window.GuardianV14?.addXP(c.xp);window.Expedition?.save?.();save();
    notify(`${c.emoji} BESTIÁRIO: ${c.name} descoberta! +${c.xp} XP`,4);
    refreshHUD();
  }
  function hostile(c){return ['predador','veneno','aquatico','aereo','lenda'].includes(c.role);}
  function insideHabitat(c){const river=Math.abs(state.z-(17.6+1.7*Math.sin(state.x*.097)+.85*Math.cos(state.x*.22)))<5.0;
    if(c.role==='aquatico'||c.id==='iara'||c.id==='cobragrande'||c.id==='sucurilenda')return river;
    return true;
  }
  function statusEffect(c){if(window.SurvivalV19?.onHazard(c))return;if(c.role==='veneno'){ailment={type:'irritação',duration:8,tick:0};}
    else if(['sucuri','sucurilenda','cobragrande'].includes(c.id)){ailment={type:'lentidão',duration:5,tick:0};}
    else if(c.id==='iara'){ailment={type:'desorientação',duration:4,tick:0};}
    else if(c.id==='boitata'){ailment={type:'calor mágico',duration:5,tick:0};}
  }
  function knockOut(){state.hp=100;state.x=-8;state.z=-26;state.stamina=85;
    window.SurvivalV19?.onRescue();
    ailment={type:'',duration:0,tick:0};creatures.forEach(c=>{c.retreat=Math.max(c.retreat,7);});
    notify('🏕 Sua equipe retornou ao acampamento para recuperar a saúde.',5);
  }
  function tick(dt){if(!state||!window.Expedition?.active)return;
    if(['expMedicalDialog','expGearDialog','expFaunaDialog','expFullMap','expInventory','expTrailsDialog','expGuardianDialog'].some(id=>$(id)?.open))return;
    dt=Math.min(.11,Math.max(0,dt));envTime+=dt;cooldown=Math.max(0,cooldown-dt);nextAlertUI-=dt;
    if(ailment.duration>0){ailment.duration=Math.max(0,ailment.duration-dt);if(ailment.type==='irritação'){
      ailment.tick+=dt;if(ailment.tick>=2){ailment.tick=0;state.hp=Math.max(0,state.hp-2);if(state.hp<=0)knockOut();}}
      if(ailment.duration===0)ailment.type='';}
    let closest=null,best=999;
    for(const c of creatures){c.cd=Math.max(0,c.cd-dt);c.retreat=Math.max(0,c.retreat-dt);c.phase+=dt*(c.role==='aereo'?2.2:.85);
      let d=distance(c);
      if(d<12&&!found.has(c.id))discover(c);
      if(c.retreat>0){const away=Math.atan2(c.x-state.x,c.z-state.z);c.x=clamp(c.x+Math.sin(away)*dt*c.speed,-41,41);c.z=clamp(c.z+Math.cos(away)*dt*c.speed,-41,41);}
      else if(hostile(c)&&d<c.range&&insideHabitat(c)){
        if(d>2.5){const a=Math.atan2(state.x-c.x,state.z-c.z);let step=dt*c.speed*(c.role==='veneno'?.57:1);
          if(c.role==='aquatico'||c.id==='iara'||c.id==='cobragrande'||c.id==='sucurilenda'){const z0=17.6+1.7*Math.sin(c.x*.097)+.85*Math.cos(c.x*.22);c.x=clamp(c.x+Math.sin(a)*step,-41,41);c.z=clamp(c.z+Math.cos(a)*step,z0-3.1,z0+3.1);}
          else{c.x=clamp(c.x+Math.sin(a)*step,-41,41);c.z=clamp(c.z+Math.cos(a)*step,-41,41);}}
        if(d<2.8&&c.cd<=0){c.cd=c.role==='veneno'?6:c.role==='lenda'?3.6:4.0;
          if(window.SurvivalV19?.protect(c)){c.retreat=9;continue;}
          const defended=state.tool==='escudo';const amount=Math.max(1,Math.ceil(c.damage*(defended?.20:1)));
          state.hp=Math.max(0,state.hp-amount);state.hit=.35;if(!defended)statusEffect(c);
          notify(`${c.emoji} ${c.name}: ${defended?'escudo bloqueou parte do impacto':'perigo!'} −${amount} vida`,3.2);
          if(state.hp<=0)knockOut();}}
      else {const px=c.homeX+Math.sin(c.phase*.35+c.idx)*2, pz=c.homeZ+Math.cos(c.phase*.25+c.idx)*1.25;
        c.x+=(px-c.x)*Math.min(1,dt*.38);c.z+=(pz-c.z)*Math.min(1,dt*.38);}
      d=distance(c);if(d<best){closest=c;best=d;}
      if(c.role==='amigo'&&d<3.3&&c.cd===0){c.cd=18;
        state.stamina=clamp(state.stamina+22,0,100);state.hp=clamp(state.hp+8,0,100);
        discover(c);notify(`${c.emoji} ${c.name}: encontro amistoso! +8 vida, +22 energia`);}
    }
    currentAlert=closest&&best<15?{creature:closest,d:best}:null;
    if(nextAlertUI<=0){refreshHUD();nextAlertUI=.20;}
  }
  function interact(){if(!state)return false;const near=creatures.filter(c=>distance(c)<4).sort((a,b)=>distance(a)-distance(b))[0];if(!near)return false;
    discover(near);
    if(near.role==='amigo'){state.hp=clamp(state.hp+10,0,100);state.stamina=clamp(state.stamina+20,0,100);notify(`${near.emoji} Você observou ${near.name}; energia recuperada.`);}
    else {near.retreat=Math.max(near.retreat,3.5);notify(`${near.emoji} ${near.name}: registro realizado. Afaste-se para evitar riscos.`);}
    return true;
  }
  function combat(){if(!state)return false;const c=creatures.filter(c=>distance(c)<(state.tool==='arco'?8:4.6)).sort((a,b)=>distance(a)-distance(b))[0];if(!c)return false;
    discover(c);if(state.tool==='escudo'){c.retreat=7;state.stamina=Math.max(0,state.stamina-5);notify(`🛡 ${c.name} recuou diante da defesa.`);}
    else if(c.role==='amigo'){notify(`${c.emoji} ${c.name} é um encontro pacífico. Use COLETAR para observá-lo.`);}
    else {c.retreat=9;state.stamina=Math.max(0,state.stamina-9);notify(`⚔ ${c.name} foi afugentado! Observe, proteja-se e siga seu caminho.`);}
    return true;
  }
  function speedMultiplier(){return ailment.duration>0&&['lentidão','desorientação'].includes(ailment.type)?.52:1;}
  function refreshHUD(){const count=$('expFaunaCount'),warn=$('expFaunaAlert'),meter=$('expSurvivalMeter');
    if(count)count.textContent=`${found.size}/${creatures.length}`;
    if(!state)return;
    if(warn){if(currentAlert){const c=currentAlert.creature;
        warn.hidden=false;warn.dataset.danger=hostile(c)?'high':'low';
        warn.textContent=`${c.emoji} ${c.name.toUpperCase()} · ${Math.round(currentAlert.d)} m${ailment.duration?' · '+ailment.type.toUpperCase():''}`;
      }else{warn.hidden=true;warn.textContent='';}}
    if(meter){meter.style.width=clamp(state.hp,0,100)+'%';meter.parentElement?.setAttribute('aria-label',`Vida ${Math.ceil(state.hp)} de 100`);}
  }
  const statusText=c=>c.role==='amigo'?'Amigável':c.role==='pacifico'?'Observação':c.role==='lenda'?'Lendário':c.role==='veneno'?'Risco de veneno':c.role==='aquatico'?'Risco na água':c.role==='aereo'?'Risco aéreo':'Predador';
  function open(){if(!state)return;const cards=$('expFaunaCards');
    cards.innerHTML=entries.map(c=>`<article class="fauna-card ${found.has(c.id)?'seen':'unknown'}"><div class="fauna-icon">${c.emoji}</div><div><strong>${c.name}</strong><small>${c.habitat} · ${statusText(c)}</small><p>${found.has(c.id)?c.lore:'Explore o habitat para registrar o encontro.'}</p><span>${found.has(c.id)?'✓ DESCOBERTO':'NÃO DESCOBERTO'} · ${c.xp} XP</span></div></article>`).join('');
    $('expFaunaDialog').showModal();
  }
  function mapDraw(ctx,cx,cy,unit,side){if(!state)return;
    for(const c of creatures){if(!found.has(c.id)&&distance(c)>17)continue;
      const x=cx+c.x*unit,y=cy-c.z*unit;
      ctx.beginPath();ctx.arc(x,y,Math.max(2.5,side*.011),0,TAU);
      ctx.fillStyle=c.role==='lenda'?'#de84fd':c.role==='amigo'?'#73f0ce':'#e25e54';ctx.fill();
      ctx.strokeStyle='#0c2430';ctx.lineWidth=1.5;ctx.stroke();
      if(side>250){ctx.fillStyle='#fff9de';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText(c.emoji,x,y-8);}}
  }
  function draw2D(ctx,proj,clampSize){if(!state)return;
    for(const c of creatures){const py=['bird','siren'].includes(c.shape)?2.4:.7;const p=proj(c.x,py,c.z);if(!p||p.d>52)continue;
      const r=clampSize(p.s*.4,c.shape==='giantsnake'?13:7,c.shape==='giantsnake'?90:55);
      ctx.save();ctx.textAlign='center';ctx.shadowBlur=6;ctx.shadowColor=c.role==='lenda'?'#ca95ff':'#15130c';
      ctx.font=`${r}px sans-serif`;ctx.fillText(c.emoji,p.x,p.y);ctx.shadowBlur=0;
      if(p.d<16){ctx.font='bold 10px sans-serif';ctx.fillStyle='#ffe5a4';ctx.fillText(c.name,p.x,p.y-r*.9);}
      ctx.restore();}
  }
  function render3D(m,terrain,t,quality){if(!state)return;
    const economy=quality==='economia';const sphere=(x,y,z,a,b,c,col)=>m.sphere(x,y,z,a,b,c,col,economy?3:5,economy?6:9);
    const seg=(x1,y1,z1,x2,y2,z2,r,col)=>{const dx=x2-x1,dy=y2-y1,dz=z2-z1,len=Math.hypot(dx,dy,dz)||.01;
      // Approximate articulated volume with intersecting spheres, robust on WebGL1.
      let n=economy?3:5;for(let j=0;j<=n;j++){let f=j/n;sphere(x1+dx*f,y1+dy*f,z1+dz*f,r,r*.82,r,col);}};
    for(const c of creatures){const x=c.x,z=c.z,g=terrain(x,z),wob=Math.sin(t*2+c.idx);let y=g+(c.role==='aquatico'?.28:0);
      const col=c.role==='lenda'?'#7569ab':c.id==='onca'?'#c6a454':c.id==='jaguatirica'?'#ae9368':c.id==='suçuarana'?'#b29a71':'#406a46';
      if(['cat'].includes(c.shape)){
        sphere(x,y+.67,z,.76,.43,.42,col);sphere(x+.65,y+.91,z,.36,.36,.34,col);
        for(let side of [-.46,.46])for(let sideZ of [-.30,.30])m.cylinder(x+side,y+.28,z+sideZ,.10,.53,col,5);
        for(let k=0;k<(economy?4:7);k++){let a=(k+1)*.56;sphere(x-.4+Math.sin(a)*.4,y+.99,z+Math.cos(a)*.30,.065,.065,.065,'#30241c');}
        sphere(x+.77,y+1.22,z-.18,.11,.15,.08,col);sphere(x+.77,y+1.22,z+.18,.11,.15,.08,col);
        seg(x-.64,y+.79,z,x-1.35,y+.95+wob*.08,z,.08,col);
      }else if(['snake','giantsnake','flamesnake'].includes(c.shape)){
        const big=c.shape==='giantsnake'?(c.id==='sucurilenda'?2.35:2.8):c.shape==='flamesnake'?1.6:1;
        const color=c.shape==='flamesnake'?'#e97b27':c.shape==='giantsnake'?'#4a6462':'#60865b';
        for(let k=0;k<6;k++){const j=k/5;const sx=x+(j-.5)*big*1.45,sz=z+Math.sin(j*PI*2+t*.8+c.idx)*big*.43;
          sphere(sx,y+.20*big+(.1*Math.sin(j*PI))*big,sz,.41*big,.25*big,.33*big,color);}
        sphere(x+big*.88,y+big*.52,z+.25*big,.43*big,.34*big,.42*big,color);
        if(big>1.5){m.cone(x+big*.9,y+big*.72,z+.25*big,.38*big,.8*big,'#d99a5f',6);}
      }else if(['croc','lizard'].includes(c.shape)){
        const f=c.shape==='croc'?1.7:0.7;const color=c.shape==='croc'?'#485e3e':'#5f985b';
        sphere(x,y+.35*f,z,.9*f,.28*f,.39*f,color);sphere(x+.9*f,y+.31*f,z,.52*f,.18*f,.28*f,color);
        seg(x-.88*f,y+.25*f,z,x-1.70*f,y+.20*f,z,.17*f,color);
        for(let q of [-.5,.5])for(let s of [-.32,.32])sphere(x+q*f,y+.13*f,z+s*f,.24*f,.12*f,.16*f,color);
      }else if(c.shape==='frog'){
        const color=c.id==='sapo'?'#94805a':'#4ebfa4';sphere(x,y+.26,z,.37,.26,.38,color);
        for(let s of [-1,1]){sphere(x+.23,y+.13,z+s*.28,.17,.10,.13,color);sphere(x+.17,y+.43,z+s*.19,.11,.11,.12,'#f4d681');}
      }else if(['spider','scorpion'].includes(c.shape)){
        const color=c.shape==='scorpion'?'#986b4a':'#3a2c2a';sphere(x,y+.25,z,.32,.23,.27,color);
        sphere(x-.33,y+.20,z,.27,.19,.24,color);for(let k=0;k<4;k++)for(let s of [-1,1]){
          const a=k*.24-.4;seg(x+a,y+.27,z+s*.15,x+a-.25,y+.10,z+s*.67,.048,color);}
        if(c.shape==='scorpion')seg(x-.32,y+.20,z,x-.75,y+.75,z,.09,color);
      }else if(['bird'].includes(c.shape)){
        const yy=g+3+Math.sin(t*2+c.idx)*.6;const color=c.id==='uirapuru'?'#ebb857':c.id==='morcegos'?'#57516c':'#857b68';
        sphere(x,yy,z,.41,.27,.30,color);
        const flap=Math.sin(t*5+c.idx)*.5;
        for(let s of [-1,1])m.tri([x,yy,z],[x-.22,yy+flap,z+s*1.55],[x+.36,yy-.07,z+s*.32],color);
        m.cone(x+.49,yy,z,.17,.33,'#d7a95c',5);
      }else if(c.shape==='fish'||c.shape==='dolphin'){
        const color=c.shape==='fish'?'#c0a5a1':'#d68b9b';const f=c.shape==='fish'?.6:1.4;
        sphere(x,y+.27,z,.69*f,.3*f,.32*f,color);
        m.cone(x-.67*f,y+.3,z,.30*f,.52*f,color,5);
        if(c.shape==='fish')for(let j=0;j<3;j++)sphere(x+j*.35,y+.2,z+j*.12,.22,.15,.18,color);
      }else if(c.shape==='eel'){
        const eColor='#596d69';for(let j=0;j<8;j++){const v=j/7;
          sphere(x+(v-.5)*2.7,y+.18+Math.sin(t*2+v*7)*.10,z+Math.sin(v*7+t*.6)*.22,.30,.19,.27,eColor);}
        sphere(x+1.38,y+.24,z,.36,.25,.29,'#789a84');
        for(let k=0;k<3;k++){const a=t*3+k*TAU/3;sphere(x+Math.cos(a)*.72,y+.7,z+Math.sin(a)*.72,.10,.13,.10,'#eddf7c');}
      }else if(c.shape==='ray'){
        sphere(x,y+.20,z,.75,.10,.83,'#988565');
        for(let a of [-1,1])m.tri([x-.1,y+.25,z],[x+.75,y+.17,z+a*1.2],[x-.72,y+.18,z+a*.55],'#bda988');
        seg(x-.6,y+.21,z,x-1.7,y+.19,z,.045,'#988565');
      }else if(['wasp','mosquito','tick','waterbug','ant'].includes(c.shape)){
        const flying=['wasp','mosquito'].includes(c.shape),yy=y+(flying?1.4+Math.sin(t*4+c.idx)*.28:.27);
        const cc=c.shape==='wasp'?'#cfab4e':c.shape==='mosquito'?'#8b9c94':c.shape==='tick'?'#6f4939':c.shape==='waterbug'?'#416b68':'#825c36';
        const r=flying?.23:.28;
        sphere(x,yy,z,r*1.30,r*.73,r,cc);sphere(x+.25,yy+.06,z,.16,.14,.15,cc);
        if(c.shape==='wasp')for(let k=0;k<3;k++)m.box(x+(k-1)*.12,yy,z,.055,.17,.30,'#3f3421');
        for(let a of [-1,1])for(let j=0;j<3;j++)seg(x+(j-1)*.18,yy-.09,z+a*.16,x+(j-1)*.25,yy-.22,z+a*.42,.026,cc);
        if(flying)for(const side of [-1,1])sphere(x-.08,yy+.18,z+side*.22,.23,.045,.21,'#bacbc0');
      }else if(c.shape==='siren'){
        sphere(x,y+.7,z,.58,.34,.35,'#448d83');sphere(x,y+1.5,z,.31,.5,.25,'#bd927b');
        sphere(x,y+2.1,z,.30,.31,.27,'#bb8a70');sphere(x,y+2.33,z-.08,.35,.16,.33,'#273e42');
        m.cone(x,y+.15,z,.65,.8,'#6ab4ad',7);
      }
    }
  }
  function heal(){if(!state)return;if(kits<=0){notify('🌿 Você usou todos os 3 kits desta expedição.');return;}
    if(state.hp>=100&&ailment.duration<=0&&!window.SurvivalV19?.injury){notify('Sua saúde está completa.');return;}
    kits--;state.hp=clamp(state.hp+45,0,100);ailment={type:'',duration:0,tick:0};window.SurvivalV19?.onGenericFirstAid();notify(`🌿 Cura: +45 vida. Restam ${kits} kits. Peçonhas ainda exigem resgate.`);refreshHUD();
    if($('expInventory').open)window.Expedition?.refreshInventory?.();
  }
  function close(){state=null;const d=$('expFaunaDialog');if(d?.open)d.close();if($('expFaunaAlert'))$('expFaunaAlert').hidden=true;}
  function hasSeen(id){return found.has(id);}
  function resetProfile(){for(const a of ['munduruku','muirapinima'])for(const b of ['munduruku','muirapinima'])try{localStorage.removeItem(`batalha_fauna_v17_${a}_${b}`);}catch(_){}}
  $('expFauna').addEventListener('click',open);
  $('expCloseFauna').addEventListener('click',()=>$('expFaunaDialog').close());
  window.FaunaV17={start,tick,combat,interact,render3D,draw2D,mapDraw,open,close,resetProfile,heal,speedMultiplier,refreshHUD,entries,hasSeen,get creatures(){return creatures},get discoveries(){return found.size},get kits(){return kits},get condition(){return ailment.type}};
})();
