import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function SeasonPage() {
  return (
    <main className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <section className={styles.inSeasonContainer}>
        <div className={styles.inSeasonBlock}>
          <div className={styles.inSeasonImage}>
            <Image src="/mezze_farm_fresh.png" alt="Fresh Mixed Cold Mezzes" fill style={{ objectFit: 'cover' }} />
          </div>
          <div className={styles.inSeasonContent}>
            <h3>
              AT NAJ TURKISH RESTURANT, AUTHENTICITY AND CONNECTION—TO OUR COMMUNITY AND THE LAND THAT SUSTAINS US—ARE AT THE HEART OF EVERYTHING WE DO.
            </h3>
            <br />
            <p style={{ textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '2px' }}>
              Our menu is a collaboration with local farms, ensuring that every dish bursts with the flavors of freshly harvested produce, received daily at each location.
            </p>
            <p style={{ marginTop: '20px', fontStyle: 'italic', color: 'var(--color-mustard)' }}>
              <strong>Featured: Mixed Cold Mezzes</strong> — A vibrant symphony of Hummus, Mutabbal, Cacik, and Feta Cheese, bringing out the raw beauty of local produce and farm-fresh ingredients.
            </p>
          </div>
        </div>

        <div className={`${styles.inSeasonBlock} ${styles.inSeasonReverse}`}>
          <div className={styles.inSeasonContent}>
            <h2>WINTER</h2>
            <p style={{ fontWeight: 'bold' }}>
              Our winter menus are a quiet celebration of the season — vibrant, and deeply nourishing.
            </p>
            <p>
              Earthy beets at their richest, bright winter citrus, crisp fennel, and sturdy greens come together in dishes that balance warmth with freshness. Each ingredient arrives at its peak, shaped by cooler days and slower rhythms, bringing color, texture, and comfort to the table.
            </p>
            <p style={{ marginTop: '10px', fontStyle: 'italic', color: 'var(--color-mustard)' }}>
              <strong>Featured: Kleftico</strong> — A knuckle of lamb slow-cooked to perfection in our chef&apos;s special tomato, vegetable, and herb sauce. A hearty, comforting plate that feels grounding yet bright — the ultimate winter indulgence.
            </p>
          </div>
          <div className={styles.inSeasonImage}>
            <Image src="/kleftico_winter.png" alt="Kleftico Winter Dish" fill style={{ objectFit: 'cover' }} />
          </div>
        </div>

      </section>
    </main>
  );
}
