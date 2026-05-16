"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';
import Link from 'next/link';
import { menuData } from '@/data/menuData';
import { useCart } from '@/context/CartContext';

function MenuContent() {
  const searchParams = useSearchParams();
  const location = searchParams.get('location')?.toLowerCase();

  const { items, addToCart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    if (location) {
      localStorage.setItem('naj_order_location', location);
    }
  }, [location]);

  // Filter and map menu data based on location
  const filteredMenuData = menuData
    .filter((section: any) => !section.locations || (location && section.locations.includes(location)))
    .map((section: any) => ({
      ...section,
      items: section.items
        .filter((item: any) => !item.locations || (location && item.locations.includes(location)))
        .map((item: any) => ({
          ...item,
          price: (location && item.prices && item.prices[location]) ? item.prices[location] : item.price
        }))
    }));

  const handleAdd = (item: { name: string; price: string; description: string }, sectionIdx: number, itemIdx: number) => {
    const id = sectionIdx * 1000 + itemIdx;
    const key = `${sectionIdx}-${itemIdx}`;
    addToCart({ id, name: item.name, price: parseFloat(item.price), quantity: 1 });
    setAddedId(key);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <main className={styles.main}>
      {/* Hero Header */}
      <div className={styles.header}>
        <p className={styles.headerLabel}>AUTHENTIC TURKISH CUISINE</p>
        <h1 className={styles.title}>OUR MENU</h1>
        <p className={styles.subtitle}>Discover the rich flavours of NAJ Turkish Restaurant — crafted with passion and the finest ingredients.</p>
        <div className={styles.headerDivider}>
          <span className={styles.headerDividerLine} />
          <span className={styles.headerDividerIcon}>✦</span>
          <span className={styles.headerDividerLine} />
        </div>
      </div>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button className={styles.floatingCart} onClick={() => setCartOpen(true)} id="open-cart-btn">
          <span className={styles.cartIcon}>🛒</span>
          <span className={styles.cartCount}>{totalItems}</span>
          <span className={styles.cartLabel}>View Order</span>
          <span className={styles.cartTotal}>£{cartTotal.toFixed(2)}</span>
        </button>
      )}

      {/* Menu Sections */}
      <div className={styles.menuContainer}>
        {filteredMenuData.map((section, sectionIndex) => (
          <section key={sectionIndex} className={styles.menuSection}>
            {section.image && (
              <div className={styles.imageWrapper}>
                <Image
                  src={section.image}
                  alt={section.category}
                  fill
                  style={{ objectFit: 'cover' }}
                  className={styles.sectionImage}
                />
                <div className={styles.imageOverlay} />
                <div className={styles.imageCategoryBadge}>{section.category}</div>
              </div>
            )}
            <div className={styles.categoryContent}>
              <h2 className={styles.categoryTitle}>{section.category}</h2>
              <div className={styles.itemsList}>
                {section.items.map((item: { name: string; price: string; description: string; locations?: string[] }, itemIndex: number) => {
                  const key = `${sectionIndex}-${itemIndex}`;
                  const id = sectionIndex * 1000 + itemIndex;
                  const cartItem = items.find(i => i.id === id);
                  const isAdded = addedId === key;

                  return (
                    <div key={itemIndex} className={styles.menuItem}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemName}>{item.name}</h3>
                        <span className={styles.itemPrice}>£{item.price}</span>
                      </div>
                      <p className={styles.itemDescription}>{item.description}</p>
                      <div className={styles.itemActions}>
                        {cartItem ? (
                          <div className={styles.quantityControl}>
                            <button
                              className={styles.qtyBtn}
                              onClick={() => cartItem.quantity <= 1 ? removeFromCart(id) : updateQuantity(id, cartItem.quantity - 1)}
                              id={`decrease-${key}`}
                            >−</button>
                            <span className={styles.qtyCount}>{cartItem.quantity}</span>
                            <button
                              className={styles.qtyBtn}
                              onClick={() => updateQuantity(id, cartItem.quantity + 1)}
                              id={`increase-${key}`}
                            >+</button>
                          </div>
                        ) : (
                          <button
                            className={`${styles.addBtn} ${isAdded ? styles.addBtnSuccess : ''}`}
                            onClick={() => handleAdd(item, sectionIndex, itemIndex)}
                            id={`add-${key}`}
                          >
                            {isAdded ? '✓ Added' : '+ Add to Order'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Cart Slide-In Drawer */}
      {cartOpen && (
        <div className={styles.drawerOverlay} onClick={() => setCartOpen(false)}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Your Order</h2>
              <button className={styles.drawerClose} onClick={() => setCartOpen(false)}>✕</button>
            </div>

            <div className={styles.drawerItems}>
              {items.length === 0 ? (
                <p className={styles.drawerEmpty}>No items added yet.</p>
              ) : (
                items.map(item => (
                  <div key={item.id} className={styles.drawerItem}>
                    <div className={styles.drawerItemInfo}>
                      <p className={styles.drawerItemName}>{item.name}</p>
                      <p className={styles.drawerItemPrice}>£{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className={styles.drawerQty}>
                      <button className={styles.qtyBtn} onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span className={styles.qtyCount}>{item.quantity}</span>
                      <button className={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className={styles.drawerFooter}>
                <div className={styles.drawerTotal}>
                  <span>Subtotal</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                <Link href="/cart" onClick={() => setCartOpen(false)}>
                  <button className={styles.drawerCheckoutBtn} id="proceed-to-checkout-btn">
                    Proceed to Checkout
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#D4AF37' }}>Loading Menu...</div>}>
      <MenuContent />
    </Suspense>
  );
}
