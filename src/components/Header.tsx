"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./Header.module.css";

export default function Header() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isMenuOpen && menuData.length === 0) {
      fetch('/api/menu')
        .then(res => res.json())
        .then(data => setMenuData(data))
        .catch(err => console.error("Failed to fetch menu", err));
    }
  }, [isMenuOpen, menuData.length]);

  const toggleCategory = (catId: string) => {
    setExpandedCategory(prev => prev === catId ? null : catId);
  };

  return (
    <>
      <div className={styles.announcement}>
        BOOK YOUR NEXT GATHERING WITH US — EVENTS@NAJTURKISH.COM
      </div>
      <header className={styles.header}>
        <div className={styles.headerContainer}>

          <div className={styles.left}>
            <Link href="/admin" style={{ fontSize: '1.1rem', textDecoration: 'none', opacity: 0.5 }} title="Admin Panel">
              ⚙️
            </Link>

          </div>

          <div className={styles.center}>
            <Link href="/"           className={styles.navLink}>HOME</Link>
            <Link href="/season"     className={styles.navLink}>IN SEASON</Link>
            <a href="https://web.dojo.app/create_booking/vendor/PyvvA8idXRtM-dc6DpBwac6bJXW8TkvUYjwsU8VpSfQ_restaurant" target="_blank" rel="noopener noreferrer" className={styles.navLink}>RESERVATIONS</a>
            <Link href="/locations"       className={styles.navLink}>MENUS</Link>
            <Link href="/about"      className={styles.navLink}>ABOUT</Link>
            <Link href="/locations"  className={styles.navLink}>LOCATIONS</Link>

          </div>

          <div className={styles.right}>
            <Link href="/cart" className={styles.cartLink} id="header-cart-btn">
              <span className={styles.cartIcon}>🛒</span>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
              <span className={styles.cartText}>ORDER</span>
            </Link>
          </div>

        </div>

        {/* --- MENU DRAWER OVERLAY --- */}
        <div className={`${styles.menuDrawerOverlay} ${isMenuOpen ? styles.open : ''}`} onClick={() => setIsMenuOpen(false)}></div>
        
        {/* --- MENU DRAWER --- */}
        <div className={`${styles.menuDrawer} ${isMenuOpen ? styles.open : ''}`}>
          <div className={styles.drawerHeader}>
            <h2>OUR MENU</h2>
            <button className={styles.closeBtn} onClick={() => setIsMenuOpen(false)}>✕</button>
          </div>
          
          <div className={styles.drawerContent}>
            {menuData.length === 0 ? (
              <p className={styles.loadingText}>Loading...</p>
            ) : (
              menuData.map(cat => (
                <div key={cat.id} className={styles.categoryBlock}>
                  <button 
                    className={`${styles.categoryHeader} ${expandedCategory === cat.id ? styles.active : ''}`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    {cat.name}
                    <span className={styles.chevron}>{expandedCategory === cat.id ? '−' : '+'}</span>
                  </button>
                  
                  <div className={`${styles.categoryItems} ${expandedCategory === cat.id ? styles.expanded : ''}`}>
                    {cat.items.length === 0 ? (
                      <p className={styles.emptyText}>No items available</p>
                    ) : (
                      cat.items.map((item: any) => (
                        <div key={item.id} className={styles.menuItem}>
                          <div className={styles.itemInfo}>
                            <span className={styles.itemName}>{item.name}</span>
                            {item.description && <span className={styles.itemDesc}>{item.description}</span>}
                          </div>
                          <span className={styles.itemPrice}>£{item.price.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </header>
    </>
  );
}
