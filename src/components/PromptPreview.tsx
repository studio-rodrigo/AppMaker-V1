'use client';

import { useMemo, useState } from 'react';
import { Card, Button, Typography, Space, Progress, Modal, message, Dropdown, Alert, Tabs, Tag } from 'antd';
import { CopyOutlined, CheckOutlined, RocketOutlined, ExportOutlined, DownOutlined, ScissorOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import { PromptData } from '@/lib/types';
import { generatePrompt, getCompletenessScore } from '@/lib/prompt-generator';
import { generateCursorPrompt, getSafeFilename } from '@/lib/cursor-export';
import type { PlatformType } from '@/lib/platform-types';
import { PLATFORM_LIMITS, isOverLimit, getUsagePercent, formatCharCount } from '@/lib/prompt-limits';
import { splitPrompt, PromptPart } from '@/lib/prompt-splitter';

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
  const [splitParts, setSplitParts] = useState<PromptPart[]>([]);
  const [showSplitModal, setShowSplitModal] = useState(false);
  
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

      const responseData = await response.json();

      if (responseData.error) {
        message.error(responseData.error);
        return;
      }

      if (responseData.enhanced) {
        setEnhancedPrompt(responseData.enhanced);
        setEnhancedPlatform(platform);
        
        // Check if prompt exceeds platform limit
        if (isOverLimit(responseData.enhanced, platform)) {
          const parts = splitPrompt(responseData.enhanced, platform);
          setSplitParts(parts);
          if (parts.length > 1) {
            setShowSplitModal(true);
          } else {
            setShowEnhancedModal(true);
          }
        } else {
          setSplitParts([]);
          setShowEnhancedModal(true);
        }
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
        title={`AI-Enhanced Prompt (${PLATFORM_LIMITS[enhancedPlatform]?.name || enhancedPlatform})`}
        open={showEnhancedModal}
        onCancel={() => setShowEnhancedModal(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setShowEnhancedModal(false)}>
            Cancel
          </Button>,
          <Button key="download" icon={<DownloadOutlined />} onClick={() => {
            if (enhancedPrompt) {
              const filename = `${getSafeFilename(data)}-${enhancedPlatform}-enhanced.md`;
              const blob = new Blob([enhancedPrompt], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              message.success(`Downloaded ${filename}`);
            }
          }}>
            Download
          </Button>,
          <Button key="copy" type="primary" onClick={handleUseEnhanced}>
            Copy Enhanced Prompt
          </Button>,
        ]}
      >
        {/* Character count and limit info */}
        {enhancedPrompt && (
          <div style={{ marginBottom: 12 }}>
            <Space>
              <Text type="secondary">
                {formatCharCount(enhancedPrompt.length)} / {formatCharCount(PLATFORM_LIMITS[enhancedPlatform]?.maxChars || 0)} characters
              </Text>
              <Tag color={isOverLimit(enhancedPrompt, enhancedPlatform) ? 'error' : 'success'}>
                {getUsagePercent(enhancedPrompt, enhancedPlatform)}% of limit
              </Tag>
            </Space>
          </div>
        )}
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

      {/* Split Prompt Modal - shown when prompt exceeds limit */}
      <Modal
        title={
          <Space>
            <ScissorOutlined />
            <span>Prompt Exceeds {PLATFORM_LIMITS[enhancedPlatform]?.name || enhancedPlatform} Limit</span>
          </Space>
        }
        open={showSplitModal}
        onCancel={() => setShowSplitModal(false)}
        width={900}
        footer={[
          <Button key="cancel" onClick={() => setShowSplitModal(false)}>
            Cancel
          </Button>,
          <Button key="view-full" onClick={() => {
            setShowSplitModal(false);
            setShowEnhancedModal(true);
          }}>
            View Full Prompt
          </Button>,
        ]}
      >
        <Alert
          message={`Prompt is ${formatCharCount(enhancedPrompt?.length || 0)} characters (limit: ${formatCharCount(PLATFORM_LIMITS[enhancedPlatform]?.maxChars || 0)})`}
          description={`We've split this into ${splitParts.length} parts. Use each part sequentially - tell the AI to ask for the next part when done.`}
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Tabs
          items={splitParts.map((part) => ({
            key: String(part.partNumber),
            label: (
              <Space>
                Part {part.partNumber}
                <Tag>{formatCharCount(part.charCount)}</Tag>
              </Space>
            ),
            children: (
              <div>
                <Space style={{ marginBottom: 12 }}>
                  <Button 
                    type="primary" 
                    icon={<CopyOutlined />}
                    onClick={async () => {
                      await navigator.clipboard.writeText(part.content);
                      message.success(`Part ${part.partNumber} copied!`);
                    }}
                  >
                    Copy Part {part.partNumber}
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      const filename = `${getSafeFilename(data)}-${enhancedPlatform}-part${part.partNumber}.md`;
                      const blob = new Blob([part.content], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = filename;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                      message.success(`Downloaded ${filename}`);
                    }}
                  >
                    Download Part {part.partNumber}
                  </Button>
                </Space>
                <div 
                  style={{ 
                    background: '#141414', 
                    padding: 16, 
                    borderRadius: 6,
                    border: '1px solid #424242',
                    maxHeight: '40vh',
                    overflow: 'auto',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                >
                  {part.content}
                </div>
              </div>
            ),
          }))}
        />
        
        <div style={{ marginTop: 16 }}>
          <Button 
            icon={<DownloadOutlined />}
            onClick={() => {
              // Download all parts as a zip or concatenated file
              const allContent = splitParts.map(p => 
                `${'='.repeat(60)}\nPART ${p.partNumber} OF ${p.totalParts}\n${'='.repeat(60)}\n\n${p.content}`
              ).join('\n\n\n');
              const filename = `${getSafeFilename(data)}-${enhancedPlatform}-all-parts.md`;
              const blob = new Blob([allContent], { type: 'text/markdown' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              message.success(`Downloaded all parts`);
            }}
          >
            Download All Parts
          </Button>
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
