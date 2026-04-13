'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface CostChartProps {
  data: {
    formattedDate: string
    cost: number
  }[]
}

const CostChart: React.FC<CostChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[250px] bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-gray-900 tracking-tight">노무비 지출 추이</h3>
          <p className="text-xs font-bold text-gray-400">최근 14일간의 일별 총액</p>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Daily Cost</span>
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              hide
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
              itemStyle={{ fontWeight: 800, fontSize: '12px', color: '#2563eb' }}
              labelStyle={{ fontWeight: 700, fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value: number) => [`₩${value.toLocaleString()}`, '지출액']}
            />
            <Area 
              type="monotone" 
              dataKey="cost" 
              stroke="#2563eb" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorCost)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default CostChart
