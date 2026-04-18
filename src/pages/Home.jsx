import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getShops } from '../api'

export default function Home() {
  const navigate = useNavigate()
  const name = localStorage.getItem('name') || localStorage.getItem('user')
  const [shops, setShops] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

useEffect(() => {
  getShops().then(async res => {
    const shopsData = res.data
    const shopsWithEta = await Promise.all(
      shopsData.map(async shop => {
        try {
          const etaRes = await fetch(`http://localhost:5000/api/smart/eta/${shop._id}`)
          const etaData = await etaRes.json()
          return { ...shop, smartEta: etaData.eta }
        } catch {
          return shop
        }
      })
    )
    setShops(shopsWithEta)
    setLoading(false)
  }).catch(() => setLoading(false))
}, [])

  const filtered = shops.filter(s => {
    const matchCategory = filter === 'all' || s.category === filter
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div>
      <Navbar title="Campus Delivery" />
      <div style={styles.container}>
        <div style={styles.hero}>
          <h2 style={styles.heroTitle}>Hey, {name?.split('@')[0]} 👋</h2>
          <p style={styles.heroSub}>What are you ordering today?</p>
        </div>

        <input
          style={styles.search}
          placeholder="🔍  Search shops..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div style={styles.tabs}>
          {[
            { key: 'all',      label: 'All Shops', icon: '🏪' },
            { key: 'food',     label: 'Food',      icon: '🍛' },
            { key: 'pharmacy', label: 'Pharmacy',  icon: '💊' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                ...styles.tab,
                background: filter === f.key ? '#6c63ff' : '#fff',
                color: filter === f.key ? '#fff' : '#555',
                border: filter === f.key ? '2px solid #6c63ff' : '2px solid #eee',
              }}
            >
              {f.icon} {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={styles.loading}>Loading shops...</div>
        ) : (
          <div style={styles.grid}>
            {filtered.map(shop => (
  <div
    key={shop._id}
    style={styles.card}
    onClick={() => navigate(`/menu/${shop._id}`)}
  >
    <div style={styles.cardEmoji}>{shop.emoji}</div>
    <div style={styles.cardBody}>
      <div style={styles.cardTop}>
        <span style={{
          ...styles.badge,
          background: shop.category === 'food' ? '#fff3e0' : '#e8f5e9',
          color: shop.category === 'food' ? '#e65100' : '#2e7d32',
        }}>
          {shop.category === 'food' ? 'Food' : 'Pharmacy'}
        </span>
        <span style={styles.rating}>★ {shop.rating}</span>
      </div>
      <h3 style={styles.shopName}>{shop.name}</h3>
      <div style={styles.cardFooter}>
        <span style={styles.eta}>🕐 {shop.smartEta || shop.eta} mins</span>
        <span style={styles.itemCount}>{shop.items?.length} items</span>
      </div>
    </div>
  </div>
))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '780px', margin: '0 auto', padding: '24px 16px' },
  hero: { marginBottom: '24px' },
  heroTitle: { fontSize: '26px', fontWeight: '800', color: '#1a1a2e' },
  heroSub: { color: '#888', fontSize: '15px', marginTop: '4px' },
  search: { width: '100%', padding: '14px 18px', borderRadius: '14px', border: '2px solid #eee', fontSize: '14px', background: '#fff', marginBottom: '20px' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '24px' },
  tab: { padding: '10px 20px', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  loading: { textAlign: 'center', padding: '60px', color: '#888', fontSize: '15px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' },
  card: { background: '#fff', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s' },
  cardEmoji: { background: '#f0efff', fontSize: '40px', textAlign: 'center', padding: '24px' },
  cardBody: { padding: '14px 16px' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  badge: { fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '20px' },
  rating: { fontSize: '12px', color: '#f59e0b', fontWeight: '700' },
  shopName: { fontSize: '15px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between' },
  eta: { fontSize: '12px', color: '#6c63ff', fontWeight: '600' },
  itemCount: { fontSize: '12px', color: '#aaa' },
}