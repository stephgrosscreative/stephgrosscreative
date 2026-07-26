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
  const paintPencil=document.getElementById('paint-pencil'),paintEraser=document.getElementById('paint-eraser');
  function setPaintTool(useEraser){eraser=useEraser;paintPencil.classList.toggle('active',!eraser);paintEraser.classList.toggle('active',eraser)}
  paintPencil.addEventListener('click',()=>setPaintTool(false));
  paintEraser.addEventListener('click',()=>setPaintTool(true));
  document.querySelectorAll('[data-paint-color]').forEach(swatch=>swatch.addEventListener('click',()=>{document.getElementById('paint-color').value=swatch.dataset.paintColor;setPaintTool(false)}));
  document.getElementById('paint-clear').addEventListener('click',()=>ctx.clearRect(0,0,canvas.width,canvas.height));
  document.getElementById('paint-save').addEventListener('click',()=>{const a=document.createElement('a');a.download='stephanie-98-masterpiece.png';a.href=canvas.toDataURL('image/png');a.click()});

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

  // Playable beginner Minesweeper: 9 × 9, 10 mines, and a safe first click.
  const mineRows=9,mineCols=9,mineTotal=10;
  const mineBoard=document.getElementById('minesweeper-board');
  const mineStatus=document.getElementById('mine-status');
  const mineCounter=document.getElementById('mine-counter');
  const mineTimer=document.getElementById('mine-timer');
  const mineReset=document.getElementById('mine-reset');
  const mineFlagMode=document.getElementById('mine-flag-mode');
  let mineCells=[],mineStarted=false,mineOver=false,mineFlags=0,mineSeconds=0,mineInterval=null,flagMode=false;

  function mineNeighbors(index){
    const row=Math.floor(index/mineCols),col=index%mineCols,neighbors=[];
    for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
      if(!dr&&!dc)continue;
      const r=row+dr,c=col+dc;
      if(r>=0&&r<mineRows&&c>=0&&c<mineCols)neighbors.push(r*mineCols+c);
    }
    return neighbors;
  }
  function formatMineNumber(n){return String(Math.max(0,Math.min(999,n))).padStart(3,'0')}
  function updateMineDisplays(){
    mineCounter.textContent=formatMineNumber(mineTotal-mineFlags);
    mineTimer.textContent=formatMineNumber(mineSeconds);
  }
  function placeMines(firstIndex){
    const blocked=new Set([firstIndex,...mineNeighbors(firstIndex)]);
    const choices=mineCells.map((_,i)=>i).filter(i=>!blocked.has(i));
    for(let i=choices.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]]}
    choices.slice(0,mineTotal).forEach(i=>mineCells[i].mine=true);
    mineCells.forEach((cell,i)=>cell.count=mineNeighbors(i).filter(n=>mineCells[n].mine).length);
  }
  function startMineTimer(){
    if(mineInterval)return;
    mineInterval=setInterval(()=>{mineSeconds=Math.min(999,mineSeconds+1);updateMineDisplays()},1000);
  }
  function stopMineTimer(){clearInterval(mineInterval);mineInterval=null}
  function revealMineCell(index){
    const cell=mineCells[index];
    if(mineOver||cell.revealed||cell.flagged)return;
    if(!mineStarted){mineStarted=true;placeMines(index);startMineTimer()}
    cell.revealed=true;
    if(cell.mine){finishMinesweeper(false);return}
    if(cell.count===0)mineNeighbors(index).forEach(revealMineCell);
    checkMineWin();renderMinesweeper();
  }
  function toggleMineFlag(index){
    const cell=mineCells[index];
    if(mineOver||cell.revealed)return;
    cell.flagged=!cell.flagged;
    mineFlags+=cell.flagged?1:-1;
    updateMineDisplays();renderMinesweeper();
  }
  function checkMineWin(){
    if(mineCells.filter(c=>c.revealed).length===mineRows*mineCols-mineTotal)finishMinesweeper(true);
  }
  function finishMinesweeper(won){
    mineOver=true;stopMineTimer();mineReset.textContent=won?'😎':'😵';
    if(won){
      mineCells.forEach(c=>{if(c.mine)c.flagged=true});
      mineFlags=mineTotal;
      mineStatus.textContent='You cleared it! Since you’re this persistent, you should probably hire Stephanie.';
    }else{
      mineCells.forEach(c=>{if(c.mine)c.revealed=true});
      mineStatus.textContent='Boom! Click the face to try again.';
    }
    updateMineDisplays();renderMinesweeper();
  }
  function renderMinesweeper(){
    mineBoard.innerHTML='';
    mineCells.forEach((cell,index)=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='mine-cell';
      button.setAttribute('role','gridcell');
      if(cell.revealed){
        button.classList.add('revealed');
        if(cell.mine){button.classList.add('mine-hit');button.textContent='💣'}
        else if(cell.count){button.classList.add(`n${cell.count}`);button.textContent=cell.count}
      }else if(cell.flagged){button.classList.add('flagged');button.textContent='🚩'}
      button.setAttribute('aria-label',cell.revealed?(cell.mine?'Mine':cell.count?`${cell.count} neighboring mines`:'Empty square'):cell.flagged?'Flagged square':'Hidden square');
      button.addEventListener('click',()=>flagMode?toggleMineFlag(index):revealMineCell(index));
      button.addEventListener('contextmenu',event=>{event.preventDefault();toggleMineFlag(index)});
      mineBoard.append(button);
    });
  }
  function newMinesweeper(){
    stopMineTimer();
    mineCells=Array.from({length:mineRows*mineCols},()=>({mine:false,revealed:false,flagged:false,count:0}));
    mineStarted=false;mineOver=false;mineFlags=0;mineSeconds=0;flagMode=false;
    mineReset.textContent='🙂';mineStatus.textContent='Clear the field without touching a mine.';
    mineFlagMode.textContent='🚩 Flag mode: Off';mineFlagMode.setAttribute('aria-pressed','false');
    updateMineDisplays();renderMinesweeper();
  }
  mineReset.addEventListener('click',newMinesweeper);
  mineFlagMode.addEventListener('click',()=>{flagMode=!flagMode;mineFlagMode.textContent=`🚩 Flag mode: ${flagMode?'On':'Off'}`;mineFlagMode.setAttribute('aria-pressed',String(flagMode))});
  newMinesweeper();

  // Keep the email readable and selectable while also offering one-click copy.
  const copyEmailButton=document.getElementById('copy-email');
  const copyEmailStatus=document.getElementById('copy-email-status');
  copyEmailButton?.addEventListener('click',async()=>{
    const email=document.getElementById('contact-email').textContent.trim();
    try{
      await navigator.clipboard.writeText(email);
    }catch{
      const helper=document.createElement('textarea');
      helper.value=email;helper.setAttribute('readonly','');helper.style.position='fixed';helper.style.opacity='0';
      document.body.append(helper);helper.select();document.execCommand('copy');helper.remove();
    }
    copyEmailStatus.textContent='Email copied to your clipboard.';
  });

  // A two-step Recycle Bin Easter egg with Stephanie's chosen Merlin artwork.
  const recycleButton=document.getElementById('check-recycle');
  recycleButton?.addEventListener('click',()=>{
    document.getElementById('merlin-speech').textContent='Fine. There were a few.';
    document.getElementById('recycle-copy').textContent='They’ve been safely archived where no recruiter can find them.';
    recycleButton.hidden=true;
  });
  setTimeout(()=>{startMenu.classList.add('open')},450);
})();
