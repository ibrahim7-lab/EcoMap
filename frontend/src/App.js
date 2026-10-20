
import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import ReportForm from './pages/ReportForm';
import ReportDetails from './pages/ReportDetails';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import './App.css';
import Register from './pages/Register';
import UserLogin from './pages/UserLogin';
import MyReports from './pages/MyReports';
import AuthPage from './pages/AuthPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function NotFound() {
  return (
    <section className="not-found">
      <span className="not-found-icon">🌿</span>
      <h1>Page not found</h1>
      <p>
        Looks like this page isn't part of our map.
        Let's get you back to EcoMap.
      </p>
      <Link to="/" className="btn">
        Back to Home
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-inner">
        <Link to="/" className="footer-brand">
          <span className="brand-icon">🌱</span>
          <span>EcoMap</span>
        </Link>

        <p>
          Small actions. Cleaner communities. A greener future.
        </p>

        <span className="footer-copy">
          © {new Date().getFullYear()} EcoMap
        </span>
      </div>
    </footer>
  );
}

function AppLayout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />

      <main className="container app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/report" element={<ReportForm />} />
          <Route path="/reports/:id" element={<ReportDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/my-reports" element={<MyReports />} />
          
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
