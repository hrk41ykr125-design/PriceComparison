import { useState, useEffect } from 'react';
import { Trash2, TrendingDown, Calendar } from 'lucide-react';
import { getHistory, deleteHistoryItem } from '../firebase';

const formatDate = (item) => {
  const date = item.timestamp?.toDate?.() || (item.createdAt ? new Date(item.createdAt) : null);
  if (!date || Number.isNaN(date.getTime())) {
    return '---';
  }

  return date.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

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
      setHistory((currentHistory) => currentHistory.filter((item) => item.id !== id));
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
        history.map((item) => (
          <div key={item.clientId || item.remoteId || item.id} className="card" style={{ margin: '10px 15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                  {item.title || '無題の比較'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#94a3b8' }}>
                  <Calendar size={12} />
                  {formatDate(item)}
                </div>
              </div>
              <button
                onClick={() => deleteItem(item.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 5 }}
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: 15, alignItems: 'center', background: '#f8fafc', padding: 15, borderRadius: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2 }}>
                  商品A
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.itemA.p}<span style={{ fontSize: '0.7rem' }}>円</span></div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.itemA.c}単位</div>
              </div>
              <div style={{ color: '#cbd5e1', fontWeight: 900, fontSize: '0.8rem' }}>VS</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 2 }}>
                  商品B
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.itemB.p}<span style={{ fontSize: '0.7rem' }}>円</span></div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.itemB.c}単位</div>
              </div>
            </div>

            <div style={{ marginTop: 15, display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontSize: '0.9rem', fontWeight: 700 }}>
              <TrendingDown size={18} />
              <span>
                商品{item.winner} の方がお得
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default History;
