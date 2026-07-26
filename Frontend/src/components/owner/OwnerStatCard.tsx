import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface OwnerStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success';
}

export const OwnerStatCard: React.FC<OwnerStatCardProps> = ({
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

  const getHeaderBg = () => {
    switch (variant) {
      case 'warning': return 'bg-orange-500';
      case 'success': return 'bg-green-600';
      default: return 'bg-[#00008B]';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'warning': return 'text-orange-600';
      case 'success': return 'text-green-600';
      default: return 'text-gray-900';
    }
  };

  const formatTrend = () => {
    if (trend === undefined) return '';
    const sign = trend >= 0 ? '+' : '';
    return `${sign}${trend.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className={`px-6 py-3 ${getHeaderBg()}`}>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">
            {title}
          </p>
          <Icon className="h-4 w-4 text-white/60" />
        </div>
      </div>
      <div className="p-6">
        <p className={`text-3xl font-bold ${getValueColor()}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend !== undefined && (
          <div className={`flex items-center mt-2 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium ml-1">{formatTrend()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerStatCard;
