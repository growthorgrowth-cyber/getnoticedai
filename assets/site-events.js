(function(){
  'use strict';
  function clean(value){return String(value||'none').replace(/[^a-zA-Z0-9._~-]/g,'_').slice(0,80)||'none';}
  var q=new URLSearchParams(location.search);
  var referrerHost='direct';
  try{referrerHost=document.referrer?new URL(document.referrer).hostname:'direct';}catch(_){}
  var context={
    page_path:location.pathname,
    page_group:location.pathname.indexOf('/local-seo-for-')===0?'local_seo_landing':'site',
    offer_path:'nova',
    viewport:innerWidth<768?'mobile':'desktop',
    utm_source:clean(q.get('utm_source')||'direct'),
    utm_medium:clean(q.get('utm_medium')||'none'),
    utm_campaign:clean(q.get('utm_campaign')||'none'),
    utm_content:clean(q.get('utm_content')||'none'),
    referrer_host:clean(referrerHost)
  };
  function push(name,details){
    var payload=Object.assign({event:name},context,details||{});
    window.dataLayer=window.dataLayer||[];
    window.dataLayer.push(payload);
    try{window.posthog&&window.posthog.capture(name,payload);}catch(_){}
  }
  function metaTrack(eventName, params){
    try{ if (typeof window.fbq==='function') window.fbq('track', eventName, params||{}); }catch(_){}
  }
  function metaTrackCustom(eventName, params){
    try{ if (typeof window.fbq==='function') window.fbq('trackCustom', eventName, params||{}); }catch(_){}
  }
  // Key page views for ads optimization
  if (/^\/audit(\/|\.html)?$/.test(location.pathname) || location.pathname.indexOf('/audit/')===0){
    metaTrack('ViewContent',{content_name:'free_audit',content_category:'lead_magnet'});
  }
  if (location.pathname.indexOf('/local-seo-for-')===0){
    metaTrack('ViewContent',{content_name:clean(location.pathname),content_category:'industry_landing'});
  }
  document.addEventListener('click',function(event){
    var link=event.target.closest('a[href]'); if(!link) return;
    var target; try{ target=new URL(link.getAttribute('href')||'',location.href); }catch(_){ return; }
    var placement=clean(link.id||link.className||link.textContent.trim());
    var destinationType=(target.hostname==='audit.app.getnoticedai.com'||/^\/audit(\.html)?\/?$/.test(target.pathname))?'audit':(target.hostname==='link.getnoticedai.com'?'payment':(target.origin===location.origin?'internal':'external'));

    if (target.hostname==='link.getnoticedai.com' && target.pathname.indexOf('/payment-link/')===0){
      var planEl=link.closest('.plan');
      var value=planEl && planEl.getAttribute('data-monthly') ? Number(planEl.getAttribute('data-monthly')) : undefined;
      var planName=planEl ? clean((planEl.querySelector('h3')||{}).textContent||'plan') : 'plan';
      metaTrack('InitiateCheckout',{content_name:planName,content_category:'subscription',currency:'USD',value:value,content_type:'product'});
      push('initiate_checkout',{plan:planName,value:value,placement:placement,destination_type:destinationType});
      return;
    }
    if (target.hostname==='audit.app.getnoticedai.com' || /^\/audit(\.html)?\/?$/.test(target.pathname)){
      metaTrack('Lead',{content_name:'audit_click',content_category:'lead_magnet'});
      push('audit_click',{placement:placement,destination_type:destinationType});
      return;
    }
    if (target.pathname.indexOf('/command/')===0){
      metaTrackCustom('command_entry_click',{placement:placement});
      push('command_entry_click',{placement:placement,destination_type:destinationType});
      return;
    }
    if (target.hash==='#pricing'){
      push('pricing_click',{plan:'unspecified',billing:'unspecified',placement:placement,destination_type:destinationType});
      push('nova_click',{plan:'unspecified',billing:'unspecified',placement:placement,destination_type:destinationType});
      return;
    }
    if (/^\/(resources|compare|guides|industries|blog|local-seo-for-)/.test(target.pathname)){
      push('resource_click',{content_id:clean(target.pathname),placement:placement,destination_type:destinationType});
    }
  });
})();
