import styles from '../page.module.css';

export default function Page() {
  return (
    <main style={{ padding: '100px 20px', minHeight: '60vh', textAlign: 'center', color: '#D4AF37' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '3rem' }}>
        contact
      </h1>
      <p style={{ marginTop: '20px', fontFamily: 'var(--font-body)' }}>
        This is the dedicated page for contact. Content coming soon!
      </p>
    </main>
  );
}
