import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, Loader2, Sparkles, X, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useNutrition } from '../hooks/useNutrition';
import { compressFoodImage } from '../services/imageCompression';
import { getProfileApi } from '../services/api';

export const Scan = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraMessage, setCameraMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [profileReady, setProfileReady] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { scanFood, loading, error } = useNutrition();
  const navigate = useNavigate();

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async (requestedFacingMode = facingMode) => {
    if (!window.isSecureContext) {
      setCameraMessage('Open the HTTPS mobile link to enable your camera.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage('Live camera is not supported in this browser.');
      return;
    }
    try {
      stopCamera();
      const videoOptions = { width: { ideal: 1080 }, height: { ideal: 1440 } };
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...videoOptions, facingMode: { exact: requestedFacingMode } },
          audio: false,
        });
      } catch (error) {
        // Some browsers do not expose facingMode constraints. Keep scanning
        // usable there, while preferring the requested camera whenever possible.
        if (error.name !== 'OverconstrainedError' && error.name !== 'ConstraintNotSatisfiedError') throw error;
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...videoOptions, facingMode: { ideal: requestedFacingMode } },
          audio: false,
        });
      }
      streamRef.current = stream;
      setCameraActive(true);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 0);
    } catch {
      setCameraActive(false);
      setCameraMessage('Camera permission was blocked. Allow camera access in Chrome settings.');
    }
  };

  useEffect(() => {
    getProfileApi().then((response) => {
      const profile = response.data.data;
      const ready = Boolean(profile?.age && profile?.gender && profile?.height && profile?.currentWeight);
      setProfileReady(ready);
      if (ready) startCamera();
    }).catch(() => setProfileReady(false));
    return () => stopCamera();
  }, []);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setCameraMessage('');
    setScanResult(null);
  };

  const openCamera = () => {
    if (streamRef.current) return;
    startCamera(facingMode);
  };

  const switchCamera = async () => {
    const nextFacingMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacingMode);
    setCameraMessage('Switching camera…');
    await startCamera(nextFacingMode);
  };

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) {
      startCamera();
      return;
    }
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 800;
    canvas.height = video.videoHeight || 1000;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'food-capture.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      stopCamera();
    }, 'image/jpeg', .9);
  };

  const handleAnalyze = async () => {
    if (!profileReady) return;
    if (!selectedFile) return;
    try {
      const compressedImage = await compressFoodImage(selectedFile);
      const response = await scanFood(compressedImage);
      const result = response?.data || response;
      setScanResult(result);
      navigate('/scan/result', { state: { result } });
    } catch {
      // Keep the scanner open and show the real API error. Never replace a failed
      // scan with demo nutrition data.
      setScanResult(null);
    }
  };

  if (profileReady !== true) {
    return <div className="scanner-viewport"><div className="scanner-screen scanner-profile-gate"><div><strong>{profileReady === null ? 'Checking your profile…' : 'Complete your profile first'}</strong><p>{profileReady === null ? 'Please wait a moment.' : 'Age, gender, height, and current weight are required before food scanning.'}</p>{profileReady === false && <Link to="/profile">Set your profile&nbsp; →</Link>}</div></div></div>;
  }

  return (
    <div className="scanner-viewport">
      <div className="scanner-screen">
        <div className="scanner-preview">
          {preview ? <img className="scanner-food-image has-preview" src={preview} alt="Selected food preview" /> : <div className="scanner-camera-placeholder"><CameraIcon size={42} /><strong>Camera preview</strong><span>{cameraMessage || 'Starting your camera…'}</span></div>}
          {cameraActive && <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />}
          <div className="scanner-shade" />

          <div className="scanner-topbar">
            <Link to="/home" className="scanner-round-button" aria-label="Close scanner"><X size={22} /></Link>
            <button className={`scanner-round-button ${flashOn ? 'flash-active' : ''}`} onClick={() => setFlashOn((value) => !value)} aria-label="Toggle flash"><Zap size={20} /></button>
          </div>

          <div className="scanner-frame" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="scanner-hint">Center your food in the frame</div>

          {loading && <div className="scanner-analysis-overlay" role="status" aria-live="polite">
            <div className="scanner-analysis-orbit"><span>🍽️</span><i /><i /><i /></div>
            <strong>Reading your meal</strong>
            <span>Identifying ingredients and nutrients<span className="scanner-analysis-dots">...</span></span>
          </div>}
          {scanResult && <div className="scanner-result"><Sparkles size={16} /> {scanResult.foodName || 'Meal analyzed successfully'}</div>}
          {error && <div className="scanner-error">{error}</div>}
        </div>

        <div className="scanner-controls">
          <div className="scanner-side-control">
            <label htmlFor="gallery-file-input" className="scanner-action-button"><ImageIcon size={24} /></label>
            <span>Gallery</span>
            <input id="gallery-file-input" type="file" accept="image/*" onChange={handleFile} />
          </div>
          <button className="scanner-capture" onClick={selectedFile ? handleAnalyze : captureFrame} aria-label={selectedFile ? 'Analyze food' : 'Capture food'}>
            <span>{selectedFile ? <Sparkles size={24} /> : <span className="capture-glow" />}</span>
          </button>
          <div className="scanner-side-control">
            <button className="scanner-action-button" onClick={switchCamera} aria-label="Switch camera" type="button"><CameraIcon size={24} /></button>
            <span>Switch</span>
            <input id="camera-file-input" type="file" accept="image/*" capture="environment" onChange={handleFile} />
          </div>
        </div>
      </div>
    </div>
  );
};
