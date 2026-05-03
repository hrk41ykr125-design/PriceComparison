import React, { useRef, useEffect, useState } from 'react';
import { X, Camera as CameraIcon } from 'lucide-react';
import { performOcr } from '../vision';

const CameraInput = ({ onClose, onResult }) => {
  const videoRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("カメラにアクセスできませんでした。権限を確認してください。");
      }
    }
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (!videoRef.current) return;
    
    setIsCapturing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
    
    console.log("Image captured, processing OCR...");
    
    try {
      const result = await performOcr(base64Image);
      onResult(result);
    } catch (err) {
      console.error("OCR Error:", err);
      alert("解析に失敗しました。");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="camera-container">
      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1100 }}>
        <button 
          onClick={onClose} 
          style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: 10, borderRadius: '50%' }}
        >
          <X size={24} />
        </button>
      </div>

      {error ? (
        <div style={{ color: 'white', textAlign: 'center', marginTop: '100px', padding: 20 }}>
          <p>{error}</p>
          <button className="btn-primary" onClick={onClose} style={{ marginTop: 20 }}>戻る</button>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline />
          
          <div className="camera-overlay">
            <button 
              className="capture-btn" 
              onClick={captureImage} 
              disabled={isCapturing}
              style={{ opacity: isCapturing ? 0.5 : 1 }}
            />
          </div>
          
          {isCapturing && (
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.7)',
              padding: '20px',
              borderRadius: '12px'
            }}>
              解析中...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraInput;
