'use client';

import { useState } from 'react';
import { Form, Input, Typography, Alert, Button, Space, Modal, message, Card } from 'antd';
import { FileTextOutlined, ThunderboltOutlined, CopyOutlined, DownloadOutlined, CheckOutlined, UploadOutlined } from '@ant-design/icons';
import { PromptData } from '@/lib/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

type PRDVariant = 'primary' | 'generator';

interface PRDInputProps {
  promptData?: PromptData;
  onPRDGenerated?: (prdContent: string, prdSummary: string) => void;
  variant?: PRDVariant;
}

export default function PRDInput({ promptData, onPRDGenerated, variant = 'generator' }: PRDInputProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPRD, setGeneratedPRD] = useState<string | null>(null);
  const [showPRDModal, setShowPRDModal] = useState(false);
  const form = Form.useFormInstance();

  const currentPRDContent = form?.getFieldValue('prdContent') || '';

  const handleGeneratePRD = async () => {
    if (!promptData) {
      message.warning('Please fill in some project details first');
      return;
    }

    // Check if we have enough data to generate a meaningful PRD
    const hasBasicInfo = promptData.featureName?.trim() || promptData.problem?.trim();
    if (!hasBasicInfo) {
      message.warning('Please provide at least a feature name or problem statement');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptData }),
      });

      const result = await response.json();

      if (result.error) {
        message.error(result.error);
        return;
      }

      if (result.prdContent) {
        setGeneratedPRD(result.prdContent);
        
        // If PRD field is empty, fill it directly
        if (!currentPRDContent.trim()) {
          form?.setFieldsValue({ 
            prdContent: result.prdContent,
            prdSummary: result.prdSummary || ''
          });
          onPRDGenerated?.(result.prdContent, result.prdSummary || '');
          message.success('PRD generated and added to the form!');
        } else {
          // If PRD field has content, show modal with options
          setShowPRDModal(true);
        }
      }
    } catch (err) {
      console.error(err);
      message.error('Failed to generate PRD');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPRD = async () => {
    if (generatedPRD) {
      try {
        await navigator.clipboard.writeText(generatedPRD);
        message.success('PRD copied to clipboard!');
      } catch {
        message.error('Failed to copy');
      }
    }
  };

  const handleDownloadPRD = () => {
    if (generatedPRD) {
      const filename = `${promptData?.featureName?.toLowerCase().replace(/\s+/g, '-') || 'prd'}-requirements.md`;
      const blob = new Blob([generatedPRD], { type: 'text/markdown' });
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
  };

  const handleOverwritePRD = () => {
    if (generatedPRD) {
      form?.setFieldsValue({ 
        prdContent: generatedPRD,
        prdSummary: ''
      });
      onPRDGenerated?.(generatedPRD, '');
      setShowPRDModal(false);
      message.success('PRD field updated!');
    }
  };

  // Shared modal for both variants
  const renderPRDModal = () => (
    <Modal
      title="Generated PRD"
      open={showPRDModal}
      onCancel={() => setShowPRDModal(false)}
      width={800}
      footer={[
        <Button key="cancel" onClick={() => setShowPRDModal(false)}>
          Cancel
        </Button>,
        <Button key="copy" icon={<CopyOutlined />} onClick={handleCopyPRD}>
          Copy
        </Button>,
        <Button key="download" icon={<DownloadOutlined />} onClick={handleDownloadPRD}>
          Download .md
        </Button>,
        <Button key="overwrite" type="primary" icon={<CheckOutlined />} onClick={handleOverwritePRD}>
          Overwrite PRD Field
        </Button>,
      ]}
    >
      <Alert
        message="You already have PRD content"
        description="Choose how to handle the newly generated PRD."
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />
      <div 
        style={{ 
          background: '#141414', 
          padding: 16, 
          borderRadius: 6,
          border: '1px solid #424242',
          maxHeight: '50vh',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: 13,
          lineHeight: 1.6,
          color: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        {generatedPRD}
      </div>
    </Modal>
  );

  // ============================================
  // PRIMARY VARIANT - Team mode (paste/upload focused)
  // ============================================
  if (variant === 'primary') {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <FileTextOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={3} style={{ marginBottom: 8 }}>Start with your PRD</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Paste your Product Requirements Document. We&apos;ll extract key information to guide the design.
          </Text>
        </div>

        <Form.Item
          name="prdContent"
          rules={[{ required: true, message: 'Please paste your PRD content' }]}
        >
          <TextArea
            rows={12}
            placeholder={`Paste your PRD content here...

The PRD should include:
- Overview / Problem Statement
- Goals and Objectives
- User Stories or Requirements
- Success Metrics
- Technical Constraints (if any)

Tip: If your PRD has tables, save it as .md first and paste the markdown.`}
            style={{ fontFamily: 'monospace', fontSize: 13, padding: 16 }}
          />
        </Form.Item>

        <Space style={{ marginBottom: 16 }}>
          <Button
            icon={<ThunderboltOutlined />}
            onClick={handleGeneratePRD}
            loading={isGenerating}
          >
            Extract & Fill Fields
          </Button>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Auto-populate form fields from PRD
          </Text>
        </Space>

        <Form.Item
          label="PRD Summary (Optional)"
          name="prdSummary"
          tooltip="A brief summary helps keep the final prompt concise"
        >
          <TextArea
            rows={2}
            placeholder="Brief 1-2 sentence summary of the PRD"
          />
        </Form.Item>

        {renderPRDModal()}
      </div>
    );
  }

  // ============================================
  // GENERATOR VARIANT - Product mode (generation focused)
  // ============================================
  return (
    <Card
      size="small"
      style={{ background: '#1a1a1a', border: '1px solid #303030' }}
    >
      <div style={{ marginBottom: 12 }}>
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong>PRD Generator</Text>
        </Space>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Generate a PRD from your form data, or paste an existing one.
        </Text>
      </div>

      <Space style={{ marginBottom: 12 }}>
        <Button
          type="primary"
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={handleGeneratePRD}
          loading={isGenerating}
        >
          Generate PRD
        </Button>
        <Text type="secondary" style={{ fontSize: 11 }}>
          Creates PRD from form data
        </Text>
      </Space>

      <Form.Item
        label="PRD Content"
        name="prdContent"
        tooltip="Paste an existing PRD or generate one above"
        style={{ marginBottom: 8 }}
      >
        <TextArea
          rows={6}
          placeholder="Paste PRD here or click Generate PRD above..."
          style={{ fontFamily: 'monospace', fontSize: 12 }}
        />
      </Form.Item>

      <Form.Item
        label="Summary (Optional)"
        name="prdSummary"
        style={{ marginBottom: 0 }}
      >
        <TextArea
          rows={2}
          placeholder="Brief summary"
          style={{ fontSize: 12 }}
        />
      </Form.Item>

      {renderPRDModal()}
    </Card>
  );
}
