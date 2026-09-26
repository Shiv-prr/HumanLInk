import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function BuyerDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [availableCropsCount, setAvailableCropsCount] = useState(0);
  const [offersSentCount, setOffersSentCount] = useState(0);
  const [acceptedOffersCount, setAcceptedOffersCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        
        // Fetch available crops count
        const cropsRes = await fetch("http://localhost:5000/api/marketplace/crops");
        const cropsData = await cropsRes.json();
        if (cropsRes.ok && cropsData.success) {
          setAvailableCropsCount(cropsData.count || 0);
        }

        // Fetch my sent offers
        if (token) {
          const offersRes = await fetch("http://localhost:5000/api/offers/my", {
            headers: { Authorization: `Bearer ${token}` }
          });
          const offersData = await offersRes.json();
          if (offersRes.ok && offersData.success && Array.isArray(offersData.offers)) {
            setOffersSentCount(offersData.offers.length);
            const accepted = offersData.offers.filter(o => o.status === "accepted").length;
            setAcceptedOffersCount(accepted);
          }
        }
      } catch (e) {}
    };
    fetchStats();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="farmer-dashboard">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar" style={{ background: '#0e1c26' }}>
        <div className="dashboard-logo" style={{ color: '#ffffff' }}>
          🏪 Human<span>Link</span>
        </div>

        <nav>
          <button className="dashboard-nav active">
            🏠 <span>Home</span>
          </button>

          <Link to="/buyer/marketplace" className="dashboard-nav" style={{ textDecoration: 'none', color: '#c2c7d0' }}>
            🔎 <span>Find Crops</span>
          </Link>

          <Link to="/buyer/offers" className="dashboard-nav" style={{ textDecoration: 'none', color: '#c2c7d0' }}>
            📨 <span>My Offers</span>
          </Link>

          <button className="dashboard-nav">
            🤝 <span>My Deals</span>
          </button>

          <Link to="/buyer/profile" className="dashboard-nav" style={{ textDecoration: 'none', color: '#c2c7d0' }}>
            👤 <span>My Profile</span>
          </Link>
        </nav>

        <div className="dashboard-bottom">
          <button className="dashboard-nav">
            ❓ <span>Help</span>
          </button>

          <button className="dashboard-nav" onClick={logout}>
            🚪 <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p>Welcome, 👋</p>
            <h1>{user.name ? user.name : "Buyer"}</h1>
            {user.businessName && (
              <p style={{ margin: "5px 0 0", color: "#666" }}>
                🏢 {user.businessName}
              </p>
            )}
          </div>

          <div className="profile-circle" style={{ background: '#2c3e50', color: 'white' }}>
            {user.name ? user.name.charAt(0).toUpperCase() : "B"}
          </div>
        </header>

        {/* BIG ACTIONS */}
        <section className="big-actions">
          <button className="big-action" onClick={() => navigate("/buyer/marketplace")} style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <div className="big-action-icon blue">🔎</div>
            <div>
              <h3 style={{ color: '#212529' }}>Find Crops</h3>
              <p>Search for crops available from farmers.</p>
            </div>
            <strong style={{ color: '#495057' }}>→</strong>
          </button>

          <button className="big-action" onClick={() => navigate("/buyer/offers")} style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <div className="big-action-icon orange">📨</div>
            <div>
              <h3 style={{ color: '#212529' }}>My Offers</h3>
              <p>View the offers you have sent to farmers.</p>
            </div>
            <strong style={{ color: '#495057' }}>→</strong>
          </button>

          <button className="big-action" style={{ background: '#f8f9fa', border: '1px solid #dee2e6' }}>
            <div className="big-action-icon">🤝</div>
            <div>
              <h3 style={{ color: '#212529' }}>My Deals</h3>
              <p>View your completed deals.</p>
            </div>
            <strong style={{ color: '#495057' }}>→</strong>
          </button>
        </section>

        {/* STATS */}
        <section className="activity-section">
          <div className="section-heading-small">
            <span>QUICK VIEW</span>
            <h2>Dashboard Statistics</h2>
          </div>

          <div className="activity-grid">
            <div className="activity-card" style={{ background: '#f1f3f5', cursor: 'pointer' }} onClick={() => navigate("/buyer/marketplace")}>
              <span>🔎</span>
              <strong>{availableCropsCount}</strong>
              <p>Crops Available</p>
            </div>

            <div className="activity-card" style={{ background: '#f1f3f5', cursor: 'pointer' }} onClick={() => navigate("/buyer/offers")}>
              <span>📨</span>
              <strong>{offersSentCount}</strong>
              <p>Offers Sent</p>
            </div>

            <div className="activity-card" style={{ background: '#f1f3f5', cursor: 'pointer' }} onClick={() => navigate("/buyer/offers")}>
              <span>🤝</span>
              <strong>{acceptedOffersCount}</strong>
              <p>Offers Accepted</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );

}

export default BuyerDashboard;
