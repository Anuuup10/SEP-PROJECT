import React, { useEffect, useState } from "react";
import khanaLensLogo from "../assets/images/KhanaLens.jpg";
import momoImage from "../assets/images/Momo.jpg";
import healthyFoodOne from "../assets/images/HealthyFood-1.jpg";
import healthyFoodTwo from "../assets/images/HealthyFood-2.jpg";

const foodImages = [
  { src: momoImage, alt: "Momo bowl" },
  { src: healthyFoodOne, alt: "Healthy food bowl" },
  { src: healthyFoodTwo, alt: "Vegetable protein bowl" },
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
    <div className="app-viewport">
      <div className="mobile-card">

        {/* Background Decorative Plant Leaves */}
        <svg
          className="bg-leaf-top"
          viewBox="0 0 100 100"
          fill="#3b8770"
        >
          <path d="M50 0 C70 30 90 40 100 100 C40 90 30 70 0 50 C30 40 40 20 50 0 Z" />
        </svg>

        <svg
          className="bg-leaf-bottom"
          viewBox="0 0 100 100"
          fill="#3b8770"
        >
          <path d="M0 100 C30 70 40 30 100 0 C70 40 50 70 0 100 Z" />
        </svg>

        {/* Header / Logo Section */}
        <div className="content-header">

          <div className="logo-badge">
            <img
              src={khanaLensLogo}
              alt="KhanaLens Logo"
            />
          </div>

          <h1 className="app-title">
            Khana<span>Lens</span>
          </h1>

          <h2 className="tagline">
            Scan. Analyze. Eat Smarter.
          </h2>

          <p className="description">
            AI-powered nutrition analysis for your everyday meals.
          </p>

        </div>

        {/* Center Media Section */}
        <div className="media-section">

          <div className="food-image-wrapper">
            {foodImages.map((image, index) => (
              <img
                key={image.src}
                src={image.src}
                alt={image.alt}
                className={`food-slide ${
                  activeIndex === index ? "active" : ""
                }`}
              />
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="pagination">
            {foodImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`dot ${
                  activeIndex === index ? "active" : ""
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

        </div>

        {/* Buttons */}
        <div className="button-group">
          <button className="btn btn-primary">
            Get Started
          </button>

          <button className="btn btn-secondary">
            Log In
          </button>
        </div>

      </div>
    </div>
  );
}

export default SplashPage;
