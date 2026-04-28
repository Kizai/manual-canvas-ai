import { Select } from 'antd';

export function LanguageSelect(props: { value?: string; onChange?: (value: string) => void }) {
  return <Select style={{ width: 140 }} options={[{ value: 'zh-CN', label: '中文' }, { value: 'en-US', label: '英文' }, { value: 'ja-JP', label: '日文' }]} {...props} />;
}
