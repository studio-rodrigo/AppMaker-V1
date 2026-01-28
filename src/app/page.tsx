'use client';

import { useState, useCallback } from 'react';
import { Layout, Typography, Splitter } from 'antd';
import PromptPreview from '@/components/PromptPreview';
import ModeSelector from '@/components/ModeSelector';
import { IdeaWorkflow, ProductWorkflow, TeamWorkflow } from '@/components/workflows';
import { PromptData, defaultPromptData, WorkflowMode } from '@/lib/types';
import { ExtractedFields } from '@/lib/extract-types';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function Home() {
  const [promptData, setPromptData] = useState<PromptData>(defaultPromptData);
  const [suggestions, setSuggestions] = useState<ExtractedFields>({});
  const [selectedMode, setSelectedMode] = useState<WorkflowMode | null>(null);

  // Check if form has meaningful data (for mode switch warning)
  const hasFormData = !!(
    promptData.featureName || 
    promptData.problem || 
    promptData.targetUsers ||
    promptData.prdContent
  );

  const handleValuesChange = useCallback((_changedValues: Partial<PromptData>, allValues: PromptData) => {
    setPromptData(allValues);
  }, []);

  const handleApplySuggestion = useCallback((field: string, value: string) => {
    setPromptData(prev => ({ ...prev, [field]: value }));
    setSuggestions(prev => {
      const updated = { ...prev };
      delete (updated as Record<string, unknown>)[field];
      return updated;
    });
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          background: '#1f1f1f', 
          borderBottom: '1px solid #424242',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          height: 'auto',
          lineHeight: 'normal',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Text 
            style={{ 
              fontSize: 11, 
              color: '#2444EC', 
              fontWeight: 600,
              padding: '3px 8px',
              border: '1px solid #2444EC',
              borderRadius: 4,
            }}
          >
            Rodrigo Labs
          </Text>
          <Text style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
            App Maker
          </Text>
        </div>
        <Text type="secondary" style={{ fontSize: 13 }}>
          Generate structured prompts for AI-powered design
        </Text>
      </Header>

      <Content style={{ padding: 24, background: '#141414' }}>
        <Splitter
          style={{ 
            height: 'calc(100vh - 100px)',
            background: 'transparent',
          }}
        >
          <Splitter.Panel 
            defaultSize="50%" 
            min="30%" 
            max="70%"
            style={{ 
              overflow: 'auto',
              paddingRight: 12,
            }}
          >
            <div style={{ 
              height: '100%',
              overflow: 'auto',
            }}>
              {/* Mode Selector */}
              <ModeSelector
                selectedMode={selectedMode}
                onModeSelect={setSelectedMode}
                hasData={hasFormData}
              />

              {/* Mode-specific workflow components */}
              {selectedMode === 'idea' && (
                <IdeaWorkflow
                  promptData={promptData}
                  onValuesChange={handleValuesChange}
                  suggestions={suggestions}
                  onApplySuggestion={handleApplySuggestion}
                />
              )}

              {selectedMode === 'product' && (
                <ProductWorkflow
                  promptData={promptData}
                  onValuesChange={handleValuesChange}
                  suggestions={suggestions}
                  onApplySuggestion={handleApplySuggestion}
                />
              )}

              {selectedMode === 'team' && (
                <TeamWorkflow
                  promptData={promptData}
                  onValuesChange={handleValuesChange}
                  suggestions={suggestions}
                  onApplySuggestion={handleApplySuggestion}
                />
              )}
            </div>
          </Splitter.Panel>

          <Splitter.Panel 
            style={{ 
              overflow: 'auto',
              paddingLeft: 12,
            }}
          >
            <div style={{ height: '100%' }}>
              <PromptPreview data={promptData} mode={selectedMode} />
            </div>
          </Splitter.Panel>
        </Splitter>
      </Content>
    </Layout>
  );
}
