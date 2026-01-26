'use client';

import { useState } from 'react';
import { Layout, Typography, Splitter } from 'antd';
import PromptForm from '@/components/PromptForm';
import PromptPreview from '@/components/PromptPreview';
import { PromptData, defaultPromptData } from '@/lib/types';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function Home() {
  const [promptData, setPromptData] = useState<PromptData>(defaultPromptData);

  const handleValuesChange = (_changedValues: Partial<PromptData>, allValues: PromptData) => {
    setPromptData(allValues);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header 
        style={{ 
          background: '#1f1f1f', 
          borderBottom: '1px solid #424242',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          height: 'auto',
          lineHeight: 'normal',
        }}
      >
        <div>
          <Text style={{ fontSize: 16, color: '#2444EC', fontWeight: 500 }}>
            Rodrigo Labs: App Maker
          </Text>
          {' '}
          <Text type="secondary" style={{ fontSize: 14 }}>
            [Generate structured prompts for AI-powered design]
          </Text>
        </div>
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
              background: '#1f1f1f', 
              padding: 24, 
              borderRadius: 8,
              height: '100%',
              overflow: 'auto',
              border: '1px solid #424242',
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
