import { Button, Upload } from 'antd';

export function UploadButton() {
  return <Upload beforeUpload={() => false}><Button>上传图片</Button></Upload>;
}
