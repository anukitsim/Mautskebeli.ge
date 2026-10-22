// app/admin/_components/HBars.jsx — a simple list of horizontal bars with labels.

export default function HBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="hbars">
      {items.map((i) => (
        <div className="hbar" key={i.label}>
          <span>{i.label}</span>
          <span className="hbar-track">
            <span className="hbar-fill" style={{ width: `${(i.value / max) * 85}%` }} />
            <span className="hbar-value">{i.text}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
