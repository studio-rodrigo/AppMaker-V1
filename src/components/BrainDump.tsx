'use client';

import { useState } from 'react';
import { Input, Button, Typography, Space, Alert, Tag, Tooltip, Collapse } from 'antd';
import { ThunderboltOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { ExtractionResult, ExtractedFields, FieldExtraction, getConfidenceLevel, getConfidenceColor } from '@/lib/extract-types';
import { PromptData } from '@/lib/types';
import { applyExtractedFields, getSuggestedFields } from '@/lib/apply-extract';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

interface BrainDumpProps {
  onExtracted: (data: PromptData, suggestions: ExtractedFields, followUpQuestions: string[], brainDumpText: string) => void;
  currentData: PromptData;
  isExtracting: boolean;
  onStartExtract: () => void;
  onFinishExtract: () => void;
}

export default function BrainDump({ 
  onExtracted, 
  currentData, 
  isExtracting,
  onStartExtract,
  onFinishExtract 
}: BrainDumpProps) {
  const [brainDumpText, setBrainDumpText] = useState('');
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!brainDumpText.trim()) return;
    
    setError(null);
    onStartExtract();
    
    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brainDump: brainDumpText,
          existingData: currentData 
        }),
      });

      const result = await response.json();

      if (result.error) {
        setError(result.error);
        return;
      }

      setExtractionResult(result);
      
      // Apply high-confidence fields automatically
      const appliedData = applyExtractedFields(currentData, result.fields);
      const suggestions = getSuggestedFields(result.fields);
      
      onExtracted(appliedData, suggestions, result.followUpQuestions || [], brainDumpText);
    } catch (err) {
      setError('Failed to extract fields. Please try again.');
      console.error(err);
    } finally {
      onFinishExtract();
    }
  };

  const renderFieldBadge = (extraction: FieldExtraction | undefined) => {
    if (!extraction) return null;
    const level = getConfidenceLevel(extraction.confidence);
    const color = getConfidenceColor(extraction.confidence);
    
    return (
      <Tooltip title={extraction.evidence ? `Evidence: "${extraction.evidence}"` : 'No direct evidence found'}>
        <Tag color={color} style={{ marginLeft: 8 }}>
          {level.toUpperCase()} ({Math.round(extraction.confidence * 100)}%)
        </Tag>
      </Tooltip>
    );
  };

  const renderExtractedField = (label: string, extraction: FieldExtraction | undefined) => {
    if (!extraction || !extraction.value.trim()) return null;
    
    return (
      <div style={{ marginBottom: 8, padding: '8px 12px', background: '#1a1a1a', borderRadius: 6, border: '1px solid #303030' }}>
        <Space>
          <Text type="secondary">{label}:</Text>
          <Text>{extraction.value.substring(0, 100)}{extraction.value.length > 100 ? '...' : ''}</Text>
          {renderFieldBadge(extraction)}
        </Space>
      </div>
    );
  };

  return (
    <div>
      <Alert
        message="Start with a brain dump"
        description="Write everything you know about your project in plain text. The AI will extract structured information and fill in the form fields automatically. You can then refine the results."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <TextArea
        value={brainDumpText}
        onChange={(e) => setBrainDumpText(e.target.value)}
        placeholder={`Describe your project freely. Include things like:

- What are you building and for whom?
- What problem are you solving?
- What should the user experience be like?
- What are the key screens or flows?
- Any constraints or requirements?

Example:
"I'm building a dashboard for marketing managers at our company. They need to track campaign performance across multiple channels. The main challenge is making complex data easy to understand quickly. Users check this daily on desktop. Key screens would be an overview dashboard, detailed campaign view, and a comparison tool..."

Don't worry about structure - just dump your thoughts!`}
        rows={8}
        style={{ fontFamily: 'inherit', marginBottom: 16 }}
      />

      <Space>
        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={handleExtract}
          loading={isExtracting}
          disabled={!brainDumpText.trim()}
        >
          Extract Fields
        </Button>
        {brainDumpText.trim() && (
          <Text type="secondary">{brainDumpText.length} characters</Text>
        )}
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {extractionResult && (
        <div style={{ marginTop: 24 }}>
          <Title level={5}>
            <Space>
              Extracted Fields
              <Tooltip title="Fields with HIGH confidence were auto-applied. Review MEDIUM/LOW confidence suggestions below.">
                <QuestionCircleOutlined />
              </Tooltip>
            </Space>
          </Title>
          
          {renderExtractedField('Feature Name', extractionResult.fields.featureName)}
          {renderExtractedField('Product/Company', extractionResult.fields.productCompany)}
          {renderExtractedField('Problem', extractionResult.fields.problem)}
          {renderExtractedField('Target Users', extractionResult.fields.targetUsers)}
          {renderExtractedField('Design Principle', extractionResult.fields.designPrinciple)}
          {renderExtractedField('Critical Challenge', extractionResult.fields.criticalChallenge)}
          {renderExtractedField('Platform', extractionResult.fields.platform)}
          {renderExtractedField('Design System', extractionResult.fields.designSystem)}

          {extractionResult.fields.journeys && extractionResult.fields.journeys.length > 0 && (
            <Collapse
              items={[{
                key: 'journeys',
                label: `Journeys (${extractionResult.fields.journeys.length} found)`,
                children: extractionResult.fields.journeys.map((j, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <Text strong>Journey {i + 1}: {j.name?.value || 'Unnamed'}</Text>
                    {renderFieldBadge(j.name)}
                    {j.when?.value && <Paragraph type="secondary" style={{ margin: '4px 0 0 0' }}>When: {j.when.value}</Paragraph>}
                  </div>
                ))
              }]}
              style={{ marginTop: 12 }}
            />
          )}

          {extractionResult.missing && extractionResult.missing.length > 0 && (
            <Alert
              message="Missing Information"
              description={
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {extractionResult.missing.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              }
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </div>
      )}
    </div>
  );
}
