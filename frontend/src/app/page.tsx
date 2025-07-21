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




  return (
      <>
      <div className={styles.container}>
        <div className={styles.header}>
          <img src="/logo.png"></img>
          
          <div className={styles.links}>
            <a href="reviews">HOME</a>
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


        <div className={styles.hero_overlay}>
          <h1>Revive And Protect Your Driveway</h1>
          <p>Proudly serving the Twin Cities – Minneapolis & St. Paul</p>
          <button className={styles.heroBtn} onClick={() => setShowForm(true)}>Get a Free Quote</button>

        </div>
        <img className={styles.wave} src="wave.png"></img>
      </div>



      <div className={styles.about_us}>

        <div className={styles.about_text}>
          <p>ABOUT US</p>
          <h1><span className={styles.brand_color}>10,000 SEALS</span> Will Make Your Home Shinny</h1>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum ut mollitia vitae asperiores deleniti autem atque quis esse. Praesentium, molestiae. Iste, in qui? Error molestias odio sequi ipsa delectus fugit!
            <br/><br/>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Modi nobis velit magni consectetur fuga ad quae doloremque explicabo amet, iste sit dolorum quaerat impedit et dicta. Sequi cumque suscipit ipsum.

          </p>
        </div>
        <img src="test.jpg"></img>
       </div>


        <p>OUR CREW</p>
       <div className={styles.meet_crew}>

        <div>
          <img src="/person.png"></img>
          <h3>Vance Schaefer</h3>
        </div>

        <div>
          <img src="/person.png"></img>
          <h3>Vance Schaefer</h3>
        </div>

          <div>
          <img src="/person.png"></img>
          <h3>Vance Schaefer</h3>
        </div>


       </div>

      <img className={styles.the_line} src="/line.png"></img>


      <div className={styles.galleryPreviewSection}>
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



     <div id="services" className={styles.our_service}>
        <p>OUR SERVICE</p>
        <h1>Trusted Power Washing</h1>
        <div className={styles.offered_services}>
          <div>
            <img src="/service_power.jpeg"></img>
            <h1>Power Washing</h1>
            <p>Blasts away dirt, grime, and stains from driveways, patios, and concrete with high-pressure cleaning.</p>
            <strong>$75–$100</strong>
          </div>

          <div>
            <img src="/seal.jpg"></img>
            <h1>Seal Coating</h1>
            <p>Protects your driveway from water, oil, and sun damage while restoring a clean, dark finish. Helps prevent cracks and keeps it looking new longer.</p>
            <strong>$250–$300</strong>
          </div>


          

        </div>

     </div>

    


    <p className={styles.dumb_shit}>CONTACTS</p>
    <h1 className={styles.contact_title}>Connect With Us Now!</h1>
     <div className={styles.contact_section}>
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

      <button className={styles.heroBtn} onClick={() => setShowForm(true)}>Contact Us</button>
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
     </div>
        


        <div className={styles.footer}>
          <p>Serving Minneapolis • St. Paul • Twin Cities Area</p><br/>
          <p>© {new Date().getFullYear()}. All Rights Reserved.</p>
          <a className={styles.admin_link} href="/login">Admin Login</a>
        </div>

      </div>
      </>
  );
}
