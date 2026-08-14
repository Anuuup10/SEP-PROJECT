import React, { useEffect, useState } from "react";
import khanaLensLogo from "../assets/images/KhanaLens.jpg";
import momoImage from "../assets/images/Momo.jpg";
import healthyFoodOne from "../assets/images/HealthyFood-1.jpg";
import healthyFoodTwo from "../assets/images/HealthyFood-2.jpg";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const foodImages = [
  { src: healthyFoodTwo, alt: "Colorful vegetable protein bowl" },
  { src: healthyFoodOne, alt: "Healthy food bowl" },
  { src: momoImage, alt: "Momo bowl" },
];

function SplashPage() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % foodImages.length);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="app-viewport splash-viewport">
      <main className="mobile-card splash-card">
        <div className="splash-leaf splash-leaf-top" aria-hidden="true" />
        <div className="splash-leaf splash-leaf-side" aria-hidden="true" />
        <div className="splash-dot-grid splash-dot-grid-left" aria-hidden="true" />
        <div className="splash-dot-grid splash-dot-grid-right" aria-hidden="true" />

        <section className="content-header splash-header">
          <div className="logo-badge splash-logo">
            <img src={khanaLensLogo} alt="KhanaLens logo" />
          </div>
          <h1 className="app-title">Khana<span>Lens</span></h1>
          <h2 className="tagline">Scan. Analyze. Eat Smarter.</h2>
          <p className="description">AI-powered nutrition analysis<br />for your everyday meals.</p>
        </section>

        <section className="media-section splash-media">
          <div className="food-image-wrapper splash-food-image">
            {foodImages.map((image, index) => <img key={image.src} src={image.src} alt={image.alt} className={`food-slide ${activeIndex === index ? "active" : ""}`} />)}
          </div>
          <div className="pagination splash-pagination">
            {foodImages.map((_, index) => <button key={index} onClick={() => setActiveIndex(index)} className={`dot ${activeIndex === index ? "active" : ""}`} aria-label={`Slide ${index + 1}`} />)}
          </div>
        </section>

        <div className="button-group splash-actions">
          <Link to="/login" className="btn btn-primary splash-primary">Get Started <ArrowRight size={27} /></Link>
          <Link to="/login" className="btn btn-secondary splash-secondary">Log In</Link>
          <p className="splash-register-prompt">Don’t have an account? <Link to="/register">Sign Up</Link></p>
        </div>
      </main>
    </div>
  );
}

export default SplashPage;
