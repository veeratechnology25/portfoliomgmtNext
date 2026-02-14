'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface BudgetChartProps {
  data: any[];
  type: 'utilization' | 'comparison';
  title?: string;
  height?: number;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export const BudgetChart: React.FC<BudgetChartProps> = ({ data, type, title, height = 300 }) => {
  const renderTooltip = (props: any) => {
    if (props.active && props.payload && props.payload.length) {
      const data = props.payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {type === 'utilization' ? 'Amount' : 'Value'}: ${data.value.toLocaleString()}
          </p>
          {data.percentage && (
            <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (type === 'utilization') {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, payload }) => `${name}: ${payload?.percentage || 0}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={renderTooltip} />
          <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
          <Bar dataKey="spent" fill="#ef4444" name="Spent" />
          <Bar dataKey="remaining" fill="#10b981" name="Remaining" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
