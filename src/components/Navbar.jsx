import { useNavigate } from 'react-router-dom'
import { getUser, logout } from '../auth'

export default function Navbar({ title, back }) {
  const navigate = useNavigate()
  const user = getUser()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div style={styles.bar}>
      <div style={styles.left}>
        {back && (
          <button onClick={() => navigate(back)} style={styles.backBtn}>
            ←
          </button>
        )}
        <div style={styles.logo}>🍽</div>
        <span style={styles.title}>{title || 'Campus Delivery'}</span>
      </div>
      <div style={styles.right}>
        <span style={styles.userPill}>{user?.email?.split('@')[0]}</span>
        <span style={styles.rolePill}>{user?.role}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </div>
  )
}

const styles = {
  bar: {
    background: '#fff',
    borderBottom: '1px solid #eee',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  logo: { fontSize: '22px' },
  title: { fontWeight: '700', fontSize: '16px', color: '#1a1a2e' },
  backBtn: { background: '#f0f0f0', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '16px' },
  right: { display: 'flex', alignItems: 'center', gap: '10px' },
  userPill: { background: '#f0efff', color: '#6c63ff', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  rolePill: { background: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', textTransform: 'capitalize' },
  logoutBtn: { background: '#fff', border: '1px solid #eee', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', color: '#888' },
}