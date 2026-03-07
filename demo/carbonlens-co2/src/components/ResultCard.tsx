//输出卡片
import { useState } from 'react';
import type { CalculationResult } from '../hooks/useCarbonCalculator';
import toast from 'react-hot-toast';

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
    const [showOptimization, setShowOptimization] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => toast.success('代码已复制到剪贴板！'))
            .catch(() => toast.error('复制失败，请手动复制'));
    };

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

            {/* 一键绿色优化面板 */}
            <div style={{ marginTop: '32px' }}>
                <button
                    onClick={() => setShowOptimization(!showOptimization)}
                    style={{
                        width: '100%',
                        padding: '12px 0',
                        background: '#2f855a',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {showOptimization ? '收起优化建议' : '一键绿色优化'}
                </button>

                {showOptimization && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        marginTop: '20px'
                    }}>
                        {result.optimizationSuggestions.map(suggestion => (<div key={suggestion.id} style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#2f855a' }}>
                                {suggestion.title}
                            </h4>
                            <p style={{ margin: '0 0 12px 0', color: '#4a5568' }}>
                                预计节省：{suggestion.estimatedSavings} g CO₂e
                            </p>
                            <pre style={{
                                background: '#1e293b',
                                color: '#e2e8f0',
                                padding: '16px',
                                borderRadius: '8px',
                                fontSize: '0.9rem',
                                overflowX: 'auto',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {suggestion.codeSnippet}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(suggestion.codeSnippet)}
                                style={{
                                    marginTop: '12px',
                                    padding: '8px 16px',
                                    background: '#38a169',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                复制代码
                            </button>
                        </div>))}
                    </div>
                )}
            </div>
        </div>
    );
}