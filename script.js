async function saveProduct(){
  const name=document.getElementById('f-name').value.trim();
  const cat=document.getElementById('f-cat').value.trim();
  const price=document.getElementById('f-price').value.trim();

  if(!name||!cat||!price){
    toast('Name, category and price are required');
    return;
  }

  const stock=parseInt(document.getElementById('f-stock').value)||0;

  const obj={
    name:name,
    cat:cat,
    descr:document.getElementById('f-desc').value.trim(),
    price:price,
    stock:stock,
    status:document.getElementById('f-status').value,
    media:editMedia
  };

  const payload=JSON.stringify(obj);

  if(payload.length>900000){
    toast('Media too large — please use fewer or smaller images');
    return;
  }

  const btn=document.getElementById('saveBtn');
  btn.textContent='Saving…';
  btn.disabled=true;

  try{
    if(editId){
      const res=await sbPatch('products',editId,obj);

      if(res&&res.error){
        throw new Error(res.error.message||res.error);
      }

      toast(`"${name}" updated ✓`);
    }else{
      const res=await sbPost('products',obj);

      if(res&&res.error){
        throw new Error(res.error.message||res.error);
      }

      toast(`"${name}" added ✦`);
    }

    closeDrawer();

    // IMPORTANT FIX: reload products from Supabase after saving
    await loadAll();

  }catch(e){
    console.error('Save error:',e);
    toast('Save failed: '+String(e.message||e).slice(0,60));
  }

  btn.textContent='Save Product';
  btn.disabled=false;
}
