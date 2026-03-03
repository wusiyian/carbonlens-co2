//输出卡片

import type { CalculationResult } from '../hooks/useCarbonCalculator';

interface ResultCardProps {
    result: CalculationResult;
}

const getRatingClass = (rating: string) => {
    switch (rating) {
        case 'A+': case 'A': return 'rating-a';
        case 'B': return 'rating-b';
        case 'C': return 'rating-c';
        case 'D': return 'rating-d';
        default: return 'rating-f';
    }
};

export default function ResultCard({ result }: ResultCardProps) {
    return (
        <div className="result-card">
            <h2 className="result-title">计算结果</h2>

            <div className="result-item">
                <span className="result-label">网址：</span>
                <span className="result-value">{result.url}</span>
            </div>

            <div className="result-item">
                <span className="result-label">传输大小：</span>
                <span className="result-value">{result.bytes} bytes</span>
            </div>

            <div className="result-item">
                <span className="result-label">碳排放（每视图）：</span>
                <span className="result-value">{result.gramsCO2e} g CO₂e</span>
            </div>

            <div className="result-item">
                <span className="result-label">比平均网页更清洁：</span>
                <span className="result-value">{result.cleanerThan}</span>
            </div>

            <div className="result-item">
                <span className="result-label">评级：</span>
                <span className={`rating-badge ${getRatingClass(result.rating)}`}>
                    {result.rating}
                </span>
            </div>

            <div className="result-item">
                <span className="result-label">绿色托管：</span>
                <span className="result-value">{result.isGreenHosting}</span>
            </div>

            <div className="result-item">
                <span className="result-label">计算模型：</span>
                <span className="result-value">{result.modelUsed}</span>
            </div>

            {/* 显示详细排放信息 */}
            <div className="result-item" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: '16px' }}>
                <span className="result-label">排放详情：</span>
                <pre style={{
                    whiteSpace: 'pre-wrap',
                    background: '#f8f9fa',
                    padding: '12px',
                    borderRadius: '8px',
                    width: '100%',
                    fontSize: '0.95rem',
                    marginTop: '8px'
                }}>
                    {result.displayInfo}
                </pre>
            </div>
        </div>

    );
}