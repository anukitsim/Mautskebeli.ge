// app/admin/stats/health/page.jsx — what the filter accepted and refused.

import { requireAdmin } from '../../_lib/guard';
import AdminShell, { NotConfigured, PeriodChips } from '../../_components/AdminShell';
import { fmtNumber, readPeriod } from '../../_lib/format';
import { isStatsEnabled } from '@/utils/stats/ticket';
import { getFilterHealth } from '@/utils/stats/queries';
import { PERIODS } from '@/utils/stats/config';

export const dynamic = 'force-dynamic';

const REASONS = {
  bot: ['რობოტი', 'საძიებო სისტემის ან სხვა ავტომატური პროგრამის ვიზიტი.'],
  staff: ['გუნდის მოწყობილობა', 'მფლობელის ბრაუზერი — საკუთარი კითხვა არ ითვლება.'],
  expired: ['ძველი გვერდი', 'გვერდი 48 საათზე მეტი ხნის წინ გაიხსნა და ახლა გაგრძელდა.'],
  bad_ticket: ['ყალბი სიგნალი', 'სიგნალი, რომელიც ჩვენს საიტს არ შეუქმნია (მაგ. ხელით გაგზავნილი).'],
  rate_limited: ['ზედმეტად ბევრი სიგნალი', 'ერთი მისამართიდან წუთში 60-ზე მეტი — შესაძლო თავდასხმა.'],
  bad_request: ['დაზიანებული მოთხოვნა', 'არასწორი მონაცემი ან სხვა საიტიდან გამოგზავნილი.'],
  mismatch: ['არევა', 'ერთი ნომრით სხვა სტატიის მონიშვნის მცდელობა.'],
};

export default async function FilterHealth({ searchParams }) {
  const session = await requireAdmin();
  const period = readPeriod(searchParams);

  if (!isStatsEnabled()) {
    return (
      <AdminShell session={session} active="health">
        <NotConfigured />
      </AdminShell>
    );
  }

  const { opens, rejected } = await getFilterHealth(PERIODS[period].days);

  return (
    <AdminShell session={session} active="health">
      <PeriodChips basePath="/admin/stats/health" period={period} />

      <div className="tiles">
        <div className="tile">
          <div className="tile-label">მიღებული გახსნები</div>
          <div className="tile-value">{fmtNumber(opens)}</div>
          <div className="tile-note">ეს ითვლება სტატისტიკაში</div>
        </div>
        <div className="tile">
          <div className="tile-label">უარყოფილი სიგნალები</div>
          <div className="tile-value">{fmtNumber(rejected.reduce((s, r) => s + r.n, 0))}</div>
          <div className="tile-note">ეს არ ითვლება</div>
        </div>
      </div>

      <section className="card">
        <h2>რატომ იქნა უარყოფილი</h2>
        <p className="sub">
          ეს გვერდი აჩვენებს, რომ ფილტრი მუშაობს. რობოტები და გუნდის მოწყობილობები ნორმალურია. ყალბი ან
          ზედმეტად ბევრი სიგნალის უეცარი ზრდა — უთხარით დეველოპერს.
        </p>
        {rejected.length ? (
          <div className="table-scroll">
            <table className="stats-table">
              <thead>
                <tr>
                  <th scope="col">მიზეზი</th>
                  <th scope="col">რას ნიშნავს</th>
                  <th className="num" scope="col">რაოდენობა</th>
                </tr>
              </thead>
              <tbody>
                {rejected.map((r) => (
                  <tr key={r.reason}>
                    <td>{REASONS[r.reason]?.[0] || r.reason}</td>
                    <td className="meta">{REASONS[r.reason]?.[1] || ''}</td>
                    <td className="num">{fmtNumber(r.n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sub">ამ პერიოდში არაფერი უარყოფილა.</p>
        )}
      </section>
    </AdminShell>
  );
}
