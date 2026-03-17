"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Automatically redirects to the secure dashboard
      router.push('/');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div className="ambient-blob blob-1" style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1, opacity: 0.4, background: '#8b5cf6', width: '300px', height: '300px', top: '-100px', left: '-100px' }}></div>
      <div className="ambient-blob blob-2" style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(80px)', zIndex: -1, opacity: 0.4, background: '#3b82f6', width: '250px', height: '250px', bottom: '-50px', right: '-100px' }}></div>

      <div style={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '2.5rem', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #8b5cf6, var(--primary-color))' }}></div>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)', overflow: 'hidden', padding: '0.4rem' }}>
            <img src="/logo.png" alt="Knitway Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Create an Account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Set up your owner profile to manage enquiries</p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="firstName" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>First Name</label>
              <div style={{ position: 'relative' }}>
                <i className="ri-user-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem' }}></i>
                <input type="text" id="firstName" name="firstName" className="form-control" placeholder="John" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="lastName" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Last Name</label>
              <div style={{ position: 'relative' }}>
                <i className="ri-user-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem' }}></i>
                <input type="text" id="lastName" name="lastName" className="form-control" placeholder="Doe" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="email" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <i className="ri-mail-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem' }}></i>
              <input type="email" id="email" name="email" className="form-control" placeholder="john.doe@knitway.in" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="password" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <i className="ri-lock-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem' }}></i>
                <input type="password" id="password" name="password" className="form-control" placeholder="••••••••" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <i className="ri-lock-password-line" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '1.1rem' }}></i>
                <input type="password" id="confirmPassword" name="confirmPassword" className="form-control" placeholder="••••••••" required style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: 'var(--white)', fontSize: '0.95rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.85rem', background: 'linear-gradient(to right, #8b5cf6, var(--primary-color))', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating...' : <>Create Account <i className="ri-arrow-right-line"></i></>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account? <a href="/login" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: 500, marginLeft: '0.25rem' }}>Log In</a>
        </div>
      </div>
    </div>
  );
}
