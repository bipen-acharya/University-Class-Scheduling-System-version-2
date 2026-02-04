import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: "blue" | "teal" | "yellow" | "red" | "purple";
  trend?: string;
}

const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  teal: "bg-teal-50 text-[#0AA6A6]",
  yellow: "bg-yellow-50 text-yellow-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
};

export function KPICard({ title, value, icon: Icon, color, trend }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-gray-900 mt-2">{value}</p>
          {trend && <p className="text-gray-500 text-sm mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
