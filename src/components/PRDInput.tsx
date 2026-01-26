'use client';

import { Form, Input, Typography, Alert } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function PRDInput() {
  return (
    <div>
      <div className="section-title">
        <FileTextOutlined />
        <Title level={5} style={{ margin: 0 }}>Product Requirements Document (PRD)</Title>
      </div>

      <Alert
        message="Paste your PRD or product brief here"
        description="This helps provide context for your design. The content will be included at the beginning of your generated prompt to give Figma Make better understanding of your project."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

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
          placeholder={`Paste your PRD content here...

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
    </div>
  );
}
