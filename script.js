(() => {
  const windows = [...document.querySelectorAll('.window')];
  const taskButtons = document.getElementById('task-buttons');
  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');
  const clock = document.getElementById('clock');
  let z = 20;
  const titleFor = w => w.querySelector('.titlebar > span')?.textContent || w.dataset.window;
  function setActive(win){windows.forEach(w=>w.classList.remove('active'));if(!win)return;win.classList.add('active');win.style.zIndex=++z;[...taskButtons.children].forEach(b=>b.classList.toggle('active',b.dataset.task===win.dataset.window));}
  function ensureTask(win){let b=taskButtons.querySelector(`[data-task="${win.dataset.window}"]`);if(!b){b=document.createElement('button');b.className='task-button';b.dataset.task=win.dataset.window;b.textContent=titleFor(win);b.addEventListener('click',()=>{if(!win.classList.contains('open')){win.classList.add('open');setActive(win)}else if(win.classList.contains('active')){win.classList.remove('open','active');b.classList.remove('active')}else setActive(win)});taskButtons.appendChild(b)}}
  function openWindow(id){const win=document.querySelector(`[data-window="${id}"]`);if(!win)return;win.classList.add('open');ensureTask(win);setActive(win);startMenu.classList.remove('open')}
  function closeWindow(win){if(!win)return;win.classList.remove('open','active','maximized');taskButtons.querySelector(`[data-task="${win.dataset.window}"]`)?.remove()}
  document.addEventListener('click',e=>{const opener=e.target.closest('[data-open]');if(opener)openWindow(opener.dataset.open)});
  document.addEventListener('click',e=>{const back=e.target.closest('[data-back]');if(!back)return;closeWindow(back.closest('.window'));openWindow(back.dataset.back)});
  windows.forEach(win=>{
    win.querySelector('[data-close]')?.addEventListener('click',()=>closeWindow(win));
    win.querySelector('[data-minimize]')?.addEventListener('click',()=>{win.classList.remove('open','active');taskButtons.querySelector(`[data-task="${win.dataset.window}"]`)?.classList.remove('active')});
    win.querySelector('[data-maximize]')?.addEventListener('click',()=>{win.classList.toggle('maximized');setActive(win)});
    win.addEventListener('mousedown',()=>setActive(win));
    const bar=win.querySelector('.titlebar');let drag=null;
    bar?.addEventListener('mousedown',e=>{if(matchMedia('(max-width:760px)').matches||e.target.closest('button')||win.classList.contains('maximized'))return;const r=win.getBoundingClientRect();drag={dx:e.clientX-r.left,dy:e.clientY-r.top};e.preventDefault()});
    document.addEventListener('mousemove',e=>{if(!drag)return;win.style.left=Math.max(0,Math.min(innerWidth-win.offsetWidth,e.clientX-drag.dx))+'px';win.style.top=Math.max(0,Math.min(innerHeight-46-win.offsetHeight,e.clientY-drag.dy))+'px'});
    document.addEventListener('mouseup',()=>drag=null);
  });
  startButton.addEventListener('click',e=>{e.stopPropagation();startMenu.classList.toggle('open')});
  document.addEventListener('click',e=>{if(!e.target.closest('#start-menu')&&!e.target.closest('#start-button'))startMenu.classList.remove('open')});
  document.querySelector('.clippy-close')?.addEventListener('click',()=>document.getElementById('clippy').hidden=true);
  function updateClock(){clock.textContent=new Intl.DateTimeFormat([],{hour:'numeric',minute:'2-digit'}).format(new Date())}updateClock();setInterval(updateClock,30000);

  document.querySelectorAll('.filmstrip').forEach(strip=>{const main=document.getElementById(strip.dataset.viewer);const caption=document.getElementById(strip.dataset.caption);strip.querySelectorAll('button').forEach((b,i)=>{if(i===0)b.classList.add('selected');b.addEventListener('click',()=>{main.src=b.dataset.src;caption.textContent=b.dataset.label;strip.querySelectorAll('button').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')})})});
  const lightbox=document.getElementById('lightbox');document.querySelectorAll('[data-lightbox]').forEach(b=>b.addEventListener('click',()=>{lightbox.querySelector('img').src=b.dataset.lightbox;lightbox.hidden=false}));lightbox.querySelector('button').addEventListener('click',()=>lightbox.hidden=true);lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.hidden=true});

  // Paint
  const canvas=document.getElementById('paint-canvas'),ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round';let drawing=false,eraser=false;
  function pos(e){const r=canvas.getBoundingClientRect(),p=e.touches?.[0]||e;return{x:(p.clientX-r.left)*canvas.width/r.width,y:(p.clientY-r.top)*canvas.height/r.height}}
  function startDraw(e){drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()}
  function draw(e){if(!drawing)return;const p=pos(e);ctx.strokeStyle=eraser?'#fff':document.getElementById('paint-color').value;ctx.lineWidth=document.getElementById('paint-size').value;ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()}
  ['mousedown','touchstart'].forEach(x=>canvas.addEventListener(x,startDraw,{passive:false}));['mousemove','touchmove'].forEach(x=>canvas.addEventListener(x,draw,{passive:false}));['mouseup','mouseleave','touchend'].forEach(x=>canvas.addEventListener(x,()=>drawing=false));
  document.getElementById('paint-eraser').addEventListener('click',()=>{eraser=!eraser;document.getElementById('paint-eraser').textContent=eraser?'Pencil':'Eraser'});document.getElementById('paint-clear').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));document.getElementById('paint-save').addEventListener('click',()=>{const a=document.createElement('a');a.download='stephanie-98-masterpiece.png';a.href=canvas.toDataURL('image/png');a.click()});

  // YouTube blocks embeds opened directly from file:// because there is no web
  // referrer. Keep real embeds on GitHub Pages, but show a useful local preview.
  if(location.protocol==='file:'){
    document.querySelectorAll('.player-shell iframe').forEach(frame=>{
      const src=frame.src;
      let href=src;
      let service='video';
      if(src.includes('youtube.com/embed/')||src.includes('youtube-nocookie.com/embed/')){
        href='https://www.youtube.com/watch?v='+src.split('/embed/')[1].split('?')[0];
        service='YouTube';
      }else if(src.includes('player.vimeo.com/video/')){
        href='https://vimeo.com/'+src.split('/video/')[1].split('?')[0];
        service='Vimeo';
      }
      const fallback=document.createElement('div');
      fallback.className='local-video-fallback';
      fallback.innerHTML=`<div><strong>Video ready to watch</strong><p>${service} does not allow an embedded player when this site is opened directly from your computer. The video will play inside this window after the site is published.</p><a class="classic-button" href="${href}" target="_blank" rel="noopener">Watch on ${service}</a></div>`;
      frame.replaceWith(fallback);
    });
  }

  // Compact playable Klondike solitaire
  const suits=['♠','♥','♦','♣'], ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];let game;
  const color=s=>s==='♥'||s==='♦'?'red':'black';
  function newGame(){let deck=[];suits.forEach(s=>ranks.forEach((r,i)=>deck.push({s,r,v:i+1,face:false,id:crypto.randomUUID()})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}game={stock:[],waste:[],found:[[],[],[],[]],table:[[],[],[],[],[],[],[]],selected:null};for(let c=0;c<7;c++){for(let r=0;r<=c;r++){const card=deck.pop();card.face=r===c;game.table[c].push(card)}}game.stock=deck;renderSolitaire()}
  function cardEl(card,loc,pi,ci){const d=document.createElement('div');d.className=`card ${card.face?color(card.s):'back'} ${game.selected?.card.id===card.id?'selected':''}`;d.textContent=card.face?card.r+card.s:'';d.dataset.loc=loc;d.dataset.pi=pi;d.dataset.ci=ci;d.addEventListener('click',()=>cardClick(loc,pi,ci));return d}
  function canStack(a,b){return b.face&&color(a.s)!==color(b.s)&&a.v===b.v-1}function canFound(c,p){return (!p.length&&c.v===1)||(p.length&&p.at(-1).s===c.s&&c.v===p.at(-1).v+1)}
  function cardClick(loc,pi,ci){if(loc==='stock'){if(game.stock.length){const c=game.stock.pop();c.face=true;game.waste.push(c)}else{game.stock=game.waste.reverse().map(c=>({...c,face:false}));game.waste=[]}game.selected=null;renderSolitaire();return}
    const pile=loc==='table'?game.table[pi]:loc==='waste'?game.waste:game.found[pi];const card=pile[ci];if(!card||!card.face)return;
    if(!game.selected){game.selected={loc,pi,ci,card};renderSolitaire();return}
    const sel=game.selected;if(sel.card.id===card.id){game.selected=null;renderSolitaire();return}
    if(loc==='table'&&canStack(sel.card,card)){moveSelected('table',pi);return}game.selected={loc,pi,ci,card};renderSolitaire()}
  function moveSelected(dest,pi){const s=game.selected;let src=s.loc==='table'?game.table[s.pi]:s.loc==='waste'?game.waste:game.found[s.pi];const moving=s.loc==='table'?src.splice(s.ci):[src.pop()];game.table[pi].push(...moving);if(s.loc==='table'&&src.length)src.at(-1).face=true;game.selected=null;renderSolitaire()}
  function tryEmptyTable(pi){if(!game.selected)return;const c=game.selected.card;if(c.v!==13)return;const s=game.selected;let src=s.loc==='table'?game.table[s.pi]:s.loc==='waste'?game.waste:game.found[s.pi];const moving=s.loc==='table'?src.splice(s.ci):[src.pop()];game.table[pi].push(...moving);if(s.loc==='table'&&src.length)src.at(-1).face=true;game.selected=null;renderSolitaire()}
  function tryFoundation(pi){if(!game.selected)return;const c=game.selected.card;if(!canFound(c,game.found[pi]))return;const s=game.selected;let src=s.loc==='table'?game.table[s.pi]:s.loc==='waste'?game.waste:game.found[s.pi];if(s.loc==='table'&&s.ci!==src.length-1)return;game.found[pi].push(src.pop());if(s.loc==='table'&&src.length)src.at(-1).face=true;game.selected=null;renderSolitaire();if(game.found.every(p=>p.length===13))document.getElementById('solitaire-status').textContent='Congratulations! Since you’re clearly persistent, you should probably hire Stephanie too.'}
  function renderSolitaire(){const board=document.getElementById('solitaire-board');board.innerHTML='';const stock=document.createElement('div');stock.className='pile';stock.style.gridColumn='1';stock.style.gridRow='1';if(game.stock.length)stock.append(cardEl(game.stock.at(-1),'stock',0,game.stock.length-1));else stock.innerHTML='<div class="foundation-label">↻</div>';stock.addEventListener('click',e=>{if(e.target===stock)cardClick('stock',0,0)});board.append(stock);
    const waste=document.createElement('div');waste.className='pile';waste.style.gridColumn='2';waste.style.gridRow='1';if(game.waste.length)waste.append(cardEl(game.waste.at(-1),'waste',0,game.waste.length-1));board.append(waste);
    game.found.forEach((p,i)=>{const el=document.createElement('div');el.className='pile';el.style.gridColumn=4+i;el.style.gridRow='1';el.innerHTML=p.length?'':'<div class="foundation-label">A</div>';if(p.length)el.append(cardEl(p.at(-1),'found',i,p.length-1));el.addEventListener('dblclick',()=>tryFoundation(i));el.addEventListener('click',e=>{if(e.target===el||e.target.classList.contains('foundation-label'))tryFoundation(i)});board.append(el)});
    game.table.forEach((p,i)=>{const el=document.createElement('div');el.className='pile';el.style.gridColumn=1+i;el.style.gridRow='2';p.forEach((c,j)=>{const ce=cardEl(c,'table',i,j);ce.style.top=(j*28)+'px';el.append(ce)});el.style.minHeight=Math.max(340,p.length*28+125)+'px';el.addEventListener('click',e=>{if(e.target===el)tryEmptyTable(i)});board.append(el)});
  }
  document.getElementById('new-game').addEventListener('click',newGame);document.addEventListener('dblclick',e=>{const c=e.target.closest('.card');if(!c)return;const loc=c.dataset.loc,pi=+c.dataset.pi,ci=+c.dataset.ci;const pile=loc==='table'?game.table[pi]:loc==='waste'?game.waste:game.found[pi];const card=pile[ci];if(!card.face)return;game.selected={loc,pi,ci,card};const fi=game.found.findIndex(p=>canFound(card,p));if(fi>=0)tryFoundation(fi)});newGame();
  setTimeout(()=>{startMenu.classList.add('open')},450);
})();
