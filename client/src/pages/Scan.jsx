import React, { useEffect, useRef, useState } from 'react';
import { Camera as CameraIcon, Image as ImageIcon, Loader2, Sparkles, X, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNutrition } from '../hooks/useNutrition';

export const Scan = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const { scanFood, loading, error } = useNutrition();

  const startCamera = async () => {
    if (!window.isSecureContext) {
      setCameraMessage('Camera preview needs HTTPS on your phone. Use Gallery to choose a meal photo.');
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage('Live camera is not supported in this browser. Use Gallery instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      });
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
      setCameraMessage('Camera permission was blocked. Allow camera access or use Gallery.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
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
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      document.getElementById('camera-file-input')?.click();
      return;
    }
    startCamera();
  };

  const captureFrame = () => {
    if (!cameraActive || !videoRef.current) {
      document.getElementById('camera-file-input')?.click();
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
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }, 'image/jpeg', .9);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    try {
      const response = await scanFood(selectedFile);
      setScanResult(response?.data || response);
    } catch {
      // The hook exposes the API error in the scanner state.
    }
  };

  return (
    <div className="scanner-viewport">
      <div className="scanner-screen">
        <div className="scanner-preview">
          {preview ? <img className="scanner-food-image has-preview" src={preview} alt="Selected food preview" /> : <div className="scanner-camera-placeholder"><CameraIcon size={42} /><strong>Camera preview</strong><span>{cameraMessage || 'Starting your camera…'}</span></div>}
          {cameraActive && <video ref={videoRef} className="scanner-video" autoPlay playsInline muted />}
          <div className="scanner-shade" />

          <div className="scanner-topbar">
            <Link to="/" className="scanner-round-button" aria-label="Close scanner"><X size={22} /></Link>
            <button className={`scanner-round-button ${flashOn ? 'flash-active' : ''}`} onClick={() => setFlashOn((value) => !value)} aria-label="Toggle flash"><Zap size={20} /></button>
          </div>

          <div className="scanner-frame" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="scanner-hint">Center your food in the frame</div>

          {loading && <div className="scanner-processing"><Loader2 className="scanner-spin" size={22} /> Analyzing your meal…</div>}
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
            <button className="scanner-action-button" onClick={openCamera} aria-label="Switch camera"><CameraIcon size={24} /></button>
            <span>Switch</span>
            <input id="camera-file-input" type="file" accept="image/*" capture="environment" onChange={handleFile} />
          </div>
        </div>
      </div>
    </div>
  );
};
