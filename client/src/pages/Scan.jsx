import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, Loader2, RotateCcw, Sparkles, X, Zap } from 'lucide-react';
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
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
      } catch (err) {
        // Some browsers do not expose facingMode constraints. Keep scanning
        if (err.name !== 'OverconstrainedError' && err.name !== 'ConstraintNotSatisfiedError') throw err;
        stream = await navigator.mediaDevices.getUserMedia({
          video: { ...videoOptions, facingMode: { ideal: requestedFacingMode } },
          audio: false,
        });
      }
      streamRef.current = stream;
      setCameraActive(true);
      setCameraMessage('');
    } catch {
      setCameraActive(false);
      setCameraMessage('Camera permission was blocked. Allow camera access in Chrome settings.');
    }
  };

  useEffect(() => {
    if (!cameraActive || !videoRef.current || !streamRef.current) return undefined;
    const video = videoRef.current;
    const stream = streamRef.current;
    const startPlayback = () => video.play().catch(() => {});
    video.srcObject = stream;
    if (video.readyState >= 1) startPlayback();
    else video.onloadedmetadata = startPlayback;

    return () => {
      video.onloadedmetadata = null;
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [cameraActive]);

  useEffect(() => {
    const cachedProfile = null;
    const hasRequiredDetails = (profile) => Boolean(profile?.age && profile?.gender && profile?.height && profile?.currentWeight);
    if (hasRequiredDetails(cachedProfile)) setProfileReady(true);
    getProfileApi().then((response) => {
      const profile = response.data.data;
      const ready = hasRequiredDetails(profile) || hasRequiredDetails(cachedProfile);
      setProfileReady(ready);
      if (ready && !preview) startCamera();
    }).catch(() => setProfileReady(hasRequiredDetails(cachedProfile)));
    return () => stopCamera();
  }, []);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopCamera();
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setCameraMessage('');
    setScanResult(null);
    event.target.value = '';
  };

  const handleRetake = () => {
    setSelectedFile(null);
    setPreview(null);
    setScanResult(null);
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
      stopCamera();
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }, 'image/jpeg', 0.92);
  };

  const handleAnalyze = async () => {
    if (!profileReady || !selectedFile || loading) return;
    try {
      const compressedImage = await compressFoodImage(selectedFile);
      const response = await scanFood(compressedImage);
      const result = response?.data || response;
      setScanResult(result);
      navigate('/scan/result', { state: { result } });
    } catch {
      setScanResult(null);
    }
  };

  if (profileReady !== true) {
    return (
      <div className="scanner-viewport">
        <div className="scanner-screen scanner-profile-gate">
          <div>
            <strong>{profileReady === null ? 'Checking your profile…' : 'Complete your profile first'}</strong>
            <p>{profileReady === null ? 'Please wait a moment.' : 'Age, gender, height, and current weight are required before food scanning.'}</p>
            {profileReady === false && <Link to="/profile">Set your profile&nbsp; →</Link>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scanner-viewport">
      <div className="scanner-screen">
        <div className="scanner-preview">
          {preview ? (
            <div className="scanner-image-preview-wrap">
              <img className="scanner-food-image has-preview" src={preview} alt="Selected food preview" />
              <div className="scanner-preview-tag">
                <Sparkles size={14} />
                <span>Photo Ready to Scan</span>
              </div>
            </div>
          ) : (
            <>
              {cameraActive ? (
                <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />
              ) : (
                <div className="scanner-camera-placeholder">
                  <CameraIcon size={42} />
                  <strong>Camera preview</strong>
                  <span>{cameraMessage || 'Starting your camera…'}</span>
                </div>
              )}
            </>
          )}

          <div className="scanner-shade" />

          <div className="scanner-topbar">
            <Link to="/home" className="scanner-round-button" aria-label="Close scanner"><X size={22} /></Link>
            {preview ? (
              <button className="scanner-retake-top-button" onClick={handleRetake} aria-label="Retake photo" type="button">
                <RotateCcw size={14} />
                <span>Retake</span>
              </button>
            ) : (
              <button className={`scanner-round-button ${flashOn ? 'flash-active' : ''}`} onClick={() => setFlashOn((value) => !value)} aria-label="Toggle flash" type="button">
                <Zap size={20} />
              </button>
            )}
          </div>

          <div className={`scanner-frame ${preview ? 'has-preview-frame' : ''}`} aria-hidden="true">
            <span /><span /><span /><span />
          </div>

          <div className="scanner-hint">
            {preview ? 'Tap Scan Food below to analyze nutrition' : 'Center your food in the frame'}
          </div>

          {loading && (
            <div className="scanner-analysis-overlay" role="status" aria-live="polite">
              <div className="scanner-analysis-orbit">
                <span>🍽️</span>
                <i /><i /><i />
              </div>
              <strong>Reading your meal</strong>
              <span>Identifying ingredients and nutrients<span className="scanner-analysis-dots">...</span></span>
            </div>
          )}

          {scanResult && <div className="scanner-result"><Sparkles size={16} /> {scanResult.foodName || 'Meal analyzed successfully'}</div>}
          {error && <div className="scanner-error">{error}</div>}
        </div>

        {preview ? (
          <div className="scanner-preview-controls">
            <button className="scanner-preview-btn-cancel" onClick={handleRetake} type="button" disabled={loading}>
              <RotateCcw size={17} />
              <span>Retake</span>
            </button>

            <button className="scanner-preview-btn-scan" onClick={handleAnalyze} type="button" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={19} className="scanner-spin" />
                  <span>Scanning…</span>
                </>
              ) : (
                <>
                  <Sparkles size={19} />
                  <span>Scan Food</span>
                </>
              )}
            </button>

            <div className="scanner-side-control">
              <label htmlFor="gallery-file-input-preview" className="scanner-action-button" aria-label="Choose different photo">
                <ImageIcon size={22} />
              </label>
              <span>Gallery</span>
              <input id="gallery-file-input-preview" type="file" accept="image/*" onChange={handleFile} />
            </div>
          </div>
        ) : (
          <div className="scanner-controls">
            <div className="scanner-side-control">
              <label htmlFor="gallery-file-input" className="scanner-action-button" aria-label="Upload from gallery">
                <ImageIcon size={24} />
              </label>
              <span>Gallery</span>
              <input id="gallery-file-input" type="file" accept="image/*" onChange={handleFile} />
            </div>
            <button className="scanner-capture" onClick={captureFrame} aria-label="Capture food" type="button">
              <span><span className="capture-glow" /></span>
            </button>
            <div className="scanner-side-control">
              <button className="scanner-action-button" onClick={switchCamera} aria-label="Switch camera" type="button">
                <CameraIcon size={24} />
              </button>
              <span>Switch</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
