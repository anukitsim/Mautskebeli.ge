'use client';

// Daily chart for one article: views (light bar) with real reads (dark bar)
// in front — reads are always part of views, so they share one baseline.
// Hover or keyboard focus on a day shows its numbers; the same numbers are
// in the table below the chart.

import { useEffect, useRef, useState } from 'react';

const HEIGHT = 220;
const M = { top: 12, right: 8, bottom: 26, left: 40 };

function niceStep(max) {
  if (max <= 4) return 1;
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const unit = raw / pow;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * pow;
}

const compact = (n) => (n >= 1000 ? `${Math.round(n / 100) / 10}K` : String(n));

// Bar with 4px rounded top, square at the baseline.
function barPath(x, y, w, h) {
  if (h <= 0) return '';
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
}

export default function DailyChart({ data }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(720);
  const [active, setActive] = useState(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.floor(entry.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = Math.max(1, ...data.map((d) => d.views));
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = 0; v <= top; v += step) ticks.push(v);

  const plotW = width - M.left - M.right;
  const plotH = HEIGHT - M.top - M.bottom;
  const slot = plotW / data.length;
  const barW = Math.max(2, Math.min(24, slot * 0.7));
  const y = (v) => M.top + plotH - (v / top) * plotH;
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  const tip = active != null ? data[active] : null;

  return (
    <div>
      <div className="chart-legend" aria-hidden="true">
        <span><i style={{ background: 'var(--viz-views)' }} />ნახვები</span>
        <span><i style={{ background: 'var(--viz-reads)' }} />რეალურად წაკითხული</span>
      </div>
      <div className="chart-wrap" ref={wrapRef}>
        <svg
          className="chart-svg"
          width={width}
          height={HEIGHT}
          role="img"
          aria-label="დღიური ნახვები და რეალური წაკითხვები"
        >
          {ticks.map((t) => (
            <g key={t}>
              <line className="grid" x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} />
              <text x={M.left - 6} y={y(t) + 4} textAnchor="end">{compact(t)}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = M.left + slot * i + slot / 2;
            const x = cx - barW / 2;
            return (
              <g key={d.day}>
                {active === i && (
                  <rect className="band" x={M.left + slot * i} y={M.top} width={slot} height={plotH} />
                )}
                <path d={barPath(x, y(d.views), barW, M.top + plotH - y(d.views))} fill="var(--viz-views)" />
                <path d={barPath(x, y(d.reads), barW, M.top + plotH - y(d.reads))} fill="var(--viz-reads)" />
                {(i % labelEvery === 0 || i === data.length - 1) && (
                  <text x={cx} y={HEIGHT - 8} textAnchor="middle">{d.label}</text>
                )}
                <rect
                  className="hit"
                  x={M.left + slot * i}
                  y={M.top}
                  width={slot}
                  height={plotH}
                  tabIndex={0}
                  aria-label={`${d.label}: ${d.views} ნახვა, ${d.reads} რეალურად წაკითხული`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              </g>
            );
          })}
        </svg>
        {tip && (
          <div
            className="chart-tip"
            style={{
              left: Math.min(Math.max(M.left + slot * active + slot / 2, 90), width - 90),
              top: y(tip.views) - 6,
            }}
          >
            <div className="tip-date">{tip.label}</div>
            <div className="tip-row"><span className="key" style={{ background: 'var(--viz-views)' }} /><b>{tip.views}</b> ნახვა</div>
            <div className="tip-row"><span className="key" style={{ background: 'var(--viz-reads)' }} /><b>{tip.reads}</b> რეალურად წაკითხული</div>
            <div className="tip-row"><span className="key" /><b>{tip.readers}</b> მკითხველი</div>
          </div>
        )}
      </div>
      <details className="table-toggle">
        <summary>ცხრილის სახით</summary>
        <div className="table-scroll">
          <table className="stats-table">
            <thead>
              <tr>
                <th scope="col">დღე</th>
                <th className="num" scope="col">ნახვები</th>
                <th className="num" scope="col">მკითხველები</th>
                <th className="num" scope="col">რეალურად წაკითხული</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.day}>
                  <td>{d.label}</td>
                  <td className="num">{d.views}</td>
                  <td className="num">{d.readers}</td>
                  <td className="num">{d.reads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
