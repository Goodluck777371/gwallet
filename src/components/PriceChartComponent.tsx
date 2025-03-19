
import React, { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { currencyRates } from "@/utils/transactionUtils";

// Mock price history data
const generateMockHistoricalData = (
  timeFrame: string,
  currency: string,
  baseRate: number
) => {
  const now = new Date();
  const data = [];
  
  let numberOfPoints = 0;
  let interval = 0;
  
  switch (timeFrame) {
    case "1D":
      numberOfPoints = 24;
      interval = 60 * 60 * 1000; // 1 hour in milliseconds
      break;
    case "1W":
      numberOfPoints = 7;
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
    case "1M":
      numberOfPoints = 30;
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
      break;
    case "3M":
      numberOfPoints = 12;
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      break;
    case "6M":
      numberOfPoints = 24;
      interval = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
      break;
    case "1Y":
      numberOfPoints = 12;
      interval = 30 * 24 * 60 * 60 * 1000; // 1 month in milliseconds
      break;
    default:
      numberOfPoints = 7;
      interval = 24 * 60 * 60 * 1000; // 1 day in milliseconds
  }
  
  for (let i = numberOfPoints - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * interval);
    const randomVariation = 0.05; // 5% variation
    const variationFactor = 1 + (Math.random() * randomVariation * 2 - randomVariation);
    
    // For the price trend, make it generally go up over time
    const trendFactor = 1 + (i / numberOfPoints) * 0.1; // Up to 10% increase over time
    
    const price = baseRate * variationFactor * trendFactor;
    const volume = Math.round(100000 + Math.random() * 500000);
    
    const open = price * (1 - Math.random() * 0.02);
    const close = price;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    
    let label = '';
    switch (timeFrame) {
      case "1D":
        label = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        break;
      case "1W":
      case "1M":
        label = date.toLocaleDateString([], { weekday: 'short', day: 'numeric' });
        break;
      case "3M":
      case "6M":
        label = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        break;
      case "1Y":
        label = date.toLocaleDateString([], { month: 'short', year: '2-digit' });
        break;
      default:
        label = date.toLocaleDateString();
    }
    
    data.push({
      name: label,
      price: parseFloat(price.toFixed(4)),
      open: parseFloat(open.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      volume,
    });
  }
  
  return data;
};

interface PriceChartComponentProps {
  currency: string;
  timeFrame: string;
}

const PriceChartComponent: React.FC<PriceChartComponentProps> = ({ currency, timeFrame }) => {
  const [data, setData] = useState<any[]>([]);
  
  useEffect(() => {
    const baseRate = currencyRates[currency as keyof typeof currencyRates] || 1;
    const historyData = generateMockHistoricalData(timeFrame, currency, baseRate);
    setData(historyData);
  }, [currency, timeFrame]);
  
  const formatCurrency = (value: number) => {
    return `${value.toFixed(4)} ${currency}`;
  };
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
        />
        <YAxis 
          tickFormatter={formatCurrency} 
          tick={{ fontSize: 12 }} 
          tickMargin={10}
          domain={['dataMin', 'dataMax']}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), "Price"]} 
          labelFormatter={(label) => `Time: ${label}`}
          contentStyle={{ 
            backgroundColor: 'white', 
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke="#4f46e5" 
          fill="url(#colorPrice)" 
          dot={false}
          activeDot={{ r: 6 }}
          name={`GCoin Price (${currency})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PriceChartComponent;
