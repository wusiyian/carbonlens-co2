//输入表单

interface InputFormProps {
    inputValue: string;
    setInputValue: (value: string) => void;
    onCalculate: () => void;
    loading: boolean;
}

export default function InputForm({
    inputValue,
    setInputValue,
    onCalculate,
    loading,
}: InputFormProps) {
    return (
        <div className="input-card">
            <div className="form-group">
                <label>网址（推荐）或手动输入字节数</label>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="https://example.com 或 169719"
                />
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '8px' }}>
                    已切换为本地 Lighthouse 审计（更精确的真实传输大小）手动输入字节数更精确（F12 → Network → 底部 Transferred 值）
                </p>
            </div>

            <button onClick={onCalculate} disabled={loading}>
                {loading ? '计算中...' : '计算碳足迹'}
            </button>
        </div>
    );
}