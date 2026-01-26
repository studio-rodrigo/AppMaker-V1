'use client';

import { ConfigProvider, theme } from 'antd';
import { ReactNode } from 'react';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#2444EC',
          colorBgContainer: '#1f1f1f',
          colorBgElevated: '#1f1f1f',
          colorBgLayout: '#141414',
          colorBorder: '#424242',
          colorBorderSecondary: '#303030',
          borderRadius: 6,
        },
        components: {
          Card: {
            colorBgContainer: '#1f1f1f',
          },
          Collapse: {
            colorBgContainer: '#1f1f1f',
            contentBg: '#1f1f1f',
          },
          Input: {
            colorBgContainer: '#141414',
          },
          Select: {
            colorBgContainer: '#141414',
          },
          Button: {
            colorBgContainer: '#1f1f1f',
          },
          Modal: {
            contentBg: '#1f1f1f',
            headerBg: '#1f1f1f',
          },
          Dropdown: {
            colorBgElevated: '#1f1f1f',
          },
          Alert: {
            colorInfoBg: '#111a2c',
            colorInfoBorder: '#153450',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
