import { useEffect, useState } from "react";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      if (typeof window !== "undefined") {
        const width = window.innerWidth;
        setIsMobile(width < breakpoint);
      }
    };

    checkIsMobile();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", checkIsMobile);
      return () => window.removeEventListener("resize", checkIsMobile);
    }
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
