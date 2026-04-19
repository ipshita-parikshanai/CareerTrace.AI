'use client';

import { useState } from 'react';
import { Database, ExternalLink } from 'lucide-react';

/**
 * Small "Powered by CrustData" chip — hover/tap to reveal the actual API
 * endpoints we hit to build this trace. Useful for the hackathon judges to
 * see CrustData primitives surfaced.
 */
const ENDPOINTS = [
  { method: 'GET', path: '/screener/person/enrich', purpose: 'Enrich your LinkedIn profile + each candidate' },
  { method: 'POST', path: '/screener/persondb/search', purpose: 'Find people whose current title matches your goal' },
  { method: 'POST', path: '/screener/persondb/search', purpose: '"Macro cohort" counts (school / employer / field × goal)' },
];

export function PoweredByCrustData() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-flex flex-col items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="font-heading inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-medium text-amber-900 shadow-sm transition-colors hover:bg-amber-100"
        aria-expanded={open}
      >
        <Database className="h-3.5 w-3.5 text-amber-700" />
        Powered by CrustData
      </button>

      {open ? (
        <div
          role="tooltip"
          className="motion-safe:animate-career-rise absolute bottom-full z-40 mb-2 w-[min(92vw,360px)] rounded-xl border border-slate-200 bg-white p-3 shadow-2xl"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <p className="font-heading mb-2 text-xs font-semibold tracking-wide text-slate-700 uppercase">
            APIs we used for this trace
          </p>
          <ul className="space-y-1.5 text-left">
            {ENDPOINTS.map((e, i) => (
              <li key={i} className="rounded-md bg-slate-50 px-2 py-1.5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                      e.method === 'GET' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {e.method}
                  </span>
                  <code className="font-mono text-[11px] text-slate-800">{e.path}</code>
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-600">{e.purpose}</p>
              </li>
            ))}
          </ul>
          <a
            href="https://docs.crustdata.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-800 hover:text-amber-900 hover:underline"
          >
            CrustData docs <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ) : null}
    </div>
  );
}
