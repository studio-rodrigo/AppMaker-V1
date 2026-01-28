'use client';

import { useState } from 'react';
import { Form, Collapse, Button, Typography, Space } from 'antd';
import { 
  FileTextOutlined,
  TeamOutlined,
  AppstoreOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  ToolOutlined,
  ReloadOutlined,
  LockOutlined
} from '@ant-design/icons';
import BrainDump from '../BrainDump';
import PRDInput from '../PRDInput';
import TeamContext from '../TeamContext';
import JourneyBuilder from '../JourneyBuilder';
import DesignSystemInput from '../DesignSystemInput';
import UIRequirements from '../UIRequirements';
import QuestionFlow from '../QuestionFlow';
import { PromptData, defaultPromptData } from '@/lib/types';
import { ExtractedFields } from '@/lib/extract-types';

const { Text } = Typography;

interface TeamWorkflowProps {
  promptData: PromptData;
  onValuesChange: (changedValues: Partial<PromptData>, allValues: PromptData) => void;
  suggestions?: ExtractedFields;
  onApplySuggestion?: (field: string, value: string) => void;
}

export default function TeamWorkflow({
  promptData,
  onValuesChange,
  suggestions = {},
  onApplySuggestion,
}: TeamWorkflowProps) {
  const [form] = Form.useForm<PromptData>();
  const [showHelpers, setShowHelpers] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [brainDumpContext, setBrainDumpContext] = useState('');
  const [localSuggestions, setLocalSuggestions] = useState<ExtractedFields>(suggestions);
  const [questionsComplete, setQuestionsComplete] = useState(false);

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

  // Get locked source name for display
  const getLockedSourceName = () => {
    const config = promptData.designSystemConfig;
    if (!config) return null;
    if (config.figmaFileUrl) return 'Figma';
    if (config.mcpServerUrl) return 'MCP';
    if (config.tokensJson) return 'Tokens';
    return null;
  };

  const lockedSource = getLockedSourceName();

  const mainSections = [
    {
      key: 'prd',
      label: (
        <Space>
          <FileTextOutlined />
          PRD / Product Brief
        </Space>
      ),
      children: (
        <PRDInput
          variant="primary"
          promptData={promptData}
          onPRDGenerated={handlePRDGenerated}
        />
      ),
    },
    {
      key: 'team-context',
      label: (
        <Space>
          <TeamOutlined />
          Existing App & Stakeholders
        </Space>
      ),
      children: <TeamContext />,
    },
    {
      key: 'design-system',
      label: (
        <Space>
          <LockOutlined style={{ color: '#52c41a' }} />
          Team Design System
          {lockedSource && (
            <span style={{ 
              fontSize: 11, 
              color: '#52c41a',
              background: '#1a3a1a',
              padding: '2px 8px',
              borderRadius: 4,
            }}>
              Locked: {lockedSource}
            </span>
          )}
        </Space>
      ),
      children: (
        <DesignSystemInput
          mode="locked"
          value={promptData.designSystemConfig}
          onChange={(config) => {
            // Compute designSystem string from config
            let designSystem = '';
            if (config.figmaFileUrl) {
              designSystem = `Figma Design System: ${config.figmaFileUrl}`;
            } else if (config.mcpServerUrl) {
              designSystem = `MCP Design System: ${config.mcpServerUrl}`;
            } else if (config.tokensJson) {
              try {
                const tokens = JSON.parse(config.tokensJson);
                designSystem = `Custom Design Tokens: ${JSON.stringify(tokens).substring(0, 100)}...`;
              } catch {
                designSystem = 'Custom Design Tokens';
              }
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
      key: 'feature-journey',
      label: (
        <Space>
          <NodeIndexOutlined />
          Feature Journey
        </Space>
      ),
      children: <JourneyBuilder />,
    },
    {
      key: 'ui-requirements',
      label: (
        <Space>
          <SettingOutlined />
          UI Requirements & Supplemental Screens
        </Space>
      ),
      children: <UIRequirements />,
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

      {/* Main form sections - PRD is expanded by default */}
      <Collapse
        defaultActiveKey={['prd', 'team-context', 'design-system']}
        items={mainSections}
        accordion={false}
      />

      {/* Optional helper toggle */}
      {!showHelpers && (
        <Button
          type="dashed"
          icon={<ToolOutlined />}
          onClick={() => setShowHelpers(true)}
          style={{ width: '100%', marginTop: 16 }}
        >
          Need help articulating? Show Brain Dump helper
        </Button>
      )}

      {/* Helper section */}
      {showHelpers && (
        <div style={{ marginTop: 16 }}>
          <Space style={{ marginBottom: 12 }}>
            <ToolOutlined />
            <Text strong>Helper Tool</Text>
            <Button 
              type="link" 
              size="small" 
              onClick={() => setShowHelpers(false)}
            >
              Hide
            </Button>
          </Space>
          
          <BrainDump
            variant="helper"
            onExtracted={handleBrainDumpExtracted}
            currentData={promptData}
            isExtracting={isExtracting}
            onStartExtract={() => setIsExtracting(true)}
            onFinishExtract={() => setIsExtracting(false)}
          />
          
          {!questionsComplete && followUpQuestions.length > 0 && brainDumpContext && (
            <div style={{ marginTop: 16 }}>
              <QuestionFlow
                questions={followUpQuestions}
                currentData={promptData}
                onFieldsUpdated={handleFollowUpFieldsUpdated}
                brainDumpContext={brainDumpContext}
                onComplete={() => setQuestionsComplete(true)}
              />
            </div>
          )}
        </div>
      )}
    </Form>
  );
}
