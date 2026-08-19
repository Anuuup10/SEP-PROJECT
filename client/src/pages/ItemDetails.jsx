import React from "react";
import { ChevronLeft } from "lucide-react";

const defaultItem = {
  name: "Grilled Chicken",
  portion: "150g",
  kcal: 248,
  protein: 46,
  carbs: 0,
  fat: 5,
  fiber: 0,
  sodium: 420,
  image:
    "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=320&q=80",
};

export default function ItemDetails({ item = defaultItem, onBack }) {
  const {
    name = defaultItem.name,
    portion = defaultItem.portion,
    kcal = defaultItem.kcal,
    protein = item.totals?.protein ?? defaultItem.protein,
    carbs = item.totals?.carbohydrates ?? item.totals?.carbs ?? defaultItem.carbs,
    fiber = item.totals?.fiber ?? defaultItem.fiber,
    sodium = item.totals?.sodium ?? defaultItem.sodium,
    image = item.image || defaultItem.image,
    nutritionFacts,
  } = item;
  const fat = item.fats ?? item.fat ?? item.totals?.fat ?? defaultItem.fat;

  const facts =
    nutritionFacts ?? [
      { label: "Calories", value: kcal, unit: "kcal" },
      { label: "Protein", value: protein, unit: "g" },
      { label: "Carbohydrates", value: carbs, unit: "g" },
      { label: "Fat", value: fat, unit: "g" },
      { label: "Fiber", value: fiber, unit: "g" },
      { label: "Sodium", value: sodium, unit: "mg" },
    ];

  return (
    <div className="item-details-page">
      <div className="item-details-card">
        <div className="item-details-nav result-header">
          <button
            className="item-details-icon-btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>
          <div className="result-header-title"><small>KHANALENS</small><strong>Food Details</strong></div>
          <span className="item-details-nav-spacer" aria-hidden="true" />
        </div>

        <div className="item-details-hero">
          <div className="item-details-image-wrap">
            <img src={image} alt={name} />
          </div>

          <div className="item-details-title-block">
            <h1>{name}</h1>
            <p>{portion} (Estimated)</p>
          </div>
        </div>

        <div className="item-details-top-metrics">
          <div className="item-details-calorie-card">
            <strong>{kcal}</strong>
            <span>Calories</span>
          </div>

          <div className="item-details-protein-card">
            <strong>{protein >= 20 ? "High" : "Good"}</strong>
            <span>Protein</span>
          </div>
        </div>

        <div className="item-details-macro-grid">
          <div className="item-details-macro-card">
            <strong>{protein}g</strong>
            <span>Protein</span>
          </div>

          <div className="item-details-macro-card">
            <strong>{carbs}g</strong>
            <span>Carbs</span>
          </div>

          <div className="item-details-macro-card">
            <strong>{fat}g</strong>
            <span>Fat</span>
          </div>
        </div>

        <section className="item-details-nutrition">
          <h2>Nutrition Facts</h2>
          <p>Amount per {portion}</p>

          <div className="item-details-table">
            {facts.map((fact) => (
              <div className="item-details-row" key={fact.label}>
                <span>{fact.label}</span>
                <strong>
                  {fact.value}
                  {fact.unit ? <small> {fact.unit}</small> : null}
                </strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
