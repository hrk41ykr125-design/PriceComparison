import React, { useState } from 'react';
import Compare from './components/Compare';
import History from './components/History';
import { Calculator, History as HistoryIcon } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('compare');

  return (
    <div className="app-container">
      <header>
        <h1>お買い得チェッカー</h1>
        <div className="header-icons">
          {/* Settings or Profile could go here */}
        </div>
      </header>

      <div className="tabs">
        <div 
          className="tab-indicator" 
          style={{ 
            transform: `translateX(${activeTab === 'compare' ? '0' : '100'}%)`,
            width: '50%'
          }} 
        />
        <button 
          className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveTab('compare')}
        >
          <Calculator size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          比較
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <HistoryIcon size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          履歴
        </button>
      </div>

      <main>
        <div style={{ display: activeTab === 'compare' ? 'block' : 'none' }}>
          <Compare />
        </div>
        <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
          <History />
        </div>
      </main>
    </div>
  );
}

export default App;
