'use client';

import { Card, Typography, Space, Tag, Modal } from 'antd';
import { 
  BulbOutlined, 
  AppstoreOutlined, 
  TeamOutlined,
  SwapOutlined 
} from '@ant-design/icons';
import { WorkflowMode } from '@/lib/types';
import { modeConfigs } from '@/lib/mode-config';

const { Text, Title } = Typography;

interface ModeSelectorProps {
  selectedMode: WorkflowMode | null;
  onModeSelect: (mode: WorkflowMode) => void;
  hasData?: boolean;
}

const modeIcons: Record<WorkflowMode, React.ReactNode> = {
  idea: <BulbOutlined style={{ fontSize: 24 }} />,
  product: <AppstoreOutlined style={{ fontSize: 24 }} />,
  team: <TeamOutlined style={{ fontSize: 24 }} />,
};

const modeColors: Record<WorkflowMode, string> = {
  idea: '#722ed1',
  product: '#1890ff',
  team: '#52c41a',
};

export default function ModeSelector({ 
  selectedMode, 
  onModeSelect, 
  hasData = false 
}: ModeSelectorProps) {
  const handleModeClick = (mode: WorkflowMode) => {
    if (hasData && selectedMode && selectedMode !== mode) {
      Modal.confirm({
        title: 'Change workflow mode?',
        content: 'Switching modes may hide some fields. Your data will be preserved, but some fields may not be visible in the new mode.',
        okText: 'Switch Mode',
        cancelText: 'Cancel',
        onOk: () => onModeSelect(mode),
      });
    } else {
      onModeSelect(mode);
    }
  };

  // Compact view when mode is selected
  if (selectedMode) {
    const config = modeConfigs[selectedMode];
    return (
      <div 
        style={{ 
          marginBottom: 16,
          padding: '12px 16px',
          background: '#1f1f1f',
          borderRadius: 8,
          border: `1px solid ${modeColors[selectedMode]}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <span style={{ color: modeColors[selectedMode] }}>
            {modeIcons[selectedMode]}
          </span>
          <div>
            <Text strong style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
              {config.name}
            </Text>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
              {config.description}
            </Text>
          </div>
        </Space>
        <Tag 
          icon={<SwapOutlined />}
          onClick={() => onModeSelect(null as unknown as WorkflowMode)}
          style={{ 
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid #424242',
          }}
        >
          Change
        </Tag>
      </div>
    );
  }

  // Full selection view
  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={5} style={{ marginBottom: 16, color: 'rgba(255, 255, 255, 0.85)' }}>
        How would you like to start?
      </Title>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {(Object.keys(modeConfigs) as WorkflowMode[]).map((mode) => {
          const config = modeConfigs[mode];
          return (
            <Card
              key={mode}
              hoverable
              onClick={() => handleModeClick(mode)}
              style={{
                background: '#1f1f1f',
                border: '1px solid #424242',
                cursor: 'pointer',
              }}
              styles={{
                body: { padding: '16px 20px' }
              }}
            >
              <Space align="start">
                <span style={{ color: modeColors[mode], marginTop: 2 }}>
                  {modeIcons[mode]}
                </span>
                <div>
                  <Text strong style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.85)' }}>
                    {config.name}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {config.description}
                  </Text>
                </div>
              </Space>
            </Card>
          );
        })}
      </Space>
    </div>
  );
}
