import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ProjectExpandedView({ data }: { data: any }) {
  if (!data) return null;

  const hideHero = !!data._hideHero;
  const heroSrc = (data.image && (data.image.startsWith('http') || data.image.startsWith('/'))) ? data.image : '/portfolio/placeholder.png';

  return (
    <div className="w-full max-w-5xl mx-auto p-8 md:p-16 text-foreground bg-background">
      <header className="mb-12">
        <h1 className="text-4xl md:text-6xl font-mono mb-4">{data.title || 'Project Title'}</h1>
        <div className="flex gap-4 font-mono text-sm uppercase opacity-70">
          <span>{data.year || '2026'}</span>
          <span>•</span>
          <span>{data.role || 'Design & Engineering'}</span>
        </div>
      </header>

      {/* Hero Image — hidden when the overlay flying-hero handles it */}
      {!hideHero && (
        <div className="w-full aspect-video bg-foreground/10 mb-12 flex items-center justify-center overflow-hidden">
          <img src={heroSrc} alt="Hero" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Column: Metadata & Tech Stack */}
        <div className="col-span-1 md:col-span-4 space-y-8">
          <div className="border-t border-foreground/20 pt-4">
             <h3 className="font-mono text-xs uppercase mb-2 opacity-50">Problem</h3>
             <p className="text-sm">{data.problem || 'Define the problem here.'}</p>
          </div>
          <div className="border-t border-foreground/20 pt-4">
             <h3 className="font-mono text-xs uppercase mb-2 opacity-50">Solution</h3>
             <p className="text-sm">{data.solution || 'Define the solution here.'}</p>
          </div>
          
          <div className="border-t border-foreground/20 pt-4">
             <h3 className="font-mono text-xs uppercase mb-4 opacity-50">Tech Stack</h3>
             <div className="flex flex-wrap gap-2">
               {(data.techStack || ['React', 'WebGL', 'GSAP']).map((tech: string, i: number) => (
                 <span key={i} className="px-2 py-1 border border-foreground/20 rounded-full font-mono text-[10px] uppercase tracking-wider">
                   {tech}
                 </span>
               ))}
             </div>
          </div>
        </div>

        {/* Right Column: Article & Gallery */}
        <div className="col-span-1 md:col-span-8 space-y-12">
          <div className="prose prose-invert max-w-none text-foreground/80 leading-relaxed">
            <p>{data.description || 'Project description goes here. Expand on the narrative of the work.'}</p>
          </div>

          <div className="border-l-2 border-foreground/30 pl-6 italic text-xl md:text-3xl font-light">
             &ldquo;{data.quote || 'This is a pull quote highlighting the impact of the project.'}&rdquo;
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Gallery Placeholders */}
             <div className="aspect-[4/3] bg-foreground/5"></div>
             <div className="aspect-[4/3] bg-foreground/5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
