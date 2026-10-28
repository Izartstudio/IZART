const stats = [
  { label: "Projects", value: "140+" },
  { label: "Clients", value: "80+" },
  { label: "Partnerships", value: "15+" },
  { label: "Years of Experience", value: "5+" },
] as const;

export function StatsGrid() {
  return <dl className="about-stats__grid">
    {stats.map(stat => <div className="about-stats__stat" key={stat.label}>
      <dt>{stat.label}</dt>
      <dd>{stat.value}</dd>
    </div>)}
  </dl>;
}
