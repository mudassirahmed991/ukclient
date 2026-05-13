import styles from './page.module.css';
import Image from 'next/image';

export default function ShopPage() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>ESSENTIALS SHOP</h1>
      
      <div className={styles.productGrid}>
        {/* Product 1 */}
        <div className={styles.productCard}>
          <div className={styles.imageContainer}>
            <Image 
              src="/hero.png" 
              alt="Signature Organic Coffee Blend" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>Signature Organic Coffee Blend</h2>
            <p className={styles.productPrice}>$24.00</p>
            <button className={styles.addToCartBtn}>ADD TO CART</button>
          </div>
        </div>

        {/* Product 2 */}
        <div className={styles.productCard}>
          <div className={styles.imageContainer}>
            <Image 
              src="/hero.png" 
              alt="The Butcher's Daughter Cookbook" 
              fill 
              style={{ objectFit: 'cover' }} 
            />
          </div>
          <div className={styles.productInfo}>
            <h2 className={styles.productName}>The Butcher's Daughter Cookbook</h2>
            <p className={styles.productPrice}>$35.00</p>
            <button className={styles.addToCartBtn}>ADD TO CART</button>
          </div>
        </div>
      </div>
    </main>
  );
}
