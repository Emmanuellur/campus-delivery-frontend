import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import RiderLogin from './pages/RiderLogin'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Track from './pages/Track'
import Rider from './pages/Rider'
import { StudentRoute, RiderRoute } from './components/ProtectedRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Login />} />
        <Route path="/rider-portal" element={<RiderLogin />} />
        <Route path="/home"         element={<StudentRoute><Home /></StudentRoute>} />
        <Route path="/menu/:shopId" element={<StudentRoute><Menu /></StudentRoute>} />
        <Route path="/track/:orderId" element={<StudentRoute><Track /></StudentRoute>} />
        <Route path="/rider"        element={<RiderRoute><Rider /></RiderRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App