import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function RiderLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login({ email, password })
      const user = data.data.user

      if (user.role !== 'rider') {
        setError('Access denied. This portal is for riders only.')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('role',  user.role)
      localStorage.setItem('user',  user.email)
      localStorage.setItem('name',  user.name)

      navigate('/rider')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>🛵</span>
        </div>
        <h1 style={styles.title}>Rider Portal</h1>
        <p style={styles.subtitle}>Campus Delivery — Riders only</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Not a rider? <a href="/" style={styles.link}>Go to student portal</a>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  card: {
    background: '#fff',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logoBox: {
    width: '64px', height: '64px', background: '#e8fdf5',
    borderRadius: '16px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 20px',
  },
  logoIcon: { fontSize: '32px' },
  title: { textAlign: 'center', fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' },
  subtitle: { textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '24px' },
  error: { background: '#fff0f0', color: '#e53e3e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px', marginTop: '16px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #eee', fontSize: '14px', background: '#f7f8fc' },
  submitBtn: { width: '100%', padding: '14px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '24px', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' },
  footer: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' },
  link: { color: '#10b981', fontWeight: '700', textDecoration: 'none' },
}