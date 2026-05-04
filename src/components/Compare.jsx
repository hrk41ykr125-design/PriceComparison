import React, { useState, useEffect } from 'react';
import { Camera, RefreshCw, Save, Check } from 'lucide-react';
import CameraInput from './CameraInput';
import { saveComparison } from '../firebase';

const ProductCard = ({ title, name, setName, price, capacity, setPrice, setCapacity, isCheaper, onCameraOpen }) => (
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

    <input 
      type="text" 
      className="name-input" 
      placeholder="商品名 (例: A社 牛乳)" 
      value={name}
      onChange={(e) => setName(e.target.value)}
    />

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
  const [prodA, setProdA] = useState({ name: '', price: '', capacity: '' });
  const [prodB, setProdB] = useState({ name: '', price: '', capacity: '' });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeTarget, setActiveTarget] = useState('A');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [comparisonTitle, setComparisonTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

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
      setProdA({ ...prodA, price: price || prodA.price, capacity: capacity || prodA.capacity });
    } else {
      setProdB({ ...prodB, price: price || prodB.price, capacity: capacity || prodB.capacity });
    }
    setIsCameraOpen(false);
  };

  const resetAll = () => {
    setProdA({ name: '', price: '', capacity: '' });
    setProdB({ name: '', price: '', capacity: '' });
    setComparisonTitle('');
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const saveToHistory = async () => {
    try {
      await saveComparison({
        title: comparisonTitle || '無題の比較',
        itemA: { name: prodA.name || '商品A', p: Number(prodA.price), c: Number(prodA.capacity) },
        itemB: { name: prodB.name || '商品B', p: Number(prodB.price), c: Number(prodB.capacity) },
        winner: isACheaper ? 'A' : 'B'
      });
      setShowSaveModal(false);
      setShowSuccess(true);
      // Reset success screen after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
        resetAll();
      }, 3000);
    } catch (err) {
      console.error("Save failed:", err);
      alert('保存に失敗しました。Firebaseの設定を確認してください。');
    }
  };

  return (
    <div className="compare-view">
      {showSuccess && (
        <div className="success-view">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h2 className="success-title">保存しました！</h2>
          <p className="success-text">比較履歴からいつでも確認できます。</p>
          <button className="btn-primary" onClick={() => setShowSuccess(false)}>
            閉じる
          </button>
        </div>
      )}

      <ProductCard 
        title="商品 A" 
        name={prodA.name}
        setName={(v) => setProdA({...prodA, name: v})}
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
        name={prodB.name}
        setName={(v) => setProdB({...prodB, name: v})}
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
          onClick={handleSaveClick}
        >
          <Save size={18} style={{ marginRight: 8 }} />
          比較結果を保存
        </button>
      </div>

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">比較を保存</h3>
            <div className="input-group">
              <label>比較の名称 (例: 牛乳の比較)</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="比較のタイトルを入力" 
                  value={comparisonTitle}
                  onChange={(e) => setComparisonTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowSaveModal(false)}>
                キャンセル
              </button>
              <button className="btn-primary" style={{ flex: 2 }} onClick={saveToHistory}>
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

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
