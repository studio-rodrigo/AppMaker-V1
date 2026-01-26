'use client';

import { Form, Input, Select, Checkbox, Button, Typography, Space } from 'antd';
import { SettingOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { platformOptions, availableStates } from '@/lib/types';

const { Title, Text } = Typography;

export default function UIRequirements() {
  return (
    <div>
      <div className="section-title">
        <SettingOutlined />
        <Title level={5} style={{ margin: 0 }}>UI Requirements</Title>
      </div>

      <Form.Item
        label="Platform"
        name="platform"
        rules={[{ required: true, message: 'Please select a platform' }]}
      >
        <Select
          options={platformOptions}
          placeholder="Select platform"
        />
      </Form.Item>

      <Form.Item
        label="Design System"
        name="designSystem"
        tooltip="Your company's design system or component library"
      >
        <Input placeholder="e.g., Prism Components, Material Design, Custom System" />
      </Form.Item>

      <Form.Item
        label="Layout Constraints"
        name="layoutConstraints"
        tooltip="Key layout requirements (e.g., modal width, responsive breakpoints)"
      >
        <Input placeholder="e.g., Centered modals 400-500px width, 12-column grid" />
      </Form.Item>

      <Form.Item
        label="States Needed"
        name="statesNeeded"
        tooltip="Select all UI states that need to be designed"
      >
        <Checkbox.Group options={availableStates} />
      </Form.Item>

      <div style={{ marginTop: 24 }}>
        <div className="section-title">
          <Title level={5} style={{ margin: 0 }}>Supporting Screens</Title>
        </div>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          List any additional screens needed (helper pages, modals, etc.)
        </Text>

        <Form.List name="supportingScreens">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={name}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input placeholder="e.g., Help documentation page" style={{ width: 300 }} />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      style={{ color: '#ff4d4f', cursor: 'pointer' }}
                    />
                  )}
                </Space>
              ))}
              <Button
                type="dashed"
                onClick={() => add('')}
                icon={<PlusOutlined />}
                style={{ width: 300 }}
              >
                Add Screen
              </Button>
            </>
          )}
        </Form.List>
      </div>
    </div>
  );
}
