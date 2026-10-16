/* V1.8 — Tupã / Voz do Trovão: fenômeno ambiental ficcional, sem combate religioso. */
'use strict';
(() => {
  const $=id=>document.getElementById(id);
  let state=null,elapsed=0,storm=0,cooldown=0,flash=0,pulse=0;
  const notify=s=>window.Expedition?.notify(s,4.2);
  function start(S){state=S;storm=0;elapsed=0;cooldown=85;flash=0;pulse=0;updateHUD();}
  function begin(){if(!state)return;storm=38;cooldown=140;pulse=0;notify('⚡ TUPÃ • VOZ DO TROVÃO — uma tempestade atravessa a floresta!');updateHUD();}
  function tick(dt){if(!state||!window.Expedition?.active)return;elapsed+=dt;cooldown-=dt;
    if(storm>0){storm=Math.max(0,storm-dt);pulse+=dt;flash=Math.max(0,flash-dt*2.7);
      if(pulse>5.5){pulse=0;flash=.94;}
      if(storm===0){notify('☀ A tempestade passou. A floresta voltou a ficar calma.');updateHUD();}}
    else if(cooldown<=0)begin();
    updateHUD();
  }
  function updateHUD(){const s=$('expWeatherInfo');if(s)s.textContent=storm>0?'⚡ TEMPESTADE · '+Math.ceil(storm)+'s':'☁ CÉU DA FLORESTA';}
  function open(){const d=$('expMythosDialog');if(d&&!d.open)d.showModal();}
  $('expMythos')?.addEventListener('click',open);
  $('expCloseMythos')?.addEventListener('click',()=>$('expMythosDialog').close());
  $('expStormDemo')?.addEventListener('click',()=>{begin();$('expMythosDialog')?.close();});
  function close(){state=null;if($('expMythosDialog')?.open)$('expMythosDialog').close();}
  function render3D(m,terrain,t,quality){if(!state||storm<=0)return;
    const n=quality==='economia'?18:44;
    for(let i=0;i<n;i++){
      const h=Math.sin(i*151.9+t*1.9)*4383.22,k=h-Math.floor(h),other=Math.sin(i*177.7+t*2.31)*26239.53;
      const f=other-Math.floor(other),x=state.x+(k-.5)*40,z=state.z+(f-.5)*40;
      const y=terrain(x,z)+1.5+((t*10+i*.57)%9);
      m.box(x,y,z,.018,.64,.015,'#7fa6a6');
    }
    if(flash>.2){for(let j=0;j<4;j++){
      const x=state.x+23-j*.75,z=state.z+27+j*.42,y=terrain(x,z)+5.6-j*1.2;
      m.sphere(x,y,z,.13,.62,.14,'#b6e8ff',3,4);
    }}
  }
  function render2D(ctx,w,h){if(!state||storm<=0)return;ctx.save();ctx.fillStyle=`rgba(19,38,54,${Math.min(.30,storm*.008)})`;ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#a6bfd555';ctx.lineWidth=1;
    for(let i=0;i<80;i++){const x=((i*79+Math.floor(elapsed*72))%Math.max(1,w)),y=((i*123+Math.floor(elapsed*140))%Math.max(1,h));ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-4,y+20);ctx.stroke();}
    if(flash>.15){ctx.fillStyle=`rgba(222,238,255,${flash*.25})`;ctx.fillRect(0,0,w,h);}ctx.restore();
  }
  window.MythosV18={start,tick,begin,open,close,render3D,render2D,get weather(){return storm>0?'tempestade':'calmo'},get intensity(){return storm>0?Math.min(1,storm/12):0},get flash(){return flash},get active(){return Boolean(state)}};
})();
