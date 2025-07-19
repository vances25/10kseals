"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';





export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');



    useEffect(() => {
        const checkSession = async () => {
            try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/refresh`, {
                method: 'POST',
                credentials: 'include', // sends cookies!
            });
            if (res.ok) {
                const data = await res.json();
                // maybe store accessToken in context/state if needed
                window.location.href = "/admin"; // already logged in
            }
            } catch (err) {
            console.log("Not logged in");
            }
        };

        checkSession();
}, []);





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError(''); // reset previous error

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: 'POST',
        credentials: "include",
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
      } else {
        localStorage.setItem("token", data.access_token)
        window.location.href = '/admin';
      }
    } catch (err) {
      setError('Network error or server not reachable');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Admin Login</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          <input
            type="text"
            placeholder="Username"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
}