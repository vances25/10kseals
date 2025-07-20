
"use client";

type PhotoItem = {
  before_file: string;
  after_file: string;
  uploaded_at: number;
};

import styles from "./page.module.css"
import { useState, useEffect } from "react";

export default function Gallery(){
  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_photos?limit 4`)
      .then(res => res.json())
      .then(data => setPhotos(data.photos || []))
      .catch(console.error);
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/logo.png"></img>
          
          <div className={styles.links}>
            <a href="/#contacts">CONTACT</a>
            <a href="/gallery">GALLERY</a>
            <a href="/reviews">REVIEWS</a>
            <a href="/#services">SERVICES</a>
          </div>

          <p className={styles.number}>call 763-258-7172</p>

          <button onClick={()=> setOpenMenu(!openMenu)} className={styles.menu}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect y="4" width="24" height="2" rx="1" fill="#ffffff"/>
              <rect y="11" width="24" height="2" rx="1" fill="#ffffff"/>
              <rect y="18" width="24" height="2" rx="1" fill="#ffffff"/>
            </svg>
          </button>
        </div>

        {openMenu && (
          <div className={styles.popupOverlay} onClick={() => setOpenMenu(false)}>
            <div className={styles.popupMenu} onClick={(e) => e.stopPropagation()}>
              <a onClick={() => setOpenMenu(false)} href="//#contacts">contact</a>
              <a onClick={() => setOpenMenu(false)} href="/gallery">gallery</a>
              <a onClick={() => setOpenMenu(false)} href="/reviews">reviews</a>
              <a onClick={() => setOpenMenu(false)} href="/#services">services</a>
              <button className={styles.closeBtn} onClick={() => setOpenMenu(false)}>Close</button>
            </div>
          </div>
        )}
      </div>
      {/* Gallery Section */}
      <h1 className={styles.galleryTitle}>Gallery</h1>
      <div className={styles.galleryWrapper}>
        {photos.map((item, idx) => (
    <div key={idx} className={styles.almost_done}>
          <div className={styles.galleryItem}>
            <div>
              <p><strong>Before:</strong></p>
              <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.before_file}`} alt="Before" />
            </div>
            <div>
              <p><strong>After:</strong></p>
              <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.after_file}`} alt="After" />
            </div>
          </div>
           <p className={styles.uploadedAt}>Uploaded: {new Date(item.uploaded_at * 1000).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </>
  )
}