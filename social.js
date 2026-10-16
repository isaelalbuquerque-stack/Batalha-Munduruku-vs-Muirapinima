/* V1.3 — interface de equipes, login com minimização de dados e partidas online.
   O servidor Supabase guarda apenas perfil pseudônimo, tribo e resultado da partida.
   Idade: exclusivamente em memória RAM do navegador, nunca enviada ao backend. */
'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const nicknameKey='batalha_v11_nickname', faveKey='batalha_v11_favorite', teamKey='batalha_v11_team';
  const names={munduruku:'Munduruku',muirapinima:'Muirapinima'};
  const stored=(key, fallback='')=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
  const save=(key,value)=>{try{localStorage.setItem(key,value);}catch{/* private mode */}};
  const roleNames={tuxaua:'Tuxaua',paje:'Pajé',guerreira:'Guerreira'};
  const roles=['tuxaua','paje','guerreira'];
  let player=null,client=null,roomId=null,roomTimer=null,renderTimer=null,loading=false,serverOffset=0,lastSnapshot=null;
  let localTeam=readTeam();
  function readTeam(){try{return JSON.parse(stored(teamKey,''))||{name:'Tribo dos Guardiões',captain:'tuxaua'};}catch{return {name:'Tribo dos Guardiões',captain:'tuxaua'};}}
  const safeText=(value,max=40)=>String(value??'').slice(0,max);
  function hideScreens(){document.querySelectorAll('main > .screen').forEach(el=>{el.classList.remove('active');el.setAttribute('aria-hidden','true');});}
  function showExtra(name){hideScreens();$(name+'Screen').classList.add('active');$(name+'Screen').setAttribute('aria-hidden','false');document.querySelector('.footer').style.display='flex';}
  function backHome(){if(window.Expedition)window.Expedition.active=false;stopPolling();roomId=null;lastSnapshot=null;hideScreens();$('homeScreen').classList.add('active');document.querySelector('.footer').style.display='flex';refreshCounts();}
  function requireAccess(){if(player)return true;showAccess();return false;}
  function showAccess(){
    $('playerNick').value=player?.nick||stored(nicknameKey,'');
    document.querySelectorAll('[name=faveTribe]').forEach(r=>r.checked=r.value===(player?.tribe||stored(faveKey,'munduruku')));
    $('playerAge').value='';$('privacyAgree').checked=false;$('accessError').textContent='';
    if(!$('accessDialog').open)$('accessDialog').showModal();
  }
  $('accessForm').addEventListener('submit',event=>{
    event.preventDefault();
    const nick=$('playerNick').value.trim().replace(/\s+/g,' '), age=Number($('playerAge').value), tribe=document.querySelector('[name=faveTribe]:checked')?.value;
    if(nick.length<2||nick.length>24||!Number.isInteger(age)||age<1||age>120||!names[tribe]||!$('privacyAgree').checked){$('accessError').textContent='Confira apelido, idade, tribo e o aviso de privacidade.';return;}
    player={nick,age,tribe};save(nicknameKey,nick);save(faveKey,tribe);
    $('playerWelcome').textContent=`Bem-vindo(a), ${nick}! Sua tribo: ${names[tribe]}. ${age<18?'Modo offline disponível.':'Modo offline e salas online disponíveis.'}`;
    $('accessDialog').close();
    if(age>=18)refreshCounts();
    else $('counterNote').textContent='Contadores globais disponíveis nas sessões adultas online';
    if(client&&age>=18)registerOnlineProfile().then(refreshCounts).catch(()=>{});
    if(client&&age<18)client.auth.signOut().catch(()=>{});
  });
  $('accountBtn').onclick=showAccess;
  $('deleteProfile').onclick=async()=>{
    if(!confirm('Excluir apelido, equipe e registros de jogo desta identidade? A identidade técnica anônima do provedor pode exigir exclusão administrativa separada.'))return;
    const msg=$('accessError');msg.textContent='Apagando cadastro…';
    try{
      if(configured())await initClient();
      if(client){const {data:{session}}=await client.auth.getSession();if(session){
        const {error}=await client.rpc('delete_my_battle_data');if(error)throw error;
        await client.auth.signOut();
      }}
      window.GuardianV14?.resetProfile();
      window.TrailsV15?.resetProfile();
      window.FaunaV17?.resetProfile();window.AdventureV18?.resetProfile();window.SurvivalV19?.resetProfile();
      try{for(const key of Object.keys(localStorage)){if(key.startsWith('batalha_expedicao_v13_')||key.startsWith('batalha_expedicao_v18_explorador_'))localStorage.removeItem(key);}}catch{}
      for(const k of [nicknameKey,faveKey,teamKey,'batalha_best_festival','batalha_wins'])try{localStorage.removeItem(k);}catch{}
      player=null;localTeam={name:'Tribo dos Guardiões',captain:'tuxaua'};
      $('playerNick').value='';$('playerAge').value='';$('privacyAgree').checked=false;
      $('playerWelcome').textContent='Cadastro local apagado. Para jogar, cadastre um novo apelido.';
      msg.textContent='Cadastro do jogo apagado. Contate o responsável pela plataforma para eliminar também a identidade anônima no provedor.';
      refreshCounts();
    }catch(e){msg.textContent='Não foi possível apagar os dados online: '+onlineError(e);}
  };
  ['festivalMode','duelMode','expeditionMode'].forEach(id=>$(id).addEventListener('click',e=>{
    if(!requireAccess()){e.stopImmediatePropagation();return;}
    window.setTimeout(()=>{const target=document.querySelector(`.role-btn:nth-child(${roles.indexOf(localTeam.captain)+1})`);if(target)target.click();},0);
  },true));
  function teamScreen(){if(!requireAccess())return;$('teamName').value=localTeam.name;$('captainSelect').value=localTeam.captain;renderTeam();showExtra('teams');}
  function renderTeam(){
    const first=$('captainSelect').value;
    $('teamRoster').replaceChildren();
    [first,...roles.filter(r=>r!==first)].forEach((r,index)=>{
      const div=document.createElement('div');div.className='roster-member';
      const icon=document.createElement('span');icon.textContent=index===0?'★':'◆';
      const text=document.createElement('span');text.textContent=`${index===0?'CAPITÃO':'RESERVA'} — ${roleNames[r]}`;
      div.append(icon,text);$('teamRoster').append(div);
    });
  }
  $('teamsBtn').onclick=teamScreen;$('teamsBack').onclick=backHome;$('captainSelect').onchange=renderTeam;
  $('teamSave').onclick=()=>{
    const name=$('teamName').value.trim().replace(/\s+/g,' ');
    if(name.length<2||name.length>26){$('teamMessage').textContent='Digite um nome de equipe entre 2 e 26 caracteres.';return;}
    localTeam={name,captain:$('captainSelect').value};save(teamKey,JSON.stringify(localTeam));
    $('teamMessage').textContent='Equipe salva neste aparelho! Seu capitão será usado nas próximas partidas offline.';
  };
  function configured(){const c=window.BATALHA_CONFIG||{};return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test((c.supabaseUrl||'').trim()) && typeof c.supabasePublishableKey==='string' && c.supabasePublishableKey.length>15;}
  function getLibrary(){return new Promise((resolve,reject)=>{
    if(window.supabase?.createClient){resolve();return;}
    const tag=document.createElement('script');tag.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';tag.onload=resolve;tag.onerror=()=>reject(new Error('Não foi possível carregar a biblioteca online. Verifique a conexão.'));document.head.appendChild(tag);
  });}
  async function initClient(){
    if(client)return client;
    if(!configured())throw new Error('Modo online ainda não configurado. Preencha config.js com a URL e a chave publicável do Supabase.');
    await getLibrary();const config=window.BATALHA_CONFIG;
    client=window.supabase.createClient(config.supabaseUrl.replace(/\/$/,''),config.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    return client;
  }
  async function registerOnlineProfile(){
    if(!player||player.age<18)throw new Error('A participação online está disponível somente para maiores de 18 anos nesta versão.');
    await initClient();let {data:{session},error:err}=await client.auth.getSession();if(err)throw err;
    if(!session){const result=await client.auth.signInAnonymously();if(result.error)throw result.error;}
    const {data:{user},error:e}=await client.auth.getUser();if(e||!user)throw e||new Error('Falha na identificação anônima.');
    const result=await client.from('profiles').upsert({user_id:user.id,nickname:player.nick,tribe:player.tribe,team_name:localTeam.name},{onConflict:'user_id'});
    if(result.error)throw result.error;
  }
  function onlineError(e){const msg=e?.message||String(e);if(/fetch|network/i.test(msg))return 'Falha de rede. Confira a conexão e o Supabase.';return safeText(msg,300);}
  function onlineStatus(t){$('onlineStatus').textContent=t;}
  async function refreshCounts(){
    if(!configured()){$('counterNote').textContent='Contadores globais: configurar Supabase';return;}
    try{
      await initClient();const {data,error}=await client.rpc('tribe_counts');if(error)throw error;
      $('countMunduruku').textContent=Number(data?.munduruku??0).toLocaleString('pt-BR');
      $('countMuirapinima').textContent=Number(data?.muirapinima??0).toLocaleString('pt-BR');
      $('counterNote').textContent='Contas anônimas registradas online · não representa pessoas verificadas';
    }catch(e){$('counterNote').textContent='Contagem indisponível — '+onlineError(e);}
  }
  $('onlineBtn').onclick=async()=>{
    if(!requireAccess())return;
    showExtra('online');$('onlineWaiting').classList.add('hidden');$('onlineOptions').classList.remove('hidden');
    if(player.age<18){$('onlineOptions').classList.add('hidden');onlineStatus('Por segurança, partidas online são reservadas a maiores de 18 anos nesta versão. Continue jogando offline.');return;}
    onlineStatus('Conectando…');$('onlineOptions').classList.add('hidden');
    try{await registerOnlineProfile();await refreshCounts();onlineStatus(`${player.nick} • ${names[player.tribe]} • conectado`);$('onlineOptions').classList.remove('hidden');}
    catch(e){onlineStatus(onlineError(e));}
  };
  $('onlineBack').onclick=()=>{if(roomId){quitRoom();}else backHome();};
  async function createRoom(){
    if(loading)return;loading=true;$('createRoom').disabled=true;
    try{
      await registerOnlineProfile();const {data,error}=await client.rpc('create_battle_room',{p_mode:$('onlineMode').value,p_arena:player.tribe});if(error)throw error;
      roomId=data;await inspectRoom();showWaiting();startPolling();
    }catch(e){onlineStatus(onlineError(e));}finally{loading=false;$('createRoom').disabled=false;}
  }
  async function joinRoom(){
    if(loading)return;const code=$('roomCodeInput').value.trim().toUpperCase().replace(/[^A-F0-9]/g,'');
    if(!/^[A-F0-9]{6}$/.test(code)){onlineStatus('Digite um código de seis caracteres (0–9 e A–F).');return;}
    loading=true;$('joinRoom').disabled=true;
    try{
      await registerOnlineProfile();const {data,error}=await client.rpc('join_battle_room',{p_code:code});if(error)throw error;
      roomId=data;await inspectRoom();showWaiting();startPolling();
    }catch(e){onlineStatus(onlineError(e));}finally{loading=false;$('joinRoom').disabled=false;}
  }
  $('createRoom').onclick=createRoom;$('joinRoom').onclick=joinRoom;
  function showWaiting(){ $('onlineOptions').classList.add('hidden');$('onlineWaiting').classList.remove('hidden');onlineStatus('Sala criada. Compartilhe o código somente com quem vai jogar.'); }
  $('copyCode').onclick=async()=>{
    const code=$('roomCode').textContent;try{await navigator.clipboard.writeText(code);$('roomWaitingInfo').textContent='Código copiado.';}
    catch{$('roomWaitingInfo').textContent='Copie manualmente: '+code;}
  };
  async function inspectRoom(){
    if(!roomId||!client)return;
    const {data,error}=await client.rpc('battle_room_state',{p_room:roomId});if(error)throw error;
    if(!data)throw new Error('Sala não encontrada ou acesso negado.');
    lastSnapshot=data;serverOffset=Date.parse(data.server_now)-Date.now();
    $('roomCode').textContent=data.code;
    $('roomWaitingInfo').textContent=`${data.host_alias} (${names[data.host_tribe]}) ${data.guest_alias?'× '+data.guest_alias+' ('+names[data.guest_tribe]+')':'aguarda o adversário de outra tribo'}`;
    if(data.status==='live'||data.status==='finished')renderMatch(data);
    if(data.status==='cancelled'){stopPolling();roomId=null;showExtra('online');$('onlineWaiting').classList.add('hidden');$('onlineOptions').classList.remove('hidden');onlineStatus('A sala foi encerrada.');}
  }
  function stopPolling(){if(roomTimer){clearInterval(roomTimer);roomTimer=null;}if(renderTimer){clearInterval(renderTimer);renderTimer=null;}}
  function startPolling(){stopPolling();roomTimer=setInterval(()=>{if(roomId&&!loading)inspectRoom().catch(e=>{$('matchFeedback').textContent='Falha de atualização: '+onlineError(e);onlineStatus(onlineError(e));});},1000);renderTimer=setInterval(tickOnlineClock,100);}
  function secondsRemaining(m){const elapsed=(Date.now()+serverOffset-Date.parse(m.started_at||new Date().toISOString()))/1000;return Math.min(60,Math.max(0,60-elapsed));}
  function tickOnlineClock(){const m=lastSnapshot;if(!m||!$('onlineMatchScreen').classList.contains('active'))return;
    const rem=m.status==='finished'?0:secondsRemaining(m);$('matchTimer').textContent='00:'+String(Math.ceil(rem)).padStart(2,'0');
    if(m.status==='live'){$('matchBeat').disabled=rem<=0;$('matchStrike').disabled=rem<=0;$('matchGuard').disabled=rem<=0;$('matchSpecial').disabled=rem<=0;}
    if(m.mode==='festival'&&m.status==='live'){
      const seconds=(Date.now()+serverOffset-Date.parse(m.started_at))/1000;
      const nearest=Math.round((seconds-1.2)/.82)*.82+1.2;
      const diff=Math.abs(seconds-nearest);
      $('matchBeat').classList.toggle('on-beat',diff<.20);
    }
  }
  function renderMatch(m){
    if(!$('onlineMatchScreen').classList.contains('active'))showExtra('onlineMatch');
    const host=m.side==='host', mine=host?'host':'guest',other=host?'guest':'host';
    const myScore=m.mode==='festival'?m[mine+'_score']:m[mine+'_hp'];
    const theirScore=m.mode==='festival'?m[other+'_score']:m[other+'_hp'];
    $('matchMode').textContent=m.mode==='festival'?'DISPUTA FOLCLÓRICA ONLINE':'CONFRONTO ONLINE';
    $('matchOwnName').textContent=`${m[mine+'_alias']} · ${names[m[mine+'_tribe']]}`;
    $('matchOpponentName').textContent=`${m[other+'_alias']} · ${names[m[other+'_tribe']]}`;
    $('matchOwnScore').textContent=myScore;$('matchOpponentScore').textContent=theirScore;
    $('matchOwnMeter').firstElementChild.style.width=(m.mode==='festival'?Math.min(100,myScore/50):myScore/3)+'%';
    $('matchOpponentMeter').firstElementChild.style.width=(m.mode==='festival'?Math.min(100,theirScore/50):theirScore/3)+'%';
    $('matchStrike').classList.toggle('hidden',m.mode!=='duel');$('matchGuard').classList.toggle('hidden',m.mode!=='duel');$('matchBeat').classList.toggle('hidden',m.mode!=='festival');
    $('matchSpecial').textContent='✦ ESPECIAL ('+m[mine+'_energy']+'%)';
    $('matchHelp').textContent=m.mode==='festival'
      ?`Ato ${Math.min(3,1+Math.floor((60-secondsRemaining(m))/20))}/3 · A equipe alterna os três personagens. Toque quando o botão brilhar; especial custa 100%.`
      :`Sua equipe: ${Math.ceil(myScore/100)} personagens restantes de 3. Golpe enche energia, defesa protege e especial custa 60%.`;
    if(m.status==='finished'){
      $('matchActions').classList.add('hidden');const win=myScore>theirScore;
      $('matchFeedback').textContent=myScore===theirScore?'EMPATE!':win?'SUA EQUIPE VENCEU!':'EQUIPE ADVERSÁRIA VENCEU!';
    }else{
      $('matchActions').classList.remove('hidden');$('matchFeedback').textContent=secondsRemaining(m)>0?'DISPUTA AO VIVO · SERVIDOR SINCRONIZADO':'Finalizando resultado…';
    }
    tickOnlineClock();
  }
  async function doAction(action){
    if(!roomId||!lastSnapshot||lastSnapshot.status!=='live'||loading)return;
    loading=true;
    try{const {data,error}=await client.rpc('battle_action',{p_room:roomId,p_action:action});if(error)throw error;
      await inspectRoom();if(data?.message)$('matchFeedback').textContent=safeText(data.message,90);
    }catch(e){$('matchFeedback').textContent=onlineError(e);}finally{loading=false;}
  }
  $('matchBeat').onclick=()=>doAction('beat');$('matchStrike').onclick=()=>doAction('strike');$('matchGuard').onclick=()=>doAction('guard');$('matchSpecial').onclick=()=>doAction('special');
  async function quitRoom(){
    const old=roomId;roomId=null;stopPolling();backHome();
    if(old&&client)client.rpc('leave_battle_room',{p_room:old}).then(()=>{}).catch(()=>{});
  }
  $('cancelRoom').onclick=quitRoom;$('exitMatch').onclick=quitRoom;
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&roomId)inspectRoom().catch(()=>{});});
  // Idade não é persistida. Toda nova sessão exige declaração de idade.
  window.setTimeout(showAccess,80);
})();
