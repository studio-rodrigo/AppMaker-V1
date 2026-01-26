'use client';

import { useState } from 'react';
import { Form, Input, Typography, Alert, Button, Space, Modal, message } from 'antd';
import { FileTextOutlined, ThunderboltOutlined, CopyOutlined, DownloadOutlined, CheckOutlined } from '@ant-design/icons';
import { PromptData } from '@/lib/types';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface PRDInputProps {
  promptData?: PromptData;
  onPRDGenerated?: (prdContent: string, prdSummary: string) => void;
}

export default function PRDInput({ promptData, onPRDGenerated }: PRDInputProps) {
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

  return (
    <div>
      <div className="section-title">
        <FileTextOutlined />
        <Title level={5} style={{ margin: 0 }}>Product Requirements Document (PRD)</Title>
      </div>

      <Alert
        message="Paste your PRD or generate one"
        description="You can paste an existing PRD, or click 'Generate PRD' to create one from your project details."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleGeneratePRD}
          loading={isGenerating}
        >
          Generate PRD
        </Button>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Creates a PRD from your form data
        </Text>
      </Space>

      <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        If your PRD contains tables, save it as a .md file first and paste the markdown directly to preserve formatting.
      </Text>

      <Form.Item
        label="PRD / Product Brief Content"
        name="prdContent"
        tooltip="Paste the full PRD or relevant sections. This will be included as context in your prompt."
      >
        <TextArea
          rows={10}
          placeholder={`Paste your PRD content here, or click "Generate PRD" above...

Example:
## Overview
Brief description of the feature...

## Goals
- Goal 1
- Goal 2

## User Stories
As a [user], I want to [action] so that [benefit]...

## Requirements
- Requirement 1
- Requirement 2

## Success Metrics
- Metric 1
- Metric 2`}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
      </Form.Item>

      <Form.Item
        label="PRD Summary (Optional)"
        name="prdSummary"
        tooltip="A brief 1-2 sentence summary of the PRD. If left empty, the full PRD content will be used."
      >
        <TextArea
          rows={2}
          placeholder="Brief summary of the PRD (optional - helps keep the prompt concise)"
        />
      </Form.Item>

      {/* Modal for when PRD already has content */}
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
    </div>
  );
}
