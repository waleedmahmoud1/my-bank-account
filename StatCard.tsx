import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, color = "blue" }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {trend && (
          <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
            {trend}
          </p>
        )}
      </div>
      <div className={`p-4 rounded-full bg-${color}-50 text-${color}-600`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
