import { useState } from 'react';
import type { CalculationResult } from '@/types';
import { generateOptimizationSuggestions } from '@/utils/generateSuggestions';
import { fetchLighthouseAudit } from '@/api/lighthouse';
import { fetchGreenHosting } from '@/api/greenHosting';
import { computeCarbonFootprint } from '@/utils/computeCarbonFootprint';

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
            const auditData = await fetchLighthouseAudit(input.trim());

            if (!auditData.success) {
                setError(auditData.error || '审计失败');
                setLoading(false);
                return;
            }

            bytes = auditData.bytes;
            hasImages = auditData.hasImages;
            hasFonts = auditData.hasFonts;
            hasCSS = auditData.hasCSS;
        }

        try {
            let isGreenHosting = false;
            let greenHostingNote = '否（默认）';

            if (input.startsWith('http')) {
                try {
                    const domain = new URL(input.trim()).hostname;
                    const hostCheck = await fetchGreenHosting(domain);

                    if (hostCheck) {
                        isGreenHosting = hostCheck.green === true;
                        greenHostingNote = isGreenHosting ? '是（绿电托管）' : '否（非绿电）';
                    }
                } catch (err) {
                    console.warn('绿电检测失败，使用默认值', err);
                }
            }

            const carbonResult = computeCarbonFootprint(bytes, isGreenHosting);

            const optimizationSuggestions = generateOptimizationSuggestions(
                bytes,
                carbonResult.adjustedGramsCO2e,
                hasImages,
                hasFonts,
                hasCSS,
                // hasBlockingJS
            );

            if (!isGreenHosting) {
                optimizationSuggestions.push({
                    id: 'green-hosting',
                    title: '迁移到绿电托管平台',
                    description: '当前服务器非绿电，建议迁移到 Vercel、Netlify 或 Google Cloud 绿电区域，可大幅降低数据中心排放',
                    estimatedSavings: Math.min(0.5, carbonResult.adjustedGramsCO2e * 0.6).toFixed(3),
                    codeSnippet: '无需代码变更，直接迁移域名到绿电平台（如 Vercel.com）',
                    priority: 0
                });
            }

            optimizationSuggestions.sort((a, b) => a.priority - b.priority);

            setResult({
                url: input.trim(),
                bytes: bytes.toLocaleString(),
                gramsCO2e: carbonResult.adjustedGramsCO2e.toFixed(4),
                cleanerThan: carbonResult.cleanerThan,
                rating: carbonResult.rating,
                isGreenHosting: greenHostingNote,
                modelUsed: 'Sustainable Web Design v4',
                displayInfo: carbonResult.displayInfo,
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