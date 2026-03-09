import { co2 } from '@tgwf/co2';

/**
 * 计算碳足迹、调整排放、评级、清洁度百分比和显示信息
 * @param bytes 传输字节数
 * @param isGreenHosting 是否绿电托管
 * @returns 计算结果对象
 */
export function computeCarbonFootprint(bytes: number, isGreenHosting: boolean) {
    const calculator = new co2({ model: "swd" });

    const traceResult = calculator.perByteTrace(bytes, isGreenHosting);

    let gramsCO2e: number;
    let adjustedGramsCO2e: number;
    let displayInfo = '';

    if (typeof traceResult.co2 === 'number') {
        gramsCO2e = traceResult.co2;
        adjustedGramsCO2e = gramsCO2e;  // 无需调整
        displayInfo = `直接数字排放: ${gramsCO2e.toFixed(4)} g CO₂e`;
    } else {
        const components = traceResult.co2;
        gramsCO2e = components.total;

        adjustedGramsCO2e = gramsCO2e;  // 默认值
        if (isGreenHosting) {
            // 绿电减免数据中心 80%
            adjustedGramsCO2e = components.networkCO2 +
                (components.dataCenterCO2 * 0.2) +
                components.consumerDeviceCO2 +
                components.productionCO2;
        }

        displayInfo = `详细组件排放：
- 网络: ${components.networkCO2.toFixed(3)} g
- 数据中心: ${components.dataCenterCO2.toFixed(3)} g
- 消费者设备: ${components.consumerDeviceCO2.toFixed(3)} g
- 设备生产: ${components.productionCO2.toFixed(3)} g
总计: ${adjustedGramsCO2e.toFixed(4)} g CO₂e`;
    }

    // 评级
    let rating = 'F';
    if (adjustedGramsCO2e < 0.2) rating = 'A+';
    else if (adjustedGramsCO2e < 0.5) rating = 'A';
    else if (adjustedGramsCO2e < 1.0) rating = 'B';
    else if (adjustedGramsCO2e < 2.0) rating = 'C';
    else if (adjustedGramsCO2e < 5.0) rating = 'D';

    // 清洁度百分比（基准 0.8g）
    const avgGrams = 0.8;
    const cleanerThan = Math.max(0, Math.min(100, Math.round(100 - (adjustedGramsCO2e / avgGrams) * 100)));

    return {
        gramsCO2e,
        adjustedGramsCO2e,
        displayInfo,
        rating,
        cleanerThan: `${cleanerThan}%`,
    };
}