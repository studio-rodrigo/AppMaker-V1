'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, List, Tag } from 'antd';
import { SendOutlined, MessageOutlined, RobotOutlined, UserOutlined } from '@ant-design/icons';
import { ChatMessage, ExtractionResult, ExtractedFields } from '@/lib/extract-types';
import { PromptData } from '@/lib/types';
import { applyExtractedFields, getSuggestedFields } from '@/lib/apply-extract';

const { TextArea } = Input;
const { Text, Paragraph } = Typography;

interface FollowupChatProps {
  initialQuestions: string[];
  currentData: PromptData;
  onFieldsUpdated: (data: PromptData, suggestions: ExtractedFields) => void;
  brainDumpContext: string;
}

export default function FollowupChat({ 
  initialQuestions, 
  currentData, 
  onFieldsUpdated,
  brainDumpContext 
}: FollowupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>(initialQuestions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with assistant message showing follow-up questions
    if (initialQuestions.length > 0 && messages.length === 0) {
      const intro = `I've extracted what I could from your brain dump. To fill in the gaps, could you help me with a few things?`;
      setMessages([{ role: 'assistant', content: intro }]);
    }
  }, [initialQuestions, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brainDump: brainDumpContext,
          followUpAnswer: messageText,
          existingData: currentData,
          conversationHistory: newMessages
        }),
      });

      const result: ExtractionResult & { assistantMessage?: string; error?: string } = await response.json();

      if (result.error) {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: `Sorry, I encountered an error. Please try again.` 
        }]);
        return;
      }

      // Apply any new extracted fields
      if (result.fields) {
        const appliedData = applyExtractedFields(currentData, result.fields);
        const suggestions = getSuggestedFields(result.fields);
        onFieldsUpdated(appliedData, suggestions);
      }

      // Add assistant response
      const assistantResponse = result.assistantMessage || 
        (result.followUpQuestions?.length 
          ? `Thanks! I've updated the form. ${result.followUpQuestions.length > 0 ? 'A few more questions:' : ''}`
          : `Great, I've updated the form with that information.`);
      
      setMessages([...newMessages, { role: 'assistant', content: assistantResponse }]);
      setSuggestedQuestions(result.followUpQuestions || []);
    } catch (err) {
      console.error(err);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    // Remove clicked question from suggestions
    setSuggestedQuestions(prev => prev.filter(q => q !== question));
    // Set as input and show it was selected
    setInputValue('');
    handleSend(`Regarding "${question}":`);
  };

  if (initialQuestions.length === 0 && messages.length === 0) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <MessageOutlined />
          <span>Follow-up Questions</span>
        </Space>
      }
      style={{ marginBottom: 16 }}
      styles={{ body: { padding: 16 } }}
    >
      <div style={{ 
        maxHeight: 300, 
        overflowY: 'auto', 
        marginBottom: 16,
        padding: 8,
        background: '#141414',
        borderRadius: 6,
        border: '1px solid #303030'
      }}>
        <List
          dataSource={messages}
          renderItem={(msg) => (
            <List.Item style={{ 
              border: 'none', 
              padding: '8px 0',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: 8,
                background: msg.role === 'user' ? '#2444EC' : '#1f1f1f',
              }}>
                <Space align="start">
                  {msg.role === 'assistant' && <RobotOutlined style={{ marginTop: 4 }} />}
                  <Text>{msg.content}</Text>
                  {msg.role === 'user' && <UserOutlined style={{ marginTop: 4 }} />}
                </Space>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      {suggestedQuestions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 8, display: 'block' }}>
            Click a question to answer it:
          </Text>
          <Space wrap>
            {suggestedQuestions.map((q, i) => (
              <Tag
                key={i}
                onClick={() => handleQuestionClick(q)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '4px 8px',
                  background: '#1f1f1f',
                  border: '1px solid #424242'
                }}
              >
                {q}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      <Space.Compact style={{ width: '100%' }}>
        <TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your answer or add more context..."
          autoSize={{ minRows: 1, maxRows: 4 }}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{ flex: 1 }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={() => handleSend()}
          loading={isLoading}
          disabled={!inputValue.trim()}
        >
          Send
        </Button>
      </Space.Compact>

      <Paragraph type="secondary" style={{ fontSize: 11, marginTop: 8, marginBottom: 0 }}>
        Press Enter to send, Shift+Enter for new line
      </Paragraph>
    </Card>
  );
}
