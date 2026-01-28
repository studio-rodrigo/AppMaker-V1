'use client';

import { useState } from 'react';
import { Form, Collapse, Button, Typography, Space } from 'antd';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import BrainDump from '../BrainDump';
import FollowupChat from '../FollowupChat';
import ProjectContext from '../ProjectContext';
import JourneyBuilder from '../JourneyBuilder';
import DesignSystemInput from '../DesignSystemInput';
import UIRequirements from '../UIRequirements';
import { PromptData, defaultPromptData } from '@/lib/types';
import { ExtractedFields } from '@/lib/extract-types';

const { Text } = Typography;

interface IdeaWorkflowProps {
  promptData: PromptData;
  onValuesChange: (changedValues: Partial<PromptData>, allValues: PromptData) => void;
  suggestions?: ExtractedFields;
  onApplySuggestion?: (field: string, value: string) => void;
}

export default function IdeaWorkflow({
  promptData,
  onValuesChange,
  suggestions = {},
  onApplySuggestion,
}: IdeaWorkflowProps) {
  const [form] = Form.useForm<PromptData>();
  const [hasExtracted, setHasExtracted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [brainDumpContext, setBrainDumpContext] = useState('');
  const [localSuggestions, setLocalSuggestions] = useState<ExtractedFields>(suggestions);

  const handleBrainDumpExtracted = (
    extractedData: PromptData,
    extractedSuggestions: ExtractedFields,
    questions: string[],
    brainDumpText: string
  ) => {
    // Update form with extracted data
    form.setFieldsValue(extractedData);
    onValuesChange({}, extractedData);
    
    setLocalSuggestions(extractedSuggestions);
    setFollowUpQuestions(questions);
    setBrainDumpContext(brainDumpText);
    setHasExtracted(true);
  };

  const handleFollowUpFieldsUpdated = (
    updatedData: PromptData,
    updatedSuggestions: ExtractedFields
  ) => {
    form.setFieldsValue(updatedData);
    onValuesChange({}, updatedData);
    setLocalSuggestions(prev => ({ ...prev, ...updatedSuggestions }));
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={promptData}
      onValuesChange={onValuesChange}
      requiredMark="optional"
    >
      {/* Hero: BrainDump Section */}
      <BrainDump
        variant="hero"
        onExtracted={handleBrainDumpExtracted}
        currentData={promptData}
        isExtracting={isExtracting}
        onStartExtract={() => setIsExtracting(true)}
        onFinishExtract={() => setIsExtracting(false)}
      />

      {/* FollowUp Chat - appears after extraction */}
      {hasExtracted && followUpQuestions.length > 0 && brainDumpContext && (
        <div style={{ marginTop: 24 }}>
          <FollowupChat
            initialQuestions={followUpQuestions}
            currentData={promptData}
            onFieldsUpdated={handleFollowUpFieldsUpdated}
            brainDumpContext={brainDumpContext}
          />
        </div>
      )}

      {/* Minimal Context - appears after extraction */}
      {hasExtracted && (
        <div style={{ marginTop: 24 }}>
          <Collapse
            defaultActiveKey={['quick-context', 'design-vibe']}
            items={[
              {
                key: 'quick-context',
                label: 'Quick Context',
                children: <ProjectContext simplified />,
              },
              {
                key: 'design-vibe',
                label: 'Design Vibe',
                children: (
                  <DesignSystemInput
                    mode="vibe"
                    value={promptData.designSystemConfig}
                    onChange={(config) => {
                      const designSystem = config.toneDescription || config.brandFeel || '';
                      form.setFieldsValue({ designSystemConfig: config, designSystem });
                      onValuesChange({ designSystemConfig: config, designSystem }, {
                        ...promptData,
                        designSystemConfig: config,
                        designSystem,
                      });
                    }}
                  />
                ),
              },
            ]}
          />

          {/* Show Advanced toggle */}
          {!showAdvanced && (
            <Button
              type="dashed"
              icon={<DownOutlined />}
              onClick={() => setShowAdvanced(true)}
              style={{ width: '100%', marginTop: 16 }}
            >
              Need more detail? Show advanced fields
            </Button>
          )}

          {/* Advanced sections */}
          {showAdvanced && (
            <div style={{ marginTop: 16 }}>
              <Space style={{ marginBottom: 12 }}>
                <SettingOutlined />
                <Text strong>Advanced Fields</Text>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => setShowAdvanced(false)}
                >
                  Hide
                </Button>
              </Space>
              
              <Collapse
                items={[
                  {
                    key: 'full-context',
                    label: 'Full Project Context',
                    children: <ProjectContext />,
                  },
                  {
                    key: 'journeys',
                    label: 'User Journeys (Optional)',
                    children: <JourneyBuilder simplified />,
                  },
                  {
                    key: 'ui-requirements',
                    label: 'UI Requirements',
                    children: <UIRequirements />,
                  },
                ]}
              />
            </div>
          )}
        </div>
      )}
    </Form>
  );
}
