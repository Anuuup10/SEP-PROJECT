import React, { useState } from "react";
import { ChevronLeft, Heart } from "lucide-react";

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
  const [isLiked, setIsLiked] = useState(!!item.isFavorite);

  const {
    name = defaultItem.name,
    portion = defaultItem.portion,
    kcal = defaultItem.kcal,
    protein = defaultItem.protein,
    carbs = defaultItem.carbs,
    fiber = defaultItem.fiber,
    sodium = defaultItem.sodium,
    image = defaultItem.image,
    nutritionFacts,
  } = item;
  const fat = item.fats ?? defaultItem.fat;

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
        <div className="item-details-nav">
          <button
            className="item-details-icon-btn"
            onClick={onBack}
            aria-label="Go back"
          >
            <ChevronLeft size={20} strokeWidth={2.4} />
          </button>

          <button
            className="item-details-icon-btn"
            onClick={() => setIsLiked((current) => !current)}
            aria-label="Favorite item"
            aria-pressed={isLiked}
          >
            <Heart
              size={20}
              strokeWidth={2.2}
              color={isLiked ? "#51a48c" : "#3b8770"}
              fill={isLiked ? "#51a48c" : "none"}
            />
          </button>
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

        <button className="item-details-edit-btn">Edit Portion</button>
      </div>
    </div>
  );
}
