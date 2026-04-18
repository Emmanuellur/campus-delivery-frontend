import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getShop, placeOrder } from '../api'

export default function Menu() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState(null)
  const [cart, setCart] = useState({})
  const [room, setRoom] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getShop(shopId)
      .then(res => { setShop(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [shopId])

  function addToCart(item) {
    setCart(prev => ({
      ...prev,
      [item._id]: { ...item, qty: (prev[item._id]?.qty || 0) + 1 }
    }))
  }

  function removeFromCart(item) {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[item._id]?.qty > 1) updated[item._id].qty -= 1
      else delete updated[item._id]
      return updated
    })
  }

  const cartItems = Object.values(cart)
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)
  const maxTime = cartItems.length > 0 ? Math.max(...cartItems.map(i => i.time)) : 0

async function handlePlaceOrder() {
  if (cartItems.length === 0) return alert('Add items to your cart first!')
  if (!room) return alert('Please enter your room or hostel!')

  try {
    const res = await placeOrder({
      shop: shop.name,
      shopId: shop._id,
      items: cartItems,
      total,
      room,
      eta: maxTime + 10,
      placedAt: new Date().toISOString(),
    })
    setOrdered(true)
    setTimeout(() => navigate(`/track/${res.data._id}`), 1500)
  } catch (err) {
    console.log(err)
    alert('Failed to place order. Try again!')
  }
}

  if (loading) return (
    <div>
      <Navbar title="Menu" back="/home" />
      <div style={styles.center}>Loading menu...</div>
    </div>
  )

  if (!shop) return (
    <div>
      <Navbar title="Menu" back="/home" />
      <div style={styles.center}>Shop not found.</div>
    </div>
  )

  if (ordered) {
    return (
      <div style={styles.successPage}>
        <div style={styles.successCard}>
          <div style={styles.checkCircle}>✓</div>
          <h2 style={{ margin: '0 0 8px', color: '#1a1a2e' }}>Order Placed!</h2>
          <p style={{ color: '#888', margin: 0 }}>Taking you to tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar title={shop.name} back="/home" />
      <div style={styles.container}>

        <div style={styles.shopHero}>
          <span style={styles.shopEmoji}>{shop.emoji}</span>
          <div>
            <h2 style={styles.shopName}>{shop.name}</h2>
            <p style={styles.shopSub}>{shop.items.length} items available</p>
          </div>
        </div>

        <div style={styles.itemsList}>
          {shop.items.map(item => (
            <div key={item._id} style={styles.itemCard}>
              <div style={styles.itemInfo}>
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemMeta}>
                  <span style={styles.price}>₦{item.price.toLocaleString()}</span>
                  <span style={styles.dot}>·</span>
                  <span style={styles.prepTime}>{item.time} mins prep</span>
                </p>
              </div>
              <div style={styles.qtyControl}>
                {cart[item._id] ? (
                  <>
                    <button onClick={() => removeFromCart(item)} style={styles.qtyBtn}>−</button>
                    <span style={styles.qtyNum}>{cart[item._id].qty}</span>
                    <button onClick={() => addToCart(item)} style={{ ...styles.qtyBtn, background: '#6c63ff', color: '#fff', border: 'none' }}>+</button>
                  </>
                ) : (
                  <button onClick={() => addToCart(item)} style={styles.addBtn}>+ Add</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {cartItems.length > 0 && (
          <div style={styles.cartBox}>
            <h3 style={styles.cartTitle}>🛒 Your Order</h3>

            {cartItems.map(i => (
              <div key={i._id} style={styles.cartRow}>
                <span style={styles.cartItemName}>{i.name} × {i.qty}</span>
                <span style={styles.cartItemPrice}>₦{(i.price * i.qty).toLocaleString()}</span>
              </div>
            ))}

            <div style={styles.divider} />

            <div style={styles.cartRow}>
              <strong style={{ color: '#1a1a2e' }}>Total</strong>
              <strong style={{ color: '#6c63ff', fontSize: '18px' }}>₦{total.toLocaleString()}</strong>
            </div>

            <div style={{ ...styles.cartRow, marginTop: '4px' }}>
              <span style={{ color: '#888', fontSize: '13px' }}>Estimated delivery</span>
              <span style={{ color: '#6c63ff', fontSize: '13px', fontWeight: '600' }}>{maxTime + 10} mins</span>
            </div>

            <input
              style={styles.roomInput}
              placeholder="📍 Enter your room / hostel (e.g. Block C Room 14)"
              value={room}
              onChange={e => setRoom(e.target.value)}
            />

            <button onClick={handlePlaceOrder} style={styles.orderBtn}>
              Place Order · ₦{total.toLocaleString()}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: { maxWidth: '700px', margin: '0 auto', padding: '24px 16px' },
  center: { textAlign: 'center', padding: '60px', color: '#888' },
  shopHero: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px', background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  shopEmoji: { fontSize: '48px' },
  shopName: { margin: '0 0 4px', fontSize: '20px', fontWeight: '800', color: '#1a1a2e' },
  shopSub: { margin: 0, color: '#888', fontSize: '14px' },
  itemsList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  itemCard: { background: '#fff', borderRadius: '14px', padding: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  itemInfo: { flex: 1 },
  itemName: { margin: '0 0 6px', fontWeight: '700', fontSize: '15px', color: '#1a1a2e' },
  itemMeta: { margin: 0, display: 'flex', alignItems: 'center', gap: '6px' },
  price: { fontSize: '14px', fontWeight: '700', color: '#6c63ff' },
  dot: { color: '#ddd' },
  prepTime: { fontSize: '12px', color: '#aaa' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '10px' },
  qtyBtn: { width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #eee', background: '#fff', cursor: 'pointer', fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  qtyNum: { fontWeight: '700', fontSize: '16px', minWidth: '24px', textAlign: 'center', color: '#1a1a2e' },
  addBtn: { padding: '8px 18px', background: '#f0efff', color: '#6c63ff', border: '2px solid #6c63ff', borderRadius: '24px', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  cartBox: { background: '#fff', borderRadius: '20px', padding: '24px', boxShadow: '0 8px 32px rgba(108,99,255,0.12)', border: '1px solid #f0efff' },
  cartTitle: { margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  cartRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  cartItemName: { fontSize: '14px', color: '#555' },
  cartItemPrice: { fontSize: '14px', fontWeight: '600', color: '#1a1a2e' },
  divider: { borderTop: '2px dashed #f0f0f0', margin: '16px 0' },
  roomInput: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '2px solid #eee', fontSize: '14px', background: '#f7f8fc', marginTop: '16px', marginBottom: '14px' },
  orderBtn: { width: '100%', padding: '16px', background: '#6c63ff', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,99,255,0.4)' },
  successPage: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  successCard: { background: '#fff', borderRadius: '24px', padding: '56px 48px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  checkCircle: { width: '72px', height: '72px', background: '#6c63ff', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(108,99,255,0.4)' },
}