'use client';

import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';

interface ChartData {
  [key: string]: any;
}

interface AnalyticsChartProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'radar' | 'treemap';
  data: ChartData[];
  width?: number | string;
  height?: number;
  dataKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  lines?: Array<{ key: string; color: string; name: string }>;
  bars?: Array<{ key: string; color: string; name: string }>;
  areas?: Array<{ key: string; color: string; name: string }>;
  pieData?: Array<{ key: string; color: string }>;
  colors?: string[];
  title?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  strokeWidth?: number;
  fillOpacity?: number;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  data,
  width = '100%',
  height = 300,
  dataKey = 'value',
  xAxisKey = 'name',
  yAxisKey = 'value',
  lines,
  bars,
  areas,
  pieData,
  colors = COLORS,
  title,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  strokeWidth = 2,
  fillOpacity = 0.6,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
            )}
            {showLegend && <Legend />}
            {lines?.map((line, index) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                stroke={line.color || colors[index % colors.length]}
                strokeWidth={strokeWidth}
                name={line.name}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
            )}
            {showLegend && <Legend />}
            {bars?.map((bar, index) => (
              <Bar
                key={bar.key}
                dataKey={bar.key}
                fill={bar.color || colors[index % colors.length]}
                name={bar.name}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={Math.min(height, Number(width)) / 3}
              fill="#8884d8"
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={pieData?.[index]?.color || colors[index % colors.length]} 
                />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
            )}
            {showLegend && <Legend />}
          </PieChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />}
            <XAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
            )}
            {showLegend && <Legend />}
            {areas?.map((area, index) => (
              <Area
                key={area.key}
                type="monotone"
                dataKey={area.key}
                stroke={area.color || colors[index % colors.length]}
                fill={area.color || colors[index % colors.length]}
                fillOpacity={fillOpacity}
                strokeWidth={strokeWidth}
                name={area.name}
              />
            ))}
          </AreaChart>
        );

      case 'radar':
        return (
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey={xAxisKey} 
              stroke="#6b7280"
              fontSize={12}
            />
            <PolarRadiusAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            {showTooltip && (
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}
              />
            )}
            {showLegend && <Legend />}
            {lines?.map((line, index) => (
              <Radar
                key={line.key}
                name={line.name}
                dataKey={line.key}
                stroke={line.color || colors[index % colors.length]}
                fill={line.color || colors[index % colors.length]}
                fillOpacity={fillOpacity}
                strokeWidth={strokeWidth}
              />
            ))}
          </RadarChart>
        );

      case 'treemap':
        return (
          <Treemap
            data={data}
            dataKey={dataKey}
            aspectRatio={4 / 3}
            stroke="#fff"
            fill={colors[0]}
            content={({ x, y, width: treemapWidth, height: treemapHeight, name: treemapName, value: treemapValue }) => (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={treemapWidth}
                  height={treemapHeight}
                  style={{
                    fill: colors[Math.floor(Math.random() * colors.length)],
                    stroke: '#fff',
                    strokeWidth: 2,
                    strokeOpacity: 1,
                    fillOpacity: 0.8,
                  }}
                />
                {treemapWidth && treemapHeight && treemapWidth > 50 && treemapHeight > 30 && (
                  <>
                    <text
                      x={x + treemapWidth / 2}
                      y={y + treemapHeight / 2 - 8}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {treemapName}
                    </text>
                    <text
                      x={x + treemapWidth / 2}
                      y={y + treemapHeight / 2 + 8}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={10}
                    >
                      {treemapValue}
                    </text>
                  </>
                )}
              </g>
            )}
          />
        );

      default:
        return <div>Unsupported chart type</div>;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex justify-center" style={{ width, height }}>
        <ResponsiveContainer>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChart;
