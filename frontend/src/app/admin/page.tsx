'use client';

import styles from './page.module.css';

import { useState, useEffect } from 'react';

export default function AdminDashboard() {

  const [loading, setLoading] = useState<boolean>(true)
  const [mode, setMode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_mode") || "upload";
    }
    return "upload";
  });

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (err) {
      console.error("Logout request failed", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("admin_mode");
      window.location.href = "/";
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_mode", mode);
    }
  }, [mode]);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);

  useEffect(() => {
        const checkSession = async () => {
            try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
                method: 'POST',
                
                credentials: 'include',
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.access_token)
                setLoading(false)

                const galleryRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_photos`, {
                  headers: { 'Authorization': `Bearer ${data.access_token}` },
                });
                if (galleryRes.ok) {
                  const galleryData = await galleryRes.json();
                  console.log("Gallery data:", galleryData);

                  setPhotos(galleryData.photos);
                }
            }else{
              window.location.href = "/login"
            }
            } catch (err) {
            console.log("Not logged in");
            }
        };

        checkSession();
}, []);

  const handleUpload = async () => {
    if (!beforeFile || !afterFile) return alert("Both files are required");

    const formData = new FormData();
    formData.append("before", beforeFile);
    formData.append("after", afterFile);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload_pictures`, {
        method: "POST",
        body: formData,
        headers:{
          'Authorization':`Bearer ${localStorage.getItem('token')}` || '',
        },
        credentials: "include"
      });

      if (res.ok) {
        setBeforeFile(null);
        setAfterFile(null);
        alert("Upload successful! Check the gallery to see your new upload.");
        window.location.reload()
      } else {
        const error = await res.json();
        alert("Upload failed: " + (error.detail || "Unknown error"));
        window.location.reload()
      }
    } catch (err) {
      alert("Error uploading.");
      window.location.reload()
      console.error(err);
    }
  };

  const handleDelete = async (before: string, after: string) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this photo pair?");
      if (!confirmed) return;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete_photo?before=${before}&after=${after}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter(photo => photo.after_file !== after));
      } else {
        const err = await res.json();
        alert("Failed to delete: " + (err.detail || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting photo.");
    }
  };

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
            <button onClick={()=>setMode("upload")} className={`${styles.menu_button} ${mode =="upload"&&styles.selected_mode}`}>Upload Photos</button>
            <button onClick={()=>setMode("photos")} className={`${styles.menu_button} ${mode =="photos"&&styles.selected_mode}`}>Manage Photos</button>
            <button onClick={()=>setMode("password")} className={`${styles.menu_button} ${mode =="password"&&styles.selected_mode}`}>Change Password</button>
          </div>

          {mode === "upload"&&
          <div className={styles.upload_photo}>
            <h1>Upload Photos</h1>
              <div>
                  <p>Before Photo: </p>
                  <input
                    type="file"
                    className={styles.fileInput}
                    onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                  />
              </div>
              <div>
                <p>After Photo: </p>
                <input
                  type="file"
                  className={styles.fileInput}
                  onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                />
              </div>
              <button onClick={handleUpload}>Upload</button>

          </div>}


          {mode === "photos" &&
            <div className={styles.gallery}>
              <h1>Gallery</h1>
              <div className={styles.galleryGrid}>
                {photos.map((item, idx) => (
                  <div key={idx} className={styles.galleryItem}>
                    <div>
                    <p> <strong>Before:</strong></p>
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.before_file}`} alt="Before" />
                    </div>
                    <div>
                     <p><strong>After:</strong></p>
                      <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${item.after_file}`} alt="After" />
                    </div>
                    <p>Uploaded: {new Date(item.uploaded_at * 1000).toLocaleString()}</p>
                    <button onClick={() => handleDelete(item.before_file, item.after_file)}>Delete</button>
                  </div>
                ))}
              </div>
            </div>
          }

          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>

        </div>
        </>

      )


}