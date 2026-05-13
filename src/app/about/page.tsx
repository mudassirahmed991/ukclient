import styles from './page.module.css';
import Image from 'next/image';
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {},
  });

  return (
    <main className={styles.main}>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <Image 
            src={settings.bannerHomeHero || "/hero.png"} 
            alt="NAJ Turkish Restaurant Interior" 
            fill 
            style={{ objectFit: 'cover' }} 
            priority 
          />
          <div className={styles.heroOverlay}>
            <div className={styles.heroLogoBox}>
              <h2 style={{ letterSpacing: '4px', textTransform: 'uppercase' }}>
                NAJ TURKISH<br/>RESTAURANT
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT TEXT SECTION */}
      <section className={styles.aboutContent}>
        <h1 className={styles.aboutTitle}>ABOUT US</h1>
        <div className={styles.aboutText}>
          <p>
            At NAJ Turkish Restaurant, we believe that authentic Turkish cuisine is a celebration of community, tradition, and rich, vibrant flavors. We are passionate about sharing the true taste of Turkey with our guests.
          </p>
          <p>
            From our sizzling charcoal grills to our freshly prepared mezzes, every dish is crafted with love, using the finest local produce and time-honored recipes. Whether you're gathering with family or enjoying a quiet meal, we invite you to experience the warmth and hospitality that is at the heart of our kitchen.
          </p>
        </div>
      </section>
    </main>
  );
}
