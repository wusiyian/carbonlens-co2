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

            setResult({
                url: input.trim(),
                bytes: bytes.toLocaleString(),
                gramsCO2e: gramsCO2e.toFixed(4),
                cleanerThan: `${cleanerThan}%`,
                rating,
                isGreenHosting: isGreenHosting ? '是' : '否（默认）',
                modelUsed: 'Sustainable Web Design v4',
                displayInfo,
            });
        } catch (err: any) {
            setError(`计算失败：${err.message || '未知错误'}`);
        } finally {
            setLoading(false);
        }
    };

    return { calculate, loading, error, result };
};