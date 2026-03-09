// src/components/Dashboard.tsx
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import type { CalculationResult } from '@/types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardProps {
    result: CalculationResult;
    comparison: ReturnType<typeof import('@/utils/compareOptimization').compareOptimization>;
}

export default function Dashboard({ result, comparison }: DashboardProps) {
    const { original, optimized, savings } = comparison;

    // 柱状图：前后对比
    const barData = {
        labels: ['原始排放', '优化后排放'],
        datasets: [{
            label: '碳排放 (g CO₂e)',
            data: [parseFloat(original.gramsCO2e), parseFloat(optimized.gramsCO2e)],
            backgroundColor: ['#e53e3e', '#38a169'],
        }],
    };

    // 饼图：当前组件占比（如果有 breakdown）
    const pieData = {
        labels: ['网络', '数据中心', '设备端', '生产'],
        datasets: [{
            data: [0.4, 0.3, 0.2, 0.1], // 占位，实际可从 displayInfo 解析
            backgroundColor: ['#3182ce', '#e53e3e', '#38a169', '#ecc94b'],
        }],
    };

    return (
        <div style={{ marginTop: '24px' }}>
            <h3 style={{ textAlign: 'center', color: '#2f855a' }}>优化前后对比</h3>

            <div style={{ display: 'flex', justifyContent: 'space-around', gap: '32px' }}>
                {/* 柱状图 */}
                <div style={{ width: '45%' }}>
                    <Bar
                        data={barData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: '碳排放对比 (g CO₂e)' },
                            },
                        }}
                    />
                </div>

                {/* 饼图 */}
                <div style={{ width: '45%' }}>
                    <Pie
                        data={pieData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' },
                                title: { display: true, text: '当前排放组成占比' },
                            },
                        }}
                    />
                </div>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <p>节省量：{savings.grams.toFixed(3)} g CO₂e ({savings.percent.toFixed(1)}%)</p>
                <p>原始评级：{original.rating} → 优化后：{optimized.rating}</p>
            </div>
        </div>
    );
}