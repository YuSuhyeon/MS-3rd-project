import { useEffect, useState } from "react";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|iphone|ipad|ipod/i.test(ua);
    setIsMobile(isMobileUA);
  }, []);

  return isMobile;
}

export default useIsMobile;
