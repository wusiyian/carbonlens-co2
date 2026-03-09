// src/utils/compareOptimization.ts

import type { CalculationResult } from '@/types';
import { computeCarbonFootprint } from './computeCarbonFootprint';

/**
 * 模拟优化前后碳排放对比
 * @param currentResult 当前计算结果
 * @param reductionRate 模拟减少比例（默认 0.35，即 35% 减少）
 * @returns 对比数据
 */
export function compareOptimization(
    currentResult: CalculationResult,
    reductionRate: number = 0.35  // 默认减少 35%（可通过 UI 调节）
): {
    original: CalculationResult;
    optimized: CalculationResult;
    savings: { grams: number; percent: number };
} {
    const originalBytes = parseInt(currentResult.bytes.replace(/,/g, ''), 10); // 去掉千分位逗号
    const optimizedBytes = Math.round(originalBytes * (1 - reductionRate));

    // 用相同绿电状态重新计算优化后
    const optimizedCarbon = computeCarbonFootprint(optimizedBytes, currentResult.isGreenHosting === '是（绿电托管）');

    const originalGrams = parseFloat(currentResult.gramsCO2e);
    const optimizedGrams = optimizedCarbon.adjustedGramsCO2e;

    const savingsGrams = originalGrams - optimizedGrams;
    const savingsPercent = originalGrams > 0 ? (savingsGrams / originalGrams) * 100 : 0;

    return {
        original: currentResult,
        optimized: {
            ...currentResult,
            gramsCO2e: optimizedGrams.toFixed(4),
            cleanerThan: optimizedCarbon.cleanerThan,
            rating: optimizedCarbon.rating,
            displayInfo: optimizedCarbon.displayInfo,
            bytes: optimizedBytes.toLocaleString(),
        },
        savings: {
            grams: savingsGrams,
            percent: savingsPercent,
        },
    };
}