const fs = require('fs');
const path = require('path');

const appContent = fs.readFileSync(path.join(__dirname, 'src/App.tsx'), 'utf-8');

// Helper to convert JSX to plain HTML
function jsxToHtml(jsx) {
    let html = jsx;
    // Replace className with class
    html = html.replace(/className=/g, 'class=');
    // Replace React inline styles like style={{ ... }} roughly (only simple ones used)
    html = html.replace(/style={{ animationDuration: '([^']+)' }}/g, 'style="animation-duration: $1;"');
    html = html.replace(/style={{ animationDelay: '([^']+)' }}/g, 'style="animation-delay: $1;"');
    html = html.replace(/style={{ animationDuration: '([^']+)', animationDelay: '([^']+)' }}/g, 'style="animation-duration: $1; animation-delay: $2;"');
    // Replace camelCase SVG attributes
    html = html.replace(/strokeWidth=/g, 'stroke-width=');
    html = html.replace(/strokeLinecap=/g, 'stroke-linecap=');
    html = html.replace(/strokeLinejoin=/g, 'stroke-linejoin=');
    // self-closing tags without spaces could be kept, webflow is fine with <img />
    
    // Convert <ArrowRight /> etc to SVGs (just an approximation or blank if complex, but mostly used ArrowRight and Shield)
    html = html.replace(/<ArrowRight class="([^"]+)" \/>/g, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="$1"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>');
    html = html.replace(/<Shield class="([^"]+)"\/>/g, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="$1"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg>');

    // Replace <Menu /> <Search />
    html = html.replace(/<Menu class="([^"]+)" \/>/g, '<svg class="$1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h16M4 6h16M4 18h16"/></svg>');
    html = html.replace(/<Search class="([^"]+)" \/>/g, '<svg class="$1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>');
    // remove {currentPage === ... && (
    html = html.replace(/{currentPage === '[^']+' && \(/g, '');
    html = html.replace(/\)}/g, '');

    // Fix JSX specific items
    html = html.replace(/rows=\{([0-9]+)\}/g, 'rows="$1"');
    html = html.replace(/htmlFor=/g, 'for=');
    html = html.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
    // For arrays, we just keep the static generated output but since there are `.map` in the code,
    // a regex can't execute map. Let's just output the whole section including the React logic and tell the user they might need to tweak complex arrays manually in Webflow, or I can replace the `.map` with its statically rendered equivalent for them?
    
    return html;
}

// 1. Workflow / Real World Evidence Section
const workflowMatch = appContent.match(/<section id="workflow-evidence"[\s\S]*?<\/section>/);
if (workflowMatch) {
    let rweHtml = jsxToHtml(workflowMatch[0]);
    // lower heading text
    rweHtml = rweHtml.replace(/<div class="mb-12">/, '<div class="mb-12 lg:mt-24">');
    // Expanded map substitution...
    const mapStr = `{[
                    { num: '01', title: 'Ingest & Standardise', desc: 'Codified, governed data ingestion', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-[#ff79c6]"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg> },
                    { num: '02', title: 'Cohort Builder', desc: 'Version-controlled definitions', badge: 'LIVE' },
                    { num: '03', title: 'Pathway & Outcomes', desc: 'Treatment journey mapping', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-[#f1fa8c]"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg> },
                    { num: '04', title: 'Predictive Models', desc: 'Explainable AI, governed', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-[#ffb86c]"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg> },
                    { num: '05', title: 'Evidence Packs', desc: 'Audit-ready, methods-first', badge: 'OUTPUT' },
                  ].map((step, i) => (
                    <div key={i} class="bg-[#241B4D]/60 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-[#322666]/60 transition-colors">
                      <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                        {step.num}
                      </div>
                      <div class="flex-grow">
                        <div class="text-[13px] font-semibold text-white">{step.title}</div>
                        <div class="text-[10px] text-white/50">{step.desc}</div>
                      </div>
                      <div>
                        {step.badge ? (
                          <div class={\`text-[9px] font-bold px-2 py-1 rounded-full border \${step.badge === 'LIVE' ? 'border-[#00E3FF] text-[#00E3FF] bg-[#00E3FF]/10' : 'border-[#bd93f9] text-[#bd93f9] bg-[#bd93f9]/10'}\`}>
                            {step.badge}
                          </div>
                        ) : (
                          step.icon
                        )}
                      </div>
                    </div>
                  ))}`;

    
    // Expanded static HTML:
    const expandedMap = `
    <div class="bg-[#241B4D]/60 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-[#322666]/60 transition-colors">
      <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">01</div>
      <div class="flex-grow"><div class="text-[13px] font-semibold text-white">Ingest & Standardise</div><div class="text-[10px] text-white/50">Codified, governed data ingestion</div></div>
      <div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-[#ff79c6]"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg></div>
    </div>
    <div class="bg-[#241B4D]/60 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-[#322666]/60 transition-colors">
      <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">02</div>
      <div class="flex-grow"><div class="text-[13px] font-semibold text-white">Cohort Builder</div><div class="text-[10px] text-white/50">Version-controlled definitions</div></div>
      <div><div class="text-[9px] font-bold px-2 py-1 rounded-full border border-[#00E3FF] text-[#00E3FF] bg-[#00E3FF]/10">LIVE</div></div>
    </div>
    <div class="bg-[#241B4D]/60 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-[#322666]/60 transition-colors">
      <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">03</div>
      <div class="flex-grow"><div class="text-[13px] font-semibold text-white">Pathway & Outcomes</div><div class="text-[10px] text-white/50">Treatment journey mapping</div></div>
      <div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-[#f1fa8c]"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg></div>
    </div>
    <div class="bg-[#241B4D]/60 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-[#322666]/60 transition-colors">
      <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">04</div>
      <div class="flex-grow"><div class="text-[13px] font-semibold text-white">Predictive Models</div><div class="text-[10px] text-white/50">Explainable AI, governed</div></div>
      <div><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-[#ffb86c]"><path d="m12 22-8-4.5v-6.5l8-4.5 8 4.5v6.5z"/></svg></div>
    </div>
    <div class="bg-[#241B4D]/60 border border-white/5 rounded-xl p-3 flex items-center gap-4 group hover:bg-[#322666]/60 transition-colors">
      <div class="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">05</div>
      <div class="flex-grow"><div class="text-[13px] font-semibold text-white">Evidence Packs</div><div class="text-[10px] text-white/50">Audit-ready, methods-first</div></div>
      <div><div class="text-[9px] font-bold px-2 py-1 rounded-full border border-[#bd93f9] text-[#bd93f9] bg-[#bd93f9]/10">OUTPUT</div></div>
    </div>`;
    
    rweHtml = rweHtml.replace(/\{\[\s*\{\s*num:\s*'01'[\s\S]+?\)\s*<\/div>\s*<div class="bg-\[#241B4D\]\/80 border border-white\/5 rounded-2xl p-5">/, expandedMap + '\n                </div>\n\n                <div class="bg-[#241B4D]/80 border border-white/5 rounded-2xl p-5">');
    
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'real-world-evidence.html'), rweHtml);
}

// 2. Footer / Contact
const footerMatch = appContent.match(/<footer id="contact"[\s\S]*?<\/footer>/);
if (footerMatch) {
    let html = jsxToHtml(footerMatch[0]);
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'footer.html'), html);
}

// 3. Problem/Solution (Our Solution)
const probSolMatch = appContent.match(/<section id="rwe-section"[\s\S]*?<\/section>/);
if (probSolMatch) {
    let html = jsxToHtml(probSolMatch[0]);
    // fix template literals for src
    html = html.replace(/src=\{\`([^\`]+)\`\}/g, 'src="$1"');
    // Replace Lucide icons remaining
    html = html.replace(/<Database class="([^"]+)" \/>/g, '<svg class="$1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>');
    html = html.replace(/<Clock class="([^"]+)" \/>/g, '<svg class="$1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>');
    html = html.replace(/<Shield class="([^"]+)" \/>/g, '<svg class="$1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>');
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'problem-solution.html'), html);
}

// 4. Hero Section
const heroJSXMatch = appContent.match(/<section className="hero-section[\s\S]*?<\/section>/);
if (heroJSXMatch) {
    let html = jsxToHtml(heroJSXMatch[0]);
    // update hero text size
    html = html.replace(/<h1 class="text-4xl md:text-\[2.75rem\] lg:text-\[3.25rem\]/g, '<h1 class="text-5xl md:text-[3rem] lg:text-[3.5rem]');
    // ensure threejs canvas is mounted correctly. 
    html = '<div id="three-scene"></div>\n' + html;
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'hero.html'), html);
}

// 5. Impact Pipeline
const pipelineMatch = appContent.match(/<section className="pipeline-section-wrapper[\s\S]*?<\/section>/);
if (pipelineMatch) {
    let html = jsxToHtml(pipelineMatch[0]);
    // darker rich purple gradient contrast against white text
    html = html.replace(/from-\[#e9d5ff\] via-\[#8b5cf6\]/g, 'from-[#8b5cf6] via-[#6d28d9]');
    
    const pipelineData = [
      { 
        n: '01', 
        pill: 'DATA FOUNDATION', 
        title: 'Ingest & Standardise', 
        desc: 'We connect to approved NHS-derived datasets and apply rigorous standardisation across coding systems so every downstream analysis starts from a single, trusted, audit-ready data foundation — not fragmented bespoke extracts.',
        tags: ['NHS HES', 'NHSBSA EPD', 'Governed access', 'Reproducible pipelines']
      },
      { 
        n: '02', 
        pill: 'COHORT ENGINEERING', 
        title: 'Define Cohorts with Governance Built In', 
        desc: 'Cohorts, inclusion/exclusion criteria, comorbidity logic and care pathways are configured as version-controlled definitions stored in a reusable library — not one-off queries. This creates an auditable foundation that can be repeated across studies, therapy areas and time windows, without rebuilding from scratch each time.',
        tags: ['Cohort builder', 'Phenotype library', 'Version control', 'Comorbidity logic']
      },
      { 
        n: '03', 
        pill: 'ANALYTICS', 
        title: 'Orchestrate Workflows & Models', 
        desc: 'Statistical analyses and explainable predictive models run as modular, scheduled workflows — not isolated scripts. Pathway exploration, outcome measurement and risk stratification are executed in a unified environment that minimises manual hand-offs and makes refreshing evidence across time windows or therapy areas straightforward.',
        tags: ['Pathway explorer', 'Predictive analytics', 'Automated orchestration', 'Explainable AI']
      },
      { 
        n: '04', 
        pill: 'OUTPUTS', 
        title: 'Generate Defensible Evidence Packs', 
        desc: 'The same pipeline that runs the analytics assembles "methods-first" evidence packs, dashboards and decision views — each fully traceable back to the underlying data, definitions and models. This means internal governance sign-off is faster, and outputs are ready for medical affairs, HEOR, payer discussions and regulatory contexts from day one.',
        tags: ['Evidence packs', 'Audit trail', 'Interactive dashboards', 'Subgroup comparisons']
      },
      { 
        n: '05', 
        pill: 'SCALE', 
        title: 'Industrialise into Repeatable Capability', 
        desc: 'Completed pilots promote their cohorts, pipelines and evidence formats into configurable templates — ready to rerun across disease areas, geographies, time windows and stakeholder outputs. This converts one-off consultancy into a scalable workflow platform, compounding value the more it is used and eliminating the cycle of rebuilding from scratch for every new question.',
        tags: ['Reusable templates', 'Multi-therapy', 'Pilot → subscription', 'SaaS workflows']
      }
    ];

    let pipelineHtmlOut = '';
    pipelineData.forEach((step, i) => {
        const isLast = i === pipelineData.length - 1;
        const lineHtml = isLast ? '' : `
                    <div class="absolute top-[48px] bottom-[-48px] left-[23.5px] w-px bg-white/10 hidden md:block z-0">
                      <div class="pipeline-progress-segment absolute top-0 left-[-0.5px] w-[2px] bg-white origin-top scale-y-0 h-full"></div>
                    </div>`;

        const tagsHtml = step.tags.map(tag => `
                      <span class="px-4 py-1.5 rounded-full bg-white/5 text-purple-100 border border-white/10 shadow-sm text-[10px] font-medium tracking-wide uppercase hover:bg-white/10 transition-colors">
                        ${tag}
                      </span>`).join('');

        pipelineHtmlOut += `
                <div class="flex flex-col md:flex-row gap-8 md:gap-12 relative z-10">
                  <div class="flex-shrink-0 flex justify-center md:justify-start relative">
                    <div class="pipeline-node w-12 h-12 rounded-full bg-white/5 border border-white/20 flex items-center justify-center text-white font-medium text-lg shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-colors duration-300 relative z-10 backdrop-blur-sm">
                      ${step.n}
                    </div>
                    ${lineHtml}
                  </div>
                  <div class="reveal bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/20 flex-grow group hover:bg-white/15 hover:shadow-[0_8px_40px_rgba(255,255,255,0.1)] transition-all duration-300">
                    <div class="inline-flex items-center px-3 py-1 rounded-full bg-purple-900/40 text-[#f3e8ff] border border-purple-300/30 text-[10px] font-bold tracking-widest uppercase mb-4 shadow-inner">
                      ${step.pill}
                    </div>
                    <h3 class="text-2xl font-semibold mb-4 text-white">${step.title}</h3>
                    <p class="text-white/80 font-light leading-relaxed mb-6">${step.desc}</p>
                    <div class="flex flex-wrap gap-3">
                      ${tagsHtml}
                    </div>
                  </div>
                </div>`;
    });

    html = html.replace(/\{\[\s*\{\s*n:\s*'01'[\s\S]+?\)\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/, pipelineHtmlOut + '\n            </div>\n          </div>\n        </div>\n      </section>');
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'impact-pipeline.html'), html);
}

// 6. Scrollytelling elements
// Here we get the whole scrolly-wrapper.
const scrollyStartIdx = appContent.indexOf('<div className="scrolly-wrapper');
// Get index of the closing div of scrolly-wrapper. It's followed by Seamless transition section
let scrollyEndIdx = appContent.indexOf('{/* Seamless transition section');
// Back track to include the closing div
if (scrollyStartIdx !== -1 && scrollyEndIdx !== -1) {
    let scrollyBlockMatch = appContent.substring(scrollyStartIdx, scrollyEndIdx).trim();
    let scrollyWrapperHtml = jsxToHtml(scrollyBlockMatch);
    // Replace style blocks
    scrollyWrapperHtml = scrollyWrapperHtml.replace(/style=\{\{\s*height:\s*'([^']+)'\s*\}\}/g, 'style="height: $1;"');
    scrollyWrapperHtml = scrollyWrapperHtml.replace(/style=\{\{\s*top:\s*'([^']+)'\s*\}\}/g, 'style="top: $1;"');
    // Replace ArrowRight with SVG
    scrollyWrapperHtml = scrollyWrapperHtml.replace(/<ArrowRight class="([^"]+)"\/>/g, '<svg class="$1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>');
    
    // Scrolly UI replacements requested by user
    scrollyWrapperHtml = scrollyWrapperHtml.replace(/md:pr-12/g, 'md:pr-0 md:-mr-12');
    scrollyWrapperHtml = scrollyWrapperHtml.replace(/bg-white\/60 backdrop-blur-xl/g, 'bg-[#110A2E]/90 backdrop-blur-xl border border-white/20');
    scrollyWrapperHtml = scrollyWrapperHtml.replace(/text-\[#1a1a1a\]\/80/g, 'text-white/80');
    
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'scrollytelling.html'), scrollyWrapperHtml);
}

    // 7. Case Studies
    const caseStudiesMatch = appContent.match(/<section id="use-cases"[\s\S]*?<\/section>/);
    if (caseStudiesMatch) {
        let html = jsxToHtml(caseStudiesMatch[0]);

        const caseStudiesData = [
          {
            id: 'modal-0',
            pill: 'Use Cases',
            title: 'Respiratory',
            subtitle: 'Precision Patient Identification to Address Unmet Needs and Improve Outcomes',
            image: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80&w=800',
            content: `
              <h4 class="text-xl font-medium text-[#00E3FF] mb-2 mt-6">Strategic Impact</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                Accelerating uptake of a newly launched respiratory therapy by precisely identifying patients with unmet needs and the physicians most able to reach them—resulting in measurable improvements in real‑world outcomes.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Business Objective</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                A life sciences client launched a novel treatment targeting patients with high unmet needs in the respiratory market. Success depended on understanding the true attainable patient population—both current and future—and on accurately identifying physicians with the greatest potential to influence patient access and adoption.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Key Challenges</h4>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Limited visibility into patient sub‑cohorts with true medical unmet need</li>
                <li>Difficulty identifying high‑potential physicians treating the right patients at scale</li>
                <li>Inability to track early adoption and real‑world effectiveness beyond traditional rules‑based models</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Insilicare Solution</h4>
              <p class="text-white/80 font-light mb-4 leading-relaxed">
                Insilicare deployed its CORE Platform to systematically identify, profile, and prioritize eligible respiratory patients with unmet needs. Advanced analytics were applied to move beyond static rule‑based segmentation toward predictive patient and physician intelligence.
              </p>
              <p class="text-white/80 font-light mb-2 leading-relaxed">Patients were dynamically profiled using:</p>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Sub‑national geographic concentration</li>
                <li>Demographics and clinical characteristics</li>
                <li>Disease severity and treatment history</li>
                <li>Physician networks actively managing these patients</li>
              </ul>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                This enabled a precision‑driven view of both who the right patients were and where they were being treated.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Measurable Impact</h4>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>78% precision in predicting patients with a high likelihood of asthma, compared with 41% using traditional rules‑based methodologies</li>
                <li>Clear identification of high‑value physician clusters aligned to target patient segments</li>
                <li>11% reduction in uncontrolled disease status observed in a 9‑month real‑world follow‑up among patients initiated on the new therapy</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Outcome</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                Insilicare enabled the client to move from broad targeting to precision engagement—maximising commercial effectiveness while demonstrably improving patient outcomes.
              </p>
            `
          },
          {
            id: 'modal-1',
            pill: 'Use Cases',
            title: 'Cardiology',
            subtitle: 'Enabling Confident Launch Planning Through Scalable Patient and HCP Intelligence',
            image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800',
            content: `
              <h4 class="text-xl font-medium text-[#00E3FF] mb-2 mt-6">Strategic Impact</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                Strengthening launch readiness by delivering a single, scalable source of truth for patient and physician identification—driving sharper targeting decisions and greater organisational confidence.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Business Objective</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                The client sought to comprehensively assess both current and future cardiology patient populations and the physicians treating them. They required a systematic, privacy‑compliant solution capable of generating granular insights and scaling across multiple indications to support launch planning.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Key Challenges</h4>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Data gaps and privacy constraints limiting access to actionable, patient‑level insights</li>
                <li>Difficulty identifying nuanced sub‑cohorts by indication and predicting future eligible patients</li>
                <li>Low confidence in targeting strategies driven by fragmented, non‑standardised approaches</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Insilicare Solution</h4>
              <p class="text-white/80 font-light mb-4 leading-relaxed">
                Insilicare positioned the CORE Platform as the client’s single point solution for advanced patient and physician finding. The platform unified disparate datasets, applied predictive methodologies, and delivered consistent insights across teams and functions.
              </p>
              <p class="text-white/80 font-light mb-2 leading-relaxed">Key capabilities included:</p>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Advanced identification of eligible and future‑eligible cardiology patients</li>
                <li>Dynamic HCP classification based on real‑world treating behaviour</li>
                <li>Scalable analytics supporting both brand and indication expansion</li>
              </ul>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                The platform was accessed by cross‑functional teams—including commercial, medical, and strategy—creating organisational alignment during a critical launch phase.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Measurable Impact</h4>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Identification of 7× more eligible patients compared with prior approaches</li>
                <li>24% reclassification of HCPs, reshaping the client’s understanding of their target universe</li>
                <li>Increased confidence in launch targeting and resource allocation decisions</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Outcome</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                Insilicare transformed launch planning from assumption‑led to evidence‑driven—enabling the client to approach market entry with clarity, precision, and internal alignment.
              </p>
            `
          },
          {
            id: 'modal-2',
            pill: 'Use Cases',
            title: 'Neurology',
            subtitle: 'Rapid Sub‑National Market Assessment in Multiple Sclerosis',
            image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=800',
            content: `
              <h4 class="text-xl font-medium text-[#00E3FF] mb-2 mt-6">Strategic Impact</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                Delivering fast, sub‑national insights to shape competitive strategy and proactively defend market position in a complex neurological disease area.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Business Objective</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                A neurology client commissioned Insilicare to conduct a competitive landscape assessment in the Multiple Sclerosis (MS) space. The goal was to generate actionable, regional insights that could inform brand positioning and support proactive defence of existing market share.
              </p>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Key Challenges</h4>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Fragmented data across healthcare settings, limiting longitudinal visibility of MS patients</li>
                <li>Difficulty tracking disease progression and treatment sequencing over time</li>
                <li>Limited understanding of real‑world treatment outcomes at a regional level</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Insilicare Solution</h4>
              <p class="text-white/80 font-light mb-4 leading-relaxed">
                Insilicare rapidly deployed the CORE Platform within four weeks, delivering a comprehensive and sub‑national view of the MS market.
              </p>
              <p class="text-white/80 font-light mb-2 leading-relaxed">CORE applications enabled:</p>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Detailed patient profiling through the Patient Insights app, including demographics, disease characteristics, and geographic distribution</li>
                <li>In‑depth analysis of treatment lines, switching patterns, and disease progression via the Treatment Journey module</li>
                <li>Clear visibility into regional variations shaping competitive dynamics</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Measurable Impact</h4>
              <ul class="text-white/80 font-light mb-6 leading-relaxed space-y-2 list-disc list-inside">
                <li>Accelerated time‑to‑insight with platform deployment completed in under one month</li>
                <li>Robust sub‑national intelligence supporting tailored regional strategies</li>
                <li>Improved understanding of long‑term treatment patterns and outcomes within real‑world data constraints</li>
              </ul>

              <h4 class="text-xl font-medium text-[#00E3FF] mb-2">Outcome</h4>
              <p class="text-white/80 font-light mb-6 leading-relaxed">
                Insilicare empowered the client to move quickly and decisively—using data‑driven intelligence to refine competitive positioning and protect value in an evolving MS landscape.
              </p>
            `
          }
        ];

        let caseStudiesExpanded = '';
        let modalsExpanded = '';

        caseStudiesData.forEach((study, index) => {
          caseStudiesExpanded += `
              <div onclick="document.getElementById('${study.id}').classList.remove('hidden')" class="reveal bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl group cursor-pointer hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
                <div class="w-full h-48 mb-6 rounded-xl overflow-hidden relative border border-white/5">
                  <img src="${study.image}" alt="${study.title}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#0A051E] to-transparent opacity-60"></div>
                  <div class="absolute bottom-4 left-4 border border-white/20 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[10px] tracking-widest uppercase text-white">
                    ${study.title}
                  </div>
                </div>
                <h3 class="text-2xl font-light tracking-tight mb-4 text-[#00E3FF] group-hover:text-white transition-colors">${study.subtitle}</h3>
                <div class="mt-auto pt-6 flex items-center justify-between text-sm font-semibold text-white/60 group-hover:text-[#00E3FF] transition-colors uppercase tracking-widest">
                  <span>Read Case Study</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </div>
              </div>
          `;

          modalsExpanded += `
            <div id="${study.id}" class="hidden fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
              <div class="absolute inset-0 bg-[#0A051E]/80 backdrop-blur-sm" onclick="document.getElementById('${study.id}').classList.add('hidden')"></div>
              <div class="relative w-full max-w-4xl bg-[#110A2E] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div class="flex-shrink-0 w-full h-48 sm:h-64 relative border-b border-white/10">
                  <img src="${study.image}" alt="${study.title}" class="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#110A2E] to-transparent"></div>
                  <button onclick="document.getElementById('${study.id}').classList.add('hidden')" class="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                  <div class="absolute bottom-6 left-8 right-8">
                    <div class="border border-white/20 rounded-full bg-white/5 px-3 py-1 text-[10px] tracking-widest uppercase text-[#00E3FF] inline-block mb-3 backdrop-blur-md">
                      ${study.pill} • ${study.title}
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-light tracking-tight text-white">${study.subtitle}</h2>
                  </div>
                </div>
                
                <div class="p-8 sm:p-10 overflow-y-auto custom-scrollbar flex-grow overscroll-contain">
                  <div class="max-w-3xl">
                    ${study.content}
                  </div>
                </div>
              </div>
            </div>
          `;
        });

        html = html.replace(/\{caseStudies\.map\([\s\S]+?\)\s*<\/div>\s*<\/div>\s*<\/section>/, caseStudiesExpanded + '\n          </div>\n        </div>\n      </section>\n\n      <!-- Modals -->\n' + modalsExpanded);
        
        // remove onClick
        html = html.replace(/onClick=\{[^}]+\}/g, '');

        fs.writeFileSync(path.join(__dirname, 'webflow-export', 'case-studies.html'), html);
    }

// 8. About Us
// It is between `) : (` and `)}` in the App.tsx, starts with `<div className="relative z-10 w-full min-h-screen pt-48`
const aboutUsMatch = appContent.match(/<div className="relative z-10 w-full min-h-screen pt-48[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/);
if (aboutUsMatch) {
    let html = jsxToHtml(aboutUsMatch[0]);
    // remove onClick
    html = html.replace(/onClick=\{[^}]+\}/g, '');
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'about-us.html'), html);
}

// 9. Navbar
const navMatch = appContent.match(/<nav[\s\S]*?<\/nav>/);
if (navMatch) {
    const cleanNavHtml = `
<nav class="fixed top-0 w-full z-50 py-3 px-8 flex justify-between items-center pointer-events-auto bg-white/5 backdrop-blur-md text-white/90">
  <div class="flex items-center gap-2 cursor-pointer">
    <img src="/logo.svg" alt="Insilicare Logo" class="h-10 w-auto max-w-[200px] object-contain" />
  </div>
  
  <div class="hidden md:flex gap-12 font-medium text-xs tracking-widest uppercase">
    <a href="#" class="opacity-70 hover:opacity-100 transition-opacity">Solutions</a>
    <a href="#" class="opacity-70 hover:opacity-100 transition-opacity">About us</a>
    <a href="#" class="opacity-70 hover:opacity-100 transition-opacity">Use cases</a>
  </div>
  
  <div class="flex items-center gap-6 pointer-events-auto">
    <a href="#contact" class="flex border border-white/30 text-white rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-widest hover:bg-white hover:text-purple-900 transition-colors">
      Get Started
    </a>
  </div>
</nav>
`;
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'navbar.html'), cleanNavHtml.trim());
}



// 10. Global Background
const bgMatch = appContent.match(/<div className="fixed inset-0 z-\[-1\] pointer-events-none bg-\[#3b0764\] overflow-hidden">\s*<div.*?<\/div>\s*<div.*?<\/div>\s*<div.*?<\/div>\s*<div.*?<\/div>\s*<\/div>/);
if (bgMatch) {
    let html = jsxToHtml(bgMatch[0]);
    fs.writeFileSync(path.join(__dirname, 'webflow-export', 'global-background.html'), html);
}
console.log("Exported to webflow-export/");
