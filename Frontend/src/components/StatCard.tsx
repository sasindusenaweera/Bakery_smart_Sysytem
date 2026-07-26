import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
  variant?: 'default' | 'highlight';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  variant = 'default'
}) => {
  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return <Minus className="h-4 w-4 text-gray-400" />;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return 'text-gray-500';
    if (trend > 0) return 'text-green-600';
    return 'text-red-600';
  };

  const formatTrend = () => {
    if (trend === undefined) return '';
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <div className={`px-6 py-3 ${variant === 'highlight' ? 'bg-[#FF6600]' : 'bg-[#00008B]'}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
            {title}
          </p>
          <Icon className="h-4 w-4 text-white/60" />
        </div>
      </div>
      <div className="p-6">
        <p className={`text-3xl font-bold ${variant === 'highlight' ? 'text-[#FF6600]' : 'text-gray-900'}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium ml-1">{formatTrend()}</span>
            <span className="text-xs text-gray-400 ml-1">vs last period</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
