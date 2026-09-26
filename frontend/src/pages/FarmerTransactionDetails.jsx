import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const content = {
  en: {
    title: "Transaction Details",
    subtitle: "Commercial deal details, costs management, and net realisation calculation.",
    dealOverview: "DEAL OVERVIEW",
    buyerInfo: "Buyer Information",
    cropInfo: "Crop Details",
    financialSummary: "FINANCIAL & COST BREAKDOWN",
    grossAmount: "Gross Sale Amount",
    costsHeader: "Deductible Costs (Editable by Farmer)",
    transportCost: "Transport Cost (₹)",
    loadingCost: "Loading Cost (₹)",
    storageCost: "Storage Cost (₹)",
    otherCosts: "Other Costs (₹)",
    totalCosts: "Total Costs",
    netRealisation: "NET REALISATION FOR FARMER",
    saveCostsBtn: "💾 Save Costs",
    savingCosts: "Saving Costs...",
    statusHeader: "TRANSACTION STATUS",
    currentStatus: "Current Status:",
    confirmBtn: "✅ Confirm Transaction",
    completeBtn: "🎉 Complete Transaction",
    cancelBtn: "❌ Cancel Transaction",
    confirmPrompt: "Confirm this transaction deal?",
    completePrompt: "Mark this transaction as successfully completed?",
    cancelPrompt: "Are you sure you want to cancel this transaction?",
    saveCostsSuccess: "Costs updated and Net Realisation recalculated!",
    statusUpdateSuccess: "Transaction status updated to ",
    backBtn: "← Back to My Transactions",
    fetchError: "Failed to load transaction details",
    initiated: "🟡 Initiated",
    confirmed: "🔵 Confirmed",
    completed: "🟢 Completed",
    cancelled: "⚪ Cancelled"
  },
  hi: {
    title: "सौदा / लेनदेन विवरण",
    subtitle: "व्यावसायिक सौदा विवरण, लागत प्रबंधन और शुद्ध कमाई (Net Realisation) गणना।",
    dealOverview: "सौदा सारांश",
    buyerInfo: "खरीदार की जानकारी",
    cropInfo: "फसल का विवरण",
    financialSummary: "वित्तीय और लागत विवरण",
    grossAmount: "कुल बिक्री राशि (Gross Sale)",
    costsHeader: "कटौती योग्य लागत (किसान द्वारा संपादन योग्य)",
    transportCost: "परिवहन लागत (₹)",
    loadingCost: "लोडिंग / हमाली लागत (₹)",
    storageCost: "भंडारण / गोदाम लागत (₹)",
    otherCosts: "अन्य खर्चे (₹)",
    totalCosts: "कुल खर्चे (Total Costs)",
    netRealisation: "किसान की शुद्ध कमाई (NET REALISATION)",
    saveCostsBtn: "💾 लागत सेव करें",
    savingCosts: "सेव हो रहा है...",
    statusHeader: "लेनदेन की स्थिति",
    currentStatus: "वर्तमान स्थिति:",
    confirmBtn: "✅ सौदे की पुष्टि करें",
    completeBtn: "🎉 सौदा पूरा करें",
    cancelBtn: "❌ सौदा रद्द करें",
    confirmPrompt: "क्या आप इस सौदे की पुष्टि करना चाहते हैं?",
    completePrompt: "क्या आप इस सौदे को सफलतापूर्वक पूरा मार्क करना चाहते हैं?",
    cancelPrompt: "क्या आप वाकई इस सौदे को रद्द करना चाहते हैं?",
    saveCostsSuccess: "लागत अपडेट हो गई और शुद्ध कमाई की पुनः गणना की गई!",
    statusUpdateSuccess: "लेनदेन की स्थिति अपडेट हो गई: ",
    backBtn: "← मेरे सौदों पर वापस जाएं",
    fetchError: "लेनदेन विवरण लोड करने में विफल",
    initiated: "🟡 शुरू किया गया",
    confirmed: "🔵 की पुष्टि की गई",
    completed: "🟢 पूरा हुआ",
    cancelled: "⚪ रद्द किया गया"
  }
};

function FarmerTransactionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState(localStorage.getItem("farmerLang") || "en");
  const t = content[lang];

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Costs form state
  const [costs, setCosts] = useState({
    transportCost: 0,
    loadingCost: 0,
    storageCost: 0,
    otherCosts: 0
  });
  const [savingCosts, setSavingCosts] = useState(false);
  const [costsMsg, setCostsMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTransactionDetails();
  }, [id]);

  const fetchTransactionDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || t.fetchError);
      }

      const tx = data.transaction;
      setTransaction(tx);
      setCosts({
        transportCost: tx.transportCost || 0,
        loadingCost: tx.loadingCost || 0,
        storageCost: tx.storageCost || 0,
        otherCosts: tx.otherCosts || 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCostsChange = (e) => {
    const { name, value } = e.target;
    setCosts(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCosts = async (e) => {
    e.preventDefault();
    setCostsMsg("");
    setSavingCosts(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(`http://localhost:5000/api/transactions/${id}/costs`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          transportCost: Number(costs.transportCost) || 0,
          loadingCost: Number(costs.loadingCost) || 0,
          storageCost: Number(costs.storageCost) || 0,
          otherCosts: Number(costs.otherCosts) || 0
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to save costs");
      }

      setTransaction(data.transaction);
      setCostsMsg(t.saveCostsSuccess);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingCosts(false);
    }
  };

  const handleStatusUpdate = async (newStatus, promptText) => {
    if (!window.confirm(promptText)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      const res = await fetch(`http://localhost:5000/api/transactions/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update status");
      }

      alert(t.statusUpdateSuccess + newStatus);
      fetchTransactionDetails();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatus = (status) => {
    if (status === "completed") return <span style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 16px', borderRadius: '12px', fontWeight: 'bold' }}>{t.completed}</span>;
    if (status === "confirmed") return <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 16px', borderRadius: '12px', fontWeight: 'bold' }}>{t.confirmed}</span>;
    if (status === "cancelled") return <span style={{ background: '#f5f5f5', color: '#616161', padding: '6px 16px', borderRadius: '12px', fontWeight: 'bold' }}>{t.cancelled}</span>;
    return <span style={{ background: '#fff3e0', color: '#e65100', padding: '6px 16px', borderRadius: '12px', fontWeight: 'bold' }}>{t.initiated}</span>;
  };

  if (loading) return <div className="auth-page">Loading transaction...</div>;

  if (error || !transaction) return (
    <div className="farmer-dashboard">
      <main className="dashboard-content" style={{ margin: "0 auto", maxWidth: "600px", padding: "40px 20px" }}>
        <Link to="/farmer/transactions" className="back-button">← Back to Transactions</Link>
        <div className="error-box" style={{ marginTop: '20px' }}>{error || "Transaction not found"}</div>
      </main>
    </div>
  );

  return (
    <div className="farmer-dashboard">
      <main className="dashboard-content" style={{ margin: "0 auto", maxWidth: "900px", padding: "30px 20px" }}>
        
        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link to="/farmer/transactions" className="back-button" style={{ margin: 0 }}>
            {t.backBtn}
          </Link>
          <button 
            onClick={() => {
              const newLang = lang === "en" ? "hi" : "en";
              setLang(newLang);
              localStorage.setItem("farmerLang", newLang);
            }} 
            style={{ padding: '8px 16px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            🌐 {lang === "en" ? "हिंदी" : "English"}
          </button>
        </div>

        <div className="section-heading-small" style={{ marginBottom: '25px' }}>
          <h1 style={{ fontSize: '28px', color: '#1c3821', margin: '0 0 5px' }}>📦 {t.title}</h1>
          <p style={{ color: '#666', margin: 0 }}>{t.subtitle}</p>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e0e8de', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '30px' }}>
          
          {/* HEADER STATUS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '25px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#1c3821' }}>🌾 {transaction.crop?.cropName}</h2>
              <div style={{ color: '#666', fontSize: '13px', marginTop: '3px' }}>
                Transaction ID: {transaction._id}
              </div>
            </div>
            <div>{renderStatus(transaction.status)}</div>
          </div>

          {/* OVERVIEW CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#fafafa', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
              <h4 style={{ margin: '0 0 10px', color: '#555', fontSize: '14px' }}>👤 {t.buyerInfo}</h4>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{transaction.buyer?.name}</div>
              {transaction.buyer?.businessName && <div style={{ fontSize: '13px', color: '#666' }}>🏢 {transaction.buyer.businessName}</div>}
              {transaction.buyer?.phone && <div style={{ fontSize: '13px', color: '#666' }}>📞 {transaction.buyer.phone}</div>}
            </div>

            <div style={{ background: '#fafafa', padding: '15px', borderRadius: '10px', border: '1px solid #eee' }}>
              <h4 style={{ margin: '0 0 10px', color: '#555', fontSize: '14px' }}>🌾 {t.cropInfo}</h4>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{transaction.quantity} {transaction.crop?.unit || "quintal"}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>Agreed: ₹{transaction.agreedPrice} / {transaction.crop?.unit || "quintal"}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>📍 {transaction.crop?.district}, {transaction.crop?.state}</div>
            </div>
          </div>

          {/* PROMINENT FINANCIAL SUMMARY */}
          <div style={{ background: '#f8faf7', border: '1px solid #d4e3d3', borderRadius: '16px', padding: '25px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 20px', color: '#1c3821', fontSize: '18px' }}>💵 {t.financialSummary}</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #e0e8de' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>{t.grossAmount}</span>
                <strong style={{ display: 'block', fontSize: '22px', color: '#333', marginTop: '4px' }}>
                  ₹{transaction.grossAmount.toLocaleString()}
                </strong>
                <small style={{ color: '#888' }}>({transaction.quantity} × ₹{transaction.agreedPrice})</small>
              </div>

              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #ffebee' }}>
                <span style={{ color: '#666', fontSize: '13px' }}>{t.totalCosts}</span>
                <strong style={{ display: 'block', fontSize: '22px', color: '#d32f2f', marginTop: '4px' }}>
                  - ₹{transaction.totalCosts.toLocaleString()}
                </strong>
                <small style={{ color: '#888' }}>(Transport + Loading + Storage + Other)</small>
              </div>
            </div>

            {/* NET REALISATION BOX */}
            <div style={{ background: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2e7d32', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {t.netRealisation}
              </div>
              <div style={{ fontSize: '36px', fontWeight: '900', color: '#1b5e20', margin: '5px 0' }}>
                ₹{transaction.netRealisation.toLocaleString()}
              </div>
              <small style={{ color: '#33691e', fontWeight: '500' }}>
                (Actual Net Income Received by Farmer after Deductions)
              </small>
            </div>
          </div>

          {/* EDITABLE COSTS FORM */}
          {transaction.status !== "cancelled" && transaction.status !== "completed" && (
            <form onSubmit={handleSaveCosts} style={{ background: 'white', border: '1px solid #e0e8de', borderRadius: '14px', padding: '25px', marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 10px', color: '#1c3821', fontSize: '17px' }}>📝 {t.costsHeader}</h3>
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>Enter all actual expenses incurred. Net Realisation will be automatically recalculated.</p>

              {costsMsg && <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '10px 15px', borderRadius: '8px', marginBottom: '15px', fontWeight: 'bold', fontSize: '13px' }}>{costsMsg}</div>}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#444' }}>{t.transportCost}</label>
                  <input
                    type="number"
                    name="transportCost"
                    value={costs.transportCost}
                    onChange={handleCostsChange}
                    min="0"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#444' }}>{t.loadingCost}</label>
                  <input
                    type="number"
                    name="loadingCost"
                    value={costs.loadingCost}
                    onChange={handleCostsChange}
                    min="0"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#444' }}>{t.storageCost}</label>
                  <input
                    type="number"
                    name="storageCost"
                    value={costs.storageCost}
                    onChange={handleCostsChange}
                    min="0"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#444' }}>{t.otherCosts}</label>
                  <input
                    type="number"
                    name="otherCosts"
                    value={costs.otherCosts}
                    onChange={handleCostsChange}
                    min="0"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingCosts}
                className="auth-submit"
                style={{ width: 'auto', padding: '12px 25px', background: '#1976d2', margin: 0 }}
              >
                {savingCosts ? t.savingCosts : t.saveCostsBtn}
              </button>
            </form>
          )}

          {/* STATUS CONTROL ACTIONS */}
          <div style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: '14px', padding: '20px' }}>
            <h3 style={{ margin: '0 0 15px', color: '#333', fontSize: '16px' }}>⚙️ {t.statusHeader}</h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <span style={{ color: '#666', fontSize: '14px', marginRight: '8px' }}>{t.currentStatus}</span>
                {renderStatus(transaction.status)}
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {transaction.status === "initiated" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("cancelled", t.cancelPrompt)}
                      disabled={actionLoading}
                      style={{ padding: '10px 18px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("confirmed", t.confirmPrompt)}
                      disabled={actionLoading}
                      style={{ padding: '10px 22px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t.confirmBtn}
                    </button>
                  </>
                )}

                {transaction.status === "confirmed" && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate("cancelled", t.cancelPrompt)}
                      disabled={actionLoading}
                      style={{ padding: '10px 18px', background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate("completed", t.completePrompt)}
                      disabled={actionLoading}
                      style={{ padding: '10px 22px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      {t.completeBtn}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default FarmerTransactionDetails;
