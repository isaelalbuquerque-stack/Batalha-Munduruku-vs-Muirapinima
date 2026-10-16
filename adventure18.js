/* V1.8 — Perfil explorador + sobrevivência offline.
 * Arsenal inteiramente fictício; contra fauna, sinalizar e afugentar sem abate.
 */
'use strict';
(() => {
  const $=id=>document.getElementById(id);
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const TYPES={guerreiro:{title:'GUERREIRO / GUERREIRA',quick:[['lança','🗡','Lança'],['arco','🏹','Arco'],['escudo','🛡','Escudo'],['bolsa','🎒','Bolsa']]},explorador:{title:'EXPLORADOR / EXPLORADORA',quick:[['facao','🗡️','Facão'],['carabina','🎯','Carabina'],['sinalizador','🚨','Sinal'],['bolsa','🎒','Mochila']]}};
  const STORE='batalha_perfil_expedicao_v18';
  let selected='guerreiro',S=null,gear=null,clock=0,uiClock=0;
  try{const p=localStorage.getItem(STORE);if(TYPES[p])selected=p;}catch(_){}
  const notify=(msg)=>window.Expedition?.notify(msg,3.3);
  const saveKey=()=>`batalha_sobrevivencia_v18_${S.tribe}_${S.arena}_${S.profile}`;
  function save(){if(!S||!gear)return;try{localStorage.setItem(saveKey(),JSON.stringify({gear,hunger:S.hunger,hydration:S.hydration}));}catch(_){}}
  function switchProfile(v){if(!TYPES[v])return;selected=v;try{localStorage.setItem(STORE,v)}catch(_){}paintSelection();}
  function paintSelection(){document.querySelectorAll('[data-adventure-profile]').forEach(b=>{const on=b.dataset.adventureProfile===selected;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));});const inExp=!$('expEditionSelector')?.hidden;const neutral=inExp&&selected==='explorador';$('selectScreen')?.classList.toggle('explorer-choice',neutral);if(inExp){$('modeEyebrow').textContent=neutral?'EXPEDIÇÃO INDEPENDENTE':'MODO EXPEDIÇÃO / SOBREVIVÊNCIA';$('selectScreen').querySelector('h2').textContent=neutral?'Escolha o território para explorar':'Escolha seu território e equipe';}}
  document.querySelectorAll('[data-adventure-profile]').forEach(b=>b.addEventListener('click',()=>switchProfile(b.dataset.adventureProfile)));
  function getSelection(){return selected;}
  function isExplorer(){return S?.profile==='explorador';}
  function defaults(){return {water:4,rations:4,ammo:18,flares:4,bandages:2,battery:100};}
  function start(s){S=s;s.profile=TYPES[s.profile]?s.profile:selected;s.hunger=100;s.hydration=100;gear=defaults();
    try{const prev=JSON.parse(localStorage.getItem(saveKey())||'null');if(prev&&typeof prev==='object'){
      for(const k of Object.keys(gear))if(Number.isFinite(prev.gear?.[k]))gear[k]=clamp(Math.floor(prev.gear[k]),0,k==='battery'?100:100);
      s.hunger=clamp(Number(prev.hunger)||0,0,100);s.hydration=clamp(Number(prev.hydration)||0,0,100);
    }}catch(_){}
    s.tool=isExplorer()?'facao':'lança';clock=0;uiClock=0;setQuickbar();paintHUD();
  }
  function setQuickbar(){if(!S)return;const quick=TYPES[S.profile].quick;
    const btns=[...document.querySelectorAll('[data-exp-tool]')];btns.forEach((b,i)=>{
      const [key,icon,title]=quick[i];b.dataset.expTool=key;b.innerHTML=`<span class="exp-gear-symbol" aria-hidden="true">${icon}</span><span>${title}</span>`;b.classList.toggle('selected',S.tool===key);
      b.title=title;b.setAttribute('aria-label',title);
    });
  }
  function paintHUD(){if(!S)return;const label=$('expProfileLabel'),status=$('expAdventureVitals');
    if(label)label.textContent=isExplorer()?'🧭 EXPLORADOR':'🌿 GUERREIRO';
    if(status)status.innerHTML=`<span>💧 ${Math.round(S.hydration)}%</span><span>🥣 ${Math.round(S.hunger)}%</span>${isExplorer()?`<span>🎯 ${gear.ammo}</span>`:''}`;
    const stats=$('expGearStats');if(stats)stats.textContent=`Cantil ${gear.water} · Rações ${gear.rations} · Munição ${gear.ammo} · Sinalizadores ${gear.flares} · Curativos ${gear.bandages}`;
  }
  function tick(dt){if(!S||!window.Expedition?.active)return;clock+=dt;uiClock+=dt;
    // Recursos caem lentamente e nunca abaixo de zero; risco apenas de fadiga, não uma simulação médica.
    S.hydration=clamp(S.hydration-dt*.022,0,100);S.hunger=clamp(S.hunger-dt*.012,0,100);
    if(S.hydration<=1||S.hunger<=1){S.stamina=clamp(S.stamina-dt*18,0,100);}
    if(uiClock>=.55){uiClock=0;paintHUD();}if(clock>=12){clock=0;save();}
  }
  function onCollect(type){if(!S)return;if(type==='food')S.hunger=clamp(S.hunger+8,0,100);if(type==='fish')S.hunger=clamp(S.hunger+5,0,100);save();paintHUD();}
  function use(item){if(!S)return;switch(item){
    case 'water':if(gear.water<=0)return notify('Seu cantil está vazio.');if(S.hydration>=99)return notify('Hidratação já está completa.');gear.water--;S.hydration=clamp(S.hydration+32,0,100);notify('💧 Você bebeu água do cantil.');break;
    case 'rations':if(!gear.rations)return notify('As rações acabaram.');if(S.hunger>=99)return notify('Você já está alimentado.');gear.rations--;S.hunger=clamp(S.hunger+36,0,100);notify('🥣 Ração de campo utilizada.');break;
    case 'bandages':if(!gear.bandages)return notify('Os curativos acabaram.');if(S.hp>=100)return notify('Sua saúde está completa.');gear.bandages--;S.hp=clamp(S.hp+22,0,100);window.FaunaV17?.refreshHUD();notify('🩹 Curativo aplicado: +22 de vida fictícia.');break;
    case 'battery':if(gear.battery<=0)return notify('A bateria da lanterna descarregou.');gear.battery=clamp(gear.battery-6,0,100);notify('🔦 Lanterna acionada. Energia restante: '+gear.battery+'%.');break;
    case 'compass':return notify('🧭 Use MAPA ⤢ para consultar sua posição e as rotas.');
    case 'binoculars':return notify('🔭 O minimapa destaca os perigos descobertos no bestiário.');
  }
    save();paintHUD();renderBag();
  }
  function renderBag(){const root=$('expGearCards');if(!root||!S)return;
    const cells=[['water','💧','Cantil',gear.water],['rations','🥣','Ração de campo',gear.rations],['bandages','🩹','Curativos',gear.bandages],['compass','🧭','Bússola','∞'],['binoculars','🔭','Binóculos','∞'],['battery','🔦','Lanterna',gear.battery+'%']];
    root.innerHTML=cells.map(([id,ico,name,qty])=>`<button type="button" data-use-gear="${id}" class="exp-gear-item"><strong>${ico}</strong><span>${name}</span><small>${qty}</small></button>`).join('');
    root.querySelectorAll('[data-use-gear]').forEach(b=>b.addEventListener('click',()=>use(b.dataset.useGear)));
    const note=$('expGearNote');if(note)note.textContent=isExplorer()?'Arsenal de fantasia: carabina com munição limitada e sinalizador para afastar perigos. Nunca há abatimento de fauna protegida.':'Equipamentos tradicionais estilizados do universo ficcional; mantenha distância segura da fauna.';
  }
  function loadout(){if(!S)return;paintHUD();renderBag();const d=$('expGearDialog');if(d&&!d.open)d.showModal();}
  $('expGearButton')?.addEventListener('click',loadout);
  $('expCloseGear')?.addEventListener('click',()=>$('expGearDialog').close());
  function attack(){if(!isExplorer())return false;
    if(S.tool==='sinalizador'){
      if(gear.flares<1){notify('🚨 Sem sinalizadores. Use outro equipamento.');return true;}
      gear.flares--;const old=S.tool;S.tool='arco';const found=window.FaunaV17?.combat()||false;S.tool=old;
      if(!found)notify('🚨 Sinal luminoso lançado. A área foi alertada.');save();paintHUD();return true;
    }
    if(S.tool==='carabina'){
      if(gear.ammo<1){notify('🎯 Sem munição de fantasia. Selecione o facão ou a mochila.');return true;}
      const boss=(window.GuardianV14?.data?.bosses||[]).find(b=>!(window.GuardianV14?.data?.defeated||[]).includes(b.id)&&Math.hypot(S.x-b.x,S.z-b.z)<9);
      const target=[...S.enemy].filter(e=>e.hp>0&&Math.hypot(S.x-e.x,S.z-e.z)<9).sort((a,b)=>Math.hypot(S.x-a.x,S.z-a.z)-Math.hypot(S.x-b.x,S.z-b.z))[0];
      if(!boss&&!target){notify('🎯 Sem oponente fictício ao alcance; munição preservada.');return true;}
      gear.ammo--;if(boss){const old=S.tool;S.tool='arco';window.GuardianV14?.combat();S.tool=old;}
      else if(target){target.hp=clamp(target.hp-28,0,75);notify('🎯 Disparo fictício de carabina: adversário recuou.');if(target.hp===0){target.respawn=12;S.score+=85;window.GuardianV14?.addXP(85);window.Expedition?.save?.();}}
      save();paintHUD();return true;
    }
    if(S.tool==='facao'){
      const near=[...S.enemy].filter(e=>e.hp>0&&Math.hypot(S.x-e.x,S.z-e.z)<3.2).sort((a,b)=>Math.hypot(S.x-a.x,S.z-a.z)-Math.hypot(S.x-b.x,S.z-b.z))[0];
      if(near){near.hp=clamp(near.hp-27,0,75);notify('🗡️ Defesa de curta distância no confronto fictício.');if(near.hp===0){near.respawn=12;S.score+=85;window.GuardianV14?.addXP(85);window.Expedition?.save?.();}return true;}
      const old=S.tool;S.tool='lança';const done=Boolean(window.GuardianV14?.combat()||window.FaunaV17?.combat());S.tool=old;
      if(done)return true;
      notify('🗡️ Facão equipado: útil no confronto próximo e como ferramenta de campo.');return true;
    }
    return S.tool==='bolsa';
  }
  function inventoryHTML(){if(!S)return '';
    return `<div class="exp-gear-summary"><b>🧭 ${TYPES[S.profile].title}</b><p>💧 Água: ${Math.ceil(S.hydration)}% · 🥣 Alimentação: ${Math.ceil(S.hunger)}%</p><p>🚨 Sinalizadores: ${gear.flares} · 🎯 Munição fictícia: ${gear.ammo} · 🩹 Curativos: ${gear.bandages}</p><button type="button" id="openAdventurerBag" class="secondary-btn">🎒 ABRIR EQUIPAMENTOS</button></div>`;
  }
  function bindInventory(){$('openAdventurerBag')?.addEventListener('click',loadout);}
  function close(){if(S)save();if($('expGearDialog')?.open)$('expGearDialog').close();S=null;gear=null;}
  function resetProfile(){try{localStorage.removeItem(STORE);for(const a of ['munduruku','muirapinima'])for(const b of ['munduruku','muirapinima'])for(const p of Object.keys(TYPES))localStorage.removeItem(`batalha_sobrevivencia_v18_${a}_${b}_${p}`);}catch(_){} }
  window.AdventureV18={get selectedProfile(){return selected},switchProfile,getSelection,paintSelection,start,tick,onCollect,attack,loadout,inventoryHTML,bindInventory,close,resetProfile,save,paintHUD,get gear(){return gear},get playerType(){return S?.profile},get active(){return Boolean(S)}};
})();
