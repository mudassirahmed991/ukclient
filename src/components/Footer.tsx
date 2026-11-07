import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <Link href="/" className={styles.footerLink}>HOME</Link>
        <Link href="/season" className={styles.footerLink}>IN SEASON</Link>
        <Link href="/reservation" className={styles.footerLink}>RESERVATIONS</Link>
        <Link href="/locations" className={styles.footerLink}>LOCATIONS & MENUS</Link>
        <Link href="/about" className={styles.footerLink}>ABOUT</Link>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.legalLinks}>
        <Link href="/#privacy" className={styles.legalLink}>PRIVACY POLICY</Link>
        <Link href="/#terms" className={styles.legalLink}>TERMS OF USE</Link>
        <Link href="/#accessibility" className={styles.legalLink}>ACCESSIBILITY</Link>
      </div>

      <div className={styles.copyright}>
        © {new Date().getFullYear()} NAJ TURKISH RESTURANT | SITE CREDIT
      </div>
    </footer>
  );
}
