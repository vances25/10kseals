"use client";
"use client";

type PhotoItem = {
  before_file: string;
  after_file: string;
  uploaded_at: number;
};

import styles from "./page.module.css";
import { useState, useEffect } from "react";


export default function Home() {
  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const [showForm, setShowForm] = useState<boolean>(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_photos`)
      .then(res => res.json())
      .then(data => setPhotos(data.photos || []))
      .catch(console.error);
  }, []);


useEffect(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(styles.visible);
      }
    });
  }, { threshold: 0.1 });

  const elements = document.querySelectorAll(`.${styles.scrollFade}`);
  elements.forEach(el => observer.observe(el));

  return () => observer.disconnect();
}, []);


  return (
      <>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/logo.png"></img>
          
          <div className={styles.links}>
            <a href="/">HOME</a>
            <a href="#contacts">CONTACT</a>
            <a href="/gallery">GALLERY</a>
            <a href="#services">SERVICES</a>
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
            <a onClick={() => setOpenMenu(false)} href="/">HOME</a>
            <a onClick={() => setOpenMenu(false)} href="#contacts">CONTACT</a>
            <a onClick={() => setOpenMenu(false)} href="/gallery">GALLERY</a>
            <a onClick={() => setOpenMenu(false)} href="#services">SERVICES</a>
            <button className={styles.closeBtn} onClick={() => setOpenMenu(false)}>Close</button>
          </div>
        </div>
      )}
      



      <div className={styles.call_to_action}>


        <div className={`${styles.hero_overlay} ${styles.fadeInUp}`}>
          <h1>Revive And Protect Your Driveway</h1>
          <p>Proudly serving the Twin Cities – Minneapolis & St. Paul</p>
          <button className={styles.heroBtn} onClick={() => window.location.href = "/#contacts"}>Get a Free Quote</button>

        </div>
        <img className={styles.wave} src="wave.png"></img>
      </div>



      <div className={`${styles.about_us} ${styles.scrollFade}`}>

        <div className={styles.about_text}>
          <p>ABOUT US</p>
          <h1><span className={styles.brand_color}>The Shine</span> You Want. The Seal You Need.</h1>
          <p>
            At 10K Seals, we’re committed to helping homes and businesses look their best—and stay protected. Founded by a team that values hard work, quality, and results, we specialize in professional powerwashing and sealcoating services designed to extend the life of your surfaces and boost curb appeal.
            <br/><br/>
            Whether it's reviving a weather-worn driveway, sealing asphalt for long-term durability, or blasting away grime from siding and walkways, we use proven techniques to get the job done right the first time. We treat every property like it's our own—with care, precision, and pride.
            <br/><br/>
            Based in the twin cities MN, we serve residential and commercial clients looking for dependable, no-hassle service they can count on. When you work with 10K Seals, you’re not just getting a clean surface—you’re getting peace of mind.

          </p>
        </div>
        <img src="test.jpg"></img>
       </div>

        <div id="services" className={`${styles.our_service} ${styles.scrollFade}`}>
        <p>OUR SERVICE</p>
        <h1>Trusted Power Washing</h1>
        <div className={styles.offered_services}>
          <div>
            <img src="/service_power.png"></img>
            <h1>Power Washing</h1>
            <p>Blasts away dirt, grime, and stains from driveways, patios, and concrete with high-pressure cleaning.</p>
            <strong>$75–$100</strong>
          </div>

          <div>
            <img src="/seal.png"></img>
            <h1>Seal Coating</h1>
            <p>Protects your driveway from water, oil, and sun damage while restoring a clean, dark finish. Helps prevent cracks and keeps it looking new longer.</p>
            <strong>$250–$300</strong>
          </div>


          

        </div>

     </div>



        <p className={styles.crew_title}>OUR CREW</p>
       <div className={`${styles.meet_crew} ${styles.scrollFade}`}>

        <div>
          <img className={styles.jake_pic} src="/jake.png"></img>
          <h3>Jake Breitbach</h3>
        </div>

        <div>
          <img src="/person.png"></img>
          <h3>Vance Schaefer</h3>
        </div>


       </div>

      <img className={styles.the_line} src="/line.png"></img>


      <div className={`${styles.galleryPreviewSection} ${styles.scrollFade}`}>
      <h2 className={styles.previewTitle}>See Our Results</h2>
      <div className={styles.previewGrid}>
        {photos.slice(0, 3).map((item, idx) => (
          <div key={idx} className={styles.previewCard}>
            <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.before_file}`} alt="Before" />
            <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.after_file}`} alt="After" />
          </div>
        ))}
      </div>
      <button className={styles.viewMoreBtn} onClick={() => window.location.href = '/gallery'}>View Full Gallery</button>
  </div>

  <img className={styles.the_line} src="/line2.png"></img>
  

    <p className={styles.dumb_shit}>CONTACTS</p>
    <h1 className={styles.contact_title}>Connect With Us Now!</h1>
     <div className={`${styles.contact_section} ${styles.scrollFade}`}>
      <div className={styles.contact_data}>
        <div>
          <img src="/email.png"></img>
          <p>support@10kseals.com</p>
        </div>

        <div id="contacts">
          <img src="/phone.png"></img>
          <p>Main Line: 763-258-7172</p>
        </div>

         <div>
          <img src="/phone.png"></img>
          <p>Mobile / Alt: 612-670-1984</p>
        </div>

      </div>

      <button className={styles.heroBtn} onClick={() => setShowForm(true)}>Send Email Now</button>
     </div>
        

         {showForm && (
        <div className={styles.popupOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.popupMenu} onClick={(e) => e.stopPropagation()}>
            <h2>Send Us a Message</h2>
            <form action="https://formspree.io/f/mpwlqzwy" method="POST">
              <input type="text" name="name" placeholder="Your Name" required />
              <input type="email" name="email" placeholder="Your Email" required />
              <textarea name="message" placeholder="Your Message" required />
              <button type="submit" className={styles.heroBtn}>Submit</button>
            </form>
          </div>
        </div>
      )}

        <div className={styles.footer}>
          <p>Serving Minneapolis • St. Paul • Twin Cities Area</p><br/>
          <p>© {new Date().getFullYear()}. All Rights Reserved.</p>
          <a className={styles.admin_link} href="/login">Admin Login</a>
        </div>

      </div>
      </>
  );
}
