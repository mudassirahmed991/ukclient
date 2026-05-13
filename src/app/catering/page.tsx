import styles from './page.module.css';
import Image from 'next/image';

export default function CateringPage() {
  return (
    <main className={styles.main}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <Image 
            src="/hero.png" 
            alt="Catering & Private Events" 
            fill 
            style={{ objectFit: 'cover' }} 
            priority 
          />
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>CATERING & EVENTS</h1>
          </div>
        </div>
      </section>

      {/* 2. INTRO SECTION */}
      <section className={styles.introSection}>
        <h2 className={styles.sectionTitle}>LET US HOST YOU</h2>
        <p className={styles.introText}>
          Whether you're planning an intimate dinner party, a corporate luncheon, or a grand wedding celebration, our culinary team will craft a customized experience that perfectly fits your vision. We bring the signature NAJ Turkish Restaurant aesthetic and unforgettable flavors directly to your guests.
        </p>
      </section>

      {/* 3. SERVICES GRID */}
      <section className={styles.servicesGrid}>
        {/* Service 1 */}
        <div className={styles.serviceCard}>
          <div className={styles.imageContainer}>
            <Image 
              src="/hero.png" 
              alt="Private Events" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
          <div className={styles.serviceInfo}>
            <h3 className={styles.serviceName}>PRIVATE EVENTS</h3>
            <p className={styles.serviceDesc}>
              Host your next milestone celebration with us. From birthdays and anniversaries to rehearsal dinners, our beautiful spaces and dedicated team ensure every detail is flawless.
            </p>
            <button className={styles.inquireBtn}>INQUIRE NOW</button>
          </div>
        </div>

        {/* Service 2 */}
        <div className={styles.serviceCard}>
          <div className={styles.imageContainer}>
            <Image 
              src="/hero.png" 
              alt="Corporate Catering" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
          <div className={styles.serviceInfo}>
            <h3 className={styles.serviceName}>CORPORATE CATERING</h3>
            <p className={styles.serviceDesc}>
              Elevate your meetings and company events with our premium catering packages. We offer beautifully presented, nourishing meals that keep your team inspired and energized.
            </p>
            <button className={styles.inquireBtn}>INQUIRE NOW</button>
          </div>
        </div>
      </section>
    </main>
  );
}
