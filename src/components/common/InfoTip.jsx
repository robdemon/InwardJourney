export default function InfoTip({ label, tip }) {
  return (
    <span className="iw">
      {label}
      <span className="ii">
        ?<span className="tt">{tip}</span>
      </span>
    </span>
  );
}
