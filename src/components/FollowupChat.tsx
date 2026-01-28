'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Space, List, Tag, Card } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons';
import { ChatMessage, ExtractionResult, ExtractedFields } from '@/lib/extract-types';
import { PromptData } from '@/lib/types';
import { applyExtractedFields, getSuggestedFields } from '@/lib/apply-extract';

const { TextArea } = Input;
const { Text, Paragraph, Title } = Typography;

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
      style={{ 
        background: '#1a1a1a', 
        border: '1px solid #303030',
        borderRadius: 8,
      }}
      styles={{
        body: { padding: 16 }
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 8, 
        marginBottom: 16,
        paddingBottom: 12,
        borderBottom: '1px solid #303030'
      }}>
        <MessageOutlined style={{ fontSize: 18, color: '#722ed1' }} />
        <Title level={5} style={{ margin: 0 }}>Fill in the Gaps</Title>
      </div>

      {/* Chat Messages */}
      <div style={{ 
        maxHeight: 240, 
        overflowY: 'auto', 
        marginBottom: 16,
        padding: 12,
        background: '#141414',
        borderRadius: 6,
      }}>
        <List
          dataSource={messages}
          split={false}
          renderItem={(msg) => (
            <List.Item style={{ 
              border: 'none', 
              padding: '6px 0',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: msg.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                background: msg.role === 'user' ? '#2444EC' : '#262626',
              }}>
                <Space align="start" size={8}>
                  {msg.role === 'assistant' && <RobotOutlined style={{ marginTop: 2, color: '#722ed1' }} />}
                  <Text style={{ lineHeight: 1.5 }}>{msg.content}</Text>
                  {msg.role === 'user' && <UserOutlined style={{ marginTop: 2 }} />}
                </Space>
              </div>
            </List.Item>
          )}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {suggestedQuestions.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary" style={{ fontSize: 12, marginBottom: 10, display: 'block' }}>
            Click a question to answer it:
          </Text>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {suggestedQuestions.map((q, i) => (
              <Tag
                key={i}
                onClick={() => handleQuestionClick(q)}
                style={{ 
                  cursor: 'pointer', 
                  padding: '8px 12px',
                  background: '#262626',
                  border: '1px solid #424242',
                  borderRadius: 6,
                  fontSize: 13,
                  whiteSpace: 'normal',
                  lineHeight: 1.4,
                  margin: 0,
                }}
              >
                {q}
              </Tag>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{ 
        background: '#141414', 
        borderRadius: 6, 
        padding: 8,
        border: '1px solid #303030'
      }}>
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
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none',
              resize: 'none',
            }}
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
        <Text type="secondary" style={{ fontSize: 11, marginTop: 6, display: 'block' }}>
          Press Enter to send, Shift+Enter for new line
        </Text>
      </div>
    </Card>
  );
}
