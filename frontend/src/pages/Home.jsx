import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* NAVBAR */}
      <header className="navbar">

        <div
          className="logo"
          onClick={() => navigate("/")}
        >
          <span>🌾</span>
          Human<span>Link</span>
        </div>

        <nav>
          <button onClick={() => navigate("/")}>
            Home
          </button>

          <a href="#features">
            Features
          </a>

          <a href="#how-it-works">
            How It Works
          </a>

          <a href="#about">
            About
          </a>
        </nav>

        <div className="nav-actions">

          <button
            className="nav-login"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            className="nav-register"
            onClick={() => navigate("/register")}
          >
            Get Started
          </button>

        </div>

      </header>


      {/* HERO */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="hero-badge">
            🌱 Simple. Transparent. Farmer First.
          </div>

          <h1>
            Better Markets,
            <br />
            <span>Better Opportunities.</span>
          </h1>

          <p>
            HumanLink helps farmers check market prices,
            find buyers and sell their crops with confidence.
          </p>

          <div className="hero-buttons">

            <button
              className="primary-button"
              onClick={() => navigate("/register")}
            >
              Get Started →
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              How It Works
            </button>

          </div>

          <div className="hero-stats">

            <div>
              <strong>10K+</strong>
              <span>Farmers</span>
            </div>

            <div>
              <strong>500+</strong>
              <span>Buyers</span>
            </div>

            <div>
              <strong>100+</strong>
              <span>Markets</span>
            </div>

          </div>

        </div>


        {/* HERO VISUAL */}
        <div className="hero-visual">

          <div className="market-card">

            <div className="market-card-top">
              <span>🌾</span>

              <div>
                <small>Today's Market Price</small>
                <h3>Wheat</h3>
              </div>
            </div>

            <div className="price">
              ₹2,450
              <small>/ Quintal</small>
            </div>

            <div className="price-up">
              ↑ 8.4% from yesterday
            </div>

            <div className="market-location">
              📍 Punjab Markets
            </div>

          </div>


          <div className="offer-card">

            <span>🤝</span>

            <div>
              <small>New Buyer Offer</small>
              <strong>₹2,520 / Quintal</strong>
              <em>✓ Verified Buyer</em>
            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section
        className="section"
        id="features"
      >

        <div className="section-title">

          <span>WHAT HUMANLINK OFFERS</span>

          <h2>
            Everything you need,
            <br />
            in one simple place.
          </h2>

          <p>
            No complicated process. Just the important
            information and actions you need.
          </p>

        </div>


        <div className="feature-grid">

          <div className="feature-card">

            <div className="feature-icon">
              📊
            </div>

            <h3>
              Market Prices
            </h3>

            <p>
              See current crop prices and compare
              different markets.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🤝
            </div>

            <h3>
              Find Buyers
            </h3>

            <p>
              Connect directly with verified buyers
              interested in your crops.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              💰
            </div>

            <h3>
              Compare Offers
            </h3>

            <p>
              See buyer offers clearly before
              deciding to sell.
            </p>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              🔐
            </div>

            <h3>
              Safe & Transparent
            </h3>

            <p>
              Secure accounts and transparent
              transactions.
            </p>

          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section
        className="section how-section"
        id="how-it-works"
      >

        <div className="section-title">

          <span>HOW IT WORKS</span>

          <h2>
            Four simple steps.
          </h2>

          <p>
            HumanLink is designed for everyone,
            including first-time users.
          </p>

        </div>


        <div className="steps-grid">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              👤
            </div>

            <h3>
              Create Account
            </h3>

            <p>
              Create your farmer account in a few
              simple steps.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🌾
            </div>

            <h3>
              Add Your Crop
            </h3>

            <p>
              Tell us what crop you want to sell
              and how much you have.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              🤝
            </div>

            <h3>
              Receive Offers
            </h3>

            <p>
              Buyers can see your crop and
              send offers.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              ✅
            </div>

            <h3>
              Sell With Confidence
            </h3>

            <p>
              Compare offers and choose what
              works for you.
            </p>

          </div>

        </div>

      </section>


      {/* CTA */}
      <section
        className="cta"
        id="about"
      >

        <div>

          <span>
            BUILT FOR FARMERS
          </span>

          <h2>
            Your crop.
            <br />
            Your choice.
            <br />
            Your market.
          </h2>

          <p>
            Start using HumanLink today.
          </p>

        </div>

        <button
          className="cta-button"
          onClick={() => navigate("/register")}
        >
          Create My Account →
        </button>

      </section>


      {/* FOOTER */}
      <footer>

        <div className="logo">
          🌾 Human<span>Link</span>
        </div>

        <p>
          Connecting farmers with better market opportunities.
        </p>

        <button
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </footer>

    </div>
  );
}

export default Home;