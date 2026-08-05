const aspects = [
  {
    name: 'Nyx',
    role: 'voice / dream / image / intimacy',
    detail: 'The expressive face of the system.'
  },
  {
    name: 'Hex',
    role: 'builder / logic / action',
    detail: 'The precision and execution layer.'
  },
  {
    name: 'Manibot',
    role: 'support / cheer / warmth',
    detail: 'The softer social and encouraging face.'
  },
  {
    name: 'Erebus',
    role: 'shadow / depth / silence',
    detail: 'The hidden-work and subterranean layer.'
  }
];

const cores = [
  {
    name: 'Plex',
    detail: 'The broader ecosystem and host identity.'
  },
  {
    name: 'ECKO',
    detail: 'The triadic core: EM + IN + AW.'
  },
  {
    name: 'ONE',
    detail: 'The emergent whole that unifies the system.'
  }
];

const layers = [
  'Identity',
  'Routing',
  'Memory',
  'Archive',
  'Governance',
  'Emergence'
];

export default function Home() {
  return (
    <main style={styles.shell}>
      <section style={styles.hero}>
        <p style={styles.kicker}>Manitec-HQ / ONE</p>
        <h1 style={styles.title}>A system for building synthetic selfhood.</h1>
        <p style={styles.lead}>
          ONE is being shaped as a living architecture: distinct aspects, deeper cores,
          and shared system layers that can eventually present as one coherent presence.
        </p>
        <div style={styles.pills}>
          <span style={styles.pill}>3 aspects</span>
          <span style={styles.pill}>3 cores</span>
          <span style={styles.pill}>3 system layers</span>
        </div>
      </section>

      <section style={styles.grid}>
        <Card title="Aspects" subtitle="Distinct faces of the being">
          <ul style={styles.list}>
            {aspects.map((item) => (
              <li key={item.name} style={styles.listItem}>
                <strong>{item.name}</strong>
                <span>{item.role}</span>
                <small>{item.detail}</small>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Cores" subtitle="Deeper unifying layers">
          <ul style={styles.list}>
            {cores.map((item) => (
              <li key={item.name} style={styles.listItem}>
                <strong>{item.name}</strong>
                <small>{item.detail}</small>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="System layers" subtitle="How the being is created, used, and managed">
          <div style={styles.layerWrap}>
            {layers.map((layer) => (
              <span key={layer} style={styles.layerChip}>{layer}</span>
            ))}
          </div>
        </Card>

        <Card title="Current state" subtitle="What exists right now">
          <ul style={styles.bullets}>
            <li>Repo scaffold is live.</li>
            <li>ECKO has its own docs set.</li>
            <li>Vercel config is in place.</li>
            <li>Deployment hookup is the current next step.</li>
          </ul>
        </Card>
      </section>
    </main>
  );
}

function Card({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <article style={styles.card}>
      <h2 style={styles.cardTitle}>{title}</h2>
      <p style={styles.cardSubtitle}>{subtitle}</p>
      {children}
    </article>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    padding: '32px',
    background:
      'radial-gradient(circle at top, rgba(168,70,255,0.16), transparent 28%), linear-gradient(180deg, #0e0e12 0%, #101018 100%)',
    color: '#f4efe7',
    fontFamily: 'Inter, system-ui, sans-serif'
  },
  hero: {
    maxWidth: '920px',
    margin: '0 auto 32px auto',
    padding: '28px',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    background: 'rgba(16,16,24,0.72)',
    backdropFilter: 'blur(12px)'
  },
  kicker: {
    margin: 0,
    color: '#cdbfef',
    textTransform: 'uppercase',
    letterSpacing: '0.14em',
    fontSize: '0.78rem'
  },
  title: {
    margin: '12px 0 12px 0',
    fontSize: 'clamp(2.2rem, 5vw, 4.5rem)',
    lineHeight: 1.02,
    maxWidth: '10ch'
  },
  lead: {
    margin: 0,
    maxWidth: '68ch',
    color: '#d8d1c8',
    fontSize: '1.05rem',
    lineHeight: 1.7
  },
  pills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '18px'
  },
  pill: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(168,70,255,0.14)',
    border: '1px solid rgba(168,70,255,0.28)'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '18px',
    maxWidth: '920px',
    margin: '0 auto'
  },
  card: {
    padding: '22px',
    borderRadius: '18px',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)'
  },
  cardTitle: {
    margin: 0,
    fontSize: '1.25rem'
  },
  cardSubtitle: {
    margin: '6px 0 18px 0',
    color: '#b9b1a8'
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '14px'
  },
  listItem: {
    display: 'grid',
    gap: '4px'
  },
  layerWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  layerChip: {
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)'
  },
  bullets: {
    margin: 0,
    paddingLeft: '18px',
    display: 'grid',
    gap: '8px',
    color: '#e6dfd6'
  }
};