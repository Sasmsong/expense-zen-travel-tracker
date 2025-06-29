
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SpendingChartProps {
  categoryTotals: { [key: string]: number };
}

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'
];

export const SpendingChart = ({ categoryTotals }: SpendingChartProps) => {
  const data = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
    percentage: 0 // Will be calculated by recharts
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: ((item.value / total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">${data.value.toFixed(2)}</p>
          <p className="text-gray-600">{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Chart Container - Fixed height and responsive */}
      <div className="w-full h-64 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dataWithPercentage}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {dataWithPercentage.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend - Properly contained */}
      <div className="w-full overflow-x-auto">
        <div className="space-y-2 min-w-full">
          {dataWithPercentage.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm px-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="truncate">{item.name}</span>
              </div>
              <div className="font-medium text-right flex-shrink-0 ml-2">
                ${item.value.toFixed(2)} ({item.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
