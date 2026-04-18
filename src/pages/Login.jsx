import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../api'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
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
      const data = isRegister
        ? await register({ name, email, password, role: 'student' })
        : await login({ email, password })

      const user = data.data.user

      if (user.role !== 'student') {
        setError('This is the student portal. Please use the correct login page.')
        setLoading(false)
        return
      }

      localStorage.setItem('token', data.data.token)
      localStorage.setItem('role',  user.role)
      localStorage.setItem('user',  user.email)
      localStorage.setItem('name',  user.name)

      navigate('/home')
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>
          <span style={styles.logoIcon}>🍽</span>
        </div>
        <h1 style={styles.title}>Campus Delivery</h1>
        <p style={styles.subtitle}>
          {isRegister ? 'Create your student account' : 'Sign in to order food on campus'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label style={styles.label}>Full name</label>
              <input
                style={styles.input}
                placeholder="Your full name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </>
          )}

          <label style={styles.label}>University email</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@university.edu"
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
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button
            onClick={() => { setIsRegister(!isRegister); setError('') }}
            style={styles.toggleBtn}
          >
            {isRegister ? 'Sign In' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  logoBox: {
    width: '64px', height: '64px', background: '#f0efff',
    borderRadius: '16px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 20px',
  },
  logoIcon: { fontSize: '32px' },
  title: { textAlign: 'center', fontSize: '24px', fontWeight: '800', color: '#1a1a2e', marginBottom: '6px' },
  subtitle: { textAlign: 'center', color: '#888', fontSize: '14px', marginBottom: '24px' },
  error: { background: '#fff0f0', color: '#e53e3e', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '8px', marginTop: '16px' },
  input: { width: '100%', padding: '12px 16px', borderRadius: '10px', border: '2px solid #eee', fontSize: '14px', background: '#f7f8fc' },
  submitBtn: { width: '100%', padding: '14px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '24px', boxShadow: '0 4px 15px rgba(108,99,255,0.4)' },
  toggle: { textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#888' },
  toggleBtn: { background: 'none', border: 'none', color: '#6c63ff', fontWeight: '700', cursor: 'pointer', marginLeft: '6px', fontSize: '13px' },
}