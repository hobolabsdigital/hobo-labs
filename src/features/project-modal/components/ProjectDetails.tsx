import { motion, type Variants } from 'framer-motion';

interface ProjectDetailsProps {
  problem?: string;
  solution?: string;
  quote?: string;
  techStack: string[];
  isStreaming: boolean;
  activeItem: Variants;
}

export function ProjectDetails({
  problem,
  solution,
  quote,
  techStack,
  isStreaming,
  activeItem,
}: ProjectDetailsProps) {
  return (
    <>
      {/* ── Problem / Solution ── */}
      {(problem || solution || isStreaming) && (
        <motion.div variants={activeItem} className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          <div className="border-t border-foreground/15 pt-5">
            <p className="font-ui text-[10px] uppercase tracking-widest text-foreground/40 mb-3 brutalist:text-foreground brutalist:text-xs">Problem</p>
            {isStreaming && !problem ? (
              <div className="h-16 w-full rounded bg-foreground/10 animate-pulse" />
            ) : (
              !!problem && <p className="text-sm text-foreground/70 leading-relaxed font-body brutalist:text-base brutalist:text-foreground brutalist:font-bold">{problem}</p>
            )}
          </div>
          <div className="border-t border-foreground/15 pt-5">
            <p className="font-ui text-[10px] uppercase tracking-widest text-foreground/40 mb-3 brutalist:text-foreground brutalist:text-xs">Solution</p>
            {isStreaming && !solution ? (
              <div className="h-16 w-full rounded bg-foreground/10 animate-pulse" />
            ) : (
              !!solution && <p className="text-sm text-foreground/70 leading-relaxed font-body brutalist:text-base brutalist:text-foreground brutalist:font-bold">{solution}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Pull quote ── */}
      {(quote || isStreaming) && (
        <motion.div variants={activeItem} className="border-l-2 border-foreground/20 pl-6 mb-12 brutalist:border-l-0 brutalist:border-t-[3px] brutalist:border-foreground brutalist:pl-0 brutalist:pt-6">
          {isStreaming && !quote ? (
            <div className="h-8 w-2/3 rounded bg-foreground/10 animate-pulse" />
          ) : (
            quote && (
              <p className="text-xl md:text-3xl font-light text-foreground/75 leading-snug italic font-body brutalist:text-2xl brutalist:md:text-4xl brutalist:text-[var(--brutalist-cyan)] brutalist:font-bold brutalist:not-italic brutalist:leading-tight">
                &ldquo;{quote}&rdquo;
              </p>
            )
          )}
        </motion.div>
      )}

      {/* ── Tech stack ── */}
      {techStack.length > 0 && (
        <motion.div variants={activeItem} className="flex flex-wrap gap-2">
          {techStack.map((tech, i) => (
            <span key={i} className="px-2 py-1 border border-foreground/15 font-ui text-[10px] uppercase tracking-wider text-foreground/50 brutalist:text-foreground brutalist:border-foreground brutalist:text-xs" style={{ borderRadius: 'var(--radius-pill)' }}>
              {tech}
            </span>
          ))}
        </motion.div>
      )}
    </>
  );
}
