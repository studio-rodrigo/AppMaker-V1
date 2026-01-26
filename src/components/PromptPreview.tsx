'use client';

import { useMemo, useState } from 'react';
import { Card, Button, Typography, Space, Progress, Modal, message, Dropdown } from 'antd';
import { CopyOutlined, CheckOutlined, RocketOutlined, ExportOutlined, DownOutlined } from '@ant-design/icons';
import { PromptData } from '@/lib/types';
import { generatePrompt, getCompletenessScore } from '@/lib/prompt-generator';
import { generateCursorPrompt, getSafeFilename } from '@/lib/cursor-export';
import type { PlatformType } from '@/lib/platform-types';

const { Title, Text, Paragraph } = Typography;

interface PromptPreviewProps {
  data: PromptData;
}

export default function PromptPreview({ data }: PromptPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [showEnhancePlatformModal, setShowEnhancePlatformModal] = useState(false);
  const [enhancedPlatform, setEnhancedPlatform] = useState<PlatformType>('figma-make');
  
  const prompt = generatePrompt(data);
  const completeness = getCompletenessScore(data);

  const platformOptions = useMemo(() => {
    return [
      {
        key: 'figma-make' as const,
        name: 'Figma Make',
        description: 'Enhance for Figma Make (keeps MDC structure)',
      },
      {
        key: 'lovable' as const,
        name: 'Lovable',
        description: 'Transform into a full-stack build spec',
      },
      {
        key: 'cursor' as const,
        name: 'Cursor',
        description: 'Transform into implementation instructions',
      },
    ];
  }, []);

  const handleCopy = async (textToCopy?: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy || prompt);
      setCopied(true);
      message.success('Prompt copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      message.error('Failed to copy prompt');
    }
  };

  const requestEnhance = async (platform: PlatformType) => {
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, platform }),
      });

      const data = await response.json();

      if (data.error) {
        message.error(data.error);
        return;
      }

      if (data.enhanced) {
        setEnhancedPrompt(data.enhanced);
        setEnhancedPlatform(platform);
        setShowEnhancedModal(true);
      }
    } catch {
      message.error('Failed to enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleEnhanceClick = () => {
    setShowEnhancePlatformModal(true);
  };

  const handleEnhancePlatformSelect = async (platform: PlatformType) => {
    setShowEnhancePlatformModal(false);
    await requestEnhance(platform);
  };

  const handleUseEnhanced = async () => {
    if (enhancedPrompt) {
      await handleCopy(enhancedPrompt);
      setShowEnhancedModal(false);
    }
  };

  const handleExportCursor = async () => {
    const cursorPrompt = generateCursorPrompt(data);
    try {
      await navigator.clipboard.writeText(cursorPrompt);
      message.success('Cursor prompt copied! Paste it into Cursor to create a plan.');
    } catch {
      message.error('Failed to copy');
    }
  };

  const handleDownloadCursor = () => {
    const cursorPrompt = generateCursorPrompt(data);
    const filename = `${getSafeFilename(data)}-cursor-prompt.md`;
    const blob = new Blob([cursorPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Downloaded ${filename}`);
  };

  const handleDownloadFigma = () => {
    const filename = `${getSafeFilename(data)}-figma-prompt.md`;
    const blob = new Blob([prompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Downloaded ${filename}`);
  };

  const exportMenuItems = [
    {
      key: 'cursor-copy',
      label: 'Copy for Cursor (Plan Mode)',
      onClick: handleExportCursor,
    },
    {
      key: 'cursor-download',
      label: 'Download Cursor Prompt (.md)',
      onClick: handleDownloadCursor,
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'figma-download',
      label: 'Download Figma Make Prompt (.md)',
      onClick: handleDownloadFigma,
    },
  ];

  const getCompletenessStatus = () => {
    if (completeness >= 80) return 'success';
    if (completeness >= 50) return 'normal';
    return 'exception';
  };

  const getCompletenessText = () => {
    if (completeness >= 80) return 'Great! Your prompt is well-defined.';
    if (completeness >= 50) return 'Good progress. Consider filling in more details.';
    return 'Fill in more fields for a complete prompt.';
  };

  // Convert markdown-like syntax to styled text for preview
  const renderPromptPreview = () => {
    const lines = prompt.split('\n');
    return lines.map((line, index) => {
      // Bold text
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.slice(lastIndex, match.index));
        }
        parts.push(<strong key={`bold-${index}-${match.index}`}>{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(line.slice(lastIndex));
      }

      // Handle horizontal rules
      if (line === '---') {
        return <hr key={index} style={{ border: 'none', borderTop: '1px solid #424242', margin: '12px 0' }} />;
      }

      return (
        <div key={index} style={{ minHeight: line === '' ? '0.8em' : 'auto' }}>
          {parts.length > 0 ? parts : line}
        </div>
      );
    });
  };

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0, color: 'rgba(255, 255, 255, 0.85)' }}>Generated Prompt</Title>
        </Space>
      }
      extra={
        <Space>
          <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
            <Button icon={<ExportOutlined />}>
              Export <DownOutlined />
            </Button>
          </Dropdown>
          <Button
            icon={<RocketOutlined />}
            onClick={handleEnhanceClick}
            loading={isEnhancing}
          >
            Enhance
          </Button>
          <Button
            type="primary"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={() => handleCopy()}
            className={copied ? 'copy-success' : ''}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </Space>
      }
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      styles={{ body: { flex: 1, overflow: 'auto', padding: 16 } }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text type="secondary">Completeness</Text>
          <Text type="secondary">{completeness}%</Text>
        </div>
        <Progress 
          percent={completeness} 
          status={getCompletenessStatus()} 
          showInfo={false}
          size="small"
        />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {getCompletenessText()}
        </Text>
      </div>

      <div 
        className="prompt-preview"
        style={{ 
          background: '#141414', 
          padding: 16, 
          borderRadius: 6,
          border: '1px solid #424242',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        {renderPromptPreview()}
      </div>

      <Paragraph 
        type="secondary" 
        style={{ marginTop: 16, fontSize: 12 }}
      >
        <strong>Copy</strong> → Paste into Figma Make to generate designs.<br />
        <strong>Export → Copy for Cursor</strong> → Paste into Cursor to create an implementation plan.
      </Paragraph>

      <Modal
        title={`AI-Enhanced Prompt (${enhancedPlatform})`}
        open={showEnhancedModal}
        onCancel={() => setShowEnhancedModal(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setShowEnhancedModal(false)}>
            Cancel
          </Button>,
          <Button key="copy" type="primary" onClick={handleUseEnhanced}>
            Copy Enhanced Prompt
          </Button>,
        ]}
      >
        <div 
          style={{ 
            background: '#141414', 
            padding: 16, 
            borderRadius: 6,
            border: '1px solid #424242',
            maxHeight: '60vh',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          {enhancedPrompt}
        </div>
      </Modal>

      <Modal
        title="Enhance for..."
        open={showEnhancePlatformModal}
        onCancel={() => setShowEnhancePlatformModal(false)}
        footer={null}
        width={560}
      >
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
          {platformOptions.map((p) => (
            <Card
              key={p.key}
              hoverable
              onClick={() => handleEnhancePlatformSelect(p.key)}
              styles={{ body: { padding: 16 } }}
            >
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text strong>{p.name}</Text>
                <Text type="secondary">{p.description}</Text>
              </Space>
            </Card>
          ))}
        </Space>
      </Modal>
    </Card>
  );
}
