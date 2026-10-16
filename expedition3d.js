/* V1.8 · Motor WebGL: WebGL 1, sem bibliotecas externas, arquivos offline.
 * O cenário e modelos são malhas tridimensionais com iluminação e z-buffer.
 * O aspecto é estilizado; não são digitalizações nem avatares fotorrealistas.
 */
'use strict';
(() => {
  const canvas = document.getElementById('world3d');
  const status = document.getElementById('expGraphicsStatus');
  const qualityBtn = document.getElementById('expGraphics');
  const css3d = 'expedition-3d-active';
  if (!canvas) return;
  const $ = id => document.getElementById(id);
  let gl = null, program = null, skyProgram = null, buffer = null, skyBuffer = null, staticBuffer = null, dynamicBuffer = null;
  let staticMesh = null, lastArena = '', lastQuality = '', sceneReady = false;
  let quality = 'normal', enabled = false, w = 0, h = 0, dpr = 1, frame = 0;
  try { quality = localStorage.getItem('batalha_qualidade_v16') === 'economia' ? 'economia' : 'normal'; } catch (_) {}
  const PI = Math.PI, TAU = PI * 2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const rnd=n=>{const p=Math.sin(n*127.11+17.21)*47681.97;return p-Math.floor(p);};
  const hex=c=>{if(Array.isArray(c))return c; c=c.replace('#','');return [parseInt(c.slice(0,2),16)/255,parseInt(c.slice(2,4),16)/255,parseInt(c.slice(4,6),16)/255]};
  const WORLD=43;
  const riverZ=x=>17.6+1.7*Math.sin(x*.097)+.85*Math.cos(x*.22);
  const isRiver=(x,z)=>Math.abs(z-riverZ(x))<4.0;
  function terrain(x,z){let hill=.3*Math.sin(x*.18)*Math.cos(z*.14)+.16*Math.sin(x*.47+z*.32)+.04*Math.sin(x*1.3-z*.78);
    const dist=Math.abs(z-riverZ(x));
    if(dist<5.8)hill-=(1-Math.min(1,Math.max(0,(dist-2.7)/3.1)))*(.75);
    return hill;
  }
  function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
  function makeProgram(vs,fs){const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p;}
  const vertex=`attribute vec3 aPos; attribute vec3 aNormal; attribute vec3 aColor; uniform mat4 uVP; varying vec3 vColor; varying float vFog; varying float vHeight;
    void main(){vec4 p=uVP*vec4(aPos,1.);gl_Position=p;float sun=max(dot(normalize(aNormal),normalize(vec3(-0.47,0.93,0.53))),0.);float diff=.43+sun*.57;vColor=aColor*diff;vFog=clamp((length(gl_Position.xyz/gl_Position.w)*.06)+(p.w-18.)/80.,0.,.78);vHeight=aPos.y;}`;
  const fragment=`precision mediump float; varying vec3 vColor; varying float vFog; varying float vHeight;uniform vec3 uFog;uniform float uTime;
    void main(){float grit=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);vec3 c=vColor*(.97+grit*.055);c=mix(c,uFog,clamp(vFog,0.,.76));c=pow(c,vec3(.90));gl_FragColor=vec4(c,1.);}`;
  const skyVS=`attribute vec2 aPos; varying vec2 uv;void main(){uv=aPos*.5+.5;gl_Position=vec4(aPos,1.,1.);}`;
  const skyFS=`precision mediump float; varying vec2 uv;uniform float uTime;uniform float uWarm;uniform float uStorm;uniform float uFlash;
    void main(){float t=clamp(uv.y,0.,1.);vec3 top=mix(vec3(.074,.18,.27),vec3(.28,.20,.19),uWarm);vec3 low=mix(vec3(.37,.59,.58),vec3(.72,.50,.35),uWarm);vec3 sky=mix(low,top,pow(t,.7));float glow=exp(-pow(length((uv-vec2(.76,.78))*vec2(1.3,2.4))*3.4,2.));sky+=glow*vec3(.35,.27,.13);float cloud=0.08*sin(uv.x*11.+uv.y*13.+uTime*.08)*sin(uv.x*21.-uv.y*9.);sky=mix(sky,vec3(.055,.090,.11)+cloud,clamp(uStorm,0.,.90)*.82);sky+=uFlash*vec3(.33,.40,.46);gl_FragColor=vec4(sky,1.);}`;
  function init(){try{
    gl=canvas.getContext('webgl',{antialias:false,alpha:false,powerPreference:'default',preserveDrawingBuffer:false});
    if(!gl)throw Error('WebGL indisponível');
    program=makeProgram(vertex,fragment);skyProgram=makeProgram(skyVS,skyFS);
    buffer=gl.createBuffer();staticBuffer=gl.createBuffer();dynamicBuffer=gl.createBuffer();skyBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);
    enabled=true;setStatus('WEBGL 3D');return true;
  }catch(e){console.warn('Modo WebGL indisponível, usando renderização anterior:',e);enabled=false;setStatus('MODO 2D');return false;}}
  function setStatus(msg){if(status)status.textContent=msg;if(qualityBtn)qualityBtn.textContent=quality==='normal'?'⚙ GRÁFICOS: NORMAL':'⚙ GRÁFICOS: LEVE';}
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();enabled=false;sceneReady=false;document.documentElement.classList.remove(css3d);setStatus('MODO 2D');});
  canvas.addEventListener('webglcontextrestored',()=>{gl=null;init();sceneReady=false;});
  class Mesh{
    constructor(){this.data=[];}
    tri(a,b,c,col,brightness=1){const A=hex(col),u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
      let nx=u[1]*v[2]-u[2]*v[1],ny=u[2]*v[0]-u[0]*v[2],nz=u[0]*v[1]-u[1]*v[0],l=Math.hypot(nx,ny,nz)||1;nx/=l;ny/=l;nz/=l;
      for(const p of [a,b,c])this.data.push(...p,nx,ny,nz,clamp(A[0]*brightness,0,1),clamp(A[1]*brightness,0,1),clamp(A[2]*brightness,0,1));
    }
    quad(a,b,c,d,col,bright=1){this.tri(a,b,c,col,bright);this.tri(a,c,d,col,bright);}
    box(x,y,z,w,h,d,col,rot=0){const sx=w/2,sy=h/2,sz=d/2,cs=Math.cos(rot),sn=Math.sin(rot);const v=(a,b,c)=>[x+a*cs+c*sn,y+b,z+c*cs-a*sn];
      const p=[v(-sx,-sy,-sz),v(sx,-sy,-sz),v(sx,sy,-sz),v(-sx,sy,-sz),v(-sx,-sy,sz),v(sx,-sy,sz),v(sx,sy,sz),v(-sx,sy,sz)];
      [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]].forEach((f,i)=>this.quad(...f.map(k=>p[k]),col,i===4?1.12:i===0?.76:1));
    }
    cylinder(x,y,z,r,h,col,sides=7,topR=r){let bot=[],top=[];for(let i=0;i<sides;i++){const a=TAU*i/sides;bot.push([x+Math.cos(a)*r,y-h/2,z+Math.sin(a)*r]);top.push([x+Math.cos(a)*topR,y+h/2,z+Math.sin(a)*topR]);}
      for(let i=0;i<sides;i++){const j=(i+1)%sides;this.quad(bot[i],bot[j],top[j],top[i],col,.91+rnd(x*51+z*41+i)*.15);this.tri([x,y+h/2,z],top[i],top[j],col);}
    }
    sphere(x,y,z,rx,ry,rz,col,lat=5,lon=8){for(let j=0;j<lat;j++){
      let p1=-PI/2+PI*j/lat,p2=-PI/2+PI*(j+1)/lat;
      for(let i=0;i<lon;i++){let a=TAU*i/lon,b=TAU*(i+1)/lon;
        const p=(e,f)=>[x+Math.cos(e)*Math.cos(f)*rx,y+Math.sin(e)*ry,z+Math.cos(e)*Math.sin(f)*rz];
        this.quad(p(p1,a),p(p1,b),p(p2,b),p(p2,a),col,.88+rnd(x*31+i*17+j*5)*.21);
      }
    }}
    cone(x,y,z,r,h,col,segments=6){const apex=[x,y+h,z];for(let i=0;i<segments;i++){const a=TAU*i/segments,b=TAU*(i+1)/segments;
      this.tri([x+r*Math.sin(a),y,z+r*Math.cos(a)],[x+r*Math.sin(b),y,z+r*Math.cos(b)],apex,col,.86+rnd(i+x)*.2);}}
    thinLine(x,y,z,dx,dy,dz,width,col){this.cylinder(x+dx/2,y+dy/2,z+dz/2,width,Math.hypot(dx,dy,dz),col,5);}
    finish(){return new Float32Array(this.data);}
  }
  function makeStatic(arena){const m=new Mesh(),warm=arena==='munduruku';
    const steps=quality==='economia'?58:82,area=WORLD*1.16;
    for(let i=0;i<steps;i++)for(let j=0;j<steps;j++){
      const a=-area+i*2*area/steps,b=-area+j*2*area/steps,e=2*area/steps;
      const p=(x,z)=>[x,terrain(x,z),z];const col=isRiver(a+e*.5,b+e*.5)?'#29564d':
        (rnd(i*11+j*97)>.89?'#776944':rnd(i*31+j*17)>.65?'#4c7550':warm?'#426c49':'#356c59');
      m.quad(p(a,b),p(a+e,b),p(a+e,b+e),p(a,b+e),col,.84+rnd(i*4+j*9)*.27);
    }
    // Water band with visible 3-D banks, folds, and reflected light.
    for(let ix=0;ix<94;ix++){const x=-50+ix*1.08,ex=x+1.1,rz=riverZ(x),ez=riverZ(ex);
      for(let k=0;k<7;k++){let f=k/7,ff=(k+1)/7,z1=rz-2.85+5.7*f,z2=rz-2.85+5.7*ff,ze1=ez-2.85+5.7*f,ze2=ez-2.85+5.7*ff;
        const p=(xx,zz)=>[xx,terrain(xx,zz)+.12,zz];m.quad(p(x,z1),p(ex,ze1),p(ex,ze2),p(x,z2),k%3===0?'#31808a':'#3f91a1',.91+rnd(ix+k)*.19);
      }
    }
    // Packed earth trail connecting starting base, river and routes.
    for(let z=-40;z<35;z+=1.7){const x=-8+Math.sin(z*.075)*2; if(isRiver(x,z))continue;const p=(xx,zz)=>[xx,terrain(xx,zz)+.035,zz];m.quad(p(x-1,z),p(x+1,z),p(x+1,z+1.7),p(x-1,z+1.7),'#8c7953',.85+rnd(z)*.14);}
    // Large canopy trees have literal trunks / branches / many non-flat leafy volumes.
    const trees=quality==='economia'?78:164;
    for(let i=0;i<trees;i++){let x=(rnd(i*4+11)-.5)*96,z=(rnd(i*7+3)-.5)*96;
      if(isRiver(x,z)||Math.hypot(x+8,z+26)<5||Math.hypot(x-8,z-33)<4)continue;
      const y=terrain(x,z),sz=.78+rnd(i*19)*.97,hh=4.0*sz,leaf=['#2c5c3c','#3d7650','#245f50','#417e4c','#567a40','#266454'][i%6];
      m.cylinder(x,y+hh*.47,z,.16*sz,hh,'#68513b',7,.11*sz);
      for(let k=0;k<3;k++){const a=k*2.4+i*.3; m.sphere(x+Math.cos(a)*.65*sz,y+hh+(.15*k)*sz,z+Math.sin(a)*.64*sz,1.65*sz,1.13*sz,1.52*sz,leaf,4,7);}
      if(i%9===0)m.cylinder(x,y+hh*.27,z,.23*sz,.35*sz,'#8b7250',6);
    }
    // Palms near the river, simple fronds giving readable characteristic silhouette.
    for(let i=0;i<(quality==='economia'?13:24);i++){const x=-42+rnd(i*19)*84,z=riverZ(x)+(i%2===0?-1:1)*(4.7+rnd(i+19)*4),y=terrain(x,z),s=4.8+rnd(i+5)*3;
      m.cylinder(x,y+s/2,z,.13,s,'#776047',7,.10);
      for(let k=0;k<6;k++){const a=TAU*k/6+rnd(i)*.4,dx=Math.cos(a),dz=Math.sin(a),ex=x+dx*2.4,ez=z+dz*2.4;
        m.tri([x,y+s+.2,z],[ex,y+s-.7,ez],[x+dx*.5+dz*.39,y+s+.06,z+dz*.5-dx*.39],'#51845a');
        m.tri([x,y+s+.2,z],[ex,y+s-.7,ez],[x+dx*.5-dz*.39,y+s+.06,z+dz*.5+dx*.39],'#37714e');}
    }
    // Thatch shelters on four corners, each built from cuboids and roof planes.
    for(const [i,[x,z]] of [[-24,-30],[27,-29],[-28,33],[27,34]].entries()){
      const y=terrain(x,z);m.box(x,y+.9,z,3.6,1.8,3.2,i%2?'#91694a':'#99744d');
      const apex=[x,y+3.6,z],a=[x-2.45,y+1.8,z-2.15],b=[x+2.45,y+1.8,z-2.15],c=[x+2.45,y+1.8,z+2.15],d=[x-2.45,y+1.8,z+2.15];
      m.quad(a,b,apex,apex,'#b59665');m.tri(b,c,apex,'#93704d');m.tri(c,d,apex,'#ae8856');m.tri(d,a,apex,'#b3975d');
      m.box(x,y+.87,z+1.62,.8,1.65,.06,'#322a23');
    }
    // Pebbles, ferns, wildflowers on forest floor.
    const foliage=quality==='economia'?160:400;
    for(let i=0;i<foliage;i++){let x=(rnd(i*47+7)-.5)*93,z=(rnd(i*29+5)-.5)*93,y=terrain(x,z);
      if(isRiver(x,z))continue;
      if(i%8===0){m.sphere(x,y+.12,z,.35+rnd(i)*.25,.17,.29,'#6e6958',3,6);}else {
        const s=.28+rnd(i+3)*.32,cc=i%2?'#527f45':'#639050';m.cone(x,y,z,s,.46+rnd(i)*.52,cc,5);
      }
    }
    return m.finish();
  }
  function humanoid(m,x,z,tribe,time,scale=1,yaw=0,boss=false){const y=terrain(x,z),u=tribe==='muirapinima',colors=u?['#2e70bd','#db4a62','#f4dfaf']:['#b93c36','#edbe53','#fff0bf'];
    const skin=boss?'#916649':'#b87954',hair='#22211e',t=scale,cs=Math.cos(yaw),sn=Math.sin(yaw);
    const pos=(dx,dy,dz)=>[x+dx*cs+dz*sn,y+dy*t,z+dz*cs-dx*sn];
    const bob=Math.sin(time*10)*.045,walk=Math.sin(time*8)*.23;
    for(let side of [-1,1]){let p=pos(side*.25,.59,side*walk*.5);m.cylinder(p[0],p[1],p[2],.16*t,.99*t,'#312d2c',6,.13*t);
      let foot=pos(side*.25,.12,side*walk*.66+.12);m.box(foot[0],foot[1],foot[2],.34*t,.2*t,.5*t,'#3f3229',yaw);}
    let core=pos(0,1.48+bob,0);m.sphere(core[0],core[1],core[2],.47*t,.65*t,.25*t,colors[0],5,8);
    let waist=pos(0,.99,0);m.box(waist[0],waist[1],waist[2],.7*t,.30*t,.32*t,colors[1],yaw);
    for(let side of [-1,1]){let arm=pos(side*.59,1.43+bob,.06);m.cylinder(arm[0],arm[1],arm[2],.135*t,.83*t,skin,6,.14*t);
      let cuff=pos(side*.6,1.24+bob,0);m.box(cuff[0],cuff[1],cuff[2],.24*t,.12*t,.24*t,colors[1],yaw);}
    let neck=pos(0,2.04+bob,0);m.cylinder(neck[0],neck[1],neck[2],.145*t,.19*t,skin,6);
    let head=pos(0,2.38+bob,0);m.sphere(head[0],head[1],head[2],.29*t,.35*t,.27*t,skin,6,9);
    let hairtop=pos(0,2.65+bob,-.07);m.sphere(hairtop[0],hairtop[1],hairtop[2],.30*t,.18*t,.27*t,hair,4,8);
    const headband=pos(0,2.59+bob,.05);m.box(headband[0],headband[1],headband[2],.64*t,.11*t,.32*t,colors[1],yaw);
    for(let i=-4;i<=4;i++){const dx=i*.12*t,sz=(.7+(4-Math.abs(i))*.12)*t;let base=pos(i*.12,2.64+bob,0);const tip=pos(i*.2,2.64+bob+sz,-.07);
      m.tri([base[0]-.075*t,base[1],base[2]],[base[0]+.075*t,base[1],base[2]],tip,colors[Math.abs(i)%3]);}
    for(let side of [-1,1]){let eye=pos(side*.12,2.41+bob,.252);m.sphere(eye[0],eye[1],eye[2],.033*t,.033*t,.03*t,'#232321',3,5);}
    let sash=pos(.18,1.48+bob,.16);m.box(sash[0],sash[1],sash[2],.12*t,1.05*t,.09*t,colors[1],yaw-.22);
  }

  // Explorador em uniforme de campo: 3D procedural, corpo articulado, rosto,
  // botas, colete, mochila de sobrevivência, cantil, lanterna e chapéu.
  // Modelo original estilizado; nenhum uniforme ou retrato de um povo real.
  function explorer(m,x,z,time,scale=1,yaw=0,variant=0,tool='facao'){
    const y=terrain(x,z),cs=Math.cos(yaw),sn=Math.sin(yaw),s=scale;
    const p=(a,b,c)=>[x+(a*cs+c*sn)*s,y+b*s,z+(c*cs-a*sn)*s];
    const v=(a,b,c,rx,ry,rz,col,lat=5,lon=8)=>{let q=p(a,b,c);m.sphere(...q,rx*s,ry*s,rz*s,col,lat,lon);};
    const bx=(a,b,c,dx,dy,dz,col,rot=yaw)=>{let q=p(a,b,c);m.box(...q,dx*s,dy*s,dz*s,col,rot);};
    const coat=variant?'#536454':'#777c51',vest=variant?'#686b4b':'#988d60',skin=['#ba845d','#865b47','#c08f6b'][variant%3],boots='#34332d';
    const walking=Math.sin(time*7.5);
    // Pés e pernas alternam em fases opostas, criando caminhada legível em 3D.
    for(const side of [-1,1]){
      const swing=side*walking*.24;
      v(side*.22,.84,swing*.60,.18,.40,.19,'#515c40');
      v(side*.22,.44,swing*.73,.16,.33,.17,'#4a5440');
      bx(side*.23,.16,swing+.10,.35,.23,.51,boots);
      v(side*.22,.96,swing*.22,.20,.20,.20,'#667254',4,7);
    }
    v(0,1.44,0,.49,.64,.27,coat,7,10);
    bx(0,1.25,.16,.82,.48,.18,vest);
    // Bolsos, costuras e fivelas tornam o modelo menos abstrato.
    bx(-.23,1.56,.282,.31,.38,.055,'#b9ac7c');bx(.24,1.56,.282,.30,.38,.055,'#afa076');
    bx(0,1.18,.275,.70,.085,.07,'#4b4638');bx(0,1.18,.325,.14,.12,.04,'#c2ae6b');
    for(const side of [-1,1]){
      const aw=-side*walking*.23;
      v(side*.61,1.56,aw*.40,.16,.31,.16,coat);
      v(side*.67,1.13,aw*.90,.135,.25,.13,skin);
      v(side*.68,.93,aw*1.04,.13,.12,.13,skin);
      bx(side*.59,1.43,.19,.09,.32,.05,'#b9ab7e');
    }
    // Mochila alta, tiras laterais, lanterna e cantil.
    bx(0,1.49,-.39,.70,.92,.37,'#435a45');bx(0,1.80,-.44,.76,.19,.42,'#697b55');
    bx(-.51,1.29,-.29,.25,.38,.31,'#536047');
    v(-.50,1.11,-.25,.13,.19,.13,'#85968c');
    bx(.57,1.05,-.30,.14,.30,.18,'#262d2e');
    v(0,2.03,0,.15,.17,.16,skin);
    v(0,2.36,.02,.29,.34,.27,skin,8,12);
    v(0,2.20,.27,.12,.095,.085,skin,4,6); // nariz
    for(const side of [-1,1]){
      v(side*.115,2.39,.257,.045,.029,.020,'#2d2924',3,5);
      v(side*.11,2.56,.10,.10,.04,.10,'#342a23',3,5);
    }
    bx(0,2.66,0,.66,.13,.61,'#454d35');
    bx(0,2.62,.26,.77,.05,.33,'#606e4c'); // aba do chapéu
    bx(0,2.79,-.025,.48,.22,.45,'#596847');
    bx(0,2.66,.14,.47,.045,.11,'#bbab7e');
    if(variant===0){
      if(tool==='carabina'){ // Silhueta de equipamento fictício, sem peças funcionais.
        bx(.70,1.15,.32,.12,.85,.18,'#404746');bx(.70,1.42,.32,.28,.18,.22,'#68716a');bx(.71,.77,.32,.17,.16,.18,'#373d3d');
      } else if(tool==='sinalizador'){
        bx(.66,1.08,.35,.16,.53,.15,'#cf553a');v(.66,1.39,.35,.12,.13,.12,'#eed1a0',5,8);
      } else {bx(.65,1.05,.30,.10,.36,.09,'#d9d2a2');bx(.65,.85,.30,.18,.15,.13,'#483c31');}
    }
  }

  function buildDynamics(S){const m=new Mesh(),t=S.elapsed||0;
    const movement=Math.hypot(S.x-(S._v16prevX??S.x),S.z-(S._v16prevZ??S.z));S._v16prevX=S.x;S._v16prevZ=S.z;
    if(S.profile==='explorador')explorer(m,S.x,S.z,movement>.002?t:0,1.06,S.yaw,0,S.tool);else humanoid(m,S.x,S.z,S.tribe,movement>.002?t:0,1.06,S.yaw);
    if(window.GuardianV14?.mode!=='solo')for(let i=0;i<S.squad.length;i++){const a=S.squad[i];if(S.profile==='explorador')explorer(m,a.x,a.z,t+i*.9,.87,S.yaw,i+1);else humanoid(m,a.x,a.z,S.tribe,t+i*.9,.89,S.yaw);}
    for(let i=0;i<S.enemy.length;i++){const e=S.enemy[i];if(e.hp>0)humanoid(m,e.x,e.z,S.rival,t+i,.93,Math.atan2(S.x-e.x,S.z-e.z));}
    for(const animal of S.animals){if(S.items.find(i=>i.id===animal.id)?.done)continue;let x=animal.x,z=animal.z,y=terrain(x,z);m.sphere(x,y+.62,z,.8,.50,.4,'#9b7350',4,8);m.sphere(x+.56,y+.88,z,.35,.33,.32,'#b28a5b',4,8);
      for(let d of [-.48,.48])for(let s of [-.24,.24])m.cylinder(x+d,y+.24,z+s,.10,.47,'#604b38',5);
    }
    for(const item of S.items){if(item.done||item.type==='enemy'||item.type==='hunt')continue;
      let y=terrain(item.x,item.z)+1.02+Math.sin(t*1.8+item.t*7)*.2;
      const color={food:'#efbb58',fish:'#64d8f9',amulet:'#c897ff'}[item.type];
      m.cone(item.x,y,item.z,.48,.92,color,5);m.cone(item.x,y+.9,item.z,.37,-.7,color,5);m.cylinder(item.x,terrain(item.x,item.z)+.08,item.z,.4,.1,'#9eac76',6);
    }
    for(const p of (window.TrailsV15?.POINTS||[])){if(window.TrailsV15.visited.includes(p.id))continue;
      const yy=terrain(p.x,p.z);m.cylinder(p.x,yy+1.65,p.z,.16,3.3,'#cba76c',6);
      m.sphere(p.x,yy+3.8+Math.sin(t*2)*.28,p.z,.67,.69,.67,'#ffd474',4,7);
      m.cone(p.x,yy+4.5,p.z,.42,.85,'#fff4b7',7);
    }
    for(const b of (window.GuardianV14?.data?.bosses||[])){if((window.GuardianV14.data.defeated||[]).includes(b.id))continue;
      const bcol=b.color||'#af9475';let x=b.x,z=b.z,y=terrain(x,z);
      m.cylinder(x,y+.12,z,1.55,.24,bcol,12);m.cone(x,y+.16,z,1.65,4.2,'#30403a',9);
      humanoid(m,x,z,b.id==='jurupari'?'muirapinima':'munduruku',t,1.52,t*.23,true);
      for(let i=0;i<5;i++){const a=t*.65+i*TAU/5;m.sphere(x+Math.sin(a)*1.75,y+2.4+Math.sin(a*3)*.4,z+Math.cos(a)*1.75,.20,.24,.20,bcol,3,5);}
    }
    window.FaunaV17?.render3D(m,terrain,t,quality);window.SurvivalV19?.render3D(m,terrain,t,quality);window.MythosV18?.render3D(m,terrain,t,quality);
    return m.finish();
  }
  function perspective(fovy,aspect,near,far){const f=1/Math.tan(fovy/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0, 0,f,0,0, 0,0,(far+near)*nf,-1, 0,0,2*far*near*nf,0]);}
  function lookAt(eye,target){const e=eye,t=target;let z=[e[0]-t[0],e[1]-t[1],e[2]-t[2]];let d=Math.hypot(...z)||1;z=z.map(v=>v/d);
    let x=[z[2],0,-z[0]];d=Math.hypot(...x)||1;x=x.map(v=>v/d);
    let y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
    return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1]);}
  function mult(a,b){const out=new Float32Array(16);for(let col=0;col<4;col++)for(let row=0;row<4;row++)for(let k=0;k<4;k++)out[col*4+row]+=a[k*4+row]*b[col*4+k];return out;}
  function resize(){if(!gl)return;let scale=quality==='economia'?.63:.90,dp=Math.min(window.devicePixelRatio||1,quality==='economia'?1:1.35);
    const ww=window.innerWidth,hh=window.innerHeight,tw=Math.max(240,Math.round(ww*scale*dp)),th=Math.max(160,Math.round(hh*scale*dp));
    if(canvas.width!==tw||canvas.height!==th){canvas.width=tw;canvas.height=th;}w=tw;h=th;dpr=dp;gl.viewport(0,0,w,h);
  }
  function drawSky(warm,t){gl.disable(gl.DEPTH_TEST);gl.useProgram(skyProgram);gl.bindBuffer(gl.ARRAY_BUFFER,skyBuffer);
    const a=gl.getAttribLocation(skyProgram,'aPos');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    gl.uniform1f(gl.getUniformLocation(skyProgram,'uWarm'),warm?1:0);gl.uniform1f(gl.getUniformLocation(skyProgram,'uTime'),t);gl.uniform1f(gl.getUniformLocation(skyProgram,'uStorm'),window.MythosV18?.intensity||0);gl.uniform1f(gl.getUniformLocation(skyProgram,'uFlash'),window.MythosV18?.flash||0);gl.drawArrays(gl.TRIANGLES,0,6);gl.enable(gl.DEPTH_TEST);
  }
  function drawMesh(data,VP,fog,t,staticDraw=false){gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,staticDraw?staticBuffer:dynamicBuffer);if(!staticDraw)gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);
    const stride=9*4;for(const [name,size,off] of [['aPos',3,0],['aNormal',3,12],['aColor',3,24]]){
      const loc=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride,off);
    }
    gl.uniformMatrix4fv(gl.getUniformLocation(program,'uVP'),false,VP);gl.uniform3fv(gl.getUniformLocation(program,'uFog'),fog);gl.uniform1f(gl.getUniformLocation(program,'uTime'),t);
    gl.drawArrays(gl.TRIANGLES,0,data.length/9);
  }
  function render(S){if(!S)return false;if(!gl&&!init())return false;if(!enabled)return false;
    try{
      const arena=S.arena,warm=arena==='munduruku';
      if(!sceneReady||lastArena!==arena||lastQuality!==quality){staticMesh=makeStatic(arena);gl.bindBuffer(gl.ARRAY_BUFFER,staticBuffer);gl.bufferData(gl.ARRAY_BUFFER,staticMesh,gl.STATIC_DRAW);lastArena=arena;lastQuality=quality;sceneReady=true;}
      resize();document.documentElement.classList.add(css3d);
      gl.clearColor(.10,.23,.25,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      drawSky(warm,S.elapsed);gl.clear(gl.DEPTH_BUFFER_BIT);
      const sn=Math.sin(S.yaw),cs=Math.cos(S.yaw),ground=terrain(S.x,S.z);
      const eye=[S.x-sn*7.6,ground+4.45,S.z-cs*7.6],target=[S.x+sn*3.4,ground+1.55,S.z+cs*3.4];
      const VP=mult(perspective(65*PI/180,w/h,.1,160),lookAt(eye,target));
      const storm=window.MythosV18?.intensity||0;const fog=storm>.05?new Float32Array([.17,.23,.27]):warm?new Float32Array([.43,.42,.31]):new Float32Array([.25,.44,.46]);
      drawMesh(staticMesh,VP,fog,S.elapsed,true);
      drawMesh(buildDynamics(S),VP,fog,S.elapsed,false);frame++;
      return true;
    }catch(e){console.error('Erro motor 3D:',e);enabled=false;document.documentElement.classList.remove(css3d);setStatus('MODO 2D');return false;}
  }
  function deactivate(){document.documentElement.classList.remove(css3d);}
  qualityBtn?.addEventListener('click',()=>{quality=quality==='normal'?'economia':'normal';try{localStorage.setItem('batalha_qualidade_v16',quality)}catch(_){}sceneReady=false;setStatus(enabled?'WEBGL 3D':'MODO 2D');});
  window.Expedition3D={render,deactivate,get available(){return enabled},terrain};
})();
