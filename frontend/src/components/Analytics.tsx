import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const GA_ID = import.meta.env.VITE_GA_ID;
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;

const Analytics: React.FC = () => {
  return (
    <Helmet>
      {/* Google Analytics */}
      {GA_ID && (
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
      )}
      {GA_ID && (
        <script>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </script>
      )}

      {/* Microsoft Clarity */}
      {CLARITY_ID && (
        <script type="text/javascript">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </script>
      )}
    </Helmet>
  );
};

export default Analytics;
