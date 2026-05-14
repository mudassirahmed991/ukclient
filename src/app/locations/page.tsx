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
      <h1 className={styles.locationsTitle}>
        LOCATIONS
      </h1>
      
      <section className={styles.menusSection} style={{ marginTop: '0', paddingTop: '0' }}>
        <p className={styles.locationsSubtitle}>
          Come visit us at any of our branches.<br />
          Place your order by clicking on a location.
        </p>
        <div className={styles.locationList} style={{ display: 'flex', justifyContent: 'center', gap: '80px', flexWrap: 'wrap' }}>
          {locations.map((loc: any) => (
            <div key={loc.id} className={styles.locationBlock} style={{ maxWidth: '400px' }}>
              <Link href={`/menu?location=${loc.name.toLowerCase()}`} className={styles.locationLinkBlock}>
                {loc.name}
              </Link>
              <div style={{ lineHeight: '1.8' }}>
                <span className={styles.locationEmailText}>
                  {loc.email}
                </span>
                <a href={`tel:${loc.phone.replace(/\s+/g, '')}`} className={styles.locationPhoneLink}>
                  <span style={{ fontSize: '1.5em', WebkitTextStroke: 'none', textShadow: 'none' }}>📞</span> 
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
