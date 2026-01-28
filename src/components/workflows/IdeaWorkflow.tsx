'use client';

import { useState } from 'react';
import { Form, Collapse, Button, Typography, Space } from 'antd';
import { DownOutlined, SettingOutlined } from '@ant-design/icons';
import BrainDump, { ExtractionResultsDisplay } from '../BrainDump';
import QuestionFlow from '../QuestionFlow';
import ProjectContext from '../ProjectContext';
import JourneyBuilder from '../JourneyBuilder';
import DesignSystemInput from '../DesignSystemInput';
import UIRequirements from '../UIRequirements';
import { PromptData } from '@/lib/types';
import { ExtractedFields, ExtractionResult } from '@/lib/extract-types';

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
}: IdeaWorkflowProps) {
  const [form] = Form.useForm<PromptData>();
  const [hasExtracted, setHasExtracted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [brainDumpContext, setBrainDumpContext] = useState('');
  const [localSuggestions, setLocalSuggestions] = useState<ExtractedFields>(suggestions);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [questionsComplete, setQuestionsComplete] = useState(false);
  const [extractionDismissed, setExtractionDismissed] = useState(false);

  const handleBrainDumpExtracted = (
    extractedData: PromptData,
    extractedSuggestions: ExtractedFields,
    questions: string[],
    brainDumpText: string,
    result: ExtractionResult
  ) => {
    // If we have a designVibe, also update the designSystemConfig for the vibe input
    let finalData = { ...extractedData };
    if (extractedData.designVibe && extractedData.designVibe.trim()) {
      finalData = {
        ...finalData,
        designSystemConfig: {
          ...finalData.designSystemConfig,
          type: 'vibe' as const,
          toneDescription: extractedData.designVibe,
        },
        designSystem: extractedData.designVibe,
      };
    }
    
    // Update form with extracted data
    form.setFieldsValue(finalData);
    onValuesChange({}, finalData);
    
    setLocalSuggestions(extractedSuggestions);
    setFollowUpQuestions(questions);
    setBrainDumpContext(brainDumpText);
    setExtractionResult(result);
    setHasExtracted(true);
    setQuestionsComplete(false);
    setExtractionDismissed(false);
  };

  const handleFollowUpFieldsUpdated = (
    updatedData: PromptData,
    updatedSuggestions: ExtractedFields
  ) => {
    form.setFieldsValue(updatedData);
    onValuesChange({}, updatedData);
    setLocalSuggestions(prev => ({ ...prev, ...updatedSuggestions }));
  };

  const handleQuestionsComplete = () => {
    setQuestionsComplete(true);
  };

  const handleConfirmField = (fieldName: string, value: string) => {
    // Field confirmed - could track this or trigger form update
    console.log('Confirmed field:', fieldName, value);
  };

  const handleEditField = (fieldName: string) => {
    // Scroll to field in form - for now just log
    console.log('Edit field:', fieldName);
  };

  const handleDismissExtraction = () => {
    setExtractionDismissed(true);
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
        hideExtractionResults
      />

      {/* Extracted Fields - notification style, dismissible */}
      {hasExtracted && extractionResult && !extractionDismissed && (
        <div style={{ marginTop: 16 }}>
          <ExtractionResultsDisplay 
            extractionResult={extractionResult}
            onConfirmField={handleConfirmField}
            onEditField={handleEditField}
            onDismiss={handleDismissExtraction}
          />
        </div>
      )}

      {/* Question Flow - one at a time, optional */}
      {hasExtracted && !questionsComplete && followUpQuestions.length > 0 && brainDumpContext && (
        <div style={{ marginTop: 16 }}>
          <QuestionFlow
            questions={followUpQuestions}
            currentData={promptData}
            onFieldsUpdated={handleFollowUpFieldsUpdated}
            brainDumpContext={brainDumpContext}
            onComplete={handleQuestionsComplete}
          />
        </div>
      )}

      {/* Minimal Context - appears after extraction */}
      {hasExtracted && (
        <div style={{ marginTop: 24 }}>
          <Collapse
            defaultActiveKey={['quick-context', 'design-vibe', 'journeys']}
            items={[
              {
                key: 'quick-context',
                label: 'Quick Context',
                children: <ProjectContext simplified />,
              },
              {
                key: 'journeys',
                label: `User Journeys${promptData.journeys && promptData.journeys.length > 0 && promptData.journeys[0].name ? ` (${promptData.journeys.length} flows)` : ''}`,
                children: <JourneyBuilder simplified />,
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
                      form.setFieldsValue({ designSystemConfig: config, designSystem, designVibe: config.toneDescription || '' });
                      onValuesChange({ designSystemConfig: config, designSystem, designVibe: config.toneDescription || '' }, {
                        ...promptData,
                        designSystemConfig: config,
                        designSystem,
                        designVibe: config.toneDescription || '',
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
