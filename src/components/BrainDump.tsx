'use client';

import { useState } from 'react';
import { Input, Button, Typography, Space, Alert, Tag, Tooltip, Collapse, Card } from 'antd';
import { ThunderboltOutlined, QuestionCircleOutlined, BulbOutlined } from '@ant-design/icons';
import { ExtractionResult, ExtractedFields, FieldExtraction, getConfidenceLevel, getConfidenceColor } from '@/lib/extract-types';
import { PromptData } from '@/lib/types';
import { applyExtractedFields, getSuggestedFields } from '@/lib/apply-extract';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

type BrainDumpVariant = 'hero' | 'helper';

interface BrainDumpProps {
  onExtracted: (data: PromptData, suggestions: ExtractedFields, followUpQuestions: string[], brainDumpText: string) => void;
  currentData: PromptData;
  isExtracting: boolean;
  onStartExtract: () => void;
  onFinishExtract: () => void;
  variant?: BrainDumpVariant;
}

export default function BrainDump({ 
  onExtracted, 
  currentData, 
  isExtracting,
  onStartExtract,
  onFinishExtract,
  variant = 'hero'
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

  // Shared extraction results UI
  const renderExtractionResults = () => {
    if (!extractionResult) return null;
    
    return (
      <div style={{ marginTop: variant === 'hero' ? 24 : 16 }}>
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
    );
  };

  // ============================================
  // HERO VARIANT - Prominent for Idea mode
  // ============================================
  if (variant === 'hero') {
    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <BulbOutlined style={{ fontSize: 48, color: '#722ed1', marginBottom: 16 }} />
          <Title level={3} style={{ marginBottom: 8 }}>Start with your idea</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Write everything you know about your project. Don&apos;t worry about structure - just dump your thoughts.
          </Text>
        </div>

        <TextArea
          value={brainDumpText}
          onChange={(e) => setBrainDumpText(e.target.value)}
          placeholder={`Describe your idea freely...

- What are you building and for whom?
- What problem are you solving?
- What should the user experience be like?
- What are the key screens or flows?

Example: "I'm building a habit tracking app for busy professionals. They want to build better routines but always forget. It should feel motivating, not guilt-inducing. Key moments are adding a new habit, checking off daily, and seeing weekly progress..."`}
          rows={10}
          style={{ 
            fontFamily: 'inherit', 
            marginBottom: 16,
            fontSize: 15,
            padding: 16,
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltOutlined />}
            onClick={handleExtract}
            loading={isExtracting}
            disabled={!brainDumpText.trim()}
          >
            Extract & Fill Fields
          </Button>
          {brainDumpText.trim() && (
            <Text type="secondary">{brainDumpText.length} characters</Text>
          )}
        </div>

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

        {renderExtractionResults()}
      </div>
    );
  }

  // ============================================
  // HELPER VARIANT - Compact for Product/Team mode
  // ============================================
  return (
    <Card
      size="small"
      style={{ background: '#1a1a1a', border: '1px solid #303030' }}
    >
      <div style={{ marginBottom: 12 }}>
        <Space>
          <BulbOutlined style={{ color: '#722ed1' }} />
          <Text strong>Need help articulating?</Text>
        </Space>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          Describe your idea freely and we&apos;ll extract structured fields.
        </Text>
      </div>

      <TextArea
        value={brainDumpText}
        onChange={(e) => setBrainDumpText(e.target.value)}
        placeholder="Brain dump your thoughts here..."
        rows={4}
        style={{ fontFamily: 'inherit', marginBottom: 12 }}
      />

      <Space>
        <Button
          type="primary"
          size="small"
          icon={<ThunderboltOutlined />}
          onClick={handleExtract}
          loading={isExtracting}
          disabled={!brainDumpText.trim()}
        >
          Extract
        </Button>
        {brainDumpText.trim() && (
          <Text type="secondary" style={{ fontSize: 12 }}>{brainDumpText.length} chars</Text>
        )}
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: 12 }}
          closable
          onClose={() => setError(null)}
        />
      )}

      {renderExtractionResults()}
    </Card>
  );
}
