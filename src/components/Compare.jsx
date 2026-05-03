import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Save } from 'lucide-react';
import CameraInput from './CameraInput';
import { saveComparison } from '../firebase';

const ProductCard = ({ title, price, capacity, setPrice, setCapacity, isCheaper, onCameraOpen }) => (
  <div className={`card ${isCheaper ? 'highlight-card' : ''}`}>
    {isCheaper && <div className="result-badge badge-cheaper">こちらがお得！</div>}
    {!isCheaper && price && capacity && <div className="result-badge badge-expensive">割高です</div>}
    
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
      <h3>{title}</h3>
      <button className="btn-secondary" onClick={onCameraOpen}>
        <Camera size={18} />
        スキャン
      </button>
    </div>

    <div className="input-group">
      <label>値段</label>
      <div className="input-wrapper">
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          placeholder="0"
          inputMode="numeric"
        />
        <span className="unit">円</span>
      </div>
    </div>

    <div className="input-group">
      <label>容量 (g / ml / 枚)</label>
      <div className="input-wrapper">
        <input 
          type="number" 
          value={capacity} 
          onChange={(e) => setCapacity(e.target.value)} 
          placeholder="0"
          inputMode="numeric"
        />
        <span className="unit">単位</span>
      </div>
    </div>

    {price && capacity && (
      <div style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'right' }}>
        単価: {(price / capacity).toFixed(2)} 円/単位
      </div>
    )}
  </div>
);

const Compare = () => {
  const [prodA, setProdA] = useState({ price: '', capacity: '' });
  const [prodB, setProdB] = useState({ price: '', capacity: '' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState('A');

  const unitPriceA = prodA.price && prodA.capacity ? prodA.price / prodA.capacity : Infinity;
  const unitPriceB = prodB.price && prodB.capacity ? prodB.price / prodB.capacity : Infinity;

  const isACheaper = unitPriceA < unitPriceB && unitPriceA !== Infinity;
  const isBCheaper = unitPriceB < unitPriceA && unitPriceB !== Infinity;

  const handleCameraOpen = (target) => {
    setActiveTarget(target);
    setIsCameraOpen(true);
  };

  const handleOcrResult = (result) => {
    const { price, capacity } = result;
    if (activeTarget === 'A') {
      setProdA({ price: price || prodA.price, capacity: capacity || prodA.capacity });
    } else {
      setProdB({ price: price || prodB.price, capacity: capacity || prodB.capacity });
    }
    setIsCameraOpen(false);
  };

  const resetAll = () => {
    setProdA({ price: '', capacity: '' });
    setProdB({ price: '', capacity: '' });
  };

  const saveToHistory = async () => {
    try {
      await saveComparison({
        itemA: { p: Number(prodA.price), c: Number(prodA.capacity) },
        itemB: { p: Number(prodB.price), c: Number(prodB.capacity) },
        winner: isACheaper ? 'A' : 'B'
      });
      alert('履歴に保存しました');
    } catch (err) {
      console.error("Save failed:", err);
      alert('保存に失敗しました。Firebaseの設定を確認してください。');
    }
  };

  return (
    <div className="compare-view">
      <ProductCard 
        title="商品 A" 
        price={prodA.price} 
        capacity={prodA.capacity}
        setPrice={(v) => setProdA({...prodA, price: v})}
        setCapacity={(v) => setProdA({...prodA, capacity: v})}
        isCheaper={isACheaper}
        onCameraOpen={() => handleCameraOpen('A')}
      />

      <div style={{ textAlign: 'center', margin: '10px 0', color: '#94a3b8', fontWeight: 700 }}>VS</div>

      <ProductCard 
        title="商品 B" 
        price={prodB.price} 
        capacity={prodB.capacity}
        setPrice={(v) => setProdB({...prodB, price: v})}
        setCapacity={(v) => setProdB({...prodB, capacity: v})}
        isCheaper={isBCheaper}
        onCameraOpen={() => handleCameraOpen('B')}
      />

      <div style={{ padding: '0 15px', display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={resetAll}>
          <RefreshCw size={18} />
          リセット
        </button>
        <button 
          className="btn-primary" 
          style={{ flex: 2 }} 
          disabled={!prodA.price || !prodB.price}
          onClick={saveToHistory}
        >
          <Save size={18} style={{ marginRight: 8 }} />
          比較結果を保存
        </button>
      </div>

      {isCameraOpen && (
        <CameraInput 
          onClose={() => setIsCameraOpen(false)} 
          onResult={handleOcrResult} 
        />
      )}
    </div>
  );
};

export default Compare;
