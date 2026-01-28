'use client';

import { Form, Input, Select, Typography } from 'antd';
import { TeamOutlined, AppstoreOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

export default function TeamContext() {
  return (
    <div>
      <div className="section-title">
        <TeamOutlined />
        <Title level={5} style={{ margin: 0 }}>Existing App & Stakeholders</Title>
      </div>
      
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Provide context about your existing product and team.
      </Text>

      <Form.Item
        label="Existing App Context"
        name="existingAppContext"
        tooltip="Describe the current state of your application - what exists, tech stack, etc."
      >
        <TextArea
          rows={3}
          placeholder="e.g., React/Next.js app with existing dashboard, user management, and reporting features. Uses Tailwind CSS and shadcn/ui components."
        />
      </Form.Item>

      <Form.Item
        label="Feature Scope"
        name="featureScope"
        tooltip="Is this a new feature, enhancement, or redesign?"
      >
        <Select
          placeholder="Select feature scope"
          options={[
            { value: 'new', label: 'New Feature - Adding something that doesn\'t exist' },
            { value: 'enhancement', label: 'Enhancement - Improving existing functionality' },
            { value: 'redesign', label: 'Redesign - Rethinking existing feature' },
          ]}
        />
      </Form.Item>

      <Form.Item
        label="Stakeholders"
        name="stakeholders"
        tooltip="Who needs to review/approve these designs? (PM, Eng Lead, Design Lead, etc.)"
      >
        <TextArea
          rows={2}
          placeholder="e.g., Product Manager (Sarah) - feature approval, Engineering Lead (Mike) - technical feasibility, Design Lead (Anna) - design system compliance"
        />
      </Form.Item>

      <Form.Item
        label={
          <span>
            <AppstoreOutlined style={{ marginRight: 4 }} />
            Integration Points
          </span>
        }
        name="integrationPoints"
        tooltip="What existing screens/flows will this feature connect to?"
      >
        <TextArea
          rows={2}
          placeholder="e.g., Links from main dashboard, accessible via settings menu, integrates with existing user profile"
        />
      </Form.Item>
    </div>
  );
}
