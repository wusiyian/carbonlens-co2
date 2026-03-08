import { useState } from 'react';
import { co2 } from '@tgwf/co2';
import type { CalculationResult, OptimizationSuggestion } from '@/types';


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
        let hasFonts = false;
        let hasCSS = false;
        // let hasBlockingJS = false;
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
                hasImages = data.hasImages || false;
                hasFonts = data.hasFonts || false;        // ← 赋值
                hasCSS = data.hasCSS || false;            // ← 赋值
                // hasBlockingJS = data.hasBlockingJS || false; // ← 赋值
                console.log(data);
            } catch (err: any) {
                setError(`Lighthouse 审计失败：${err.message}（请先运行 npm run server）`);
                setLoading(false);
                return;
            }
        }

        try {
            const calculator = new co2({ model: "swd" });

            let isGreenHosting = false;
            let greenHostingNote = '否（默认）';
            let greenHostingProvider = '未知';

            if (input.startsWith('http')) {
                try {
                    const domain = new URL(input.trim()).hostname;
                    const apiUrl = `https://api.thegreenwebfoundation.org/api/v3/greencheck/${domain}`;
                    const response = await fetch(apiUrl);

                    if (!response.ok) {
                        throw new Error(`绿电检测 API 返回 ${response.status}`);
                    }

                    const hostCheck = await response.json();

                    console.log('绿电检测 API 返回：', hostCheck);  // 打印查看结构

                    isGreenHosting = hostCheck.green === true;
                    greenHostingNote = isGreenHosting ? '是（绿电托管）' : '否（非绿电）';
                    greenHostingProvider = hostCheck.hosted_by || '未知';
                } catch (err) {
                    console.warn('绿电检测失败，使用默认值', err);
                }
            }
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

                // 如果是绿电，减免数据中心部分排放（示例减 80%）
                let adjustedGramsCO2e = gramsCO2e;
                if (isGreenHosting && typeof traceResult.co2 !== 'number') {
                    const components = traceResult.co2;
                    adjustedGramsCO2e = components.networkCO2 + (components.dataCenterCO2 * 0.2) + components.consumerDeviceCO2 + components.productionCO2;
                }

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

            const generateOptimizationSuggestions = (
                bytes: number,
                gramsCO2e: number,
                hasImages: boolean,
                hasFonts: boolean,
                hasCSS: boolean,
                // hasBlockingJS: boolean
            ) => {
                const suggestions = [];
                // 根据 bytes 和 gramsCO2e 生成动态建议
                if (hasImages && bytes > 1500000) {  // > 1.5MB
                    suggestions.push({
                        id: 'lazy-loading',
                        title: '启用图片懒加载',
                        description: '延迟加载屏幕外图片，减少首次传输量',
                        estimatedSavings: Math.min(0.15, gramsCO2e * 0.3).toFixed(3),  // 估算节省 30%
                        codeSnippet: `<img src="..." alt="..." loading="lazy" width="..." height="..." />`,
                        priority: 1
                    });
                }

                if (hasImages && bytes > 800000) {  // > 800KB 且有图片需求
                    suggestions.push({
                        id: 'webp-conversion',
                        title: '图片转换为 WebP 格式',
                        description: 'WebP 压缩率高 25–35%，显著降低图片体积',
                        estimatedSavings: Math.min(0.3, gramsCO2e * 0.4).toFixed(3),
                        codeSnippet: `<picture><source srcset="..." type="image/webp" /><img src="..." /></picture>`,
                        priority: 2
                    });
                }

                if (bytes > 500000) {  // > 500KB JS 可能多
                    suggestions.push({
                        id: 'code-splitting',
                        title: '启用代码分割（React.lazy）',
                        description: '延迟加载非首屏组件，减少首屏 JS 体积',
                        estimatedSavings: Math.min(0.2, gramsCO2e * 0.25).toFixed(3),
                        codeSnippet: `const Component = React.lazy(() => import('./Component'));\n<Suspense fallback={<div>加载中...</div>}><Component /></Suspense>`,
                        priority: 3
                    });
                }

                // 总是加碳感知暗模式（设备端节省）
                suggestions.push({
                    id: 'carbon-dark-mode',
                    title: '碳感知暗模式',
                    description: '高碳电网或低电量时自动切换深色主题，节省显示能耗',
                    estimatedSavings: Math.min(0.12, gramsCO2e * 0.15).toFixed(3),
                    codeSnippet: `@media (prefers-color-scheme: dark) and (prefers-reduced-data: reduce) { body { background: #121212; color: #e0e0e0; } }`,
                    priority: 4
                });

                if (!isGreenHosting) {
                    suggestions.push({
                        id: 'green-hosting',
                        title: '迁移到绿电托管平台',
                        description: '当前服务器非绿电，建议迁移到 Vercel、Netlify 或 Google Cloud 绿电区域，可大幅降低数据中心排放',
                        estimatedSavings: Math.min(0.5, gramsCO2e * 0.6).toFixed(3),
                        codeSnippet: '无需代码变更，直接迁移域名到绿电平台（如 Vercel.com）',
                        priority: 0  // 最高优先级
                    });
                }

                // 新加：字体子集化
                if (hasFonts && bytes > 1000000) {
                    suggestions.push({
                        id: 'font-subsetting',
                        title: '启用字体子集化',
                        description: '只加载页面实际使用字符，减少字体文件大小 50%~90%',
                        estimatedSavings: Math.min(0.2, gramsCO2e * 0.5).toFixed(3),
                        codeSnippet: `<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700&subset=latin&display=swap" rel="stylesheet">`,
                        priority: 5
                    });
                }

                // 新加：CSS压缩
                if (hasCSS && bytes > 500000) {
                    suggestions.push({
                        id: 'css-minification',
                        title: '启用 CSS 压缩',
                        description: '去除空格/注释，减少 CSS 体积 10%~30%',
                        estimatedSavings: Math.min(0.1, gramsCO2e * 0.2).toFixed(3),
                        codeSnippet: `// vite.config.ts\nimport cssnano from 'cssnano';\nexport default { plugins: [cssnano()] };`,
                        priority: 6
                    });
                }

                // 新加：JS异步加载
                // if (hasBlockingJS && bytes > 500000) {
                //     suggestions.push({
                //         id: 'js-async-loading',
                //         title: '启用 JS 异步加载',
                //         description: '使用 async/defer 减少阻塞时间 20%~50%',
                //         estimatedSavings: Math.min(0.15, gramsCO2e * 0.3).toFixed(3),
                //         codeSnippet: `<script src="script.js" async></script>\n<script src="script.js" defer></script>`,
                //         priority: 7
                //     });
                // }
                // 按优先级排序
                return suggestions.sort((a, b) => a.priority - b.priority);
            }

            const optimizationSuggestions = generateOptimizationSuggestions(
                bytes,
                gramsCO2e,
                hasImages,
                hasFonts,
                hasCSS,
                // hasBlockingJS
            );

            setResult({
                url: input.trim(),
                bytes: bytes.toLocaleString(),
                gramsCO2e: gramsCO2e.toFixed(4),
                cleanerThan: `${cleanerThan}%`,
                rating,
                isGreenHosting: greenHostingNote,
                modelUsed: 'Sustainable Web Design v4',
                displayInfo,
                optimizationSuggestions,
                hasImages,
                hasFonts,
                hasCSS,
                // hasBlockingJS
            });
        } catch (err: any) {
            setError(`计算失败：${err.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return { calculate, loading, error, result };
};