
/**
 * 优化建议单条的类型
 */
export interface OptimizationSuggestion {
    id: string;
    title: string;
    description: string;
    estimatedSavings: string;     // 如 "0.150"
    codeSnippet: string;
    priority: number;
}

/**
 * 计算结果完整类型（用于 useCarbonCalculator 的 result）
 */
export interface CalculationResult {
    url: string;
    bytes: string;
    gramsCO2e: string;
    cleanerThan: string;
    rating: string;
    isGreenHosting: string;
    modelUsed: string;
    displayInfo: string;
    optimizationSuggestions: OptimizationSuggestion[];
    hasImages: boolean;
    hasFonts: boolean;
    hasCSS: boolean;
    // hasBlockingJS: boolean;  // 已注释删除，如果你以后恢复可取消注释
}