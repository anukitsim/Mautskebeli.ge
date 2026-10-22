// app/admin/_components/StatTiles.jsx — the big numbers at the top of a page.

import { fmtDuration, fmtNumber, fmtPercent } from '../_lib/format';

export default function StatTiles({ counts, showTime = false }) {
  return (
    <div className="tiles">
      <div className="tile">
        <div className="tile-label">ნახვები</div>
        <div className="tile-value">{fmtNumber(counts.views)}</div>
        <div className="tile-note">ყველა გახსნა</div>
      </div>
      <div className="tile">
        <div className="tile-label">მკითხველები</div>
        <div className="tile-value">{fmtNumber(counts.readers)}</div>
        <div className="tile-note">სხვადასხვა ბრაუზერი</div>
      </div>
      <div className="tile">
        <div className="tile-label">რეალურად წაკითხული</div>
        <div className="tile-value">{fmtNumber(counts.reads)}</div>
        <div className="tile-note">{fmtPercent(counts.reads, counts.reader_items)} მათგან, ვინც გახსნა</div>
      </div>
      {showTime && (
        <div className="tile">
          <div className="tile-label">ტიპიური დრო</div>
          <div className="tile-value">{counts.views ? fmtDuration(counts.median_seconds) : '—'}</div>
          <div className="tile-note">ნახევარი უფრო მოკლე, ნახევარი — გრძელი</div>
        </div>
      )}
    </div>
  );
}
