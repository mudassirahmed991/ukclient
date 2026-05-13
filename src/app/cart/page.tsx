"use client";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import styles from "./page.module.css";
import Link from "next/link";

type OrderType = "pickup" | "delivery";
type PaymentMethod = "cash" | "googlepay" | "applepay" | "mastercard" | "visa" | "paypal";

interface PaymentOption {
  id: PaymentMethod;
  label: string;
  icon: string;
  description: string;
}

const paymentOptions: PaymentOption[] = [
  { id: "cash",       label: "Cash on Delivery", icon: "💵", description: "Pay with cash when your order arrives." },
  { id: "googlepay",  label: "Google Pay",        icon: "G",  description: "Fast & secure checkout with Google Pay." },
  { id: "applepay",   label: "Apple Pay",         icon: "",  description: "Touch ID or Face ID powered checkout." },
  { id: "mastercard", label: "Mastercard",        icon: "MC", description: "Pay securely with your Mastercard." },
  { id: "visa",       label: "Visa Card",         icon: "V",  description: "Pay securely with your Visa card." },
  { id: "paypal",     label: "PayPal",            icon: "PP", description: "Send money, pay online or set up a business." },
];

export default function CartPage() {
  const { items, cartTotal, updateQuantity, removeFromCart } = useCart();
  const [orderType, setOrderType]       = useState<OrderType>("pickup");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showPayment, setShowPayment]   = useState(false);
  const [showSuccess, setShowSuccess]   = useState(false);
  const [address, setAddress]           = useState("");
  const [phone, setPhone]               = useState("");
  const [name, setName]                 = useState("");

  const deliveryFee  = orderType === "delivery" ? 5.0 : 0;
  const grandTotal   = cartTotal + deliveryFee;

  const canProceed = items.length > 0 && name.trim() && phone.trim() && (orderType === "pickup" || address.trim());

  useEffect(() => {
    // Check if returning from a successful Stripe checkout
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      setShowSuccess(true);
    }
  }, []);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) return;
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          phone: phone,
          address: orderType === "delivery" ? address : undefined,
          paymentMethod: paymentMethod,
          type: orderType.toUpperCase(),
          items: items
        })
      });

      if (res.ok) {
        const orderData = await res.json();
        
        if (paymentMethod !== 'cash') {
          // Redirect to Stripe Checkout
          const stripeRes = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               orderId: orderData.id,
               items: items,
               orderType: orderType.toUpperCase(),
               success_url: `${window.location.origin}/cart?success=true&orderId=${orderData.id}`,
               cancel_url: `${window.location.origin}/cart?canceled=true`
            })
          });
          
          const stripeData = await stripeRes.json();
          if (stripeData.url) {
            window.location.href = stripeData.url;
            return;
          } else {
            alert("Failed to initialize payment gateway.");
            return;
          }
        }
        
        // If cash, show success immediately
        setShowPayment(false);
        setShowSuccess(true);
      } else {
        alert("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error(error);
      alert("Error placing order.");
    }
  };

  if (showSuccess) {
    return (
      <main className={styles.main}>
        <div className={styles.successContainer}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.successTitle}>Order Placed!</h1>
          <p className={styles.successSubtitle}>
            Thank you, <strong>{name}</strong>! Your {orderType === "pickup" ? "pickup" : "delivery"} order has been received.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span>Order Total</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
            <div className={styles.successRow}>
              <span>Order Type</span>
              <span>{orderType === "pickup" ? "🏪 Pickup" : "🛵 Delivery"}</span>
            </div>
            <div className={styles.successRow}>
              <span>Payment</span>
              <span>{paymentOptions.find(p => p.id === paymentMethod)?.label}</span>
            </div>
          </div>
          <Link href="/menu">
            <button className={styles.backBtn} id="back-to-menu-btn">Back to Menu</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <p className={styles.pageLabel}>NAJ TURKISH RESTAURANT</p>
        <h1 className={styles.pageTitle}>Your Order</h1>
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerDiamond}>✦</span>
          <span className={styles.dividerLine} />
        </div>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🍽️</div>
          <h2 className={styles.emptyTitle}>Your cart is empty</h2>
          <p className={styles.emptySubtitle}>Explore our menu and add your favourite dishes.</p>
          <Link href="/menu">
            <button className={styles.exploreBtn} id="explore-menu-btn">Explore Menu</button>
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>

          {/* ── LEFT: Cart Items ── */}
          <div className={styles.leftCol}>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Order Items</h2>
              <div className={styles.itemsList}>
                {items.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemMeta}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemUnitPrice}>£{item.price.toFixed(2)} each</p>
                    </div>
                    <div className={styles.itemControls}>
                      <div className={styles.qtyGroup}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => item.quantity <= 1 ? removeFromCart(item.id) : updateQuantity(item.id, item.quantity - 1)}
                          id={`cart-decrease-${item.id}`}
                        >−</button>
                        <span className={styles.qtyNum}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          id={`cart-increase-${item.id}`}
                        >+</button>
                      </div>
                      <span className={styles.itemTotal}>£{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeFromCart(item.id)}
                        id={`remove-${item.id}`}
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/menu" className={styles.addMoreLink} id="add-more-items-link">
                + Add more items
              </Link>
            </div>

            {/* ── Contact Details ── */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Your Details</h2>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="customer-name">Full Name *</label>
                <input
                  id="customer-name"
                  className={styles.input}
                  type="text"
                  placeholder="e.g. Sarah Johnson"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="customer-phone">Phone Number *</label>
                <input
                  id="customer-phone"
                  className={styles.input}
                  type="tel"
                  placeholder="e.g. +44 7700 900000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              {orderType === "delivery" && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="delivery-address">Delivery Address *</label>
                  <textarea
                    id="delivery-address"
                    className={styles.textarea}
                    placeholder="Street address, city, postcode…"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Summary ── */}
          <div className={styles.rightCol}>

            {/* Pickup / Delivery Toggle */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Order Type</h2>
              <div className={styles.orderTypeGrid}>
                <button
                  id="pickup-btn"
                  className={`${styles.orderTypeCard} ${orderType === "pickup" ? styles.orderTypeActive : ""}`}
                  onClick={() => setOrderType("pickup")}
                >
                  <span className={styles.orderTypeIcon}>🏪</span>
                  <span className={styles.orderTypeLabel}>Pickup</span>
                  <span className={styles.orderTypeNote}>Ready in ~20 min</span>
                  {orderType === "pickup" && <span className={styles.orderTypeTick}>✓</span>}
                </button>
                <button
                  id="delivery-btn"
                  className={`${styles.orderTypeCard} ${orderType === "delivery" ? styles.orderTypeActive : ""}`}
                  onClick={() => setOrderType("delivery")}
                >
                  <span className={styles.orderTypeIcon}>🛵</span>
                  <span className={styles.orderTypeLabel}>Delivery</span>
                  <span className={styles.orderTypeNote}>30–45 min · +£5.00</span>
                  {orderType === "delivery" && <span className={styles.orderTypeTick}>✓</span>}
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Summary</h2>
              <div className={styles.summaryRows}>
                <div className={styles.summaryRow}>
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className={styles.summaryRow}>
                    <span>Delivery Fee</span>
                    <span>£{deliveryFee.toFixed(2)}</span>
                  </div>
                )}
                <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
                  <span>Total</span>
                  <span>£{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                id="proceed-to-payment-btn"
                className={`${styles.checkoutBtn} ${!canProceed ? styles.checkoutBtnDisabled : ""}`}
                disabled={!canProceed}
                onClick={() => setShowPayment(true)}
              >
                Proceed to Payment
              </button>
              {!canProceed && items.length > 0 && (
                <p className={styles.formHint}>Please fill in your details above to continue.</p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── Payment Modal ── */}
      {showPayment && (
        <div className={styles.modalOverlay} onClick={() => setShowPayment(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.modalLabel}>SECURE CHECKOUT</p>
                <h2 className={styles.modalTitle}>Select Payment Method</h2>
              </div>
              <button className={styles.modalClose} onClick={() => setShowPayment(false)}>✕</button>
            </div>

            <div className={styles.modalAmount}>
              <span className={styles.modalAmountLabel}>Total Due</span>
              <span className={styles.modalAmountValue}>£{grandTotal.toFixed(2)}</span>
            </div>

            <div className={styles.paymentGrid}>
              {paymentOptions.map(opt => (
                <button
                  key={opt.id}
                  id={`pay-${opt.id}-btn`}
                  className={`${styles.paymentCard} ${paymentMethod === opt.id ? styles.paymentCardActive : ""}`}
                  onClick={() => setPaymentMethod(opt.id)}
                >
                  <span className={styles.paymentCardIcon}>{opt.icon}</span>
                  <span className={styles.paymentCardLabel}>{opt.label}</span>
                  {paymentMethod === opt.id && <span className={styles.paymentCardCheck}>✓</span>}
                </button>
              ))}
            </div>

            {paymentMethod && (
              <p className={styles.paymentDescription}>
                {paymentOptions.find(p => p.id === paymentMethod)?.description}
              </p>
            )}

            <div className={styles.modalFooter}>
              <div className={styles.modalOrderSummary}>
                <span>{orderType === "pickup" ? "🏪 Pickup" : "🛵 Delivery"}</span>
                <span>·</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""}</span>
              </div>
              <button
                id="place-order-btn"
                className={`${styles.placeOrderBtn} ${!paymentMethod ? styles.placeOrderBtnDisabled : ""}`}
                disabled={!paymentMethod}
                onClick={handlePlaceOrder}
              >
                Place Order — £{grandTotal.toFixed(2)}
              </button>
              <p className={styles.secureNote}>🔒 Your payment information is secure and encrypted.</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
