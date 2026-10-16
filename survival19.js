/* V1.9 — Sobrevivência na floresta: recursos, botânica, perigos aquáticos e resgate.
   Sistema estritamente ficcional. Plantas NÃO neutralizam peçonhas; soros são
   utilizados exclusivamente por atendimento simulado no posto de saúde. */
'use strict';
(() => {
  const $=id=>document.getElementById(id), clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const PLANTS=[
    {id:'aroma',name:'Folhagem aromática',icon:'🌿',desc:'Inspiração: plantas aromáticas. Recurso de repelente fictício.',color:'#a3cb55',spots:[[-17,-23],[8,-29],[29,-10],[-30,5]]},
    {id:'resina',name:'Resina da mata',icon:'🌳',desc:'Inspiração: copaíba e andiroba; efeito do jogo é inventado.',color:'#d8a75d',spots:[[14,-23],[-30,-9],[26,29],[-11,32]]},
    {id:'calmante',name:'Folhas calmantes',icon:'🍃',desc:'Planta genérica do jogo para bálsamo de conforto.',color:'#67d4a2',spots:[[-19,2],[8,7],[-32,34],[28,-33]]},
    {id:'jambu',name:'Jambu encantado',icon:'🌸',desc:'Inspirado no jambu regional; anestesia do jogo é fantasia, não orientação real.',color:'#e6a2df',spots:[[14,5],[-31,-34],[35,7],[-7,28]]}
  ];
  const PICKUPS=PLANTS.flatMap(p=>p.spots.map(([x,z],i)=>({id:p.id+'-'+i,type:p.id,x,z,done:false,icon:p.icon,color:p.color,name:p.name})));
  const SERUM={snake:'soroOfidico',arachnid:'soroAracnidico'};
  const RISKS={
    jararaca:['snake','Picada de serpente','🐍'], caranguejeira:['arachnid','Picada de aranha','🕷️'], escorpiao:['arachnid','Picada de escorpião','🦂'],
    marimbondos:['stings','Ferroadas de marimbondos','🐝'],cabas:['stings','Ferroadas de cabas','🐝'],tocandira:['stings','Ferroada de tocandira','🐜'],
    pernilongos:['insects','Picadas de mosquitos','🦟'],carrapatos:['insects','Carrapatos','🕷️'],
    insetosagua:['irritation','Contato com insetos aquáticos','🪲'],piranhas:['wound','Mordida de piranha (fantasia)','🐟'],
    poraque:['electric','Descarga do poraquê','⚡'],cobraagua:['wound','Contato com cobra-d’água','🐍'],arraia:['aquatic','Ferimento por arraia','🐠']
  };
  const recipes={
    repellent:{title:'🦟 Repelente de campo',needs:{aroma:2,resina:1},output:'repellent',amount:1,description:'Dificulta encontros com mosquitos e carrapatos por 90 segundos de jogo.'},
    balm:{title:'🌿 Bálsamo de conforto',needs:{calmante:2,resina:1},output:'balm',amount:1,description:'Reduz irritação leve e recupera 10 de vida simulada; nunca trata peçonhas.'},
    anesthetic:{title:'🌸 Compressa anestésica fantástica',needs:{jambu:2,calmante:1},output:'anesthetic',amount:1,description:'Alivia a fadiga por um período no universo ficcional; não é anestésico real.'}
  };
  let S=null,plants=[],bag={},injury=null,repelSeconds=0,calmSeconds=0,clock=0,uiClock=0,crafts={},questRewarded=false,registeredTypes=[],warning=false;
  const defaults=()=>({aroma:0,resina:0,calmante:0,jambu:0,repellent:2,balm:1,anesthetic:1,bandage:2,soroOfidico:1,soroAracnidico:1,radio:1});
  const key=()=>`batalha_sobrevivencia_v19_${S.profile}_${S.tribe}_${S.arena}`;
  const say=(txt,secs=3.5)=>window.Expedition?.notify?.(txt,secs);
  function save(){if(!S)return;try{localStorage.setItem(key(),JSON.stringify({bag,done:plants.filter(p=>p.done).map(p=>p.id),repelSeconds,calmSeconds,crafts,questRewarded,registeredTypes}));}catch(_){}}
  function start(s){S=s;plants=PICKUPS.map(p=>({...p}));bag=defaults();injury=null;repelSeconds=0;calmSeconds=0;clock=0;uiClock=0;crafts={};questRewarded=false;registeredTypes=[];warning=false;
    try{const old=JSON.parse(localStorage.getItem(key())||'null');if(old&&typeof old==='object'){
      for(const k of Object.keys(bag))if(Number.isFinite(old.bag?.[k]))bag[k]=clamp(Math.floor(old.bag[k]),0,99);
      const done=new Set(Array.isArray(old.done)?old.done:[]);plants.forEach(p=>p.done=done.has(p.id));
      repelSeconds=clamp(Number(old.repelSeconds)||0,0,90);calmSeconds=clamp(Number(old.calmSeconds)||0,0,70);
      crafts=old.crafts&&typeof old.crafts==='object'?{...old.crafts}:{};
      questRewarded=old.questRewarded===true;
      registeredTypes=Array.isArray(old.registeredTypes)?old.registeredTypes.filter(x=>PLANTS.some(p=>p.id===x)):[];
    }}catch(_){ }
    paintHUD();
  }
  function close(){save();if($('expMedicalDialog')?.open)$('expMedicalDialog').close();S=null;injury=null;}
  function nearest(){if(!S)return null;let best=null,dist=1e3;for(const p of plants){if(p.done)continue;const d=Math.hypot(p.x-S.x,p.z-S.z);if(d<dist){best=p;dist=d;}}return best?{plant:best,d:dist}:null;}
  function interact(){const nearestPlant=nearest();if(!nearestPlant||nearestPlant.d>3.6)return false;
    const p=nearestPlant.plant;p.done=true;bag[p.type]=clamp(bag[p.type]+1,0,99);
    if(!registeredTypes.includes(p.type))registeredTypes.push(p.type);
    S.score+=25;window.GuardianV14?.addXP?.(25);window.Expedition?.save?.();say(`${p.icon} ${p.name} coletada · +25 XP. Verifique o KIT MÉDICO.`);save();paintHUD();checkQuest();return true;
  }
  function protect(c){if(!S||repelSeconds<=0||!['pernilongos','carrapatos'].includes(c.id))return false;
    say(`🦟 Repelente de fantasia afastou ${c.name.toLowerCase()}!`);return true;
  }
  function onHazard(c){const risk=RISKS[c.id];if(!risk)return false;
    const [kind,label,icon]=risk;const duration=kind==='snake'?48:kind==='arachnid'?40:kind==='electric'?7:kind==='stings'?25:kind==='aquatic'?34:kind==='insects'?18:kind==='wound'?22:12;
    // Não empilhe picadas a cada quadro e nunca substitua uma urgência grave por uma leve.
    const priority={snake:6,arachnid:5,aquatic:5,stings:4,wound:3,electric:3,insects:2,irritation:1};
    if(injury&&injury.duration>0&&priority[injury.kind]>=priority[kind])return true;
    injury={kind,label,icon,duration,max:duration,pulse:0};
    say(`${icon} ${label}! Consulte KIT MÉDICO para proteção ou resgate.`,5);paintHUD();return true;
  }
  function onRescue(){injury=null;paintHUD();}
  function onGenericFirstAid(){if(injury&&['insects','irritation','wound'].includes(injury.kind)){injury=null;paintHUD();}}
  function tick(dt){if(!S||!window.Expedition?.active)return;
    if(['expMedicalDialog','expGearDialog','expFaunaDialog','expFullMap','expInventory','expTrailsDialog','expGuardianDialog'].some(id=>$(id)?.open))return;
    dt=clamp(dt,0,.12);clock+=dt;uiClock+=dt;
    repelSeconds=Math.max(0,repelSeconds-dt);calmSeconds=Math.max(0,calmSeconds-dt);
    if(injury){injury.duration=Math.max(0,injury.duration-dt);injury.pulse+=dt;
      const step=injury.kind==='electric'?1.5:2.5;
      if(injury.pulse>step){injury.pulse=0;
        const damage=['snake','arachnid','aquatic'].includes(injury.kind)?3:injury.kind==='stings'?2:injury.kind==='electric'?2:1;
        S.hp=clamp(S.hp-damage,0,100);S.stamina=clamp(S.stamina-4,0,100);
        window.FaunaV17?.refreshHUD?.();
        if(S.hp<=0){S.hp=100;S.x=-8;S.z=-26;S.stamina=75;injury=null;say('⛺ Resgate automático: sua equipe retornou ao posto.',5);}}
      if(injury&&injury.duration<=0){const name=injury.label;injury=null;say(`⛺ ${name}: efeito de aventura encerrado.`,3);}}
    if(uiClock>.7){uiClock=0;paintHUD();}if(clock>=12){clock=0;save();}
  }
  function checkQuest(){if(!S||questRewarded)return;
    const ready=registeredTypes.length===PLANTS.length&&Boolean(crafts.repellent)&&Boolean(window.FaunaV17?.hasSeen?.('poraque'));
    if(ready){questRewarded=true;S.score+=300;window.GuardianV14?.addXP?.(300);window.Expedition?.save?.();save();say('🏅 MISSÃO BOTÂNICA E DOS RIOS CONCLUÍDA! +300 XP',6);}}
  function use(id){if(!S)return;
    switch(id){
      case 'repellent':if(!bag.repellent)return say('Sem repelente. Colete plantas e fabrique mais.');bag.repellent--;repelSeconds=90;say('🦟 Repelente fictício ativado por 90 s: mosquitos e carrapatos se afastam.');break;
      case 'balm':if(!bag.balm)return say('Sem bálsamo.');if(injury&&['snake','arachnid','aquatic','stings'].includes(injury.kind))return say('⚠ Não é antídoto. Use atendimento adequado no posto de cura.');bag.balm--;if(injury&&['insects','irritation','wound'].includes(injury.kind))injury=null;S.hp=clamp(S.hp+10,0,100);say('🍃 Bálsamo de jogo: +10 vida e alívio leve.');break;
      case 'anesthetic':if(!bag.anesthetic)return say('Sem compressas fantásticas.');bag.anesthetic--;calmSeconds=70;S.stamina=clamp(S.stamina+28,0,100);say('🌸 Compressa de fantasia: +28 energia. Não neutraliza venenos.');break;
      case 'bandage':if(!bag.bandage)return say('Sem curativos na bolsa médica.');bag.bandage--;S.hp=clamp(S.hp+18,0,100);say('🩹 Curativo de jogo: +18 vida. Peçonhas precisam de atendimento.');break;
      case 'soroOfidico':case 'soroAracnidico':{
        if(!injury)return say('Não há indicação de soro no personagem.');
        if(SERUM[injury.kind]!==id)return say('Soro incompatível com o acidente. Identifique o tipo antes do resgate.');
        if(!bag[id])return say('Dose indisponível. Acione o rádio de resgate.');
        bag[id]--;S.x=-8;S.z=-26;S.hp=clamp(S.hp+50,0,100);S.stamina=85;
        injury=null;say('🏥 Evacuação ao posto: tratamento por equipe médica do jogo. +50 vida.',6);break;}
      case 'radio':{
        if(!injury&&S.hp>=80)return say('Nenhuma emergência. Preserve os recursos de resgate.');
        S.x=-8;S.z=-26;S.stamina=85;S.hp=clamp(S.hp+45,0,100);injury=null;
        say('📻 Equipe de resgate acionada: atendimento e retorno ao acampamento.',5);break;}
      default:return;
    }
    window.FaunaV17?.refreshHUD?.();paintHUD();save();render();
  }
  function craft(id){if(!S)return;const r=recipes[id];if(!r)return;
    const lacks=Object.entries(r.needs).filter(([k,v])=>bag[k]<v);
    if(lacks.length)return say('🌿 Faltam ingredientes virtuais. Explore o mapa e colete plantas.');
    for(const [k,v] of Object.entries(r.needs))bag[k]-=v;
    bag[r.output]=clamp(bag[r.output]+r.amount,0,99);crafts[id]=(crafts[id]||0)+1;
    say(`${r.title} fabricado na bancada fictícia!`);save();checkQuest();render();
  }
  function paintHUD(){if(!S)return;const status=$('expMedicalStatus'),mission=$('expBotanicProgress');
    if(status){status.textContent=injury?`${injury.icon} ${injury.label.toUpperCase()} · ${Math.ceil(injury.duration)}s`:repelSeconds>0?`🦟 PROTEÇÃO: ${Math.ceil(repelSeconds)}s`:'🧰 KIT DISPONÍVEL';status.dataset.risk=injury?'active':'safe';}
    if(mission)mission.textContent=questRewarded?'✓ MISSÃO CONCLUÍDA':`${registeredTypes.length}/4 plantas · repelente ${crafts.repellent?'✓':'○'} · poraquê ${window.FaunaV17?.hasSeen?.('poraque')?'✓':'○'}`;
    if(!questRewarded&&window.FaunaV17?.hasSeen?.('poraque'))checkQuest();
  }
  function htmlButton(id,icon,title,subtitle,count){return `<button type="button" data-med-use="${id}" class="exp-med-item"><span class="exp-med-symbol">${icon}</span><b>${title}</b><small>${subtitle}</small><em>x${count}</em></button>`;}
  function render(){if(!S)return;const root=$('expMedicalContent');if(!root)return;
    const status=injury?`${injury.icon} ${injury.label} · ${Math.ceil(injury.duration)} segundos restantes`:'Sem ferimentos ativos';
    const materials=PLANTS.map(p=>`<div class="exp-med-material"><span>${p.icon} ${p.name}</span><b>${bag[p.id]}</b></div>`).join('');
    const recipesHTML=Object.entries(recipes).map(([id,r])=>{
      const ing=Object.entries(r.needs).map(([p,n])=>`${PLANTS.find(x=>x.id===p)?.name}: ${n}`).join(' + ');
      const disabled=Object.entries(r.needs).some(([k,n])=>bag[k]<n)?'disabled':'';
      return `<button type="button" data-med-craft="${id}" class="exp-med-craft" ${disabled}><b>${r.title}</b><small>${ing}</small><span>${r.description}</span></button>`;
    }).join('');
    root.innerHTML=`<p class="exp-med-alert" role="status"><strong>Estado:</strong> ${status} ${repelSeconds?`· 🦟 Repelente ${Math.ceil(repelSeconds)}s`:''}</p>
      <h3>🧰 Estojo de sobrevivência</h3><div class="exp-med-grid">
      ${htmlButton('repellent','🦟','Repelente','Previne encontros com mosquitos/carrapatos',bag.repellent)}
      ${htmlButton('balm','🌿','Bálsamo calmante','Conforto e pequenas lesões de jogo',bag.balm)}
      ${htmlButton('anesthetic','🌸','Anestésico fictício','Energia e fadiga; não trata peçonha',bag.anesthetic)}
      ${htmlButton('bandage','🩹','Curativo','Recupera vida simulada',bag.bandage)}
      ${htmlButton('soroOfidico','🐍','Soro antiofídico','Resgate ao posto: acidente de serpente',bag.soroOfidico)}
      ${htmlButton('soroAracnidico','🕷️','Soro antiaracnídico','Resgate ao posto: aranha/escorpião',bag.soroAracnidico)}
      ${htmlButton('radio','📻','Rádio de resgate','Equipe médica do jogo atende no posto','∞')}
      </div><h3>🍃 Plantas encontradas</h3><div class="exp-med-materials">${materials}</div>
      <h3>🛠️ Bancada de fabricação — receitas fictícias</h3><div class="exp-med-recipes">${recipesHTML}</div>
      <div class="exp-med-quest"><h3>🏅 Missão do Botânico e dos Rios</h3><p>Registre quatro tipos de plantas, fabrique um repelente e encontre o poraquê no rio. Prêmio: +300 XP.</p><strong>${questRewarded?'✓ CONCLUÍDA':`${registeredTypes.length}/4 plantas · ${crafts.repellent?'✓':'○'} repelente · ${window.FaunaV17?.hasSeen?.('poraque')?'✓':'○'} poraquê`}</strong></div>
      <p class="exp-med-disclaimer">⚠ Simulação de fantasia, não guia de saúde. Na vida real, picadas peçonhentas exigem avaliação médica; soros são específicos e administrados por profissionais. Não prepare tratamentos, repelentes ou anestésicos caseiros com plantas desconhecidas.</p>`;
    root.querySelectorAll('[data-med-use]').forEach(b=>b.addEventListener('click',()=>use(b.dataset.medUse)));
    root.querySelectorAll('[data-med-craft]').forEach(b=>b.addEventListener('click',()=>craft(b.dataset.medCraft)));
  }
  function open(){if(!S)return;render();const modal=$('expMedicalDialog');if(modal&&!modal.open)modal.showModal();}
  function mapDraw(ctx,cx,cy,u,side){if(!S)return;for(const p of plants){if(p.done)continue;const x=cx+p.x*u,y=cy-p.z*u;
    ctx.fillStyle=p.color;ctx.strokeStyle='#172824';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,Math.max(2.4,side*.009),0,Math.PI*2);ctx.fill();ctx.stroke();}}
  function draw2D(ctx,proj,clampSize){if(!S)return;for(const p of plants){if(p.done)continue;const q=proj(p.x,.95,p.z);if(!q||q.d>55)continue;
    const r=clampSize(q.s*.30,13,28);ctx.textAlign='center';ctx.font=r+'px sans-serif';ctx.fillText(p.icon,q.x,q.y);
    if(q.d<13){ctx.fillStyle='#f4edc5';ctx.font='bold 10px system-ui';ctx.fillText(p.name,q.x,q.y-r*.6);}}
  }
  function render3D(m,terrain,t,quality){if(!S)return;for(const p of plants){if(p.done)continue;
    const y=terrain(p.x,p.z),s=.86+Math.sin(t*1.7+p.x)*.045;
    m.cylinder(p.x,y+.42*s,p.z,.060,.82*s,'#546b32',5);
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5+t*.04,dx=Math.cos(a),dz=Math.sin(a);
      m.sphere(p.x+dx*.33,y+.55+Math.sin(a*2)*.11,p.z+dz*.33,.27,.08,.16,p.color,3,6);}
    m.sphere(p.x,y+1.1+Math.sin(t*2+p.z)*.10,p.z,.16,.16,.16,p.color,4,6);
  }}
  function resetCurrent(){if(!S)return;try{localStorage.removeItem(key());}catch(_){}}
  function resetProfile(){try{for(const p of ['guerreiro','explorador'])for(const t of ['munduruku','muirapinima'])for(const a of ['munduruku','muirapinima'])localStorage.removeItem(`batalha_sobrevivencia_v19_${p}_${t}_${a}`);}catch(_){}}
  $('expMedicalButton')?.addEventListener('click',open);$('expCloseMedical')?.addEventListener('click',()=>$('expMedicalDialog').close());
  window.SurvivalV19={start,close,tick,interact,protect,onHazard,onRescue,onGenericFirstAid,open,render3D,draw2D,mapDraw,save,paintHUD,resetCurrent,resetProfile,nearest,get bag(){return bag},get injury(){return injury},get plants(){return plants},get questRewarded(){return questRewarded}};
})();
