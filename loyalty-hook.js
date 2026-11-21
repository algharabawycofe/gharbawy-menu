/* الغرباوي — بيظهر زرار وشريط الولاء في المنيو بس لما الولاء يتفعّل من الإدارة */
(function(){
  function go(){
    var FB=window.FB;if(!FB||!FB.db)return;
    FB.getDoc(FB.doc(FB.db,'settings','loyalty')).then(function(s){
      if(!s.exists()||s.data().enabled===false)return;
      var btn=document.getElementById('loyaltyBtn');if(btn)btn.style.display='';
      var has=localStorage.getItem('gh_loyalty_id'),t=+localStorage.getItem('gh_loy_dismiss')||0;
      if(has||Date.now()-t<7*864e5)return;
      var row=document.getElementById('statusRow');if(!row||!row.parentNode)return;
      var d=document.createElement('div');d.id='loyaltyStrip';
      d.style.cssText='display:flex;align-items:center;gap:10px;margin:10px 14px;padding:11px 14px;border-radius:16px;background:var(--coffee-dark);color:#FAF6F0;font-weight:800;font-size:13px;cursor:pointer';
      d.innerHTML='<span style="font-size:22px">🎁</span><span style="flex:1">خد كارت الولاء — كل زيارة ختم و'+(s.data().reward?'المكافأة: '+String(s.data().reward).replace(/[<>&]/g,''):'مكافأة مجانية')+'</span><button type="button" aria-label="إغلاق" style="background:none;border:0;color:inherit;font-size:16px;cursor:pointer">✕</button>';
      d.onclick=function(e){if(e.target.tagName==='BUTTON'){localStorage.setItem('gh_loy_dismiss',Date.now());d.remove();return}location.href='loyalty.html'+location.search};
      row.parentNode.insertBefore(d,row);
    }).catch(function(){});
  }
  if(window.FB_READY)go();else addEventListener('fb-ready',go,{once:true});
})();
