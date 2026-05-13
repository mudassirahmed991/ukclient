"use client";
import React, { useState, useRef, useEffect } from 'react';

export default function WhatsAppWidget({ phoneNumber, message }: { phoneNumber?: string, message?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={popupRef}>
      <style>{`
        @keyframes goldPulse {
          0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(212, 175, 55, 0); }
          100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        .whatsapp-btn {
          position: fixed;
          bottom: 40px;
          right: 40px;
          background: linear-gradient(135deg, #1a1a1a 0%, #000000 100%);
          color: #D4AF37;
          border: 1px solid #D4AF37;
          border-radius: 50px;
          padding: 15px 25px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          z-index: 1000;
          font-family: var(--font-heading);
          font-weight: 600;
          letter-spacing: 1px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          animation: goldPulse 2s infinite;
          transition: all 0.3s ease;
        }
        .whatsapp-btn:hover {
          transform: translateY(-3px);
          background: #D4AF37;
          color: #000000;
          box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
        }
        .branches-popup {
          position: fixed;
          bottom: 105px;
          right: 40px;
          background: #111;
          border: 1px solid #D4AF37;
          border-radius: 12px;
          padding: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.8);
          z-index: 1001;
          display: flex;
          flex-direction: column;
          gap: 10px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }
        .branches-popup.open {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .branch-link {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #fff;
          padding: 10px 20px;
          border-radius: 8px;
          background: #222;
          border: 1px solid transparent;
          transition: all 0.2s ease;
          min-width: 200px;
        }
        .branch-link:hover {
          background: #333;
          border-color: #D4AF37;
        }
        .branch-name {
          font-family: var(--font-heading);
          color: #D4AF37;
          font-size: 1rem;
          margin-bottom: 4px;
          letter-spacing: 1px;
        }
        .branch-phone {
          font-family: monospace;
          font-size: 1.2rem;
          letter-spacing: 1px;
        }
      `}</style>
      
      <div className={`branches-popup ${isOpen ? 'open' : ''}`}>
        <a href="tel:01304279018" className="branch-link">
          <span className="branch-name">Sandwich Branch</span>
          <span className="branch-phone">01304 279018</span>
        </a>
        <a href="tel:01843313655" className="branch-link">
          <span className="branch-name">Broadstairs Branch</span>
          <span className="branch-phone">01843 313655</span>
        </a>
      </div>

      <button 
        className="whatsapp-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{fontSize: '1.5rem'}}>📞</span> 
        <span>CALL NOW</span>
      </button>
    </div>
  );
}
