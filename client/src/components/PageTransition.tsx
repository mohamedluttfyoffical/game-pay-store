import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

export function PageTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const reduceMotion = useReducedMotion();
  const routeKey = location.split("?")[0] || "/";

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }, [routeKey, reduceMotion]);

  return (
    <motion.div
      key={routeKey}
      className="page-transition"
      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
