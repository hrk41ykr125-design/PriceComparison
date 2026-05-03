import React, { useState, useEffect } from 'react';
import { Trash2, TrendingDown } from 'lucide-react';
import { getHistory, deleteHistoryItem } from '../firebase';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = getHistory((data) => {
      setHistory(data);
    });
    return () => unsubscribe();
  }, []);

  const deleteItem = async (id) => {
    if (window.confirm('この履歴を削除しますか？')) {
      await deleteHistoryItem(id);
    }
  };

  return (
    <div className="history-view">
      <div style={{ padding: '20px 15px 10px' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#1e293b' }}>比較履歴</h2>
      </div>

      {history.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#94a3b8' }}>
          履歴はありません
        </div>
      ) : (
        history.map(item => (
          <div key={item.id} className="card" style={{ margin: '10px 15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span className="history-date">
                {item.timestamp?.toDate ? item.timestamp.toDate().toLocaleString() : '---'}
              </span>
              <button 
                onClick={() => deleteItem(item.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>商品A</div>
                <div style={{ fontWeight: 600 }}>{item.itemA.p}円 / {item.itemA.c}</div>
              </div>
              <div style={{ color: '#cbd5e1' }}>vs</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>商品B</div>
                <div style={{ fontWeight: 600 }}>{item.itemB.p}円 / {item.itemB.c}</div>
              </div>
            </div>

            <div style={{ marginTop: 15, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '0.9rem', fontWeight: 700 }}>
              <TrendingDown size={16} />
              商品 {item.winner} の方がお得でした
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default History;
