'use client';

import { useState, useCallback } from 'react';
import { Layout, Typography, Splitter, Collapse } from 'antd';
import { BulbOutlined, MessageOutlined } from '@ant-design/icons';
import PromptForm from '@/components/PromptForm';
import PromptPreview from '@/components/PromptPreview';
import BrainDump from '@/components/BrainDump';
import FollowupChat from '@/components/FollowupChat';
import { PromptData, defaultPromptData } from '@/lib/types';
import { ExtractedFields } from '@/lib/extract-types';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function Home() {
  const [promptData, setPromptData] = useState<PromptData>(defaultPromptData);
  const [isExtracting, setIsExtracting] = useState(false);
  const [brainDumpContext, setBrainDumpContext] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<ExtractedFields>({});
  const [formKey, setFormKey] = useState(0); // Used to force form re-render with new values

  const handleValuesChange = useCallback((_changedValues: Partial<PromptData>, allValues: PromptData) => {
    setPromptData(allValues);
  }, []);

  const handleBrainDumpExtracted = useCallback((
    extractedData: PromptData, 
    extractedSuggestions: ExtractedFields,
    questions: string[],
    brainDumpText: string
  ) => {
    setPromptData(extractedData);
    setSuggestions(extractedSuggestions);
    setFollowUpQuestions(questions);
    setBrainDumpContext(brainDumpText);
    setFormKey(prev => prev + 1); // Force form to re-initialize with new values
  }, []);

  const handleFollowUpFieldsUpdated = useCallback((
    updatedData: PromptData,
    updatedSuggestions: ExtractedFields
  ) => {
    setPromptData(updatedData);
    setSuggestions(prev => ({ ...prev, ...updatedSuggestions }));
    setFormKey(prev => prev + 1);
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
          <Text style={{ fontSize: 18, color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
            App Maker
          </Text>
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
              {/* Brain Dump & Follow-up Sections */}
              <Collapse
                defaultActiveKey={['brain-dump']}
                style={{ marginBottom: 16 }}
                items={[
                  {
                    key: 'brain-dump',
                    label: (
                      <span>
                        <BulbOutlined style={{ marginRight: 8 }} />
                        Brain Dump
                      </span>
                    ),
                    children: (
                      <BrainDump
                        onExtracted={handleBrainDumpExtracted}
                        currentData={promptData}
                        isExtracting={isExtracting}
                        onStartExtract={() => {
                          setIsExtracting(true);
                        }}
                        onFinishExtract={() => setIsExtracting(false)}
                      />
                    ),
                  },
                  ...(followUpQuestions.length > 0 && brainDumpContext ? [{
                    key: 'follow-up',
                    label: (
                      <span>
                        <MessageOutlined style={{ marginRight: 8 }} />
                        Follow-up Questions
                      </span>
                    ),
                    children: (
                      <FollowupChat
                        initialQuestions={followUpQuestions}
                        currentData={promptData}
                        onFieldsUpdated={handleFollowUpFieldsUpdated}
                        brainDumpContext={brainDumpContext}
                      />
                    ),
                  }] : []),
                ]}
              />

              {/* Main Form */}
              <PromptForm 
                key={formKey}
                onValuesChange={handleValuesChange}
                initialValues={promptData}
                currentData={promptData}
                suggestions={suggestions}
                onApplySuggestion={(field, value) => {
                  const newData = { ...promptData, [field]: value };
                  setPromptData(newData);
                  setSuggestions(prev => {
                    const updated = { ...prev };
                    delete (updated as Record<string, unknown>)[field];
                    return updated;
                  });
                  setFormKey(prev => prev + 1);
                }}
              />
            </div>
          </Splitter.Panel>

          <Splitter.Panel 
            style={{ 
              overflow: 'auto',
              paddingLeft: 12,
            }}
          >
            <div style={{ height: '100%' }}>
              <PromptPreview data={promptData} />
            </div>
          </Splitter.Panel>
        </Splitter>
      </Content>
    </Layout>
  );
}
