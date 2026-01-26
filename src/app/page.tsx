'use client';

import { useState } from 'react';
import { Layout, Typography, Splitter } from 'antd';
import PromptForm from '@/components/PromptForm';
import PromptPreview from '@/components/PromptPreview';
import { PromptData, defaultPromptData } from '@/lib/types';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function Home() {
  const [promptData, setPromptData] = useState<PromptData>(defaultPromptData);

  const handleValuesChange = (_changedValues: Partial<PromptData>, allValues: PromptData) => {
    setPromptData(allValues);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          background: 'white', 
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
            Figma Make Prompt Generator
          </Title>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Generate structured prompts for AI-powered design
          </Text>
        </div>
      </Header>

      <Content style={{ padding: 24, background: '#f5f5f5' }}>
        <Splitter
          style={{ 
            height: 'calc(100vh - 120px)',
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
              background: 'white', 
              padding: 24, 
              borderRadius: 8,
              height: '100%',
              overflow: 'auto',
            }}>
              <PromptForm 
                onValuesChange={handleValuesChange}
                initialValues={defaultPromptData}
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
