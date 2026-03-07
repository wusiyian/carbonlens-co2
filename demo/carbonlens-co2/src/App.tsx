import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultCard from './components/ResultCard';
import { useCarbonCalculator } from './hooks/useCarbonCalculator';
import './App.css'
import ToastProvider from './components/ToastProvider';

function App() {
  const { calculate, loading, error, result } = useCarbonCalculator();
  const [inputValue, setInputValue] = useState('');
  const handleCalculate = () => {
    if (!inputValue.trim()) {
      alert('请输入网址或字节数');
      return;
    }
    calculate(inputValue);
  };

  return (
    <>
      <ToastProvider />
      <div className="main-content">
        <Header />

        <div className="card-wrapper">
          <InputForm
            inputValue={inputValue}
            setInputValue={setInputValue}
            onCalculate={handleCalculate}
            loading={loading}
          />
        </div>
        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">正在计算碳排放...</div>}

        {result && (
          <div className="card-wrapper">
            <ResultCard result={result} />
          </div>
        )}

        <p className="footer-note">
          使用 @tgwf/co2 库 · 本地计算 · 低碳网页优化框架
        </p>
      </div>
    </>


  );
}

export default App;