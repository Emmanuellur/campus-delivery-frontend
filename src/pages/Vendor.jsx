import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrders, updateStatus } from '../api'

const STATUS_COLORS = {
  pending:      { bg: '#fffbeb', color: '#f59e0b', label: 'New Order' },
  preparing:    { bg: '#eff6ff', color: '#3b82f6', label: 'Preparing' },
  'in transit': { bg: '#f5f3ff', color: '#8b5cf6', label: 'In Transit' },
  delivered:    { bg: '#ecfdf5', color: '#10b981', label: 'Delivered' },
}

export default function Vendor() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')

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

async function handleUpdateStatus(orderId, newStatus) {
  try {
    if (newStatus === 'in transit') {
      await fetch(`http://localhost:5000/api/smart/assign/${orderId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
    }
    await updateStatus(orderId, { status: newStatus })
    loadOrders()
  } catch (err) {
    alert('Failed to update status')
  }
}

  function getNextAction(status) {
    if (status === 'pending')   return { label: '✅ Accept Order', next: 'preparing',   color: '#f59e0b' }
    if (status === 'preparing') return { label: '🍽 Mark Ready',   next: 'in transit',  color: '#6c63ff' }
    return null
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const counts = {
    pending:      orders.filter(o => o.status === 'pending').length,
    preparing:    orders.filter(o => o.status === 'preparing').length,
    'in transit': orders.filter(o => o.status === 'in transit').length,
    delivered:    orders.filter(o => o.status === 'delivered').length,
  }

  const totalEarnings = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0)

  return (
    <div>
      <Navbar title="Vendor Dashboard" />
      <div style={styles.container}>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <p style={styles.statIcon}>🆕</p>
            <p style={styles.statNum}>{counts.pending}</p>
            <p style={styles.statLabel}>New orders</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statIcon}>👨‍🍳</p>
            <p style={styles.statNum}>{counts.preparing}</p>
            <p style={styles.statLabel}>Preparing</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statIcon}>🛵</p>
            <p style={styles.statNum}>{counts['in transit']}</p>
            <p style={styles.statLabel}>In transit</p>
          </div>
          <div style={{ ...styles.statCard, background: '#ecfdf5' }}>
            <p style={styles.statIcon}>💰</p>
            <p style={{ ...styles.statNum, color: '#10b981' }}>₦{totalEarnings.toLocaleString()}</p>
            <p style={styles.statLabel}>Total earned</p>
          </div>
        </div>

        <div style={styles.tabs}>
          {[
            { key: 'all',        label: `All (${orders.length})` },
            { key: 'pending',    label: `New (${counts.pending})` },
            { key: 'preparing',  label: `Preparing (${counts.preparing})` },
            { key: 'in transit', label: `In Transit (${counts['in transit']})` },
            { key: 'delivered',  label: `Done (${counts.delivered})` },
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

        {filtered.length === 0 ? (
          <div style={styles.empty}>
            <p style={styles.emptyIcon}>📭</p>
            <p style={styles.emptyText}>No orders here yet</p>
          </div>
        ) : (
          <div style={styles.list}>
            {filtered.map(order => {
              const action = getNextAction(order.status)
              const statusStyle = STATUS_COLORS[order.status]
              const placedAt = new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={order._id} style={styles.orderCard}>
                  <div style={styles.orderTop}>
                    <div>
                      <div style={styles.orderMeta}>
                        <span style={{ ...styles.badge, background: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.label}
                        </span>
                        <span style={styles.orderTime}>🕐 {placedAt}</span>
                      </div>
                      <p style={styles.studentName}>{order.student?.split('@')[0]}</p>
                      <p style={styles.orderRoom}>📍 {order.room}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={styles.orderTotal}>₦{order.total.toLocaleString()}</p>
                      <p style={styles.orderShop}>{order.shop}</p>
                    </div>
                  </div>

                  <div style={styles.itemsBox}>
                    {order.items.map((item, i) => (
                      <span key={i} style={styles.itemPill}>
                        {item.name} ×{item.qty}
                      </span>
                    ))}
                  </div>

                  {action && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, action.next)}
                      style={{ ...styles.actionBtn, background: action.color }}
                    >
                      {action.label}
                    </button>
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
  tabs: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  tab: { padding: '8px 14px', borderRadius: '24px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  empty: { textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px' },
  emptyIcon: { fontSize: '48px', margin: '0 0 12px' },
  emptyText: { color: '#aaa', fontSize: '15px' },
  list: { display: 'flex', flexDirection: 'column', gap: '14px' },
  orderCard: { background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  orderTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '14px' },
  orderMeta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  badge: { fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px' },
  orderTime: { fontSize: '12px', color: '#aaa' },
  studentName: { margin: '0 0 4px', fontWeight: '700', fontSize: '16px', color: '#1a1a2e' },
  orderRoom: { margin: 0, fontSize: '13px', color: '#666' },
  orderTotal: { margin: '0 0 4px', fontWeight: '800', fontSize: '20px', color: '#1a1a2e' },
  orderShop: { margin: 0, fontSize: '12px', color: '#888' },
  itemsBox: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
  itemPill: { background: '#f7f8fc', border: '1px solid #eee', borderRadius: '20px', padding: '5px 12px', fontSize: '12px', color: '#555' },
  actionBtn: { width: '100%', padding: '13px', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
}