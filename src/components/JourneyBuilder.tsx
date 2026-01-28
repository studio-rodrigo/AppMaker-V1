'use client';

import { Form, Input, Button, Card, Space, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, NodeIndexOutlined, CompassOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface JourneyBuilderProps {
  simplified?: boolean;
}

export default function JourneyBuilder({ simplified = false }: JourneyBuilderProps) {
  // Simplified journey builder for idea exploration
  if (simplified) {
    return (
      <div>
        <div className="section-title">
          <CompassOutlined />
          <Title level={5} style={{ margin: 0 }}>User Journeys (Optional)</Title>
        </div>
        
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          Describe key moments users will experience. Keep it light - just capture the essence.
        </Text>

        <Form.List name="journeys">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  className="journey-card"
                  size="small"
                  title={<Text strong>Flow {index + 1}</Text>}
                  extra={
                    fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        size="small"
                      >
                        Remove
                      </Button>
                    )
                  }
                  style={{ marginBottom: 12 }}
                >
                  <Form.Item
                    {...restField}
                    label="What happens?"
                    name={[name, 'name']}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="e.g., User signs up, User creates first project" />
                  </Form.Item>

                  <Form.Item
                    {...restField}
                    label="Key moment"
                    name={[name, 'mustCommunicate']}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="e.g., Show value immediately, Make it feel easy" />
                  </Form.Item>
                </Card>
              ))}

              <Button
                type="dashed"
                onClick={() => add({
                  name: '',
                  when: '',
                  trigger: '',
                  mustCommunicate: '',
                  ctas: '',
                  tone: '',
                  supportingElements: '',
                })}
                block
                icon={<PlusOutlined />}
              >
                Add Flow
              </Button>
            </>
          )}
        </Form.List>
      </div>
    );
  }

  // Full journey builder
  return (
    <div>
      <div className="section-title">
        <NodeIndexOutlined />
        <Title level={5} style={{ margin: 0 }}>User Journeys</Title>
      </div>
      
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Define the core user journeys to design. Focus on WHEN they happen and WHAT to communicate.
      </Text>

      <Form.List name="journeys">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Card
                key={key}
                className="journey-card"
                size="small"
                title={
                  <Space>
                    <Text strong>Journey {index + 1}</Text>
                  </Space>
                }
                extra={
                  fields.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    >
                      Remove
                    </Button>
                  )
                }
              >
                <Form.Item
                  {...restField}
                  label="Journey Name"
                  name={[name, 'name']}
                  rules={[{ required: true, message: 'Enter journey name' }]}
                >
                  <Input placeholder="e.g., First-time Setup" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label="When (Timing)"
                  name={[name, 'when']}
                  rules={[{ required: true, message: 'Enter when this happens' }]}
                  tooltip="WHEN does this journey happen? e.g., 'Before first login', 'After purchase'"
                >
                  <Input placeholder="e.g., Before first use - Onboarding Modal" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label="Trigger / Entry Point"
                  name={[name, 'trigger']}
                  tooltip="What triggers this journey to start?"
                >
                  <Input placeholder="e.g., User clicks 'Get Started' button" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label="Must Communicate"
                  name={[name, 'mustCommunicate']}
                  tooltip="What does the user need to understand? (value props, timing, who, why)"
                >
                  <TextArea
                    rows={2}
                    placeholder="e.g., Value proposition, time commitment, what they'll accomplish"
                  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label="CTAs (Calls to Action)"
                  name={[name, 'ctas']}
                  tooltip="Primary and secondary actions available"
                >
                  <Input placeholder="e.g., Primary: 'Continue Setup' | Secondary: 'Skip for now'" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label="Tone / Framing"
                  name={[name, 'tone']}
                  tooltip="How should this journey feel?"
                >
                  <Input placeholder="e.g., Encouraging, helpful, not overwhelming" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  label="Supporting Elements"
                  name={[name, 'supportingElements']}
                  tooltip="Links, visuals, icons, or other supporting elements"
                >
                  <Input placeholder="e.g., Progress indicator, help link, illustration" />
                </Form.Item>
              </Card>
            ))}

            <Button
              type="dashed"
              onClick={() => add({
                name: '',
                when: '',
                trigger: '',
                mustCommunicate: '',
                ctas: '',
                tone: '',
                supportingElements: '',
              })}
              block
              icon={<PlusOutlined />}
              style={{ marginTop: 8 }}
            >
              Add Journey
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
}
