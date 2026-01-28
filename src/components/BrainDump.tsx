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
  onExtracted: (data: PromptData, suggestions: ExtractedFields, followUpQuestions: string[], brainDumpText: string, extractionResult: ExtractionResult) => void;
  currentData: PromptData;
  isExtracting: boolean;
  onStartExtract: () => void;
  onFinishExtract: () => void;
  variant?: BrainDumpVariant;
  hideExtractionResults?: boolean;
}

export default function BrainDump({ 
  onExtracted, 
  currentData, 
  isExtracting,
  onStartExtract,
  onFinishExtract,
  variant = 'hero',
  hideExtractionResults = false,
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
      
      onExtracted(appliedData, suggestions, result.followUpQuestions || [], brainDumpText, result);
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

        {!hideExtractionResults && renderExtractionResults()}
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

      {!hideExtractionResults && renderExtractionResults()}
    </Card>
  );
}

// Standalone component for rendering extraction results
interface ExtractionResultsDisplayProps {
  extractionResult: ExtractionResult | null;
  onScrollToField?: (fieldName: string) => void;
}

export function ExtractionResultsDisplay({ extractionResult, onScrollToField }: ExtractionResultsDisplayProps) {
  if (!extractionResult) return null;

  const renderFieldBadge = (extraction: FieldExtraction | undefined) => {
    if (!extraction) return null;
    const level = getConfidenceLevel(extraction.confidence);
    const color = getConfidenceColor(extraction.confidence);
    
    return (
      <Tooltip title={extraction.evidence ? `Evidence: "${extraction.evidence}"` : 'Inferred from context'}>
        <Tag color={color} style={{ marginLeft: 8 }}>
          {level.toUpperCase()} ({Math.round(extraction.confidence * 100)}%)
        </Tag>
      </Tooltip>
    );
  };

  const renderExtractedField = (label: string, extraction: FieldExtraction | undefined, multiline = false) => {
    if (!extraction || !extraction.value.trim()) return null;
    
    const displayValue = multiline 
      ? extraction.value 
      : extraction.value.substring(0, 100) + (extraction.value.length > 100 ? '...' : '');
    
    return (
      <div style={{ marginBottom: 8, padding: '8px 12px', background: '#1a1a1a', borderRadius: 6, border: '1px solid #303030' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Text type="secondary" style={{ flexShrink: 0 }}>{label}:</Text>
          <div style={{ flex: 1 }}>
            <Text style={{ whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>{displayValue}</Text>
            {renderFieldBadge(extraction)}
          </div>
        </div>
      </div>
    );
  };

  // Map missing item names to form field names for click-to-scroll
  const getMissingFieldLink = (missingItem: string): string | null => {
    const lowerItem = missingItem.toLowerCase();
    if (lowerItem.includes('journey')) return 'journeys';
    if (lowerItem.includes('platform')) return 'platform';
    if (lowerItem.includes('design') && lowerItem.includes('vibe')) return 'designVibe';
    if (lowerItem.includes('design') && lowerItem.includes('system')) return 'designSystem';
    if (lowerItem.includes('user') || lowerItem.includes('target')) return 'targetUsers';
    if (lowerItem.includes('problem')) return 'problem';
    if (lowerItem.includes('principle')) return 'designPrinciple';
    if (lowerItem.includes('challenge')) return 'criticalChallenge';
    if (lowerItem.includes('company') || lowerItem.includes('product')) return 'productCompany';
    if (lowerItem.includes('summary')) return 'appSummary';
    return null;
  };

  const handleMissingClick = (fieldName: string) => {
    if (onScrollToField) {
      onScrollToField(fieldName);
    }
  };

  // Filter to only show truly critical missing items (for Idea mode, be very conservative)
  const criticalMissing = (extractionResult.missing || []).filter(item => {
    const lower = item.toLowerCase();
    // Only critical: journeys if completely empty, or target users if completely unknown
    return lower.includes('journey') || (lower.includes('target') && lower.includes('user'));
  });

  return (
    <div>
      <Title level={5}>
        <Space>
          Extracted Fields
          <Tooltip title="Fields with HIGH confidence were auto-applied. Review and edit as needed.">
            <QuestionCircleOutlined />
          </Tooltip>
        </Space>
      </Title>

      {/* App Identity Group */}
      {(extractionResult.fields.featureName || extractionResult.fields.appType || extractionResult.fields.appSummary) && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>App Identity</Text>
          {renderExtractedField('App Name', extractionResult.fields.featureName)}
          {renderExtractedField('App Type', extractionResult.fields.appType)}
          {renderExtractedField('Summary', extractionResult.fields.appSummary, true)}
        </div>
      )}

      {/* Core Details Group */}
      {(extractionResult.fields.problem || extractionResult.fields.targetUsers || extractionResult.fields.designPrinciple) && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>Core Details</Text>
          {renderExtractedField('Problem', extractionResult.fields.problem, true)}
          {renderExtractedField('Target Users', extractionResult.fields.targetUsers)}
          {renderExtractedField('Design Principle', extractionResult.fields.designPrinciple)}
          {renderExtractedField('Critical Challenge', extractionResult.fields.criticalChallenge)}
        </div>
      )}

      {/* Design & Platform Group */}
      {(extractionResult.fields.platform || extractionResult.fields.designVibe || extractionResult.fields.designSystem) && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>Design & Platform</Text>
          {renderExtractedField('Platform', extractionResult.fields.platform)}
          {renderExtractedField('Design Vibe', extractionResult.fields.designVibe, true)}
          {renderExtractedField('Design System', extractionResult.fields.designSystem)}
        </div>
      )}

      {/* Journeys */}
      {extractionResult.fields.journeys && extractionResult.fields.journeys.length > 0 && (
        <Collapse
          items={[{
            key: 'journeys',
            label: (
              <Space>
                <span>User Journeys ({extractionResult.fields.journeys.length} found)</span>
                <Tag color="#722ed1" style={{ marginLeft: 4 }}>Core Flows</Tag>
              </Space>
            ),
            children: extractionResult.fields.journeys.map((j, i) => (
              <div key={i} style={{ 
                marginBottom: 12, 
                padding: 12, 
                background: '#141414', 
                borderRadius: 6,
                border: '1px solid #303030'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <Text strong>Journey {i + 1}: {j.name?.value || 'Unnamed'}</Text>
                  {renderFieldBadge(j.name)}
                </div>
                {j.when?.value && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">When: </Text>
                    <Text>{j.when.value}</Text>
                  </div>
                )}
                {j.trigger?.value && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">Trigger: </Text>
                    <Text>{j.trigger.value}</Text>
                  </div>
                )}
                {j.mustCommunicate?.value && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">Must communicate: </Text>
                    <Text>{j.mustCommunicate.value}</Text>
                  </div>
                )}
                {j.ctas?.value && (
                  <div style={{ marginBottom: 4 }}>
                    <Text type="secondary">Key actions: </Text>
                    <Text>{j.ctas.value}</Text>
                  </div>
                )}
              </div>
            ))
          }]}
          style={{ marginTop: 12 }}
          defaultActiveKey={['journeys']}
        />
      )}

      {/* Only show critical missing items */}
      {criticalMissing.length > 0 && (
        <Alert
          message="Needs Attention"
          description={
            <div>
              {criticalMissing.map((m, i) => {
                const fieldLink = getMissingFieldLink(m);
                return (
                  <div 
                    key={i} 
                    onClick={() => fieldLink && handleMissingClick(fieldLink)}
                    style={{ 
                      cursor: fieldLink ? 'pointer' : 'default',
                      padding: '4px 0',
                      color: fieldLink ? '#1890ff' : 'inherit',
                      textDecoration: fieldLink ? 'underline' : 'none'
                    }}
                  >
                    • {m}
                  </div>
                );
              })}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
}
