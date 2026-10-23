// app/admin/_components/AudienceCards.jsx — where from, which device, which country.

import HBars from './HBars';
import { fmtNumber, fmtPercent } from '../_lib/format';
import { countryLabel, DEVICE_LABELS, SOURCE_LABELS } from '@/utils/stats/audience';

function rowsToBars(rows, labelOf, totalViews) {
  return rows.map((r) => ({
    label: labelOf(r.key),
    value: r.views,
    text: `${fmtPercent(r.views, totalViews)} · ${fmtNumber(r.views)} ნახვა · ${fmtNumber(r.reads)} მკითხველი`,
  }));
}

export default function AudienceCards({ audience }) {
  const total = audience.sources.reduce((s, r) => s + r.views, 0);
  if (!total) {
    return (
      <section className="card">
        <h2>ტრაფიკის წყაროები</h2>
        <p className="sub">ამ პერიოდში ჯერ არავის გაუხსნია.</p>
      </section>
    );
  }
  return (
    <>
      <section className="card">
        <h2>ტრაფიკის წყაროები</h2>
        <p className="sub">
          რომელი ბმულით მოვიდა მკითხველი. „პირდაპირი / მესენჯერი“ — მისამართი აკრიფეს, შენახული ჰქონდათ, ან
          გაუგზავნეს Messenger-ით, Viber-ით ან WhatsApp-ით (ეს აპები წყაროს მალავენ).
        </p>
        <HBars items={rowsToBars(audience.sources, (k) => SOURCE_LABELS[k] || k, total)} />
        {audience.referrers.length > 0 && (
          <p className="sub" style={{ marginTop: 16, marginBottom: 0 }}>
            სხვა საიტები და კამპანიები:{' '}
            {audience.referrers.map((r) => `${r.key} (${fmtNumber(r.views)})`).join(', ')}
          </p>
        )}
      </section>

      <div className="card-pair">
        <section className="card">
          <h2>მოწყობილობა</h2>
          <p className="sub">ტელეფონი, ტაბლეტი თუ კომპიუტერი.</p>
          <HBars items={rowsToBars(audience.devices, (k) => DEVICE_LABELS[k] || k, total)} />
        </section>
        <section className="card">
          <h2>ქვეყანა</h2>
          <p className="sub">ინტერნეტ-კავშირის მიხედვით (VPN-ით შეიძლება სხვა ქვეყანა ჩანდეს).</p>
          <HBars items={rowsToBars(audience.countries, countryLabel, total)} />
        </section>
      </div>
    </>
  );
}
