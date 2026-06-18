import React, { useEffect } from "react";

const GA_ID = import.meta.env.VITE_GA_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;
const TIKTOK_PIXEL_ID = import.meta.env.VITE_TIKTOK_PIXEL_ID;

const Analytics: React.FC = () => {
  useEffect(() => {
    let loaded = false;

    const loadPixels = () => {
      if (loaded) return;
      loaded = true;

      // Clean up event listeners immediately
      removeListeners();

      const isAlreadyLoaded = (window as any).__pixelsLoaded;

      if (!isAlreadyLoaded) {
        (window as any).__pixelsLoaded = true;

        // 1. Google Analytics
        if (GA_ID) {
          const gaScript = document.createElement("script");
          gaScript.async = true;
          gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
          document.head.appendChild(gaScript);

          const gaInitScript = document.createElement("script");
          gaInitScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `;
          document.head.appendChild(gaInitScript);
        }

        // 2. Microsoft Clarity
        if (CLARITY_ID) {
          const clarityScript = document.createElement("script");
          clarityScript.type = "text/javascript";
          clarityScript.innerHTML = `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `;
          document.head.appendChild(clarityScript);
        }

        // 3. TikTok Pixel
        if (TIKTOK_PIXEL_ID) {
          const tiktokScript = document.createElement("script");
          tiktokScript.innerHTML = `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n;var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
            }(window, document, 'ttq');
          `;
          document.head.appendChild(tiktokScript);
        }
      } else {
        // If already loaded, trigger pageview trackings for the new route
        if (GA_ID && (window as any).gtag) {
          (window as any).gtag('config', GA_ID, { page_path: window.location.pathname });
        }
        if (TIKTOK_PIXEL_ID && (window as any).ttq) {
          (window as any).ttq.page();
        }
      }
    };

    const handleScroll = () => {
      loadPixels();
    };

    const addListeners = () => {
      window.addEventListener("scroll", handleScroll, { passive: true });
    };

    const removeListeners = () => {
      window.removeEventListener("scroll", handleScroll);
    };

    // Load pixels after 3 seconds (using idle callback if supported) or on first scroll
    const timeoutId = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(loadPixels, { timeout: 2000 });
      } else {
        loadPixels();
      }
    }, 3000);
    addListeners();

    return () => {
      clearTimeout(timeoutId);
      removeListeners();
    };
  }, []);

  return null;
};

export default Analytics;
