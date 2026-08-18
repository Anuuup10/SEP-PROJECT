import React, { useState } from "react";
import { addTrackedMeal } from "../services/tracker";
import { saveMealApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";

/**
 * FoodAnalysisResult — Page 7: shows the result of a completed food scan.
 *
 * PURELY PRESENTATIONAL — no scanning/AI logic lives here. That belongs to
 * your teammate's Food Scanner / AI Analysis pages. This page just receives
 * the finished result as a prop and displays it.
 *
 * Expected shape of `result`:
 * {
 *   id, mealName, itemCount, image,
 *   totalKcal, protein, carbs, fats, isFavorite,
 *   detectedItems: [{ id, name, portion, kcal, image }]
 * }
 *
 * Props:
 *  - result: object described above (required)
 *  - onBack: () => void
 *  - onToggleFavorite: (id) => void
 *  - onViewDetails: (result) => void
 *  - onSelectItem: (item) => void
 */
export default function FoodAnalysisResult({
  result,
  onBack,
  onToggleFavorite,
  onViewDetails,
  onSelectItem,
  onRescan,
}) {
  const { user } = useAuth();
  const [localFavorite, setLocalFavorite] = useState(!!result?.isFavorite);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [tracked, setTracked] = useState(false);
  const [removedItemIds, setRemovedItemIds] = useState([]);
  const [removalCandidate, setRemovalCandidate] = useState(null);
  const [trackerConfirmationOpen, setTrackerConfirmationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  if (!result) {
    return (
      <div className="result-page">
        <div className="result-card result-card--empty">
          <p className="empty-text">No scan result to show yet.</p>
        </div>
      </div>
    );
  }

  const {
    mealName,
    itemCount,
    image,
    totalKcal,
    protein,
    carbs,
    fats,
    detectedItems = [],
  } = result;
  const resultTotals = result.totals || {};
  const displayProtein = Number(protein ?? resultTotals.protein ?? result.macros?.protein) || 0;
  const displayCarbs = Number(carbs ?? resultTotals.carbohydrates ?? result.macros?.carbs) || 0;
  const displayFats = Number(fats ?? resultTotals.fat ?? result.macros?.fat) || 0;
  const displayCalories = Number(totalKcal ?? resultTotals.calories) || 0;
  const displayItemCount = itemCount ?? detectedItems.length;

  const handleFavoriteClick = () => {
    setLocalFavorite((prev) => !prev);
    onToggleFavorite?.(result.id);
  };

  const handleSaveToHistory = async () => {
    if (savedToHistory) return true;
    if (saving) return false;
    if (!result.scanId) { setSaveError("This scan is missing its backend reference. Please scan it again."); return false; }
    setSaving(true); setSaveError(null);
    try { await saveMealApi(result.scanId); setSavedToHistory(true); return true; }
    catch (error) { setSaveError(error.response?.data?.message || "Could not save this meal"); return false; }
    finally { setSaving(false); }
  };
  const activeItems = detectedItems.filter((item) => !removedItemIds.includes(item.id));
  const removedNutrition = detectedItems.filter((item) => removedItemIds.includes(item.id)).reduce((totals, item) => ({ kcal: totals.kcal + (Number(item.kcal ?? item.calories) || 0), protein: totals.protein + (Number(item.protein) || 0), carbs: totals.carbs + (Number(item.carbs ?? item.carbohydrates) || 0), fats: totals.fats + (Number(item.fat) || 0) }), { kcal: 0, protein: 0, carbs: 0, fats: 0 });
  const adjustedNutrition = { totalKcal: Math.max(0, displayCalories - removedNutrition.kcal), protein: Math.max(0, displayProtein - removedNutrition.protein), carbs: Math.max(0, displayCarbs - removedNutrition.carbs), fats: Math.max(0, displayFats - removedNutrition.fats) };
  const handleRemoveItem = (event, itemId, itemName) => {
    event.stopPropagation();
    setRemovalCandidate({ id: itemId, name: itemName });
  };
  const confirmRemoveItem = () => {
    if (!removalCandidate) return;
    setRemovedItemIds((current) => [...current, removalCandidate.id]);
    setRemovalCandidate(null);
  };
  const handleAddToTracker = () => {
    if (tracked || activeItems.length === 0) return;
    setTrackerConfirmationOpen(true);
  };
  const confirmAddToTracker = async () => {
    const saved = await handleSaveToHistory();
    if (!saved) return;
    addTrackedMeal({ mealName, itemCount: activeItems.length, calories: adjustedNutrition.totalKcal, protein: adjustedNutrition.protein, carbs: adjustedNutrition.carbs, fats: adjustedNutrition.fats, createdAt: "Just now", food: "meal", image: result.image || result.imageUrl || image, items: activeItems.map((item) => ({ ...item, image: item.image || result.image || result.imageUrl || image })) }, user?.id);
    setTracked(true);
    setTrackerConfirmationOpen(false);
  };

  return (
    <div className="result-page">
      {removalCandidate && (
        <div className="remove-item-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setRemovalCandidate(null); }}>
          <section className="remove-item-dialog" role="alertdialog" aria-modal="true" aria-labelledby="remove-item-title" aria-describedby="remove-item-description">
            <div className="remove-item-dialog-icon">−</div>
            <div className="remove-item-dialog-copy">
              <span>REMOVE DETECTED FOOD</span>
              <h2 id="remove-item-title">Remove {removalCandidate.name}?</h2>
              <p id="remove-item-description">This food will be removed from the scan and its nutrients will be deducted from the totals.</p>
            </div>
            <div className="remove-item-dialog-actions">
              <button type="button" className="remove-item-cancel" onClick={() => setRemovalCandidate(null)}>Cancel</button>
              <button type="button" className="remove-item-confirm" onClick={confirmRemoveItem}>Remove item</button>
            </div>
          </section>
        </div>
      )}
      {trackerConfirmationOpen && (
        <div className="tracker-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setTrackerConfirmationOpen(false); }}>
          <section className="tracker-dialog" role="alertdialog" aria-modal="true" aria-labelledby="tracker-dialog-title" aria-describedby="tracker-dialog-description">
            <div className="tracker-dialog-icon">✓</div>
            <div className="tracker-dialog-copy">
              <span>READY TO TRACK</span>
              <h2 id="tracker-dialog-title">Add {mealName}?</h2>
              <p id="tracker-dialog-description">This meal will be added to your dashboard, history, and progress totals.</p>
            </div>
            <div className="tracker-dialog-summary">
              <span><strong>{adjustedNutrition.totalKcal}</strong> kcal</span>
              <span><strong>{adjustedNutrition.protein}g</strong> protein</span>
              <span><strong>{activeItems.length}</strong> items</span>
            </div>
            <div className="tracker-dialog-actions">
              <button type="button" className="tracker-dialog-cancel" onClick={() => setTrackerConfirmationOpen(false)}>Cancel</button>
              <button type="button" className="tracker-dialog-confirm" onClick={confirmAddToTracker}>Add to tracker</button>
            </div>
          </section>
        </div>
      )}
      <div className="result-card">
        {/* Header */}
        <div className="result-header">
          <button onClick={onBack} aria-label="Go back" className="icon-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="#17332E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="result-header-title"><small>KHANALENS</small><strong>Scan Result</strong></div>

          <button onClick={handleSaveToHistory} aria-label={savedToHistory ? "Saved to history" : "Save to history"} aria-pressed={savedToHistory} className={`icon-btn ${savedToHistory ? "icon-btn-saved" : ""}`} disabled={saving}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill={savedToHistory ? "#168363" : "none"}>
              <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.6L6 21V4.8Z" stroke="#168363" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {saveError && <p role="alert" className="scanner-error">{saveError}</p>}

        {/* Title */}
        <div className="result-titles">
          <h1 className="result-title">{mealName}</h1>
          <p className="result-subtitle">{displayItemCount} food items detected</p>
        </div>

        {/* Meal photo */}
        <div className="result-photo-wrapper">
          <img src={image} alt={mealName} className="result-photo" />
        </div>

        {/* Macro summary row */}
        <div className="macro-row">
          <div className="macro-total macro-total-calories">
            <div className="macro-total-value">{adjustedNutrition.totalKcal}</div>
            <div className="macro-total-label">Total kcal</div>
          </div>
          <MacroStat label="Protein" value={`${adjustedNutrition.protein}g`} colorClass="macro-stat-value--protein" />
          <MacroStat label="Carbs" value={`${adjustedNutrition.carbs}g`} colorClass="macro-stat-value--carbs" />
          <MacroStat label="Fats" value={`${adjustedNutrition.fats}g`} colorClass="macro-stat-value--fats" />
        </div>

        {/* Detected items */}
        <div className="detected-items-section">
          <h2 className="detected-items-heading">Detected Items</h2>

          <div
            className={`detected-items-list ${
              activeItems.length > 3 ? "detected-items-list--scrollable" : ""
            }`}
          >
            {activeItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectItem?.({ ...item, image: item.image || image })}
                className="detected-item-row"
              >
                <div className="detected-item-thumb">
                  <img src={item.image || image} alt={item.name} />
                </div>
                <div className="detected-item-info">
                  <div className="detected-item-name">{item.name}</div>
                  <div className="detected-item-meta">
                    {item.portion} &middot; {item.kcal} kcal
                  </div>
                </div>
                <span className="detected-item-remove" role="button" tabIndex="0" aria-label={`Remove ${item.name}`} onClick={(event) => handleRemoveItem(event, item.id, item.name)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") handleRemoveItem(event, item.id, item.name); }}>×</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="detected-item-chevron">
                  <path d="M9 6l6 6-6 6" stroke="#B7C4C0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* View Details CTA */}
        <div className="view-details-wrapper">
          <button onClick={handleAddToTracker} className={`add-tracker-btn ${tracked ? "added" : ""}`} type="button">{tracked ? "Added to Tracker" : "Add to Tracker"}</button>
          <button onClick={() => onRescan?.()} className="view-details-btn">
            Rescan Food
          </button>
        </div>
      </div>
    </div>
  );
}

function MacroStat({ label, value, colorClass }) {
  return (
    <div className={`macro-stat macro-stat-${label.toLowerCase()}`}>
      <div className={`macro-stat-value ${colorClass}`}>{value}</div>
      <div className="macro-stat-label">{label}</div>
    </div>
  );
}
