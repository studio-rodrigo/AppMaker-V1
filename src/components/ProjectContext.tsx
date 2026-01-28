'use client';

import { Form, Input, Typography } from 'antd';
import { ProjectOutlined, BulbOutlined } from '@ant-design/icons';

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
          Just the essentials - you can always add more details later.
        </Text>

        <Form.Item
          label="What are you building?"
          name="featureName"
          rules={[{ required: true, message: 'Please describe what you\'re building' }]}
          tooltip="A brief name or description of what you're creating"
        >
          <Input placeholder="e.g., Habit tracking app, Team scheduling tool" />
        </Form.Item>

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
