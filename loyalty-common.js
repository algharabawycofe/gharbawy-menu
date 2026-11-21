/* الغرباوي — أدوات مشتركة لنظام الولاء */
(function(){
  const $=s=>document.querySelector(s);
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const toast=m=>{let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.append(t)}
    t.textContent=m;t.className='show';clearTimeout(t._h);t._h=setTimeout(()=>t.className='',2800)};
  const phoneIntl=p=>{p=String(p||'').replace(/\D/g,'');if(p.startsWith('00'))p=p.slice(2);else if(p.startsWith('0'))p='2'+p;return p};
  const days=ts=>ts?Math.floor((Date.now()-ts)/864e5):null;
  const ago=ts=>{const d=days(ts);return d===null?'لسه ماجاش':d<=0?'النهارده':d===1?'امبارح':`من ${d} يوم`};
  const dist=(a,b,c,d)=>{const R=6371000,r=x=>x*Math.PI/180,dl=r(c-a),dn=r(d-b);
    const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
  const qrSvg=text=>{for(let t=2;t<=40;t++){try{const q=new QRCodeLib(t,QRLevel.M);q.addData(text);q.make();
    const n=q.getModuleCount();let d='';for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))d+=`M${c+4} ${r+4}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n+8} ${n+8}" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#2B1D14"/></svg>`}catch(e){}}return ''};
  const ready=()=>new Promise(res=>{if(window.FB_READY)res();else addEventListener('fb-ready',res,{once:true})});
  if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.classList.add('dark');
  const DEF={
    welcome:{on:true,text:'أهلاً يا {name}! كارتك جاهز ☕ وريه للكاشير في كل زيارة'},
    thanks:{on:true,text:'شكراً على زيارتك يا {name} ☕ بقى معاك {stamps} من {goal}'},
    reward:{on:true,text:'🎉 مبروك يا {name}! مكافأتك جاهزة: {reward}'},
    win:{on:true,days:14,text:'وحشتنا يا {name}! كارتك عليه {stamps}/{goal} ختم، مستنيينك ☕'},
    near:{on:true,text:'إنت قريب من {place}، وكارتك مستنيك ☕'}};
  const msgs=o=>{const r={};for(const k in DEF)r[k]={...DEF[k],...((o||{})[k]||{})};return r};
  const fill=(t,v)=>String(t||'').replace(/\{(\w+)\}/g,(_,k)=>v[k]??'');
  const match=(m,b,cfg)=>{switch(b.audience){
    case 'lapsed':{const d=days(m.lastVisit||m.joinedAt);return d!==null&&d>=(+b.days||14)}
    case 'near':return (m.stamps||0)>=Math.max(1,(cfg.goal||8)-2);
    case 'new':return (m.visits||0)<=1;
    default:return true}};
  window.L={$,esc,toast,phoneIntl,days,ago,dist,qrSvg,ready,msgs,fill,match,DEF};
})();
