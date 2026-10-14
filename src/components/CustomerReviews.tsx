"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import styles from "./CustomerReviews.module.css";
import { REVIEWS_DATA, ReviewEntry } from "@/data/reviewsData";

function StarRating({ rating }: { rating: number }) {
  const full = "★".repeat(Math.max(0, Math.min(5, rating)));
  const empty = "☆".repeat(Math.max(0, 5 - rating));
  return (
    <div className={styles.starRating} aria-label={`${rating} out of 5 stars`}>
      <span className={styles.starText}>{full}</span>
      {empty.length > 0 && <span className={styles.emptyStarText}>{empty}</span>}
    </div>
  );
}

function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ReviewCard({ review, indexKey }: { review: ReviewEntry; indexKey: string }) {
  const initials = getInitials(review.author);

  return (
    <article className={styles.card} key={indexKey}>
      <div className={styles.cardHeader}>
        <StarRating rating={review.rating} />
        <span className={styles.branchTag}>{review.branch}</span>
      </div>

      <p className={styles.cardComment}>&ldquo;{review.comment}&rdquo;</p>

      <div className={styles.cardFooter}>
        <div className={styles.authorMeta}>
          <div className={styles.authorAvatar} aria-hidden="true">
            {initials}
          </div>
          <div className={styles.authorDetails}>
            <span className={styles.authorName}>{review.author}</span>
            <span className={styles.authorLocationAndDate}>
              {review.location} • {review.date}
            </span>
          </div>
        </div>

        <span className={styles.samplePill}>Sample Review</span>
      </div>
    </article>
  );
}

export default function CustomerReviews() {
  const pathname = usePathname();

  // Split all 300 reviews into two continuous rows of 150 each
  const { row1, row2 } = useMemo(() => {
    const half = Math.ceil(REVIEWS_DATA.length / 2); // 150
    return {
      row1: REVIEWS_DATA.slice(0, half),
      row2: REVIEWS_DATA.slice(half)
    };
  }, []);

  // Suppress rendering inside admin dashboard to preserve dedicated admin workspace
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <section className={styles.reviewsSection} aria-label="Customer Reviews">
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* Header Content */}
      <div className={styles.headerContainer}>
        <span className={styles.cursiveSubtitle}>Guest Impressions &amp; Hospitality</span>
        <h2 className={styles.sectionTitle}>What Our Guests Say</h2>
        <p className={styles.sectionDescription}>
          Authentic impressions of our charcoal mangal grills, handmade breads, and warm Turkish
          hospitality across Sandwich and Broadstairs.
        </p>

        <div className={styles.statsBadgeBar}>
          <div className={styles.statItem}>
            <span>★</span>
            <strong>4.9 Average Rating</strong>
          </div>
          <span className={styles.statDot}>•</span>
          <div className={styles.statItem}>
            <strong>{REVIEWS_DATA.length} Curated Reviews</strong>
          </div>
          <span className={styles.statDot}>•</span>
          <div className={styles.statItem}>
            <span>Sandwich &amp; Broadstairs</span>
          </div>
        </div>
      </div>

      {/* Continuous Slider Tracks */}
      <div className={styles.sliderContainer}>
        {/* Row 1: Sliding Left */}
        <div className={styles.sliderRow} tabIndex={0} aria-label="Review slider row 1">
          <div className={`${styles.sliderTrack} ${styles.trackLeft}`}>
            {/* Primary track (150 items) */}
            {row1.map((review) => (
              <ReviewCard key={`r1-orig-${review.id}`} review={review} indexKey={`r1-orig-${review.id}`} />
            ))}
            {/* Duplicate track for seamless infinite loop (150 items) */}
            {row1.map((review) => (
              <ReviewCard key={`r1-dup-${review.id}`} review={review} indexKey={`r1-dup-${review.id}`} />
            ))}
          </div>
        </div>

        {/* Row 2: Sliding Right */}
        <div className={styles.sliderRow} tabIndex={0} aria-label="Review slider row 2">
          <div className={`${styles.sliderTrack} ${styles.trackRight}`}>
            {/* Primary track (150 items) */}
            {row2.map((review) => (
              <ReviewCard key={`r2-orig-${review.id}`} review={review} indexKey={`r2-orig-${review.id}`} />
            ))}
            {/* Duplicate track for seamless infinite loop (150 items) */}
            {row2.map((review) => (
              <ReviewCard key={`r2-dup-${review.id}`} review={review} indexKey={`r2-dup-${review.id}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer & Accessibility hint */}
      <div className={styles.disclaimerContainer}>
        <p className={styles.disclaimerText}>
          Sample guest feedback entries illustrating dining, takeaway, and hospitality experiences across our Kent branches.
          <span className={styles.hoverHint}>Hover or tap any card to pause</span>
        </p>
      </div>
    </section>
  );
}
