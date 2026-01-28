'use client';

import { useState } from 'react';
import { Form, Input, Tabs, Tag, Space, Typography, Button, Alert, Tooltip } from 'antd';
import { 
  CheckCircleFilled, 
  LockOutlined, 
  LinkOutlined,
  ApiOutlined,
  FileTextOutlined,
  BgColorsOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';
import { DesignSystemConfig, commonDesignSystems } from '@/lib/types';

const { TextArea } = Input;
const { Text, Title } = Typography;

type DesignSystemMode = 'vibe' | 'picker' | 'locked';

interface DesignSystemInputProps {
  mode: DesignSystemMode;
  value?: DesignSystemConfig;
  onChange?: (config: DesignSystemConfig) => void;
}

export default function DesignSystemInput({ 
  mode, 
  value,
  onChange 
}: DesignSystemInputProps) {
  const [activeTab, setActiveTab] = useState('popular');
  
  const handleConfigChange = (updates: Partial<DesignSystemConfig>) => {
    onChange?.({
      ...value,
      ...updates,
    } as DesignSystemConfig);
  };

  // ============================================
  // VIBE MODE - Idea Exploration (descriptive)
  // ============================================
  if (mode === 'vibe') {
    return (
      <div>
        <div className="section-title" style={{ marginBottom: 8 }}>
          <BgColorsOutlined />
          <Title level={5} style={{ margin: 0 }}>Design Vibe</Title>
        </div>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Describe the feeling and aesthetic you want. Don&apos;t worry about specific components yet.
        </Text>

        <Form.Item
          label="Tone & Vibe"
          tooltip="What's the overall feel? Playful, professional, minimal, bold, warm, etc."
        >
          <TextArea
            rows={2}
            placeholder="e.g., Clean and minimal with subtle animations, feels premium but approachable"
            value={value?.toneDescription || ''}
            onChange={(e) => handleConfigChange({ 
              type: 'vibe', 
              toneDescription: e.target.value 
            })}
          />
        </Form.Item>

        <Form.Item
          label="Brand Feel (Optional)"
          tooltip="Any brand references or visual inspirations?"
        >
          <TextArea
            rows={2}
            placeholder="e.g., Like Linear meets Notion - focused, calm, productive"
            value={value?.brandFeel || ''}
            onChange={(e) => handleConfigChange({ 
              type: 'vibe', 
              brandFeel: e.target.value 
            })}
          />
        </Form.Item>
      </div>
    );
  }

  // ============================================
  // PICKER MODE - Build a Product (concrete)
  // ============================================
  if (mode === 'picker') {
    const selectedSystem = commonDesignSystems.find(
      ds => ds.id === value?.systemName
    );

    const tabItems = [
      {
        key: 'popular',
        label: (
          <span>
            <AppstoreOutlined style={{ marginRight: 4 }} />
            Popular Systems
          </span>
        ),
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Pick a popular component library - we&apos;ll instruct the AI to use its patterns.
            </Text>
            <Space wrap size={[8, 8]}>
              {commonDesignSystems.map((system) => {
                const isSelected = value?.systemName === system.id;
                return (
                  <Tooltip key={system.id} title={system.description}>
                    <Tag
                      onClick={() => handleConfigChange({ 
                        type: 'system', 
                        systemName: system.id 
                      })}
                      style={{
                        cursor: 'pointer',
                        padding: '6px 14px',
                        fontSize: 13,
                        background: isSelected ? '#1890ff' : '#2a2a2a',
                        border: isSelected ? '1px solid #1890ff' : '1px solid #424242',
                        color: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      {isSelected && <CheckCircleFilled style={{ marginRight: 6 }} />}
                      {system.name}
                    </Tag>
                  </Tooltip>
                );
              })}
            </Space>
            {selectedSystem && (
              <Alert
                message={selectedSystem.description}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        ),
      },
      {
        key: 'mcp',
        label: (
          <span>
            <CloudServerOutlined style={{ marginRight: 4 }} />
            MCP Server
          </span>
        ),
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Connect to an MCP server that provides design system context.
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="mcp://design-system.yourcompany.com"
                prefix={<ApiOutlined />}
                value={value?.mcpServerUrl || ''}
                onChange={(e) => handleConfigChange({ 
                  type: 'mcp', 
                  mcpServerUrl: e.target.value 
                })}
              />
              <Button type="primary">Test Connection</Button>
            </Space.Compact>
            {value?.mcpConnectionStatus === 'connected' && (
              <Tag color="success" style={{ marginTop: 8 }}>Connected</Tag>
            )}
          </div>
        ),
      },
      {
        key: 'llm-txt',
        label: (
          <span>
            <FileTextOutlined style={{ marginRight: 4 }} />
            llm.txt / Docs
          </span>
        ),
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Provide a URL to your design system&apos;s llm.txt or documentation that the AI can reference.
            </Text>
            <Input
              placeholder="https://your-company.com/design-system/llm.txt"
              prefix={<LinkOutlined />}
              value={value?.llmTxtUrl || ''}
              onChange={(e) => handleConfigChange({ 
                type: 'llm-txt', 
                llmTxtUrl: e.target.value 
              })}
            />
          </div>
        ),
      },
      {
        key: 'custom',
        label: 'Custom',
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Describe your design system, tokens, or styling approach manually.
            </Text>
            <TextArea
              rows={4}
              placeholder="e.g., Use a custom design system with 8px grid, Inter font, blue-500 as primary color, rounded corners (8px), subtle shadows for elevation..."
              value={value?.toneDescription || ''}
              onChange={(e) => handleConfigChange({ 
                type: 'vibe', 
                toneDescription: e.target.value 
              })}
            />
          </div>
        ),
      },
    ];

    return (
      <div>
        <div className="section-title" style={{ marginBottom: 8 }}>
          <AppstoreOutlined />
          <Title level={5} style={{ margin: 0 }}>Design System</Title>
        </div>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Choose how to define your design system. The AI will follow these patterns and components.
        </Text>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />
      </div>
    );
  }

  // ============================================
  // LOCKED MODE - Team Project (enforced)
  // ============================================
  if (mode === 'locked') {
    const tabItems = [
      {
        key: 'figma',
        label: (
          <span>
            <LinkOutlined style={{ marginRight: 4 }} />
            Figma File
          </span>
        ),
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Link your team&apos;s Figma design system - we&apos;ll match its components and styles.
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="https://www.figma.com/file/xxx/Design-System"
                prefix={<LinkOutlined />}
                value={value?.figmaFileUrl || ''}
                onChange={(e) => handleConfigChange({ 
                  type: 'figma', 
                  figmaFileUrl: e.target.value 
                })}
              />
              <Button type="primary">Connect Figma</Button>
            </Space.Compact>
            {value?.figmaConnectionStatus === 'connected' && (
              <Tag color="success" style={{ marginTop: 8 }}>
                <CheckCircleFilled /> Connected to Figma
              </Tag>
            )}
          </div>
        ),
      },
      {
        key: 'mcp',
        label: (
          <span>
            <CloudServerOutlined style={{ marginRight: 4 }} />
            MCP Server
          </span>
        ),
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Connect to your team&apos;s design system MCP for real-time component context.
            </Text>
            <Space.Compact style={{ width: '100%' }}>
              <Input
                placeholder="mcp://design-system.yourcompany.com"
                prefix={<ApiOutlined />}
                value={value?.mcpServerUrl || ''}
                onChange={(e) => handleConfigChange({ 
                  type: 'mcp', 
                  mcpServerUrl: e.target.value 
                })}
              />
              <Button type="primary">Connect</Button>
            </Space.Compact>
            {value?.mcpConnectionStatus === 'connected' && (
              <Tag color="success" style={{ marginTop: 8 }}>
                <CheckCircleFilled /> MCP Connected
              </Tag>
            )}
          </div>
        ),
      },
      {
        key: 'tokens',
        label: (
          <span>
            <FileTextOutlined style={{ marginRight: 4 }} />
            Design Tokens
          </span>
        ),
        children: (
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
              Paste or upload your design tokens JSON file.
            </Text>
            <TextArea
              rows={6}
              placeholder={`{
  "colors": {
    "primary": "#3b82f6",
    "secondary": "#64748b"
  },
  "spacing": {
    "unit": "8px"
  }
}`}
              value={value?.tokensJson || ''}
              onChange={(e) => handleConfigChange({ 
                type: 'tokens', 
                tokensJson: e.target.value 
              })}
              style={{ fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>
        ),
      },
    ];

    const getLockedSource = () => {
      if (value?.figmaFileUrl) return 'Figma Design System';
      if (value?.mcpServerUrl) return 'MCP Server';
      if (value?.tokensJson) return 'Design Tokens';
      return null;
    };

    const lockedSource = getLockedSource();

    return (
      <div>
        <div className="section-title" style={{ marginBottom: 8 }}>
          <LockOutlined style={{ color: '#52c41a' }} />
          <Title level={5} style={{ margin: 0 }}>Team Design System</Title>
          {lockedSource && (
            <Tag color="green" style={{ marginLeft: 8 }}>
              <LockOutlined /> Locked to: {lockedSource}
            </Tag>
          )}
        </div>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Connect your team&apos;s design system source. This ensures all generated designs match your existing product.
        </Text>

        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />
      </div>
    );
  }

  return null;
}
