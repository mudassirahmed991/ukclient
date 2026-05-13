import styles from '../page.module.css';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const revalidate = 0;

export default async function Page() {
  const locations = await prisma.location.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <main style={{ padding: '100px 20px', minHeight: '60vh', textAlign: 'center', backgroundColor: '#000', color: '#D4AF37' }}>
      <h1 style={{ 
        fontFamily: 'var(--font-heading)', 
        textTransform: 'uppercase', 
        letterSpacing: '6px', 
        fontSize: '3.5rem', 
        marginBottom: '40px',
        color: '#D4AF37',
        WebkitTextStroke: '1px #000',
        textShadow: '0 0 15px rgba(212, 175, 55, 0.4), 3px 3px 0px #000, 5px 5px 0px #D4AF37'
      }}>
        LOCATIONS
      </h1>
      
      <section className={styles.menusSection} style={{ marginTop: '0', paddingTop: '0' }}>
        <p className={styles.menusTitle} style={{ 
          marginBottom: '80px', 
          color: '#D4AF37',
          fontFamily: 'var(--font-heading)',
          fontSize: '1.6rem',
          letterSpacing: '2px',
          WebkitTextStroke: '0.5px #000',
          textShadow: '2px 2px 0px #000, 3px 3px 0px rgba(212,175,55,0.5)'
        }}>
          Come visit us at any of our branches.<br />
          Place your order by clicking on a location.
        </p>
        <div className={styles.locationList} style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
          {locations.map((loc: any) => (
            <div key={loc.id} className={styles.locationBlock} style={{ maxWidth: '400px' }}>
              <Link href={`/menu?location=${loc.name.toLowerCase()}`} className={styles.locationLink} style={{ 
                display: 'block', 
                fontSize: '3.2rem', 
                marginBottom: '30px',
                color: '#000',
                WebkitTextStroke: '2px #D4AF37',
                textShadow: '3px 3px 0px #D4AF37, 6px 6px 10px rgba(0,0,0,0.8)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                transition: 'all 0.3s ease'
              }}>
                {loc.name}
              </Link>
              <div style={{ fontSize: '1.3rem', lineHeight: '1.8' }}>
                <span style={{ 
                  display: 'block', 
                  marginBottom: '25px',
                  fontFamily: 'var(--font-heading)',
                  color: '#fff',
                  WebkitTextStroke: '0.5px #000',
                  textShadow: '1px 1px 0px #D4AF37, 2px 2px 4px #000',
                  letterSpacing: '1.5px',
                  fontSize: '1.4rem'
                }}>
                  {loc.email}
                </span>
                <a href={`tel:${loc.phone.replace(/\s+/g, '')}`} style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#D4AF37', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '2rem',
                  WebkitTextStroke: '1px #000',
                  textShadow: '2px 2px 0px #000, 4px 4px 0px #D4AF37',
                  letterSpacing: '2px',
                  transition: 'transform 0.3s ease'
                }}>
                  <span style={{ fontSize: '1.5rem', WebkitTextStroke: 'none', textShadow: 'none' }}>📞</span> 
                  {loc.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
