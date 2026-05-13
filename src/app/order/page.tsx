import styles from './page.module.css';
import Image from 'next/image';

export default function OrderPage() {
  return (
    <main className={styles.main}>
      <div className={styles.heroOverlay}>
        <h1 className={styles.title}>ORDER ONLINE</h1>
        <p className={styles.subtitle}>Choose your preferred way to enjoy NAJ Turkish Restaurant</p>
      </div>

      <div className={styles.optionsGrid}>
        {/* PICKUP OPTION */}
        <div className={styles.orderCard}>
          <div className={styles.imageWrapper}>
            <Image 
              src="/hero.png" 
              alt="Order for Pickup" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
          <div className={styles.cardContent}>
            <h2>PICKUP</h2>
            <p>Order ahead and skip the line. Fresh, hot, and ready when you arrive.</p>
            <button className={styles.actionBtn}>ORDER PICKUP</button>
          </div>
        </div>

        {/* DELIVERY OPTION */}
        <div className={styles.orderCard}>
          <div className={styles.imageWrapper}>
            <Image 
              src="/hero.png" 
              alt="Order for Delivery" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
          <div className={styles.cardContent}>
            <h2>DELIVERY</h2>
            <p>Enjoy our signature dishes from the comfort of your home or office.</p>
            <button className={styles.actionBtn}>ORDER DELIVERY</button>
          </div>
        </div>
      </div>
    </main>
  );
}
