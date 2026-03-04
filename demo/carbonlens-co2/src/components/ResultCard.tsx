//输出卡片
import { useState } from 'react';
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
    const [showOptimization, setShowOptimization] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
            .then(() => alert('代码已复制到剪贴板！'))
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制');
            });
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
                        {/* 建议1: 懒加载 */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#2f855a' }}>1. 启用图片懒加载</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#4a5568' }}>
                                预计节省：0.05–0.15 g CO₂e / 页（减少未进入视口的图片加载）
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
                                {`<img 
  src="example.jpg" 
  alt="描述" 
  loading="lazy" 
  width="800" 
  height="600" 
/>`}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(`<img src="example.jpg" alt="描述" loading="lazy" width="800" height="600" />`)}
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
                        </div>

                        {/* 建议2: WebP 转换 */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#2f855a' }}>2. 图片转换为 WebP 格式</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#4a5568' }}>
                                预计节省：30–60% 图片体积，降低 0.1–0.3 g CO₂e
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
                                {`<picture>
  <source srcset="example.webp" type="image/webp" />
  <img src="example.jpg" alt="描述" />
</picture>`}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(`<picture><source srcset="example.webp" type="image/webp" /><img src="example.jpg" alt="描述" /></picture>`)}
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
                        </div>

                        {/* 建议3: 代码分割 */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#2f855a' }}>3. 启用代码分割（React.lazy）</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#4a5568' }}>
                                预计节省：首屏 JS 减少 20–50%
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
                                {`const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>加载中...</div>}>
  <HeavyComponent />
</Suspense>`}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(`const HeavyComponent = React.lazy(() => import('./HeavyComponent'));\n\n<Suspense fallback={<div>加载中...</div>}>\n  <HeavyComponent />\n</Suspense>`)}
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
                        </div>

                        {/* 建议4: 碳感知暗模式 */}
                        <div style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '20px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            <h4 style={{ margin: '0 0 8px 0', color: '#2f855a' }}>4. 碳感知暗模式</h4>
                            <p style={{ margin: '0 0 12px 0', color: '#4a5568' }}>
                                在高碳电网或低电量时自动切换暗模式，节省 5–20% 设备能耗
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
                                {`@media (prefers-color-scheme: dark) and (prefers-reduced-data: reduce) {
  body {
    background: #121212;
    color: #e0e0e0;
  }
}`}
                            </pre>
                            <button
                                onClick={() => copyToClipboard(`@media (prefers-color-scheme: dark) and (prefers-reduced-data: reduce) {\n  body {\n    background: #121212;\n    color: #e0e0e0;\n  }\n}`)}
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}