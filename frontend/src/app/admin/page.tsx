'use client';

import styles from './page.module.css';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {

  const [loading, setLoading] = useState<boolean>(true)
  const [mode, setMode] = useState<string>("dashboard")

  useEffect(() => {
        const checkSession = async () => {
            try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
                method: 'POST',
                credentials: 'include', // sends cookies!
            });
            if (res.ok) {
                const data = await res.json();
                setLoading(false)
            }else{
              window.location.href = "/login"
            }
            } catch (err) {
            console.log("Not logged in");
            }
        };

        checkSession();
}, []);


    if(loading){
      return(
      <>
      </>
      )

    }



    return(
      <>
      <div className={styles.container}>

        <h1>Admin Dashboard</h1>

        <div className={styles.menu}>
          <button onClick={()=>setMode("dashboard")} className={`${styles.menu_button} ${mode =="dashboard"&&styles.selected_mode}`}>Dashboard</button>
          <button onClick={()=>setMode("photos")} className={`${styles.menu_button} ${mode =="photos"&&styles.selected_mode}`}>Manage Photos</button>
          <button onClick={()=>setMode("reviews")} className={`${styles.menu_button} ${mode =="reviews"&&styles.selected_mode}`}>Manage Reviews</button>
        </div>


        <div className={styles.upload_photo}>
          <h1>Upload Photos</h1>
            <div>
                <p>Before Photo: </p>
                <input type="file" className={styles.fileInput} />
            </div>
            <div>
              <p>After Photo: </p>
              <input type="file" className={styles.fileInput} />
            </div>
            <button>Upload</button>

        </div>
      </div>
      </>
    )


}