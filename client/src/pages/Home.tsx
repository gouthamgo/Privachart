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
          <main className="flex-1 h-full relative bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="absolute inset-0 p-8">
              <div className="h-full w-full bg-white border-2 border-black neo-shadow p-1">
                <ChartRenderer chartRef={chartRef} />
              </div>
            </div>
          </main>
        </div>
      </ConfigProvider>
    </DataProvider>
  );
}
