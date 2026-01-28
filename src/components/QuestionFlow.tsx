'use client';

import { useState } from 'react';
import { Input, Button, Typography, Space, Progress } from 'antd';
import { SendOutlined, RightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ExtractionResult, ExtractedFields } from '@/lib/extract-types';
import { PromptData } from '@/lib/types';
import { applyExtractedFields, getSuggestedFields } from '@/lib/apply-extract';

const { TextArea } = Input;
const { Text } = Typography;

interface QuestionFlowProps {
  questions: string[];
  currentData: PromptData;
  onFieldsUpdated: (data: PromptData, suggestions: ExtractedFields) => void;
  brainDumpContext: string;
  onComplete: () => void;
}

export default function QuestionFlow({ 
  questions, 
  currentData, 
  onFieldsUpdated,
  brainDumpContext,
  onComplete,
}: QuestionFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const isComplete = currentIndex >= totalQuestions;

  const handleAnswer = async () => {
    if (!inputValue.trim()) return;
    
    setIsLoading(true);

    try {
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          brainDump: brainDumpContext,
          followUpAnswer: `Question: "${currentQuestion}"\nAnswer: ${inputValue}`,
          existingData: currentData,
        }),
      });

      const result: ExtractionResult & { error?: string } = await response.json();

      if (!result.error && result.fields) {
        const appliedData = applyExtractedFields(currentData, result.fields);
        const suggestions = getSuggestedFields(result.fields);
        onFieldsUpdated(appliedData, suggestions);
      }

      setAnsweredCount(prev => prev + 1);
      moveToNext();
    } catch (err) {
      console.error(err);
      moveToNext();
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNext = () => {
    setInputValue('');
    setShowInput(false);
    
    if (currentIndex + 1 >= totalQuestions) {
      onComplete();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    moveToNext();
  };

  // Don't render if no questions or complete
  if (totalQuestions === 0 || isComplete) {
    return null;
  }

  return (
    <div style={{ 
      background: '#1a1a1a', 
      border: '1px solid #303030',
      borderRadius: 8,
      padding: 16,
    }}>
      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Optional: Help refine your brief
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {currentIndex + 1} of {totalQuestions}
          </Text>
        </div>
        <Progress 
          percent={((currentIndex) / totalQuestions) * 100} 
          showInfo={false}
          size="small"
          strokeColor="#722ed1"
        />
      </div>

      {/* Current Question */}
      <div style={{ 
        padding: '12px 16px',
        background: '#262626',
        borderRadius: 6,
        marginBottom: 12,
      }}>
        <Text style={{ fontSize: 14, lineHeight: 1.5 }}>{currentQuestion}</Text>
      </div>

      {/* Answer Input (shown when user clicks Answer) */}
      {showInput ? (
        <div style={{ marginBottom: 12 }}>
          <TextArea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your answer..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            autoFocus
            onPressEnter={(e) => {
              if (!e.shiftKey && inputValue.trim()) {
                e.preventDefault();
                handleAnswer();
              }
            }}
            style={{ 
              marginBottom: 8,
              background: '#141414',
              border: '1px solid #424242',
            }}
          />
          <Space>
            <Button
              type="primary"
              size="small"
              icon={<SendOutlined />}
              onClick={handleAnswer}
              loading={isLoading}
              disabled={!inputValue.trim()}
            >
              Submit
            </Button>
            <Button
              type="text"
              size="small"
              onClick={() => {
                setShowInput(false);
                setInputValue('');
              }}
            >
              Cancel
            </Button>
          </Space>
        </div>
      ) : (
        /* Action Buttons */
        <Space>
          <Button
            type="primary"
            size="small"
            onClick={() => setShowInput(true)}
          >
            Answer
          </Button>
          <Button
            type="text"
            size="small"
            icon={<RightOutlined />}
            onClick={handleSkip}
          >
            Skip
          </Button>
          {currentIndex > 0 && (
            <Button
              type="text"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={onComplete}
              style={{ marginLeft: 8 }}
            >
              Done
            </Button>
          )}
        </Space>
      )}

      {/* Answered count indicator */}
      {answeredCount > 0 && (
        <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
          {answeredCount} answered
        </Text>
      )}
    </div>
  );
}
