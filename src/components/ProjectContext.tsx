'use client';

import { Form, Input, Typography, Space, Divider } from 'antd';
import { ProjectOutlined, BulbOutlined, AppstoreOutlined, FileTextOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ProjectContextProps {
  simplified?: boolean;
}

export default function ProjectContext({ simplified = false }: ProjectContextProps) {
  // Simplified "Quick Context" mode for idea exploration
  if (simplified) {
    return (
      <div>
        <div className="section-title">
          <BulbOutlined />
          <Title level={5} style={{ margin: 0 }}>Quick Context</Title>
        </div>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Just the essentials - these help AI understand what you're building.
        </Text>

        {/* App Identity */}
        <div style={{ 
          background: '#1a1a1a', 
          padding: 16, 
          borderRadius: 8, 
          marginBottom: 16,
          border: '1px solid #303030'
        }}>
          <Space style={{ marginBottom: 12 }}>
            <AppstoreOutlined style={{ color: '#722ed1' }} />
            <Text strong>App Identity</Text>
          </Space>
          
          <Form.Item
            label="App Name"
            name="featureName"
            rules={[{ required: true, message: 'Please enter an app name' }]}
            tooltip="What do you call this app?"
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="e.g., DailyJournal, TeamSync, FocusFlow" />
          </Form.Item>

          <Form.Item
            label="App Type"
            name="appType"
            tooltip="What category or type of app is this?"
            style={{ marginBottom: 12 }}
          >
            <Input placeholder="e.g., Journaling app, Team collaboration tool, Habit tracker" />
          </Form.Item>

          <Form.Item
            label="Quick Summary"
            name="appSummary"
            tooltip="A digestible 2-3 sentence description - what it does, who it's for, what makes it special"
            style={{ marginBottom: 0 }}
          >
            <TextArea 
              rows={2}
              placeholder="e.g., A minimalist journaling app for busy professionals. Quick daily entries with smart prompts. Makes reflection feel effortless, not like homework."
            />
          </Form.Item>
        </div>

        {/* Core Details */}
        <Form.Item
          label="Who is it for?"
          name="targetUsers"
          tooltip="Who will use this? A quick description is fine."
        >
          <Input placeholder="e.g., Busy professionals, Small business owners" />
        </Form.Item>

        <Form.Item
          label="Key constraint or goal (optional)"
          name="designPrinciple"
          tooltip="One thing that matters most - speed, simplicity, delight?"
        >
          <Input placeholder="e.g., Must be dead simple, Needs to feel premium" />
        </Form.Item>
      </div>
    );
  }

  // Full "Project Context" mode
  return (
    <div>
      <div className="section-title">
        <ProjectOutlined />
        <Title level={5} style={{ margin: 0 }}>Project Context</Title>
      </div>

      <Form.Item
        label="App / Feature Name"
        name="featureName"
        rules={[{ required: true, message: 'Please enter the app or feature name' }]}
        tooltip="The name of the app or feature you're designing"
      >
        <Input placeholder="e.g., User Authentication Flow" />
      </Form.Item>

      <Form.Item
        label="Company / Product"
        name="productCompany"
        rules={[{ required: true, message: 'Please enter the company or product name' }]}
        tooltip="The company and product context (e.g., 'DoorDash Merchant Portal (web application)')"
      >
        <Input placeholder="e.g., Acme Dashboard (web application)" />
      </Form.Item>

      <Form.Item
        label="Problem Statement"
        name="problem"
        rules={[{ required: true, message: 'Please describe the problem' }]}
        tooltip="2-3 sentences: What's the gap? What's the solution?"
      >
        <TextArea
          rows={3}
          placeholder="Describe the problem in 2-3 sentences. What's the gap? What's the solution?"
        />
      </Form.Item>

      <Form.Item
        label="Target Users"
        name="targetUsers"
        rules={[{ required: true, message: 'Please describe the target users' }]}
        tooltip="Role + behavioral context: How often? What device? What mindset?"
      >
        <TextArea
          rows={2}
          placeholder="e.g., Marketing managers who review analytics weekly on desktop, looking for quick insights"
        />
      </Form.Item>

      <Form.Item
        label="Key Design Principle"
        name="designPrinciple"
        rules={[{ required: true, message: 'Please enter the design principle' }]}
        tooltip="ONE North Star principle for tone/framing - this guides all decisions"
      >
        <Input placeholder="e.g., Clarity over cleverness - users should understand instantly" />
      </Form.Item>

      <Form.Item
        label="Critical Challenge"
        name="criticalChallenge"
        tooltip="One key tension or edge case the design must address"
      >
        <TextArea
          rows={2}
          placeholder="e.g., Balancing simplicity for new users while providing depth for power users"
        />
      </Form.Item>
    </div>
  );
}
