import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrders, updateStatus } from '../api'

export default function Rider() {
  const navigate = useNavigate()
  const rider = localStorage.getItem('user')
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('available')

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 3000)
    return () => clearInterval(interval)
  }, [])

  async function loadOrders() {
    try {
      const res = await getOrders()
      setOrders(res.data)
    } catch (err) {
      console.log(err)
    }
  }

  async function acceptDelivery(orderId) {
    try {
      await updateStatus(orderId, { status: 'in transit', rider })
      loadOrders()
    } catch (err) {
      alert('Failed to accept delivery')
    }
  }

  async function markDelivered(orderId) {
    try {
      await updateStatus(orderId, { status: 'delivered' })
      loadOrders()
    } catch (err) {
      alert('Failed to mark as delivered')
    }
  }

  const available = orders.filter(o => o.status === 'pending')
  const active    = orders.filter(o => o.status === 'in transit' && o.rider === rider)
  const completed = orders.filter(o => o.status === 'delivered'  && o.rider === rider)
  const earnings  = completed.reduce((sum, o) => sum + Math.round(o.total * 0.1), 0)

  const displayed = filter === 'available' ? available
    : filter === 'active' ? active
    : completed

  return (
    <div>
      <Navbar title="Rider Dashboard" />
      <div style={styles.container}>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statIcon}>📦</p>
            <p style={styles.statNum}>{available.length}</p>
            <p style={styles.statLabel}>New orders</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statIcon}>🛵</p>
            <p style={styles.statNum}>{active.length}</p>
            <p style={styles.statLabel}>Active</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statIcon}>✅</p>
            <p style={styles.statNum}>{completed.length}</p>
            <p style={styles.statLabel}>Completed</p>
          </div>
          <div style={{ ...styles.statCard, background: '#ecfdf5' }}>
            <p style={styles.statIcon}>💵</p>
            <p style={{ ...styles.statNum, color: '#10b981' }}>
              ₦{earnings.toLocaleString()}
            </p>
            <p style={styles.statLabel}>Earnings</p>
          </div>
        </div>

        <div style={styles.tabs}>
          {[
            { key: 'available', label: `New Orders (${available.length})` },
            { key: 'active',    label: `Active (${active.length})` },
            { key: 'done',      label: `Done (${completed.length})` },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              style={{
                ...styles.tab,
                background: filter === t.key ? '#6c63ff' : '#fff',
                color: filter === t.key ? '#fff' : '#555',
                border: filter === t.key ? '2px solid #6c63ff' : '2px solid #eee',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {displayed.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>
              {filter === 'available' ? '📭' : filter === 'active' ? '🛵' : '🏆'}
            </p>
            <p style={styles.emptyText}>
              {filter === 'available' ? 'No new orders right now'
                : filter === 'active' ? 'No active deliveries'
                : 'No completed deliveries yet'}
            </p>
          </div>
        ) : (
          <div style={styles.list}>
            {displayed.map(order => {
              const placedAt = new Date(order.placedAt).toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit'
              })
              const commission = Math.round(order.total * 0.1)

              return (
                <div key={order._id} style={styles.jobCard}>
                  <div style={styles.jobTop}>
                    <div>
                      <p style={styles.shopName}>🍽 {order.shop}</p>
                      <p style={styles.detail}>📍 Deliver to: <strong>{order.room}</strong></p>
                      <p style={styles.detail}>👤 {order.student?.split('@')[0]}</p>
                      <p style={styles.time}>🕐 Placed at {placedAt}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={styles.orderTotal}>₦{order.total.toLocaleString()}</p>
                      <div style={styles.commissionBadge}>
                        Your cut: ₦{commission.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={styles.itemsBox}>
                    {order.items.map((item, i) => (
                      <span key={i} style={styles.itemPill}>
                        {item.name} ×{item.qty}
                      </span>
                    ))}
                  </div>

                  {filter === 'available' && (
                    <button
                      onClick={() => acceptDelivery(order._id)}
                      style={{ ...styles.actionBtn, background: '#6c63ff' }}
                    >
                      🛵 Accept & Pick Up
                    </button>
                  )}

                  {filter === 'active' && (
                    <button
                      onClick={() => markDelivered(order._id)}
                      style={{ ...styles.actionBtn, background: '#10b981' }}
                    >
                      ✅ Mark as Delivered
                    </button>
                  )}

                  {filter === 'done' && (
                    <div style={styles.doneBadge}>✅ Delivered</div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '24px 16px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { background: '#fff', borderRadius: '16px', padding: '16px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: '24px', margin: '0 0 6px' },
  statNum: { margin: '0 0 4px', fontSize: '26px', fontWeight: '800', color: '#6c63ff' },
  statLabel: { margin: 0, fontSize: '11px', color: '#888', fontWeight: '600' },
  tabs: { display: 'flex', gap: '10px', marginBottom: '20px' },
  tab: { padding: '9px 18px', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  empty: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' },
  emptyIcon: { fontSize: '48px', margin: '0 0 12px' },
  emptyText: { color: '#aaa', fontSize: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  jobCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  jobTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px' },
  shopName: { margin: '0 0 6px', fontWeight: '800', fontSize: '16px', color: '#1a1a2e' },
  detail: { margin: '0 0 4px', fontSize: '13px', color: '#555' },
  time: { margin: 0, fontSize: '12px', color: '#aaa' },
  orderTotal: { margin: '0 0 6px', fontWeight: '800', fontSize: '22px', color: '#1a1a2e' },
  commissionBadge: { background: '#ecfdf5', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' },
  itemsBox: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
  itemPill: { background: '#f7f8fc', border: '1px solid #eee', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#555' },
  actionBtn: { width: '100%', padding: '14px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  doneBadge: { textAlign: 'center', padding: '12px', background: '#ecfdf5', color: '#10b981', borderRadius: '10px', fontWeight: '700', fontSize: '14px' },
}