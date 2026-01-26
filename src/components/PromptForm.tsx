'use client';

import { Form, Collapse, Button, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import PRDInput from './PRDInput';
import ProjectContext from './ProjectContext';
import JourneyBuilder from './JourneyBuilder';
import UIRequirements from './UIRequirements';
import { PromptData, defaultPromptData } from '@/lib/types';

interface PromptFormProps {
  onValuesChange: (changedValues: Partial<PromptData>, allValues: PromptData) => void;
  initialValues?: PromptData;
}

export default function PromptForm({ onValuesChange, initialValues }: PromptFormProps) {
  const [form] = Form.useForm<PromptData>();

  const handleReset = () => {
    form.resetFields();
    onValuesChange({}, defaultPromptData);
  };

  const collapseItems = [
    {
      key: '1',
      label: 'Project Context',
      children: <ProjectContext />,
    },
    {
      key: '0',
      label: 'PRD / Product Brief (Optional)',
      children: <PRDInput />,
    },
    {
      key: '2',
      label: 'User Journeys',
      children: <JourneyBuilder />,
    },
    {
      key: '3',
      label: 'UI Requirements & Supporting Screens',
      children: <UIRequirements />,
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || defaultPromptData}
      onValuesChange={onValuesChange}
      requiredMark="optional"
    >
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Reset Form
        </Button>
      </Space>

      <Collapse 
        defaultActiveKey={['1', '2', '3']} 
        items={collapseItems}
        accordion={false}
      />
    </Form>
  );
}
