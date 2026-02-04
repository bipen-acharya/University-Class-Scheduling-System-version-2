import { 
  Calendar, 
  Building, 
  Users, 
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeaturesPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Daily Timetable',
      description: 'View class schedules by day with clear visual timelines.',
      bullets: [
        '8AM–8PM timeline',
        'Clear time-slot blocks',
        'Print & export ready',
      ]
    },
    {
      icon: Building,
      title: 'Multi-Room Scheduling',
      description: 'Schedule multiple rooms at the same time without clashes.',
      bullets: [
        'Level-based rooms',
        'Room availability tracking',
        'Capacity visibility',
      ]
    },
    {
      icon: Users,
      title: 'Teacher Profiles',
      description: 'Filter teachers by expertise, department, and availability.',
      bullets: [
        'Department-based filters',
        'Expertise tagging',
        'Active / inactive status',
      ]
    },
    {
      icon: Clock,
      title: 'Live Class Tracking',
      description: 'Instantly see which class is running right now.',
      bullets: [
        '"Now Running" status',
        'Real-time indicators',
        'Dashboard widget',
      ]
    },
  ];

  return (
    <div className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4">
            Powerful Features Built for Smart Scheduling
          </h1>
          <p className="text-xl text-[#1F2933] max-w-3xl mx-auto">
            Everything you need to manage rooms, teachers, and classes — without conflicts.
          </p>
        </div>

        {/* Features Grid - 2 rows, 4 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full"
              >
                {/* Icon */}
                <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-xl text-[#0F2A44] mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-[#1F2933] text-sm mb-4">
                  {feature.description}
                </p>

                {/* Bullet Points */}
                <ul className="space-y-2 mt-auto">
                  {feature.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-blue rounded-full mt-2 flex-shrink-0" />
                      <span className="text-[#1F2933] text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-10 rounded-3xl shadow-xl text-center text-white">
            <h2 className="text-3xl md:text-4xl mb-4">
              See Your Timetable in One Clean System
            </h2>
            <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
              Request a live demo and see how UniScheduling works for your institution.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-primary-blue rounded-lg hover:bg-gray-100 transition-colors"
            >
              Request a Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}