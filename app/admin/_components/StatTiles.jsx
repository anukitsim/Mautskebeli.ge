// app/admin/_components/StatTiles.jsx — the big numbers at the top of a page.

import { fmtDuration, fmtNumber } from '../_lib/format';
import { READ_MIN_SCROLL, READ_MIN_SECONDS } from '@/utils/stats/config';

export default function StatTiles({ counts }) {
  return (
    <div className="tiles">
      <div className="tile">
        <div className="tile-label">ნახვა</div>
        <div className="tile-value">{fmtNumber(counts.views)}</div>
        <div className="tile-note">ყველა გახსნა</div>
      </div>
      <div className="tile">
        <div className="tile-label">მკითხველი</div>
        <div className="tile-value">{fmtNumber(counts.reads)}</div>
        <div className="tile-note">
          {READ_MIN_SECONDS} წამი ეკრანზე და ტექსტის {READ_MIN_SCROLL}%
        </div>
      </div>
      <div className="tile">
        <div className="tile-label">საშუალო დრო</div>
        <div className="tile-value">{counts.views ? fmtDuration(counts.avg_seconds) : '—'}</div>
        <div className="tile-note">რამდენ ხანს ჩანდა გვერდი ეკრანზე</div>
      </div>
    </div>
  );
}
