(function(){
  'use strict';
  function clean(value){return String(value||'none').replace(/[^a-zA-Z0-9._~-]/g,'_').slice(0,80)||'none';}
  var q=new URLSearchParams(location.search);
  var referrerHost='direct';
  try{referrerHost=document.referrer?new URL(document.referrer).hostname:'direct';}catch(_){}
  var pageGroup=location.pathname.indexOf('/compare/')===0?'comparison':location.pathname.indexOf('/guides/')===0?'guide':location.pathname.indexOf('/industries/')===0?'industry_guide':location.pathname.indexOf('/resources/')===0?'resources_hub':'resource';
  var attribution={
    source:clean(q.get('utm_source')||'direct'),
    medium:clean(q.get('utm_medium')||'none'),
    campaign:clean(q.get('utm_campaign')||'none'),
    content:clean(q.get('utm_content')||'none'),
    page:location.pathname,
    page_group:pageGroup,
    offer_path:pageGroup==='comparison'?'nova':pageGroup==='resources_hub'?'education':'command',
    viewport:innerWidth<768?'mobile':'desktop',
    referrer_host:clean(referrerHost)
  };
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push(Object.assign({event:'seo_page_view'},attribution));
  function push(name,details){
    var payload=Object.assign({event:name},attribution,details||{});
    window.dataLayer.push(payload);
    try{window.posthog&&window.posthog.capture(name,payload);}catch(_){}
  }
  document.addEventListener('click',function(e){
    var link=e.target.closest('a[href]');
    if(!link)return;
    var href=link.getAttribute('href')||'';
    var target;
    try{target=new URL(href,location.href);}catch(_){return;}
    var placement=clean(link.getAttribute('data-track')||link.id||link.className||link.textContent.trim());
    var destinationType=target.hostname==='link.getnoticedai.com'?'payment':(target.hostname==='audit.app.getnoticedai.com'||/^\/audit(\.html)?\/?$/.test(target.pathname))?'audit':target.origin===location.origin?'internal':'external';
    if(link.hasAttribute('data-track')){
      var legacy=Object.assign({event:'seo_cta_click',cta_name:link.getAttribute('data-track'),cta_destination:href||'none'},attribution);
      window.dataLayer.push(legacy);
      try{window.fbq&&window.fbq('trackCustom','SEOCTA',legacy);}catch(_){}
      try{window.posthog&&window.posthog.capture('seo_cta_click',legacy);}catch(_){}
    }
    if(target.hostname==='audit.app.getnoticedai.com'||/^\/audit(\.html)?\/?$/.test(target.pathname)){
      push('audit_click',{placement:placement,destination_type:destinationType});
    }else if(target.pathname.indexOf('/command/')===0){
      push('command_entry_click',{placement:placement,destination_type:destinationType});
    }else if(target.hash==='#pricing'){
      push('pricing_click',{plan:'unspecified',billing:'unspecified',placement:placement,destination_type:destinationType});
      push('nova_click',{plan:'unspecified',billing:'unspecified',placement:placement,destination_type:destinationType});
    }else if(/^\/(resources|compare|guides|industries|blog|local-seo-for-)/.test(target.pathname)){
      push('resource_click',{content_id:clean(target.pathname),placement:placement,destination_type:destinationType});
    }
  });
})();
