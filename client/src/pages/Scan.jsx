import React, { useState } from 'react';
import { Upload, Camera, Loader2 } from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';
import { FoodCard } from '../components/FoodCard';

export const Scan = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const { scanFood, loading, error } = useNutrition();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    try {
      const res = await scanFood(selectedFile);
      setScanResult(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
        AI Food Scanner
      </h2>

      <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <input type="file" accept="image/*" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />
        
        {preview ? (
          <div style={{ marginBottom: '1.5rem' }}>
            <img src={preview} alt="Meal preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '12px', objectFit: 'cover' }} />
          </div>
        ) : (
          <label htmlFor="fileInput" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Upload size={48} color="#10b981" />
            <span style={{ color: '#9ca3af' }}>Click or drop food image here</span>
          </label>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
          <label htmlFor="fileInput" className="btn-primary" style={{ background: '#374151', cursor: 'pointer' }}>
            Choose Image
          </label>
          <button className="btn-primary" onClick={handleScan} disabled={!selectedFile || loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Camera size={20} />} Analyze Meal
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: '8px', color: '#f87171', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {scanResult && (
        <FoodCard
          foodName={scanResult.foodName}
          calories={scanResult.calories}
          macros={scanResult.macros}
          healthScore={scanResult.healthScore}
          insights={scanResult.insights}
        />
      )}
    </div>
  );
};
