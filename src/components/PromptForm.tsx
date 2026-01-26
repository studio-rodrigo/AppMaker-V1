'use client';

import { Form, Collapse, Button, Space, Tag, Tooltip } from 'antd';
import { ReloadOutlined, CheckOutlined } from '@ant-design/icons';
import PRDInput from './PRDInput';
import ProjectContext from './ProjectContext';
import JourneyBuilder from './JourneyBuilder';
import UIRequirements from './UIRequirements';
import { PromptData, defaultPromptData } from '@/lib/types';
import { ExtractedFields, FieldExtraction, getConfidenceColor } from '@/lib/extract-types';

interface PromptFormProps {
  onValuesChange: (changedValues: Partial<PromptData>, allValues: PromptData) => void;
  initialValues?: PromptData;
  suggestions?: ExtractedFields;
  onApplySuggestion?: (field: string, value: string) => void;
  currentData?: PromptData;
}

export default function PromptForm({ 
  onValuesChange, 
  initialValues, 
  suggestions = {},
  onApplySuggestion,
  currentData 
}: PromptFormProps) {
  const [form] = Form.useForm<PromptData>();

  const handleReset = () => {
    form.resetFields();
    onValuesChange({}, defaultPromptData);
  };

  const renderSuggestionTag = (fieldKey: keyof ExtractedFields) => {
    const suggestion = suggestions[fieldKey] as FieldExtraction | undefined;
    if (!suggestion || !suggestion.value.trim()) return null;

    const color = getConfidenceColor(suggestion.confidence);
    const confidencePercent = Math.round(suggestion.confidence * 100);

    return (
      <Tooltip 
        title={
          <div>
            <div><strong>Suggested:</strong> {suggestion.value.substring(0, 150)}{suggestion.value.length > 150 ? '...' : ''}</div>
            {suggestion.evidence && <div style={{ marginTop: 4 }}><em>Evidence: "{suggestion.evidence}"</em></div>}
          </div>
        }
      >
        <Tag 
          color={color} 
          onClick={() => onApplySuggestion?.(fieldKey, suggestion.value)}
          style={{ cursor: 'pointer', marginLeft: 8 }}
        >
          <CheckOutlined /> Apply suggestion ({confidencePercent}%)
        </Tag>
      </Tooltip>
    );
  };

  const collapseItems = [
    {
      key: '1',
      label: (
        <Space>
          Project Context
          {(suggestions.featureName || suggestions.productCompany || suggestions.problem || 
            suggestions.targetUsers || suggestions.designPrinciple || suggestions.criticalChallenge) && (
            <Tag color="blue">Has suggestions</Tag>
          )}
        </Space>
      ),
      children: (
        <div>
          <ProjectContext />
          {/* Show suggestion tags inline if available */}
          {suggestions.featureName && (
            <div style={{ marginTop: -12, marginBottom: 12 }}>
              {renderSuggestionTag('featureName')}
            </div>
          )}
        </div>
      ),
    },
    {
      key: '0',
      label: 'PRD / Product Brief (Optional)',
      children: (
        <PRDInput 
          promptData={currentData} 
          onPRDGenerated={(prdContent, prdSummary) => {
            // Trigger form update through onValuesChange
            const newValues = { ...currentData, prdContent, prdSummary };
            onValuesChange({ prdContent, prdSummary }, newValues as PromptData);
          }}
        />
      ),
    },
    {
      key: '2',
      label: 'User Journeys',
      children: <JourneyBuilder />,
    },
    {
      key: '3',
      label: 'UI Requirements & Supporting Screens',
      children: <UIRequirements />,
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || defaultPromptData}
      onValuesChange={onValuesChange}
      requiredMark="optional"
    >
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Reset Form
        </Button>
      </Space>

      <Collapse 
        defaultActiveKey={['1', '2', '3']} 
        items={collapseItems}
        accordion={false}
      />
    </Form>
  );
}
