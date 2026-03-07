import { useState } from 'react';
import { co2 } from '@tgwf/co2';

export interface CalculationResult {
    url: string;
    bytes: string;
    gramsCO2e: string;
    cleanerThan: string;
    rating: string;
    isGreenHosting: string;
    modelUsed: string;
    displayInfo: string;
    optimizationSuggestions: Array<{
        id: string;
        title: string;
        description: string;
        estimatedSavings: string;
        codeSnippet: string;
        priority: number;
    }>;
    hasImages: boolean;
}

export const useCarbonCalculator = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<CalculationResult | null>(null);

    const calculate = async (input: string) => {
        setLoading(true);
        setError('');
        setResult(null);

        let bytes: number;
        let hasImages = false;
        if (/^\d+$/.test(input.trim())) {
            bytes = parseInt(input.trim(), 10);
            if (isNaN(bytes) || bytes <= 0) {
                setError('请输入有效的正整数字节数');
                setLoading(false);
                return;
            }
        } else {
            try {
                const apiUrl = `http://localhost:3001/api/audit?url=${encodeURIComponent(input.trim())}`;
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`后端返回 ${response.status}`);

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || '审计失败');
                }

                bytes = data.bytes;
                console.log(`Lighthouse 真实传输大小: ${bytes} bytes`);
                hasImages = data.hasImages || false;
            } catch (err: any) {
                setError(`Lighthouse 审计失败：${err.message}（请先运行 npm run server）`);
                setLoading(false);
                return;
            }
        }


        try {
            const calculator = new co2({ model: "swd" });

            const isGreenHosting = false;

            const traceResult = calculator.perByteTrace(bytes, isGreenHosting);

            console.log('traceResult.co2 实际内容：', traceResult.co2);

            let gramsCO2e: number;
            let displayInfo: string = '';

            if (typeof traceResult.co2 === 'number') {
                gramsCO2e = traceResult.co2;
                displayInfo = `直接数字排放: ${gramsCO2e.toFixed(4)} g CO₂e`;
            } else {
                const components = traceResult.co2;
                gramsCO2e = components.total;

                displayInfo = `详细组件排放：
      - 网络: ${components.networkCO2.toFixed(3)} g
      - 数据中心: ${components.dataCenterCO2.toFixed(3)} g
      - 消费者设备: ${components.consumerDeviceCO2.toFixed(3)} g
      - 设备生产: ${components.productionCO2.toFixed(3)} g
      总计: ${components.total.toFixed(4)} g CO₂e`;
            }

            let rating = 'F';
            if (gramsCO2e < 0.2) rating = 'A+';
            else if (gramsCO2e < 0.5) rating = 'A';
            else if (gramsCO2e < 1.0) rating = 'B';
            else if (gramsCO2e < 2.0) rating = 'C';
            else if (gramsCO2e < 5.0) rating = 'D';

            const avgGrams = 0.8;
            const cleanerThan = Math.max(0, Math.min(100, Math.round(100 - (gramsCO2e / avgGrams) * 100)));

            const optimizationSuggestions = [];

            // 根据 bytes 和 gramsCO2e 生成动态建议
            if (hasImages && bytes > 1500000) {  // > 1.5MB
                optimizationSuggestions.push({
                    id: 'lazy-loading',
                    title: '启用图片懒加载',
                    description: '延迟加载屏幕外图片，减少首次传输量',
                    estimatedSavings: Math.min(0.15, gramsCO2e * 0.3).toFixed(3),  // 估算节省 30%
                    codeSnippet: `<img src="..." alt="..." loading="lazy" width="..." height="..." />`,
                    priority: 1
                });
            }

            if (hasImages && bytes > 800000) {  // > 800KB 且有图片需求
                optimizationSuggestions.push({
                    id: 'webp-conversion',
                    title: '图片转换为 WebP 格式',
                    description: 'WebP 压缩率高 25–35%，显著降低图片体积',
                    estimatedSavings: Math.min(0.3, gramsCO2e * 0.4).toFixed(3),
                    codeSnippet: `<picture><source srcset="..." type="image/webp" /><img src="..." /></picture>`,
                    priority: 2
                });
            }

            if (bytes > 500000) {  // > 500KB JS 可能多
                optimizationSuggestions.push({
                    id: 'code-splitting',
                    title: '启用代码分割（React.lazy）',
                    description: '延迟加载非首屏组件，减少首屏 JS 体积',
                    estimatedSavings: Math.min(0.2, gramsCO2e * 0.25).toFixed(3),
                    codeSnippet: `const Component = React.lazy(() => import('./Component'));\n<Suspense fallback={<div>加载中...</div>}><Component /></Suspense>`,
                    priority: 3
                });
            }

            // 总是加碳感知暗模式（设备端节省）
            optimizationSuggestions.push({
                id: 'carbon-dark-mode',
                title: '碳感知暗模式',
                description: '高碳电网或低电量时自动切换深色主题，节省显示能耗',
                estimatedSavings: Math.min(0.12, gramsCO2e * 0.15).toFixed(3),
                codeSnippet: `@media (prefers-color-scheme: dark) and (prefers-reduced-data: reduce) { body { background: #121212; color: #e0e0e0; } }`,
                priority: 4
            });

            // 按优先级排序
            optimizationSuggestions.sort((a, b) => a.priority - b.priority);

            setResult({
                url: input.trim(),
                bytes: bytes.toLocaleString(),
                gramsCO2e: gramsCO2e.toFixed(4),
                cleanerThan: `${cleanerThan}%`,
                rating,
                isGreenHosting: isGreenHosting ? '是' : '否（默认）',
                modelUsed: 'Sustainable Web Design v4',
                displayInfo,
                optimizationSuggestions,
                hasImages,
            });
        } catch (err: any) {
            setError(`计算失败：${err.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return { calculate, loading, error, result };
};