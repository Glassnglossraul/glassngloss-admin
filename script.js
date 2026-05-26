// ══ SUPABASE ══
const SUPA_URL='https://mqzjqpxgzkctdgjxtrhc.supabase.co';
const SUPA_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xempxcHhnemtjdGRnanh0cmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTQ1ODksImV4cCI6MjA5NTE5MDU4OX0.DweZkKG6ASER_gwHYvcdu6yy3QyQaoOoXKfpLAk9zX0';
const H={'Content-Type':'application/json','apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY,'Prefer':'return=representation'};

async function sbGet(t,q=''){const r=await fetch(`${SUPA_URL}/rest/v1/${t}?${q}&order=id.asc`,{headers:H});return r.json();}
async function sbPost(t,d){const r=await fetch(`${SUPA_URL}/rest/v1/${t}`,{method:'POST',headers:H,body:JSON.stringify(d)});return r.json();}
async function sbPatch(t,id,d){const r=await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`,{method:'PATCH',headers:H,body:JSON.stringify(d)});return r.json();}
async function sbDelete(t,id){await fetch(`${SUPA_URL}/rest/v1/${t}?id=eq.${id}`,{method:'DELETE',headers:H});}

// ══ STATE ══
let products=[], slides=[], editId=null, editMedia=[];
let delId=null, delType='product', tblFilter='all';
let sdEditId=null, sdImg=null;
const icons={Dresses:'👗',Tops:'👚',Skirts:'🩱',Trousers:'👖',Accessories:'💎'};
const tagColors={new:'#7aadbe',sale:'#c9a84c',event:'#b08bab',drop:'#e07070'};

// ══ PASSWORD (browser only) ══
function lPW(){return localStorage.getItem('gng_pw')||'glassngloss';}
function sPW(p){localStorage.setItem('gng_pw',p);}

// ══ LOGIN ══
function doLogin(){
  const v=document.getElementById('pwInp').value;
  if(v===lPW()){
    document.getElementById('loginEl').classList.add('hide');
    document.getElementById('app').style.display='flex';
    loadAll();
  } else {
    document.getElementById('lgErr').textContent='Incorrect password.';
    const i=document.getElementById('pwInp');i.classList.add('shake');i.value='';
    setTimeout(()=>{i.classList.remove('shake');i.focus();},420);
  }
}
function toggleEye(){const i=document.getElementById('pwInp');i.type=i.type==='password'?'text':'password';}
function doLogout(){document.getElementById('app').style.display='none';document.getElementById('loginEl').classList.remove('hide');document.getElementById('pwInp').value='';document.getElementById('lgErr').textContent='';}

// ══ NAV ══
function showPage(id,el){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  document.getElementById('page-'+id).classList.add('on');
  document.querySelectorAll('.sb-a').forEach(a=>a.classList.remove('on'));
  if(el)el.classList.add('on');
  const ts={dash:'Dashboard',products:'Products',slides:'Slides & Ticker',content:'Store Content',settings:'Settings'};
  document.getElementById('tbTitle').textContent=ts[id]||'';
  if(id==='settings')loadSettings();
  if(id==='content')loadContent();
  if(id==='products')renderTable();
  if(id==='dash')renderDash();
  if(id==='slides')renderSlidesPage();
}

// ══ LOAD ALL ══
async function loadAll(){
  try{
    [products,slides]=await Promise.all([sbGet('products'),sbGet('slides')]);
    products=products.map(p=>({...p,media:Array.isArray(p.media)?p.media:[],sizes:Array.isArray(p.sizes)?p.sizes:['One Size']}));
  }catch(e){products=[];slides=[];}
  renderDash();renderTable();
}

// ══ STATS ══
function renderDash(){
  const tot=products.length,av=products.filter(p=>p.status==='available').length,nw=products.filter(p=>p.status==='new').length,sl=products.filter(p=>p.status==='sold').length;
  document.getElementById('statsEl').innerHTML=`
    <div class="stat pu"><div class="stat-l">Total Products</div><div class="stat-v">${tot}</div><div class="stat-s">in your store</div></div>
    <div class="stat gr"><div class="stat-l">Available</div><div class="stat-v">${av}</div><div class="stat-s">ready to order</div></div>
    <div class="stat go"><div class="stat-l">New Arrivals</div><div class="stat-v">${nw}</div><div class="stat-s">freshly listed</div></div>
    <div class="stat rd"><div class="stat-l">Sold Out</div><div class="stat-v">${sl}</div><div class="stat-s">no stock</div></div>`;
  renderTbody(document.getElementById('dashBody'),products.slice(0,6));
}

function spill(s){
  if(s==='new')return`<span class="sp sp-nw"><span class="dot2"></span>New Arrival</span>`;
  if(s==='sold')return`<span class="sp sp-sl"><span class="dot2"></span>Sold Out</span>`;
  return`<span class="sp sp-av"><span class="dot2"></span>Available</span>`;
}

function renderTbody(el,list){
  if(!list.length){el.innerHTML=`<tr><td colspan="7" class="empty-t">No products yet. Add your first one!</td></tr>`;return;}
  el.innerHTML=list.map(p=>{
    const m=p.media&&p.media.length?p.media[0]:null;
    const mc=p.media?p.media.length:0;
    const thumb=m?(m.type==='video'
      ?`<div style="position:relative;display:inline-block"><video style="width:44px;height:56px;object-fit:cover;border-radius:3px;display:block" src="${m.src}" muted></video>${mc>1?`<span style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,.75);border-radius:999px;font-size:.5rem;padding:.1rem .35rem;color:#fff">+${mc-1}</span>`:''}</div>`
      :`<div style="position:relative;display:inline-block"><img style="width:44px;height:56px;object-fit:cover;border-radius:3px;display:block" src="${m.src}"/>${mc>1?`<span style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,.75);border-radius:999px;font-size:.5rem;padding:.1rem .35rem;color:#fff">+${mc-1}</span>`:''}</div>`)
      :`<div class="td-ph">${icons[p.cat]||'✦'}</div>`;
    const stock=parseInt(p.stock)||0;
    const stockHtml=p.status==='sold'?`<span style="color:var(--rd);font-size:.75rem">Sold Out</span>`
      :stock>0?`<span style="color:${stock<=3?'var(--go)':'var(--gr)'};font-size:.78rem">${stock} unit${stock!==1?'s':''}</span>`
      :`<span style="color:var(--mu);font-size:.75rem">—</span>`;
    return`<tr><td>${thumb}</td>
      <td><div class="td-nm">${p.name}</div></td>
      <td><div class="td-sub">${p.cat||''}</div></td>
      <td>${p.price}</td><td>${stockHtml}</td><td>${spill(p.status)}</td>
      <td><div class="acts"><button class="btn-ed" onclick="openDrawer(${p.id})">Edit</button><button class="btn-dl" onclick="askDel(${p.id},'product')">Delete</button></div></td>
    </tr>`;
  }).join('');
}

function renderTable(){
  const cats=[...new Set(products.map(p=>p.cat).filter(Boolean))];
  document.getElementById('catPills').innerHTML=cats.map(c=>`<button class="tpill ${tblFilter===c?'on':''}" onclick="setTF('${c}',this)">${c}</button>`).join('');
  const q=(document.getElementById('tsrch')?.value||'').toLowerCase();
  let list=tblFilter==='all'?products:products.filter(p=>p.cat===tblFilter);
  if(q)list=list.filter(p=>p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q));
  renderTbody(document.getElementById('prodBody'),list);
}
function setTF(c,el){tblFilter=c;document.querySelectorAll('.tpill').forEach(b=>b.classList.remove('on'));if(el)el.classList.add('on');renderTable();}

// ══ MEDIA GRID — with compression ══
function compressImage(dataUrl,maxW=900,maxH=1200,quality=0.78){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>{
      let w=img.width,h=img.height;
      const ratio=Math.min(maxW/w,maxH/h,1);
      w=Math.round(w*ratio);h=Math.round(h*ratio);
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      canvas.getContext('2d').drawImage(img,0,0,w,h);
      res(canvas.toDataURL('image/jpeg',quality));
    };
    img.src=dataUrl;
  });
}
function rebuildMediaGrid(){
  const grid=document.getElementById('mediaGrid');
  grid.querySelectorAll('.m-thumb').forEach(e=>e.remove());
  const addBtn=grid.querySelector('.m-add-btn');
  editMedia.forEach((m,i)=>{
    const div=document.createElement('div');
    div.className='m-thumb'+(i===0?' cover':'');
    if(m.type==='video'){div.innerHTML=`<video src="${m.src}" muted loop playsinline style="width:100%;height:100%;object-fit:cover;display:block"></video><div class="m-vid-ic">▶ Vid</div>`;}
    else{div.innerHTML=`<img src="${m.src}" alt="media"/>`;}
    if(i===0)div.innerHTML+=`<div class="m-cover-tag">Cover</div>`;
    div.innerHTML+=`<div class="m-rm" onclick="rmMedia(${i},event)">✕</div>`;
    div.innerHTML+=`<div class="m-set-cover" onclick="setCover(${i},event)">Set as Cover</div>`;
    grid.insertBefore(div,addBtn);
  });
}

function addMediaFiles(e){
  const files=[...e.target.files];if(!files.length)return;
  let done=0;
  files.forEach(file=>{
    const isVid=file.type.startsWith('video/');
    const reader=new FileReader();
    reader.onload=async ev=>{
      const src=isVid?ev.target.result:await compressImage(ev.target.result);
      editMedia.push({type:isVid?'video':'image',src});
      done++;if(done===files.length)rebuildMediaGrid();
    };
    reader.readAsDataURL(file);
  });
  e.target.value='';
}
function rmMedia(i,e){e.stopPropagation();editMedia.splice(i,1);rebuildMediaGrid();}
function setCover(i,e){e.stopPropagation();const item=editMedia.splice(i,1)[0];editMedia.unshift(item);rebuildMediaGrid();}

// ══ PRODUCT DRAWER ══
function openDrawer(id=null){
  editId=id;editMedia=[];
  ['f-name','f-cat','f-desc','f-price','f-stock'].forEach(x=>document.getElementById(x).value='');
  document.getElementById('f-status').value='available';
  document.getElementById('drwTitle').textContent=id?'Edit Product':'Add Product';
  if(id){
    const p=products.find(x=>x.id===id);
    if(p){
      document.getElementById('f-name').value=p.name;
      document.getElementById('f-cat').value=p.cat||'';
      document.getElementById('f-desc').value=p.descr||p.desc||'';
      document.getElementById('f-price').value=p.price;
      document.getElementById('f-stock').value=p.stock||'';
      document.getElementById('f-status').value=p.status;
      editMedia=JSON.parse(JSON.stringify(p.media||[]));
    }
  }
  rebuildMediaGrid();
  document.getElementById('dShade').classList.add('on');
  document.getElementById('drawer').classList.add('on');
}
function closeDrawer(){document.getElementById('dShade').classList.remove('on');document.getElementById('drawer').classList.remove('on');editId=null;editMedia=[];}

async function saveProduct(){
  const name=document.getElementById('f-name').value.trim();
  const cat=document.getElementById('f-cat').value.trim();
  const price=document.getElementById('f-price').value.trim();
  if(!name||!cat||!price){toast('Name, category and price are required');return;}
  const stock=parseInt(document.getElementById('f-stock').value)||0;
  const obj={name,cat,descr:document.getElementById('f-desc').value.trim(),price,stock,status:document.getElementById('f-status').value,media:editMedia};
  // Check payload size (Supabase row limit ~1MB)
  const payload=JSON.stringify(obj);
  if(payload.length>900000){
    toast('Media too large — please use fewer or smaller images');
    return;
  }
  const btn=document.getElementById('saveBtn');
  btn.textContent='Saving…';btn.disabled=true;
  try{
    if(editId){
      const res=await sbPatch('products',editId,obj);
      if(res&&res.error){throw new Error(res.error.message||res.error);}
      const idx=products.findIndex(p=>p.id===editId);
      if(idx>-1)products[idx]={...products[idx],...obj};
      toast(`"${name}" updated ✓`);
    } else {
      const res=await sbPost('products',obj);
      if(res&&res.error){throw new Error(res.error.message||res.error);}
      if(Array.isArray(res)&&res[0])products.unshift({...res[0],media:editMedia,stock});
      toast(`"${name}" added ✦`);
    }
    closeDrawer();renderDash();renderTable();
  }catch(e){
    console.error('Save error:',e);
    const msg=e.message||String(e);
    if(msg.includes('too large')||msg.includes('413')){toast('Images too large — compress them first');}
    else{toast('Save failed: '+msg.slice(0,60));}
  }
  btn.textContent='Save Product';btn.disabled=false;
}

// ══ DELETE ══
function askDel(id,type){
  delId=id;delType=type;
  const item=type==='slide'?slides.find(x=>x.id===id):products.find(x=>x.id===id);
  document.getElementById('delMsg').textContent=`Permanently remove "${item?.name||item?.heading||'this item'}"?`;
  document.getElementById('delBd').classList.add('on');
}
function closeDelBd(){document.getElementById('delBd').classList.remove('on');delId=null;}
async function confirmDel(){
  try{
    if(delType==='product'){await sbDelete('products',delId);products=products.filter(p=>p.id!==delId);closeDelBd();renderDash();renderTable();toast('Deleted');}
    if(delType==='slide'){await sbDelete('slides',delId);slides=slides.filter(s=>s.id!==delId);closeDelBd();renderSlidesPage(false);toast('Deleted');}
  }catch(e){toast('Error deleting');console.error(e);}
}

// ══ SLIDES PAGE ══
async function renderSlidesPage(refetch=true){
  if(refetch){try{slides=await sbGet('slides');}catch(e){}}
  const grid=document.getElementById('slidesGrid');
  if(!slides.length){grid.innerHTML=`<div style="color:var(--mu);font-size:.82rem;padding:2rem 0">No slides yet.</div>`;}
  else{grid.innerHTML=slides.map(s=>`
    <div class="sc ${s.active===false?'off':''}">
      ${s.img?`<img class="sc-img" src="${s.img}"/>`:`<div class="sc-ph">✦</div>`}
      <div class="sc-body">
        <div class="sc-tag" style="background:${tagColors[s.tag]||'#888'};color:${s.tag==='event'?'#fff':'#0a0a0a'}">${s.tag_label||s.tagLabel||'New'}</div>
        <div class="sc-title">${s.heading}</div>
        <div class="sc-sub">${s.sub||''}</div>
        <div class="sc-acts">
          <button class="btn-ed" onclick="openSlideDrawer(${s.id})">Edit</button>
          <button class="tog ${s.active!==false?'on':'off'}" onclick="toggleSlide(${s.id})">${s.active!==false?'Visible':'Hidden'}</button>
          <button class="btn-dl" onclick="askDel(${s.id},'slide')">Delete</button>
        </div>
      </div>
    </div>`).join('');}
  // Ticker
  try{
    const rows=await sbGet('ticker','limit=1');
    const items=(rows&&rows.length&&rows[0].items)?rows[0].items:['New Collection Out Now','Free Shipping on Orders Over ₹2000'];
    document.getElementById('tickItems').innerHTML=items.map(t=>`<div class="tick-row"><input value="${t}" placeholder="Announcement text…"/><button class="tick-rm" onclick="this.parentElement.remove()">✕</button></div>`).join('');
  }catch(e){}
}

async function toggleSlide(id){
  const s=slides.find(x=>x.id===id);if(!s)return;
  s.active=!s.active;
  await sbPatch('slides',id,{active:s.active});
  renderSlidesPage(false);toast(s.active?'Slide visible on store':'Slide hidden');
}

function addTickRow(){const w=document.getElementById('tickItems');const r=document.createElement('div');r.className='tick-row';r.innerHTML=`<input placeholder="Announcement text…"/><button class="tick-rm" onclick="this.parentElement.remove()">✕</button>`;w.appendChild(r);r.querySelector('input').focus();}

async function saveTicker(){
  const items=[...document.querySelectorAll('.tick-row input')].map(i=>i.value.trim()).filter(Boolean);
  if(!items.length){toast('Add at least one message');return;}
  try{
    const rows=await sbGet('ticker','limit=1');
    if(rows&&rows.length){await sbPatch('ticker',rows[0].id,{items});}
    else{await sbPost('ticker',{items});}
    toast('Ticker saved ✓');
  }catch(e){toast('Error saving ticker');}
}

// Slide drawer
function openSlideDrawer(id=null){
  sdEditId=id;sdImg=null;
  ['sd-taglabel','sd-heading','sd-sub','sd-cta'].forEach(x=>document.getElementById(x).value='');
  document.getElementById('sd-tag').value='new';document.getElementById('sd-active').value='true';
  document.getElementById('sdTitle').textContent=id?'Edit Slide':'Add Slide';
  document.getElementById('sdPrev').style.display='none';document.getElementById('sdPrev').src='';
  document.getElementById('sdClrBtn').style.display='none';document.getElementById('sdPh').style.display='flex';
  if(id){
    const s=slides.find(x=>x.id===id);
    if(s){
      document.getElementById('sd-tag').value=s.tag||'new';
      document.getElementById('sd-taglabel').value=s.tag_label||s.tagLabel||'';
      document.getElementById('sd-heading').value=s.heading||'';
      document.getElementById('sd-sub').value=s.sub||'';
      document.getElementById('sd-cta').value=s.cta||'';
      document.getElementById('sd-active').value=s.active===false?'false':'true';
      if(s.img){sdImg=s.img;document.getElementById('sdPrev').src=s.img;document.getElementById('sdPrev').style.display='block';document.getElementById('sdClrBtn').style.display='flex';document.getElementById('sdPh').style.display='none';}
    }
  }
  document.getElementById('sdShade').classList.add('on');document.getElementById('slideDrawer').classList.add('on');
}
function closeSlideDrawer(){document.getElementById('sdShade').classList.remove('on');document.getElementById('slideDrawer').classList.remove('on');}
function sdPreview(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{sdImg=ev.target.result;document.getElementById('sdPrev').src=sdImg;document.getElementById('sdPrev').style.display='block';document.getElementById('sdClrBtn').style.display='flex';document.getElementById('sdPh').style.display='none';};r.readAsDataURL(f);}
function clearSdImg(e){e.stopPropagation();sdImg=null;document.getElementById('sdPrev').style.display='none';document.getElementById('sdPrev').src='';document.getElementById('sdClrBtn').style.display='none';document.getElementById('sdPh').style.display='flex';}

async function saveSlide(){
  const heading=document.getElementById('sd-heading').value.trim();
  if(!heading){toast('Heading is required');return;}
  const obj={tag:document.getElementById('sd-tag').value,tag_label:document.getElementById('sd-taglabel').value.trim()||'New',heading,sub:document.getElementById('sd-sub').value.trim(),cta:document.getElementById('sd-cta').value.trim()||'Shop Now',img:sdImg,active:document.getElementById('sd-active').value==='true'};
  const btn=document.getElementById('sdSaveBtn');btn.textContent='Saving…';btn.disabled=true;
  try{
    if(sdEditId){await sbPatch('slides',sdEditId,obj);toast('Slide updated ✓');}
    else{const res=await sbPost('slides',obj);if(Array.isArray(res)&&res[0])slides.push(res[0]);toast('Slide added ✦');}
    closeSlideDrawer();renderSlidesPage(false);
  }catch(e){toast('Error saving slide');}
  btn.textContent='Save Slide';btn.disabled=false;
}

// ══ SETTINGS ══
async function loadSettings(){
  try{
    const rows=await sbGet('config','limit=1');
    if(rows&&rows.length){
      document.getElementById('cfg-wa').value=rows[0].wa||'';
      document.getElementById('cfg-email').value=rows[0].email||'';
      document.getElementById('cfg-name').value=rows[0].shop_name||'';
      document.getElementById('cfg-tag').value=rows[0].tagline||'';
    }
  }catch(e){}
}
async function saveConfig(){
  const wa=document.getElementById('cfg-wa').value.trim();
  const email=document.getElementById('cfg-email').value.trim();
  const shop_name=document.getElementById('cfg-name').value.trim();
  const tagline=document.getElementById('cfg-tag').value.trim();
  try{
    const rows=await sbGet('config','limit=1');
    if(rows&&rows.length){await sbPatch('config',rows[0].id,{wa,email,shop_name,tagline});}
    else{await sbPost('config',{wa,email,shop_name,tagline});}
    toast('Settings saved ✓');
  }catch(e){toast('Error saving settings');}
}

// ══ STORE CONTENT (about, socials, footer tagline) ══
async function loadContent(){
  try{
    const rows=await sbGet('config','limit=1');
    if(rows&&rows.length){
      const c=rows[0];
      document.getElementById('cfg-about').value=c.about||'';
      document.getElementById('soc-ig').value=c.soc_ig||'';
      document.getElementById('soc-fb').value=c.soc_fb||'';
      document.getElementById('soc-li').value=c.soc_li||'';
      document.getElementById('soc-wa').value=c.soc_wa||'';
      document.getElementById('cfg-tagline-footer').value=c.footer_tagline||'';
    }
  }catch(e){}
}
async function saveContent(){
  const about=document.getElementById('cfg-about').value.trim();
  const soc_ig=document.getElementById('soc-ig').value.trim();
  const soc_fb=document.getElementById('soc-fb').value.trim();
  const soc_li=document.getElementById('soc-li').value.trim();
  const soc_wa=document.getElementById('soc-wa').value.trim();
  const footer_tagline=document.getElementById('cfg-tagline-footer').value.trim();
  try{
    const rows=await sbGet('config','limit=1');
    const data={about,soc_ig,soc_fb,soc_li,soc_wa,footer_tagline};
    if(rows&&rows.length){await sbPatch('config',rows[0].id,data);}
    else{await sbPost('config',data);}
    toast('Store content saved ✓');
  }catch(e){toast('Error saving — check console');console.error(e);}
}
function changePw(){
  const cur=document.getElementById('pw-cur').value,np=document.getElementById('pw-new').value,con=document.getElementById('pw-con').value;
  if(cur!==lPW()){toast('Current password incorrect');return;}
  if(!np||np.length<4){toast('Min 4 characters');return;}
  if(np!==con){toast('Passwords do not match');return;}
  sPW(np);['pw-cur','pw-new','pw-con'].forEach(id=>document.getElementById(id).value='');toast('Password updated ✓');
}
async function clearAllProducts(){
  if(!confirm('Delete ALL products from the database? Cannot be undone.'))return;
  for(const p of products){await sbDelete('products',p.id);}
  products=[];renderDash();renderTable();toast('All products deleted');
}
async function clearAllSlides(){
  if(!confirm('Delete ALL slides?'))return;
  for(const s of slides){await sbDelete('slides',s.id);}
  slides=[];renderSlidesPage();toast('All slides deleted');
}

// ══ TOAST ══
let tt;function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2800);}
window.addEventListener('load',()=>document.getElementById('pwInp').focus());
