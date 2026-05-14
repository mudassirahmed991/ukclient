"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naj_admin_auth') === 'true';
    }
    return false;
  });
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Data States
  const [analytics, setAnalytics] = useState({ daily: 0, weekly: 0, monthly: 0, yearly: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [locations, setLocations] = useState<any[]>([]);
  const [activePrintLocation, setActivePrintLocation] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);

  // POS State
  const [posCart, setPosCart] = useState<any[]>([]);
  const [receiptToPrint, setReceiptToPrint] = useState<any>(null);



  const knownOrderIds = useRef<Set<string>>(new Set());
  const isInitialLoad = useRef(true);
  const printQueue = useRef<any[]>([]);
  const isPrinting = useRef(false);

  const printWithQZ = async (order: any) => {
    // Build receipt HTML outside try/catch so catch block can use it as fallback
    let htmlData = '';
    try {
      // @ts-ignore
      const qz = (await import('qz-tray')).default;

      // Bypass QZ Tray certificate check (fixes "Untrusted website" popup)
      qz.security.setCertificatePromise(() => Promise.resolve(''));
      qz.security.setSignatureAlgorithm('SHA512');
      qz.security.setSignaturePromise(() => Promise.resolve(''));

      if (!qz.websocket.isActive()) {
        await qz.websocket.connect({ retries: 3, delay: 1 });
      }
      
      const printers = await qz.printers.find();
      let printer = await qz.printers.getDefault();
      // Auto-detect Star printer if it's not the default
      const starPrinter = printers.find((p: string) => p.toLowerCase().includes('star') || p.toLowerCase().includes('tsp'));
      if (starPrinter) printer = starPrinter;

      const addressHTML = activePrintLocation 
        ? (activePrintLocation.name.toLowerCase() === 'sandwich' 
            ? '1 No Name Street<br>Sandwich, CT139AJ' 
            : (activePrintLocation.name.toLowerCase() === 'broadstairs'
               ? '1 High St<br>Broadstairs CT10 1LP'
               : activePrintLocation.email.replace(/, /g, '<br>')))
        : '1 No Name Street<br>Sandwich, CT139AJ';

      htmlData = `
        <div style="font-family: 'Courier New', Courier, monospace; width: 72mm; padding: 0mm; color: #000000; background: #ffffff; font-size: 13px; line-height: 1.4;">
          <div style="text-align:center; margin-bottom: 10px;">
            <div style="font-size: 16px; font-weight: bold;">NAJ Turkish Restaurant</div>
            <div style="font-size: 13px;">${activePrintLocation && activePrintLocation.name !== 'Sandwich' ? activePrintLocation.name.toUpperCase() + '<br>' : ''}${addressHTML}</div>
          </div>

          <div style="text-align:center; font-weight: bold; margin-bottom: 10px; font-size: 14px;">
            Order #${order.id?.substring(0, 6).toUpperCase()} (${order.type})
          </div>

          ${(order.type !== 'INSTORE' || (order.customerName && order.customerName !== 'Walk-in Customer')) ? `
            <div style="border-top: 1px dashed #000; border-bottom: 1px dashed #000; margin: 8px 0; padding: 8px 0;">
              <div style="margin-bottom:2px;"><strong>Name:</strong> ${order.customerName || 'N/A'}</div>
              <div style="margin-bottom:2px;"><strong>Phone:</strong> ${order.phone || 'N/A'}</div>
              ${order.type === 'DELIVERY' ? `<div style="margin-bottom:2px;"><strong>Address:</strong> ${order.address || 'N/A'}</div>` : ''}
              <div><strong>Payment:</strong> ${order.paymentMethod ? order.paymentMethod.toUpperCase() : 'N/A'}</div>
            </div>` : ''}

          <div style="margin: 8px 0;">
            ${order.items?.map((item: any) => `
              <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
                <span style="flex: 1; padding-right: 10px;">${item.quantity || 1}x ${item.nameAtTime || item.name}</span>
                <span>£${((item.priceAtTime || item.price) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>

          <div style="border-top: 1px dashed #000; margin: 8px 0; padding-top: 8px;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
              <span>Subtotal:</span>
              <span>£${order.total ? order.total.toFixed(2) : '0.00'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-weight: bold; font-size: 14px; margin-top: 4px;">
              <span>Total:</span>
              <span>£${order.total ? order.total.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div style="text-align:center; margin-top: 15px; font-size: 11px;">
            Printed: ${new Date().toLocaleString()}
          </div>
          <div style="text-align:center; margin-top: 5px; font-size: 11px; font-style: italic;">
            Thank you for your custom
          </div>
          <div style="margin-top: 15px;">&nbsp;</div>
        </div>
      `;

      const config = qz.configs.create(printer, {
         margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });
      
      await qz.print(config, [{
         type: 'pixel',
         format: 'html',
         flavor: 'plain',
         data: htmlData
      }]);
    } catch (err) {
      console.error("QZ Tray Error, using popup print fallback:", err);
      // Open a clean popup with ONLY the receipt — not the whole page
      const printWindow = window.open('', '_blank', 'width=420,height=700,scrollbars=yes');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>NAJ Receipt</title>
            <style>
              @page { size: 80mm auto; margin: 0; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: 'Courier New', monospace; width: 72mm; padding: 4mm; font-size: 13px; color: #000; background: #fff; }
            </style>
          </head>
          <body>${htmlData}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 600);
      }
    }
  };

  const processPrintQueue = async () => {
    if (isPrinting.current || printQueue.current.length === 0) return;
    isPrinting.current = true;
    const orderToPrint = printQueue.current.shift();
    
    await printWithQZ(orderToPrint);
    
    isPrinting.current = false;
    setTimeout(processPrintQueue, 1000);
  };

  const fetchStaticData = async () => {
    if (!isAuthenticated) return;
    const timestamp = Date.now();
    const resM = await fetch(`/api/menu?_t=${timestamp}`);
    if (resM.ok) setMenu(await resM.json());

    const resS = await fetch(`/api/settings?_t=${timestamp}`);
    if (resS.ok) setSettings(await resS.json());

    const resL = await fetch(`/api/locations?_t=${timestamp}`);
    if (resL.ok) {
      const fetchedLocations = await resL.json();
      setLocations(fetchedLocations);
      if (fetchedLocations.length > 0 && !activePrintLocation) {
        setActivePrintLocation(fetchedLocations[0]);
      }
    }
  };

  const fetchLiveUpdates = async () => {
    if (!isAuthenticated) return;
    const timestamp = Date.now();
    const resA = await fetch(`/api/analytics?_t=${timestamp}`);
    if (resA.ok) setAnalytics(await resA.json());

    const resR = await fetch(`/api/reservations?_t=${timestamp}`);
    if (resR.ok) setReservations(await resR.json());

    const resO = await fetch(`/api/orders?_t=${timestamp}`);
    if (resO.ok) {
      const fetchedOrders = await resO.json();
      setOrders(fetchedOrders);
      
      if (isInitialLoad.current) {
        fetchedOrders.forEach((o: any) => knownOrderIds.current.add(o.id));
        isInitialLoad.current = false;
      } else {
        const newOrders = fetchedOrders.filter((o: any) => 
          !knownOrderIds.current.has(o.id) && o.status === 'PENDING'
        );
        fetchedOrders.forEach((o: any) => knownOrderIds.current.add(o.id));
        
        if (newOrders.length > 0) {
          printQueue.current.push(...newOrders);
          processPrintQueue();
        }
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStaticData();
      fetchLiveUpdates();
    }
    const interval = setInterval(() => {
      fetchLiveUpdates();
    }, 10000);
    return () => clearInterval(interval);
  }, [activeTab, isAuthenticated]);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;

    if (email === 'Haider@gamil.com' && password === 'ArfeenHaider') {
      setIsAuthenticated(true);
      setLoginError('');
      // Save session so admin stays logged in permanently
      localStorage.setItem('naj_admin_auth', 'true');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#000000' }}>
        <form onSubmit={handleLogin} style={{ background: '#111111', padding: '40px', borderRadius: '8px', border: '1px solid #D4AF37', boxShadow: '0 4px 15px rgba(212, 175, 55, 0.2)', display: 'flex', flexDirection: 'column', width: '300px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', textAlign: 'center', marginBottom: '20px', color: '#D4AF37' }}>Admin Login</h2>
          {loginError && <p style={{ color: '#ff4444', fontSize: '0.8rem', textAlign: 'center', marginBottom: '10px' }}>{loginError}</p>}
          <input name="email" type="email" placeholder="Email" required style={{ padding: '10px', marginBottom: '15px', background: '#000000', color: '#ffffff', border: '1px solid #333333', borderRadius: '4px', outline: 'none' }} />
          <input name="password" type="password" placeholder="Password" required style={{ padding: '10px', marginBottom: '20px', background: '#000000', color: '#ffffff', border: '1px solid #333333', borderRadius: '4px', outline: 'none' }} />
          <button type="submit" style={{ background: '#D4AF37', color: '#000000', border: 'none', padding: '12px', fontFamily: 'var(--font-heading)', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>LOGIN</button>
        </form>
      </div>
    );
  }


  // Actions
  const markOrderCompleted = async (id: string) => {
    await fetch(`/api/orders?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    fetchLiveUpdates();
  };

  const deleteOrder = async (id: string) => {
    await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
    fetchLiveUpdates();
  };

  const updateReservationStatus = async (id: string, status: string) => {
    await fetch(`/api/reservations?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchLiveUpdates();
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, ...dataToSave } = settings;
    await fetch('/api/settings', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSave),
    });
    alert("Settings saved!");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (res.ok) {
      const { imageUrl } = await res.json();
      setSettings((prev: any) => ({ ...prev, [fieldName]: imageUrl }));
    } else {
      alert("Image upload failed");
    }
  };

  const handlePOSCheckout = async () => {
    if (posCart.length === 0) return;
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Walk-in Customer',
        type: 'INSTORE',
        items: posCart
      })
    });
    const savedOrder = await res.json();
    setPosCart([]);
    fetchLiveUpdates();
    await printWithQZ(savedOrder);
  };

  const printReceipt = async (order: any) => {
    await printWithQZ(order);
  };

  const handleAddItem = async (e: any) => {
    e.preventDefault();
    if (!selectedCategory) {
      alert("Please select a category first.");
      return;
    }
    const form = e.target;
    const file = form.itemImage.files[0];
    let imageUrl = '';

    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const { imageUrl: uploadedUrl } = await uploadRes.json();
        imageUrl = uploadedUrl;
      }
    }

    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'item',
        categoryId: selectedCategory,
        name: form.itemName.value,
        description: form.itemDesc.value,
        price: form.itemPrice.value,
        image: imageUrl
      })
    });
    form.reset();
    fetchStaticData();
  };

  return (
    <div className={styles.adminLayout}>
      
      {/* HIDDEN PRINTABLE RECEIPT */}
      {receiptToPrint && (
        <div className={styles.printableReceipt}>
          <div className={styles.receiptHeader}>
            <h2 style={{margin: '0 0 5px 0', textAlign: 'center'}}>NAJ Turkish Restaurant{activePrintLocation && activePrintLocation.name !== 'Sandwich' ? ' ' + activePrintLocation.name : ''}</h2>
            {activePrintLocation && activePrintLocation.name.toLowerCase() === 'broadstairs' ? (
              <>
                <p style={{margin: 0, textAlign: 'center'}}>1 High St</p>
                <p style={{margin: 0, textAlign: 'center'}}>Broadstairs CT10 1LP</p>
              </>
            ) : (
              <>
                <p style={{margin: 0, textAlign: 'center'}}>1 No Name Street</p>
                <p style={{margin: 0, textAlign: 'center'}}>Sandwich, CT139AJ</p>
              </>
            )}
            
            <p style={{marginTop: '15px', marginBottom: '5px', fontWeight: 'bold', textAlign: 'center'}}>Order #{receiptToPrint.id?.substring(0, 6).toUpperCase()} ({receiptToPrint.type})</p>
            <p style={{margin: '5px 0', textAlign: 'center'}}>Date: {new Date(receiptToPrint.createdAt || Date.now()).toLocaleString()}</p>
          </div>

          {(receiptToPrint.type !== 'INSTORE' || (receiptToPrint.customerName && receiptToPrint.customerName !== 'Walk-in Customer')) && (
            <div style={{borderTop: '1px dashed black', padding: '10px 0', margin: '10px 0', fontSize: '0.9rem', textAlign: 'left'}}>
              <p style={{margin: '3px 0'}}><strong>Name:</strong> {receiptToPrint.customerName || 'N/A'}</p>
              <p style={{margin: '3px 0'}}><strong>Phone:</strong> {receiptToPrint.phone || 'N/A'}</p>
              <p style={{margin: '3px 0'}}><strong>Address:</strong> {receiptToPrint.address || 'N/A'}</p>
              <p style={{margin: '3px 0'}}><strong>Payment:</strong> {receiptToPrint.paymentMethod ? receiptToPrint.paymentMethod.toUpperCase() : 'N/A'}</p>
            </div>
          )}
          
          <div className={styles.receiptBody} style={{borderTop: '1px dashed black', paddingTop: '10px', marginTop: '10px'}}>
            {receiptToPrint.items?.map((item: any, idx: number) => (
              <div key={idx} className={styles.receiptItem} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                <span style={{flex:1, paddingRight: '10px', textAlign: 'left'}}>{item.nameAtTime || item.name}</span>
                <span>£{(item.priceAtTime || item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{borderTop: '1px dashed black', marginTop: '10px', paddingTop: '10px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
              <span>Subtotal:</span>
              <span>£{receiptToPrint.total ? receiptToPrint.total.toFixed(2) : receiptToPrint.items?.reduce((s:number, i:any) => s + (i.priceAtTime || i.price), 0).toFixed(2)}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '10px'}}>
              <span>Total:</span>
              <span>£{receiptToPrint.total ? receiptToPrint.total.toFixed(2) : receiptToPrint.items?.reduce((s:number, i:any) => s + (i.priceAtTime || i.price), 0).toFixed(2)}</span>
            </div>
          </div>
          
          <div style={{textAlign: 'center', marginTop: '20px', fontSize: '0.9em'}}>
            <p style={{margin: '5px 0'}}>Printed: {new Date().toLocaleString()}</p>
            <p style={{margin: '10px 0', fontStyle: 'italic'}}>Thank you for your custom</p>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <div className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>NAJ ADMIN</h2>
        
        <div style={{padding: '0 15px 20px 15px', marginBottom: '10px', borderBottom: '1px solid #333'}}>
          <label style={{display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px'}}>Current Branch</label>
          <select 
            value={activePrintLocation?.id || ''} 
            onChange={e => setActivePrintLocation(locations.find(l => l.id === e.target.value))}
            style={{width: '100%', padding: '8px', background: '#111', color: '#D4AF37', border: '1px solid #333', borderRadius: '4px', outline: 'none', cursor: 'pointer'}}
          >
            {locations.length === 0 && <option value="">Loading...</option>}
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>

        <button className={activeTab === 'dashboard' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
        <button className={activeTab === 'pos' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('pos')}>POS</button>
        <button className={activeTab === 'orders' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('orders')}>Orders</button>
        <button className={activeTab === 'reservations' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('reservations')}>Reservations</button>
        <button className={activeTab === 'menu' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('menu')}>Menu Builder</button>
        <button className={activeTab === 'settings' ? styles.activeTabBtn : styles.tabBtn} onClick={() => setActiveTab('settings')}>Site Settings</button>
      </div>

      {/* MAIN CONTENT */}
      <div className={styles.mainContent}>
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h1>Revenue Dashboard</h1>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Daily Revenue</h3>
                <p>£{analytics.daily.toFixed(2)}</p>
              </div>
              {analytics.weekly > 0 && (
                <div className={styles.statCard}>
                  <h3>Weekly Revenue</h3>
                  <p>£{analytics.weekly.toFixed(2)}</p>
                </div>
              )}
              {analytics.monthly > 0 && (
                <div className={styles.statCard}>
                  <h3>Monthly Revenue</h3>
                  <p>£{analytics.monthly.toFixed(2)}</p>
                </div>
              )}
              {analytics.yearly > 0 && (
                <div className={styles.statCard}>
                  <h3>Yearly Revenue</h3>
                  <p>£{analytics.yearly.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* POS */}
        {activeTab === 'pos' && (
          <div className={styles.posGrid}>
            <div className={styles.posMenu}>
              <h2>Point of Sale</h2>
              {menu.map(cat => (
                <div key={cat.id} className={styles.posCategory}>
                  <h3>{cat.name}</h3>
                  <div className={styles.posItems}>
                    {cat.items.map((item: any) => (
                      <button key={item.id} className={styles.posItemBtn} onClick={() => setPosCart([...posCart, { ...item, quantity: 1 }])}>
                        {item.name} - £{item.price}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.posCartPanel}>
              <h2>Current Order</h2>
              {posCart.map((item, idx) => (
                <div key={idx} className={styles.posCartItem}>
                  <span>{item.name}</span>
                  <span>£{item.price}</span>
                </div>
              ))}
              <div style={{marginTop: '20px', borderTop: '1px solid #333', paddingTop: '10px'}}>
                <strong>Total: £{posCart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</strong>
              </div>
              <button className={styles.checkoutBtn} onClick={handlePOSCheckout} style={{marginTop: '20px'}}>COMPLETE SALE</button>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div>
            <h1>Order Management</h1>
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <h3>{order.customerName} - {order.type}</h3>
                    <span className={order.status === 'COMPLETED' ? styles.statusCompleted : styles.statusPending}>
                      {order.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '10px' }}>
                    {order.phone && <div><strong>Phone:</strong> {order.phone}</div>}
                    {order.address && <div><strong>Address:</strong> {order.address}</div>}
                    {order.paymentMethod && <div><strong>Payment:</strong> {order.paymentMethod.toUpperCase()}</div>}
                  </div>
                  <ul className={styles.orderItems}>
                    {order.items.map((item: any) => (
                      <li key={item.id}>{item.quantity}x {item.nameAtTime}</li>
                    ))}
                  </ul>
                  <div className={styles.orderTotal}>Total: £{order.total.toFixed(2)}</div>
                  <div className={styles.orderActions}>
                    {order.status === 'PENDING' && (
                      <button onClick={() => markOrderCompleted(order.id)} className={styles.completeBtn}>Mark Completed</button>
                    )}
                    <button onClick={() => printReceipt(order)} className={styles.completeBtn} style={{background: '#555'}}>Print Bill</button>
                    <button onClick={() => deleteOrder(order.id)} className={styles.deleteBtn}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div>
            <h1>Reservations Management</h1>
            <div className={styles.ordersList}>
              {reservations.map((res) => (
                <div key={res.id} className={styles.orderCard}>
                  <div className={styles.orderHeader}>
                    <h3>{res.customerName} - {res.guests} Guests</h3>
                    <span className={res.status === 'CONFIRMED' ? styles.statusCompleted : res.status === 'CANCELLED' ? styles.statusPending : styles.statusPending} style={res.status === 'CANCELLED' ? {backgroundColor: '#555', color: '#fff'} : {}}>
                      {res.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '10px' }}>
                    <div><strong>Date & Time:</strong> {res.date} at {res.time}</div>
                    <div><strong>Email:</strong> {res.email}</div>
                    <div><strong>Phone:</strong> {res.phone}</div>
                    <div><strong>Requested:</strong> {new Date(res.createdAt).toLocaleString()}</div>
                  </div>
                  
                  <div className={styles.orderActions}>
                    {res.status === 'PENDING' && (
                      <>
                        <button onClick={() => updateReservationStatus(res.id, 'CONFIRMED')} className={styles.completeBtn}>Confirm</button>
                        <button onClick={() => updateReservationStatus(res.id, 'CANCELLED')} className={styles.deleteBtn}>Cancel</button>
                      </>
                    )}
                    {res.status === 'CONFIRMED' && (
                       <button onClick={() => updateReservationStatus(res.id, 'CANCELLED')} className={styles.deleteBtn}>Cancel</button>
                    )}
                  </div>
                </div>
              ))}
              {reservations.length === 0 && <p>No reservations found.</p>}
            </div>
          </div>
        )}

        {/* MENU BUILDER */}
        {activeTab === 'menu' && (
          <div>
            <h1>Menu Builder</h1>
            <p style={{marginBottom: '20px'}}>Create categories and add items with images to your menu.</p>
            
            <div className={styles.menuBuilderGrid}>
              
              {/* LEFT COLUMN: ADD CATEGORY & ADD ITEM FORM */}
              <div className={styles.menuBuilderPanel}>
                <h3>1. Add a Category</h3>
                <form onSubmit={async (e: any) => {
                  e.preventDefault();
                  await fetch('/api/menu', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type: 'category', name: e.target.catName.value }) });
                  e.target.reset();
                  fetchStaticData();
                }} style={{display: 'flex', gap: '10px', marginBottom: '30px'}}>
                  <input name="catName" placeholder="e.g. Cold Drinks" required style={{flex: 1, padding: '10px', background: '#000', color: '#fff', border: '1px solid #333'}} />
                  <button type="submit" style={{padding: '10px', background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>Add</button>
                </form>

                <h3>2. Add an Item</h3>
                <form onSubmit={handleAddItem} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                  <select 
                    value={selectedCategory} 
                    onChange={e => setSelectedCategory(e.target.value)}
                    required
                    style={{padding: '10px', background: '#000', color: '#fff', border: '1px solid #333'}}
                  >
                    <option value="" disabled>Select a Category...</option>
                    {menu.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  
                  <input name="itemName" placeholder="Item Name (e.g. Pepsi)" required style={{padding: '10px', background: '#000', color: '#fff', border: '1px solid #333'}} />
                  <textarea name="itemDesc" placeholder="Description (optional)" style={{padding: '10px', minHeight: '60px', background: '#000', color: '#fff', border: '1px solid #333'}} />
                  <input name="itemPrice" placeholder="Price (£)" type="number" step="0.01" required style={{padding: '10px', background: '#000', color: '#fff', border: '1px solid #333'}} />
                  
                  <div style={{border: '1px dashed #D4AF37', padding: '15px', textAlign: 'center'}}>
                    <label style={{display: 'block', marginBottom: '10px', color: '#D4AF37'}}>Upload Item Image</label>
                    <input type="file" name="itemImage" accept="image/*" style={{color: '#fff'}} />
                  </div>

                  <button type="submit" style={{padding: '15px', background: '#D4AF37', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 'bold'}}>ADD ITEM TO MENU</button>
                </form>
              </div>

              {/* RIGHT COLUMN: CURRENT MENU LIST */}
              <div className={styles.menuBuilderPanel}>
                <h3>Current Menu</h3>
                {menu.length === 0 && <p>No categories yet. Add one to start building your menu!</p>}
                
                {menu.map(cat => (
                  <div key={cat.id} style={{marginBottom: '30px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px', marginBottom: '15px'}}>
                      <h2 style={{margin: 0}}>{cat.name}</h2>
                      <button onClick={async () => {
                        await fetch(`/api/menu?id=${cat.id}&type=category`, { method: 'DELETE' });
                        fetchStaticData();
                      }} className={styles.deleteIcon}>Delete Category</button>
                    </div>

                    {cat.items.length === 0 ? <p style={{color: '#666'}}>No items in this category.</p> : null}
                    
                    {cat.items.map((item: any) => (
                      <div key={item.id} className={styles.itemCard}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} className={styles.itemImage} />
                        ) : (
                          <div className={styles.itemImage} style={{background: '#111', border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#666'}}>No Image</div>
                        )}
                        <div className={styles.itemDetails}>
                          <h4 style={{margin: '0 0 5px 0'}}>{item.name} - £{item.price.toFixed(2)}</h4>
                          <p style={{margin: 0, fontSize: '0.85rem', color: '#666'}}>{item.description}</p>
                        </div>
                        <button onClick={async () => {
                          await fetch(`/api/menu?id=${item.id}&type=item`, { method: 'DELETE' });
                          fetchStaticData();
                        }} className={styles.deleteIcon}>X</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div>
            <h1>Site Settings (CMS)</h1>
            <form onSubmit={saveSettings} className={styles.settingsForm}>
              <div className={styles.formGroup}>
                <label>Hero Title</label>
                <input value={settings?.heroTitle || ''} onChange={e => setSettings({...settings, heroTitle: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Subtitle</label>
                <input value={settings?.heroSubtitle || ''} onChange={e => setSettings({...settings, heroSubtitle: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label>Hero Description</label>
                <textarea value={settings?.heroDesc || ''} onChange={e => setSettings({...settings, heroDesc: e.target.value})} rows={4} />
              </div>
              <div className={styles.formGroup}>
                <label>WhatsApp Number</label>
                <input value={settings?.whatsappNumber || ''} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} placeholder="+441234567890" />
              </div>
              <div className={styles.formGroup}>
                <label>WhatsApp Default Message</label>
                <input value={settings?.whatsappMessage || ''} onChange={e => setSettings({...settings, whatsappMessage: e.target.value})} />
              </div>

              <h2 style={{marginTop: '40px', marginBottom: '20px'}}>Banner & Logo Images</h2>
              {['logoImage', 'bannerHomeHero', 'bannerStatement', 'bannerStorefront', 'bannerPress', 'bannerShop', 'bannerFooter'].map(field => (
                <div key={field} className={styles.formGroup} style={{border: '1px dashed #333', padding: '15px'}}>
                  <label>{field.replace('banner', '')} Banner</label>
                  {settings?.[field] && <img src={settings[field]} alt={field} style={{width: '100%', maxHeight: '150px', objectFit: 'cover', marginBottom: '10px'}} />}
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, field)} style={{color: '#fff'}} />
                </div>
              ))}

              <button type="submit" className={styles.saveBtn} style={{marginTop: '30px'}}>Save Settings</button>
            </form>

            <h2 style={{marginTop: '40px', marginBottom: '20px'}}>Manage Locations</h2>
            
            <div style={{marginBottom: '20px'}}>
              {locations.map(loc => (
                <div key={loc.id} style={{border: '1px solid #ccc', padding: '15px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', background: 'white'}}>
                  <div>
                    <strong>{loc.name}</strong><br/>
                    {loc.phone} | {loc.email}
                  </div>
                  <button onClick={async () => {
                    await fetch(`/api/locations?id=${loc.id}`, { method: 'DELETE' });
                    fetchStaticData();
                  }} style={{background: '#dc3545', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px'}}>Delete</button>
                </div>
              ))}
            </div>

            <form onSubmit={async (e: any) => {
              e.preventDefault();
              await fetch('/api/locations', { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ 
                  name: e.target.locName.value,
                  phone: e.target.locPhone.value,
                  email: e.target.locEmail.value,
                  order: locations.length
                })
              });
              e.target.reset();
              fetchStaticData();
            }} className={styles.settingsForm} style={{marginTop: 0}}>
              <h3>Add New Location</h3>
              <div className={styles.formGroup}>
                <label>Location Name</label>
                <input name="locName" placeholder="e.g. NOLITA" required />
              </div>
              <div className={styles.formGroup}>
                <label>Phone</label>
                <input name="locPhone" placeholder="e.g. 212-219-3434" required />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input name="locEmail" placeholder="e.g. contact@domain.com" required />
              </div>
              <button type="submit" className={styles.saveBtn}>Add Location</button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}
