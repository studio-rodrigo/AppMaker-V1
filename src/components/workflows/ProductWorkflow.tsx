'use client';

import { useState } from 'react';
import { Form, Collapse, Button, Typography, Space, Tag } from 'antd';
import { 
  ProjectOutlined, 
  AppstoreOutlined, 
  NodeIndexOutlined, 
  SettingOutlined,
  ToolOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import BrainDump from '../BrainDump';
import PRDInput from '../PRDInput';
import ProjectContext from '../ProjectContext';
import JourneyBuilder from '../JourneyBuilder';
import DesignSystemInput from '../DesignSystemInput';
import UIRequirements from '../UIRequirements';
import FollowupChat from '../FollowupChat';
import { PromptData, defaultPromptData } from '@/lib/types';
import { ExtractedFields } from '@/lib/extract-types';

const { Text } = Typography;

interface ProductWorkflowProps {
  promptData: PromptData;
  onValuesChange: (changedValues: Partial<PromptData>, allValues: PromptData) => void;
  suggestions?: ExtractedFields;
  onApplySuggestion?: (field: string, value: string) => void;
}

export default function ProductWorkflow({
  promptData,
  onValuesChange,
  suggestions = {},
  onApplySuggestion,
}: ProductWorkflowProps) {
  const [form] = Form.useForm<PromptData>();
  const [showHelpers, setShowHelpers] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [brainDumpContext, setBrainDumpContext] = useState('');
  const [localSuggestions, setLocalSuggestions] = useState<ExtractedFields>(suggestions);

  const handleReset = () => {
    form.resetFields();
    onValuesChange({}, defaultPromptData);
  };

  const handleBrainDumpExtracted = (
    extractedData: PromptData,
    extractedSuggestions: ExtractedFields,
    questions: string[],
    brainDumpText: string
  ) => {
    form.setFieldsValue(extractedData);
    onValuesChange({}, extractedData);
    setLocalSuggestions(extractedSuggestions);
    setFollowUpQuestions(questions);
    setBrainDumpContext(brainDumpText);
  };

  const handleFollowUpFieldsUpdated = (
    updatedData: PromptData,
    updatedSuggestions: ExtractedFields
  ) => {
    form.setFieldsValue(updatedData);
    onValuesChange({}, updatedData);
    setLocalSuggestions(prev => ({ ...prev, ...updatedSuggestions }));
  };

  const handlePRDGenerated = (prdContent: string, prdSummary: string) => {
    const newValues = { ...promptData, prdContent, prdSummary };
    onValuesChange({ prdContent, prdSummary }, newValues);
  };

  // Check if suggestions exist for a section
  const hasSuggestions = (fields: string[]) => {
    return fields.some(f => localSuggestions[f as keyof ExtractedFields]);
  };

  const mainSections = [
    {
      key: 'project-context',
      label: (
        <Space>
          <ProjectOutlined />
          Project Context
          {hasSuggestions(['featureName', 'productCompany', 'problem', 'targetUsers', 'designPrinciple', 'criticalChallenge']) && (
            <Tag color="blue">Has suggestions</Tag>
          )}
        </Space>
      ),
      children: <ProjectContext />,
    },
    {
      key: 'design-system',
      label: (
        <Space>
          <AppstoreOutlined />
          Design System
        </Space>
      ),
      children: (
        <DesignSystemInput
          mode="picker"
          value={promptData.designSystemConfig}
          onChange={(config) => {
            // Compute designSystem string from config
            let designSystem = '';
            if (config.type === 'system' && config.systemName) {
              const systems: Record<string, string> = {
                shadcn: 'Use shadcn/ui components with Radix primitives and Tailwind CSS',
                antd: 'Use Ant Design component library with its design tokens',
                mui: 'Use Material UI (MUI) components following Material Design guidelines',
                chakra: 'Use Chakra UI components with its accessible component library',
                tailwind: 'Use Tailwind CSS utility classes for custom styling',
                bootstrap: 'Use Bootstrap components and utility classes',
              };
              designSystem = systems[config.systemName] || config.systemName;
            } else if (config.type === 'mcp' && config.mcpServerUrl) {
              designSystem = `MCP Design System: ${config.mcpServerUrl}`;
            } else if (config.type === 'llm-txt' && config.llmTxtUrl) {
              designSystem = `Design System Docs: ${config.llmTxtUrl}`;
            } else if (config.toneDescription) {
              designSystem = config.toneDescription;
            }
            
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
    {
      key: 'journeys',
      label: (
        <Space>
          <NodeIndexOutlined />
          User Journeys
        </Space>
      ),
      children: <JourneyBuilder />,
    },
    {
      key: 'ui-requirements',
      label: (
        <Space>
          <SettingOutlined />
          UI Requirements & Supporting Screens
        </Space>
      ),
      children: <UIRequirements />,
    },
  ];

  const helperSections = [
    {
      key: 'brain-dump',
      label: 'Brain Dump Helper',
      children: (
        <>
          <BrainDump
            variant="helper"
            onExtracted={handleBrainDumpExtracted}
            currentData={promptData}
            isExtracting={isExtracting}
            onStartExtract={() => setIsExtracting(true)}
            onFinishExtract={() => setIsExtracting(false)}
          />
          {followUpQuestions.length > 0 && brainDumpContext && (
            <div style={{ marginTop: 16 }}>
              <FollowupChat
                initialQuestions={followUpQuestions}
                currentData={promptData}
                onFieldsUpdated={handleFollowUpFieldsUpdated}
                brainDumpContext={brainDumpContext}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: 'prd-generator',
      label: 'PRD Generator',
      children: (
        <PRDInput
          variant="generator"
          promptData={promptData}
          onPRDGenerated={handlePRDGenerated}
        />
      ),
    },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={promptData}
      onValuesChange={onValuesChange}
      requiredMark="optional"
    >
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Reset Form
        </Button>
      </Space>

      {/* Main form sections */}
      <Collapse
        defaultActiveKey={['project-context', 'design-system', 'journeys']}
        items={mainSections}
        accordion={false}
      />

      {/* Optional tools toggle */}
      {!showHelpers && (
        <Button
          type="dashed"
          icon={<ToolOutlined />}
          onClick={() => setShowHelpers(true)}
          style={{ width: '100%', marginTop: 16 }}
        >
          Show helper tools (Brain Dump, PRD Generator)
        </Button>
      )}

      {/* Helper sections */}
      {showHelpers && (
        <div style={{ marginTop: 16 }}>
          <Space style={{ marginBottom: 12 }}>
            <ToolOutlined />
            <Text strong>Helper Tools</Text>
            <Button 
              type="link" 
              size="small" 
              onClick={() => setShowHelpers(false)}
            >
              Hide
            </Button>
          </Space>
          
          <Collapse items={helperSections} />
        </div>
      )}
    </Form>
  );
}
