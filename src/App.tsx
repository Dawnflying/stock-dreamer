import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import StockDetailPage from './pages/StockDetailPage';
import { stockWs } from './services/api';
import { useStore } from './store/useStore';

function App() {
  const updatePrices = useStore(state => state.updatePrices);

  useEffect(() => {
    // 连接WebSocket
    stockWs.connect();

    // 监听实时价格更新
    const handlePriceUpdate = (data: any) => {
      updatePrices(data);
    };

    stockWs.on('price_update', handlePriceUpdate);

    return () => {
      stockWs.off('price_update', handlePriceUpdate);
      stockWs.disconnect();
    };
  }, [updatePrices]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/stock/:code" element={<StockDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;
