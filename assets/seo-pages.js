/* Get Noticed SEO page interactions: attribution-preserving CTA events, no form data or PII. */
(function(){
  var q=new URLSearchParams(location.search);
  var attribution={source:q.get('utm_source')||'direct',medium:q.get('utm_medium')||'none',campaign:q.get('utm_campaign')||'none',page:location.pathname};
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push(Object.assign({event:'seo_page_view'},attribution));
  document.addEventListener('click',function(e){
    var link=e.target.closest('[data-track]');
    if(!link)return;
    var payload=Object.assign({event:'seo_cta_click',cta_name:link.getAttribute('data-track'),cta_destination:link.getAttribute('href')||'none'},attribution);
    window.dataLayer.push(payload);
    try{window.fbq&&window.fbq('trackCustom','SEOCTA',payload)}catch(_){}
    try{window.posthog&&window.posthog.capture('seo_cta_click',payload)}catch(_){}
  });
})();

