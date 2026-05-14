"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/season", label: "IN SEASON" },
  { href: "https://web.dojo.app/create_booking/vendor/PyvvA8idXRtM-dc6DpBwac6bJXW8TkvUYjwsU8VpSfQ_restaurant", label: "RESERVATIONS", external: true },
  { href: "/locations", label: "MENUS" },
  { href: "/about", label: "ABOUT" },
  { href: "/locations", label: "LOCATIONS" },
];

export default function Header() {
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const [isFoodMenuOpen, setIsFoodMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (isFoodMenuOpen && menuData.length === 0) {
      fetch('/api/menu')
        .then(res => res.json())
        .then(data => setMenuData(data))
        .catch(err => console.error("Failed to fetch menu", err));
    }
  }, [isFoodMenuOpen, menuData.length]);

  // Close mobile nav when scrolling
  useEffect(() => {
    const handleScroll = () => { if (isMobileNavOpen) setIsMobileNavOpen(false); };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileNavOpen]);

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

          {/* LEFT: Hamburger on mobile, admin icon on desktop */}
          <div className={styles.left}>
            {/* Mobile hamburger */}
            <button
              className={styles.mobileHamburger}
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
            {/* Desktop admin icon */}
            <Link href="/admin" className={styles.adminIcon} title="Admin Panel">⚙️</Link>
          </div>

          {/* CENTER: Nav links — hidden on mobile */}
          <div className={styles.center}>
            {NAV_LINKS.map(link =>
              link.external ? (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.navLink}>{link.label}</a>
              ) : (
                <Link key={link.label} href={link.href} className={styles.navLink}>{link.label}</Link>
              )
            )}
          </div>

          {/* RIGHT: Cart */}
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

        {/* ====== MOBILE NAV DRAWER ====== */}
        {/* Overlay */}
        <div
          className={`${styles.mobileNavOverlay} ${isMobileNavOpen ? styles.open : ''}`}
          onClick={() => setIsMobileNavOpen(false)}
        />
        {/* Drawer */}
        <nav className={`${styles.mobileNavDrawer} ${isMobileNavOpen ? styles.open : ''}`}>
          <div className={styles.mobileNavHeader}>
            <span className={styles.mobileNavTitle}>NAJ TURKISH</span>
            <button className={styles.closeBtn} onClick={() => setIsMobileNavOpen(false)}>✕</button>
          </div>
          <div className={styles.mobileNavLinks}>
            {NAV_LINKS.map(link =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={styles.mobileNavLink}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            {/* Admin link in mobile nav */}
            <Link href="/admin" className={styles.mobileNavLink} onClick={() => setIsMobileNavOpen(false)}>
              ⚙️ ADMIN PANEL
            </Link>
            {/* Cart link in mobile nav too */}
            <Link href="/cart" className={styles.mobileNavCartBtn} onClick={() => setIsMobileNavOpen(false)}>
              🛒 ORDER ONLINE
            </Link>
          </div>
        </nav>

        {/* ====== FOOD MENU DRAWER (desktop) ====== */}
        <div className={`${styles.menuDrawerOverlay} ${isFoodMenuOpen ? styles.open : ''}`} onClick={() => setIsFoodMenuOpen(false)}></div>
        <div className={`${styles.menuDrawer} ${isFoodMenuOpen ? styles.open : ''}`}>
          <div className={styles.drawerHeader}>
            <h2>OUR MENU</h2>
            <button className={styles.closeBtn} onClick={() => setIsFoodMenuOpen(false)}>✕</button>
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
