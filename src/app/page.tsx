import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import prisma from "@/lib/prisma";

// Force dynamic rendering to prevent aggressive Next.js caching
export const dynamic = 'force-dynamic';

export default async function Home() {
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {},
  });

  const locations = await prisma.location.findMany({
    orderBy: { order: 'asc' }
  });

  return (
    <main>
      {/* 1. HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroImageContainer}>
          <Image src={settings.bannerHomeHero || "/hero.png"} alt="NAJ Turkish Restaurant Interior" fill style={{ objectFit: 'cover' }} priority />
        </div>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>{settings.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{settings.heroSubtitle}</p>
          <p className={styles.heroDesc}>
            {settings.heroDesc}
          </p>
          <div className={styles.heroActions}>
            <a href="https://web.dojo.app/create_booking/vendor/PyvvA8idXRtM-dc6DpBwac6bJXW8TkvUYjwsU8VpSfQ_restaurant" target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
              <button className={styles.heroBtn}>Reserve a Table</button>
            </a>
            <Link href="/locations" style={{ width: '100%' }}>
              <button className={styles.heroBtn}>Online Order</button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATEMENT & LARGE IMAGE */}
      <section>
        <div className={styles.statementSection}>
          <p className={styles.statementText}>
            We believe that authentic Turkish cuisine is rad — and should take center stage in elevating your everyday lifestyle. We create nourishing, seasonal dishes, housemade breads and pastries — all served alongside locally-roasted coffee and craft drinks.
          </p>
        </div>
        <div className={styles.largeImageBlock}>
          <Image src={settings.bannerStatement || "/hero.png"} alt="Dining Experience" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>

      {/* 3. MENUS & LOCATIONS */}
      <section className={styles.menusSection}>
        <p className={styles.menusTitle} style={{ textTransform: 'uppercase', marginBottom: '40px' }}>
          Menus & Locations
        </p>
        <div className={styles.locationList}>
          {locations.map((loc: any) => (
            <div key={loc.id} className={styles.locationBlock}>
              <Link href={`/menu?location=${loc.name.toLowerCase()}`} className={styles.locationLink}>{loc.name}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3b. FOOD SHOWCASE */}
      <section className={styles.foodShowcase}>
        <div className={styles.foodShowcaseImage}>
          <Image
            src="/turkish_mixed_grill.png"
            alt="Turkish Mixed Grill Platter"
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className={styles.foodShowcaseContent}>
          <p className={styles.foodShowcaseLabel}>SIGNATURE DISH</p>
          <h2 className={styles.foodShowcaseTitle}>Mixed Grill Platter</h2>
          <p className={styles.foodShowcaseDesc}>
            A feast of flame-kissed lamb shish, Adana kebab and golden chicken, served with warm flatbread, grilled peppers and pomegranate — straight from our charcoal grill to your table.
          </p>
          <Link href="/locations">
            <button className={styles.foodShowcaseBtn} id="order-online-btn">Order Online</button>
          </Link>
        </div>
      </section>

      {/* 4. FULL-WIDTH INTERIOR IMAGE */}
      <section className={styles.fullWidthImage}>
        <Image src={settings.bannerStorefront || "/hero.png"} alt="Storefront Interior" fill style={{ objectFit: 'cover' }} />
      </section>

      {/* 5. PRESS BANNER SECTION */}
      <section className={styles.pressSection}>
        <div className={styles.pressImage}>
          <Image src={settings.bannerPress || "/hero.png"} alt="Coffee Making" fill style={{ objectFit: 'cover' }} />
        </div>
      </section>



      {/* 7. FINAL FULL-WIDTH BANNER */}
      <section className={styles.fullWidthImage}>
        <Image src={settings.bannerFooter || "/hero.png"} alt="Final Banner Image" fill style={{ objectFit: 'cover' }} />
      </section>
    </main>
  );
}
