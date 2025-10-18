import { motion } from "framer-motion";

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .5 }}
      className="text-3xl md:text-4xl font-bold text-center"
    >
      {children}
    </motion.h1>
  );
}

export function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .5, delay: .1 }}
      className="text-center text-slate-600 dark:text-slate-300"
    >
      {children}
    </motion.p>
  );
}

export function ShellCard({
  title, children, delay = 0,
}: { title?: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .45, delay }}
      className="card p-4"
    >
      {title && <div className="text-sm font-semibold mb-2">{title}</div>}
      {children}
    </motion.div>
  );
}

export function Kpi({
  label, value, hint, delay = 0
}: { label: string; value: string; hint?: string; delay?: number }) {
  return (
    <ShellCard delay={delay}>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: .4, delay: delay + .05 }}
        className="text-2xl font-semibold mt-1"
      >
        {value}
      </motion.div>
      {hint && <div className="text-xs text-slate-400 mt-1">{hint}</div>}
    </ShellCard>
  );
}
