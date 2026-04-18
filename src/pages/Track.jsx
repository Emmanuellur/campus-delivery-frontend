import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getOrder, getOrders } from '../api'

const STATUS_STEPS = ['pending', 'in transit', 'delivered']

const STATUS_INFO = {
  pending:      { text: 'Looking for a rider to pick up your order...', color: '#f59e0b', bg: '#fffbeb', icon: '⏳' },
  'in transit': { text: 'Order accepted! Your rider will call you soon', color: '#8b5cf6', bg: '#f5f3ff', icon: '🛵' },
  delivered:    { text: 'Delivered! Enjoy your order 🎉',                color: '#10b981', bg: '#ecfdf5', icon: '✅' },
}

export default function Track() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    loadOrder()
    const interval = setInterval(loadOrder, 3000)
    return () => clearInterval(interval)
  }, [orderId])

  async function loadOrder() {
    try {
      const res = await getOrder(orderId)
      setOrder(res.data)
    } catch (err) {
      try {
        const all = await getOrders()
        const found = all.data.find(o => o._id === orderId)
        if (found) setOrder(found)
      } catch (e) {
        console.log(e)
      }
    }
  }

  if (!order) return (
    <div>
      <Navbar title="Track Order" back="/home" />
      <div style={styles.center}>Loading your order...</div>
    </div>
  )

  const currentStep = STATUS_STEPS.indexOf(order.status)
  const info = STATUS_INFO[order.status]

  return (
    <div>
      <Navbar title="Track Order" back="/home" />
      <div style={styles.container}>

        {/* Status banner */}
        <div style={{ ...styles.banner, background: info.bg, border: `2px solid ${info.color}20` }}>
          <span style={styles.bannerIcon}>{info.icon}</span>
          <div>
            <p style={{ ...styles.bannerText, color: info.color }}>{info.text}</p>
            {order.status === 'in transit' && order.rider && (
              <p style={styles.riderName}>Rider: <strong>{order.rider}</strong></p>
            )}
          </div>
        </div>

        {/* Progress steps */}
        <div style={styles.progressCard}>
          {STATUS_STEPS.map((step, i) => (
            <div key={step} style={styles.stepWrapper}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  ...styles.dot,
                  background: i <= currentStep ? info.color : '#e5e7eb',
                  boxShadow: i === currentStep ? `0 0 0 4px ${info.color}30` : 'none',
                }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ ...styles.line, background: i < currentStep ? info.color : '#e5e7eb' }} />
                )}
              </div>
              <p style={{
                ...styles.stepLabel,
                color: i <= currentStep ? info.color : '#aaa',
                fontWeight: i === currentStep ? '700' : '500',
              }}>
                {step === 'in transit' ? 'Accepted' : step.charAt(0).toUpperCase() + step.slice(1)}
              </p>
            </div>
          ))}
        </div>

        {/* Order details */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Order Details</h3>
          {[
            { label: 'Shop',        value: order.shop },
            { label: 'Deliver to',  value: order.room },
            { label: 'Order total', value: `₦${order.total.toLocaleString()}` },
            order.status === 'in transit' && { label: 'Your rider', value: order.rider, highlight: true },
          ].filter(Boolean).map((row, i) => (
            <div key={i} style={styles.row}>
              <span style={styles.rowLabel}>{row.label}</span>
              <span style={{
                ...styles.rowValue,
                color: row.highlight ? info.color : '#1a1a2e',
                fontWeight: row.highlight ? '700' : '600'
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Items */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Items Ordered</h3>
          {order.items.map((item, i) => (
            <div key={i} style={styles.row}>
              <span style={styles.rowLabel}>{item.name} × {item.qty}</span>
              <span style={styles.rowValue}>₦{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {order.status === 'delivered' && (
          <button onClick={() => navigate('/home')} style={styles.orderAgainBtn}>
            🍛 Order Again
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '24px 16px' },
  center: { textAlign: 'center', padding: '60px', color: '#888' },
  banner: { borderRadius: '16px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '16px' },
  bannerIcon: { fontSize: '36px', flexShrink: 0 },
  bannerText: { margin: 0, fontWeight: '700', fontSize: '15px' },
  riderName: { margin: '4px 0 0', fontSize: '13px', color: '#666' },
  progressCard: { background: '#fff', borderRadius: '16px', padding: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  stepWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '8px' },
  dot: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '700', zIndex: 1 },
  line: { position: 'absolute', top: '18px', left: '60%', width: '100%', height: '3px', borderRadius: '2px' },
  stepLabel: { fontSize: '11px', textAlign: 'center', textTransform: 'capitalize', margin: 0 },
  card: { background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardTitle: { margin: '0 0 16px', fontSize: '15px', fontWeight: '700', color: '#1a1a2e' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  rowLabel: { fontSize: '13px', color: '#888' },
  rowValue: { fontSize: '14px' },
  orderAgainBtn: { width: '100%', padding: '16px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,99,255,0.4)' },
}