import React, { useRef } from 'react';
import { DataProvider } from '@/contexts/DataContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import Sidebar from '@/components/layout/Sidebar';
import ChartRenderer from '@/components/chart/ChartRenderer';

export default function Home() {
  const chartRef = useRef<any>(null);

  return (
    <DataProvider>
      <ConfigProvider>
        <div className="flex h-screen w-full bg-background overflow-hidden">
          <Sidebar chartRef={chartRef} />
          <main className="flex-1 h-full relative overflow-hidden">
            {/* Subtle grid pattern background */}
            <div className="absolute inset-0 grid-pattern opacity-50" />

            {/* Main content area */}
            <div className="absolute inset-0 p-6 md:p-8">
              <div className="h-full w-full bg-card border-2 border-border neo-shadow relative overflow-hidden">
                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-primary" />

                <ChartRenderer chartRef={chartRef} />
              </div>
            </div>
          </main>
        </div>
      </ConfigProvider>
    </DataProvider>
  );
}
