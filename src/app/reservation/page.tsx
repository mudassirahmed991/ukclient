"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];

export default function ReservationPage() {
  const todayStr = new Date().toISOString().split('T')[0];

  const [branch, setBranch] = useState('Broadstairs');
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('18:00');
  const [guests, setGuests] = useState('2');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim() || !phone.trim() || !date || !time) {
      setError('Please fill in all required fields (Name, Phone, Date, and Time).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch,
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email.trim() || 'N/A',
          date,
          time,
          guests: parseInt(guests) || 2,
          notes: notes.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit reservation. Please try again.');
      }

      setBookingSummary({
        branch,
        date,
        time,
        guests,
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Reservation error:', err);
      setError(err.message || 'Something went wrong. Please try again or call the restaurant directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setBookingSummary(null);
    setCustomerName('');
    setPhone('');
    setEmail('');
    setNotes('');
  };

  return (
    <main className={styles.main}>
      {/* Header Area */}
      <div className={styles.headerArea}>
        <h1 className={styles.title}>TABLE RESERVATION</h1>
        <p className={styles.subtitle}>
          Book your table at NAJ Turkish Restaurant for an authentic culinary experience. 
          For immediate or same-day bookings, you can also call our branch teams directly.
        </p>
      </div>

      {/* Direct Branch Contact Cards */}
      <div className={styles.quickBranchesGrid}>
        <a href="tel:01843313655" className={styles.branchQuickCard}>
          <div>
            <div className={styles.branchCardHeader}>
              <span className={styles.branchCardName}>BROADSTAIRS</span>
              <span style={{ fontSize: '1.2rem' }}>📞</span>
            </div>
            <p className={styles.branchCardAddress}>1 High Street, Broadstairs CT10 1LP</p>
          </div>
          <span className={styles.branchCallAction}>
            <span>Call: 01843 313655</span>
          </span>
        </a>

        <a href="tel:01304279018" className={styles.branchQuickCard}>
          <div>
            <div className={styles.branchCardHeader}>
              <span className={styles.branchCardName}>SANDWICH</span>
              <span style={{ fontSize: '1.2rem' }}>📞</span>
            </div>
            <p className={styles.branchCardAddress}>1 No Name Street, Sandwich CT13 9AJ</p>
          </div>
          <span className={styles.branchCallAction}>
            <span>Call: 01304 279018</span>
          </span>
        </a>
      </div>

      {/* Main Container */}
      <div className={styles.container}>
        {submitted && bookingSummary ? (
          <div className={styles.successCard}>
            <div className={styles.successIcon}>✓</div>
            <h2 className={styles.successTitle}>Reservation Request Received</h2>
            <p className={styles.successDesc}>
              Thank you, <strong>{bookingSummary.customerName}</strong>! We have received your booking request for <strong>{bookingSummary.branch}</strong>. Our team will review your reservation and hold your table.
            </p>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Branch:</span>
                <span className={styles.summaryValue}>{bookingSummary.branch}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Date:</span>
                <span className={styles.summaryValue}>{bookingSummary.date}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Time:</span>
                <span className={styles.summaryValue}>{bookingSummary.time}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Guests:</span>
                <span className={styles.summaryValue}>{bookingSummary.guests} Person(s)</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Contact Phone:</span>
                <span className={styles.summaryValue}>{bookingSummary.phone}</span>
              </div>
            </div>

            <div className={styles.successActions}>
              <button onClick={handleReset} className={styles.secondaryBtn}>
                Book Another Table
              </button>
              <Link href="/locations" className={styles.secondaryBtn}>
                Explore Menus
              </Link>
              <Link href="/" className={styles.secondaryBtn}>
                Return Home
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Book Online</h2>
              <p className={styles.formDesc}>
                Fill in your details below to reserve your table.
              </p>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Branch & Guests */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="branch">Select Location *</label>
                  <select
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                  >
                    <option value="Broadstairs">Broadstairs (1 High St, CT10 1LP)</option>
                    <option value="Sandwich">Sandwich (1 No Name St, CT13 9AJ)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="guests">Number of Guests *</label>
                  <select
                    id="guests"
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                    <option value="13">13+ Guests (Large Party)</option>
                  </select>
                </div>
              </div>

              {/* Date & Time */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    min={todayStr}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time">Time Slot *</label>
                  <select
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Name & Phone */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    placeholder="e.g. John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    placeholder="e.g. 07123 456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Special Requests */}
              <div className={styles.formGroup}>
                <label htmlFor="notes">Special Requests / Dietary Requirements</label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="e.g. High chair needed, celebrating birthday, outdoor / window seating request, allergies..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading}
              >
                {loading ? 'Submitting Reservation...' : 'Confirm Table Reservation'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
