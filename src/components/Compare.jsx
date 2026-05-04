import React, { useState } from 'react';
import { RefreshCw, Save, Check } from 'lucide-react';
import { saveComparison } from '../firebase';

const CompactProductCard = ({ title, price, capacity, setPrice, setCapacity, isWinner }) => (
  <div className={`compare-card ${isWinner ? 'winner' : ''}`}>
    <h3>{title}</h3>
    
    <div className="input-small-group">
      <label>値段</label>
      <div className="input-mini-wrapper">
        <input 
          type="number" 
          value={price} 
          onChange={(e) => setPrice(e.target.value)} 
          placeholder="0"
          inputMode="numeric"
        />
        <span className="mini-unit">円</span>
      </div>
    </div>

    <div className="input-small-group">
      <label>容量</label>
      <div className="input-mini-wrapper">
        <input 
          type="number" 
          value={capacity} 
          onChange={(e) => setCapacity(e.target.value)} 
          placeholder="0"
          inputMode="numeric"
        />
        <span className="mini-unit">単位</span>
      </div>
    </div>

    {price && capacity ? (
      <div className="unit-price-display">
        {(price / capacity).toFixed(2)} <span style={{fontSize: '0.6rem'}}>円/単</span>
      </div>
    ) : (
      <div className="unit-price-display" style={{opacity: 0}}>-</div>
    )}
  </div>
);

const Compare = () => {
  const [prodA, setProdA] = useState({ price: '', capacity: '' });
  const [prodB, setProdB] = useState({ price: '', capacity: '' });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [comparisonTitle, setComparisonTitle] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const unitPriceA = prodA.price && prodA.capacity ? prodA.price / prodA.capacity : Infinity;
  const unitPriceB = prodB.price && prodB.capacity ? prodB.price / prodB.capacity : Infinity;

  const isACheaper = unitPriceA < unitPriceB && unitPriceA !== Infinity;
  const isBCheaper = unitPriceB < unitPriceA && unitPriceB !== Infinity;

  const resetAll = () => {
    setProdA({ price: '', capacity: '' });
    setProdB({ price: '', capacity: '' });
    setComparisonTitle('');
  };

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const saveToHistory = async () => {
    setShowSaveModal(false);
    try {
      await saveComparison({
        title: comparisonTitle || '無題の比較',
        itemA: { name: '商品A', p: Number(prodA.price), c: Number(prodA.capacity) },
        itemB: { name: '商品B', p: Number(prodB.price), c: Number(prodB.capacity) },
        winner: isACheaper ? 'A' : 'B'
      });
      setShowSuccess(true);
    } catch (err) {
      console.error("Save failed:", err);
      alert('保存に失敗しました。');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    resetAll();
  };

  return (
    <div className="compare-view">
      {showSuccess && (
        <div className="success-view">
          <div className="success-icon">
            <Check size={48} />
          </div>
          <h2 className="success-title">保存しました！</h2>
          <p className="success-text">履歴から確認できます。</p>
          <button className="btn-primary" style={{ maxWidth: '200px' }} onClick={handleSuccessClose}>
            OK
          </button>
        </div>
      )}

      <div className="compare-grid">
        <CompactProductCard 
          title="商品 A" 
          price={prodA.price} 
          capacity={prodA.capacity}
          setPrice={(v) => setProdA({...prodA, price: v})}
          setCapacity={(v) => setProdA({...prodA, capacity: v})}
          isWinner={isACheaper}
        />

        <CompactProductCard 
          title="商品 B" 
          price={prodB.price} 
          capacity={prodB.capacity}
          setPrice={(v) => setProdB({...prodB, price: v})}
          setCapacity={(v) => setProdB({...prodB, capacity: v})}
          isWinner={isBCheaper}
        />
      </div>

      <div style={{ textAlign: 'center', margin: '20px 0', fontSize: '0.9rem', color: isACheaper || isBCheaper ? '#059669' : '#94a3b8', fontWeight: 700 }}>
        {isACheaper ? '商品 A の方がお得です！' : isBCheaper ? '商品 B の方がお得です！' : '数値を入力してください'}
      </div>

      <div style={{ padding: '0 15px', display: 'flex', gap: 10 }}>
        <button className="btn-secondary" style={{ flex: 1 }} onClick={resetAll}>
          <RefreshCw size={18} />
          リセット
        </button>
        <button 
          className="btn-primary" 
          style={{ flex: 2 }} 
          disabled={!prodA.price || !prodB.price || !prodA.capacity || !prodB.capacity}
          onClick={handleSaveClick}
        >
          <Save size={18} style={{ marginRight: 8 }} />
          結果を保存
        </button>
      </div>

      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">商品名を入力</h3>
            <div className="input-group">
              <label>比較する商品の名前 (例: 牛乳)</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="商品名を入力" 
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
    </div>
  );
};

export default Compare;
