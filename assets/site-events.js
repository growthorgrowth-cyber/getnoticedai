(function(){
  'use strict';
  function clean(value){return String(value||'none').replace(/[^a-zA-Z0-9._~-]/g,'_').slice(0,80)||'none';}
  var q=new URLSearchParams(location.search);
  var referrerHost='direct';
  try{referrerHost=document.referrer?new URL(document.referrer).hostname:'direct';}catch(_){}
  var context={page_path:location.pathname,page_group:location.pathname.indexOf('/local-seo-for-')===0?'local_seo_landing':'site',offer_path:'nova',viewport:innerWidth<768?'mobile':'desktop',utm_source:clean(q.get('utm_source')||'direct'),utm_medium:clean(q.get('utm_medium')||'none'),utm_campaign:clean(q.get('utm_campaign')||'none'),utm_content:clean(q.get('utm_content')||'none'),referrer_host:clean(referrerHost)};
  function push(name,details){var payload=Object.assign({event:name},context,details||{});window.dataLayer=window.dataLayer||[];window.dataLayer.push(payload);try{window.posthog&&window.posthog.capture(name,payload);}catch(_){}}
  document.addEventListener('click',function(event){
    var link=event.target.closest('a[href]');if(!link)return;
    var target;try{target=new URL(link.getAttribute('href')||'',location.href);}catch(_){return;}
    var placement=clean(link.id||link.className||link.textContent.trim());
    var destinationType=(target.hostname==='audit.app.getnoticedai.com'||/^\/audit(\.html)?\/?$/.test(target.pathname))?'audit':target.origin===location.origin?'internal':'external';
    if(target.hostname==='audit.app.getnoticedai.com'||/^\/audit(\.html)?\/?$/.test(target.pathname))push('audit_click',{placement:placement,destination_type:destinationType});
    else if(target.pathname.indexOf('/command/')===0)push('command_entry_click',{placement:placement,destination_type:destinationType});
    else if(target.hash==='#pricing'){push('pricing_click',{plan:'unspecified',billing:'unspecified',placement:placement,destination_type:destinationType});push('nova_click',{plan:'unspecified',billing:'unspecified',placement:placement,destination_type:destinationType});}
    else if(/^\/(resources|compare|guides|industries|blog|local-seo-for-)/.test(target.pathname))push('resource_click',{content_id:clean(target.pathname),placement:placement,destination_type:destinationType});
  });
})();
