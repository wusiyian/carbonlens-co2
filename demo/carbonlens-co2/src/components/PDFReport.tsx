// src/components/PDFReport.tsx
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { CalculationResult } from '@/types';
import NotoSansSCRegular from '@/assets/fonts/NotoSansSC-Regular.ttf';
// 注册中文字体（本地文件或 CDN）
Font.register({
    family: 'NotoSansSC',
    src: NotoSansSCRegular,
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'NotoSansSC',  // 切换到支持中文的字体
        fontSize: 12,
        lineHeight: 1.5,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: '#2f855a',
    },
    section: {
        marginBottom: 20,
    },
    heading: {
        fontSize: 18,
        marginBottom: 8,
        color: '#2f855a',
        fontWeight: 'bold',
    },
    text: {
        marginBottom: 4,
    },
    suggestion: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f8fafc',
    },
    suggestionTitle: {
        fontWeight: 'bold',
        color: '#2f855a',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: '#718096',
    },
});

interface PDFReportProps {
    result: CalculationResult;
    comparison?: ReturnType<typeof import('@/utils/compareOptimization').compareOptimization>;
}

export const PDFReport = ({ result, comparison }: PDFReportProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <Text style={styles.title}>绿色网页审计报告</Text>

            <View style={styles.section}>
                <Text style={styles.heading}>基本信息</Text>
                <Text style={styles.text}>网址：{result.url}</Text>
                <Text style={styles.text}>传输大小：{result.bytes} bytes</Text>
                <Text style={styles.text}>碳排放（每视图）：{result.gramsCO2e} g CO₂e</Text>
                <Text style={styles.text}>评级：{result.rating}</Text>
                <Text style={styles.text}>比平均网页更清洁：{result.cleanerThan}</Text>
                <Text style={styles.text}>绿色托管：{result.isGreenHosting}</Text>
                <Text style={styles.text}>计算模型：{result.modelUsed}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>优化建议</Text>
                {result.optimizationSuggestions.map(s => (
                    <View key={s.id} style={styles.suggestion}>
                        <Text style={styles.suggestionTitle}>{s.title}</Text>
                        <Text>{s.description}</Text>
                        <Text style={{ fontSize: 11, color: '#718096' }}>
                            预计节省：{s.estimatedSavings} g CO₂e
                        </Text>
                    </View>
                ))}
            </View>

            {comparison && (
                <View style={styles.section}>
                    <Text style={styles.heading}>优化前后对比</Text>
                    <Text style={styles.text}>
                        原始排放：{comparison.original.gramsCO2e} g CO₂e
                    </Text>
                    <Text style={styles.text}>
                        优化后排放：{comparison.optimized.gramsCO2e} g CO₂e
                    </Text>
                    <Text style={styles.text}>
                        节省量：{comparison.savings.grams.toFixed(3)} g CO₂e
                        ({comparison.savings.percent.toFixed(1)}%)
                    </Text>
                    <Text style={styles.text}>
                        原始评级：{comparison.original.rating} → 优化后评级：{comparison.optimized.rating}
                    </Text>
                </View>
            )}

            <Text style={styles.footer}>
                生成于 {new Date().toLocaleString()} • 使用 CarbonLens 绿色审计工具
            </Text>
        </Page>
    </Document>
);