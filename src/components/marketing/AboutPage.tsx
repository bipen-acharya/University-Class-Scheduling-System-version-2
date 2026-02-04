import { 
  Target, 
  Shield, 
  Users, 
  Zap, 
  CheckCircle, 
  GraduationCap,
  School,
  BookOpen,
  Layout,
  Lock,
  Settings
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const differentiators = [
    {
      icon: Target,
      title: 'Purpose-Built for Universities',
      description: 'Designed specifically for higher education scheduling — not repurposed generic software.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Private admin-only access with institutional data isolation.'
    },
    {
      icon: Users,
      title: 'Fully Customizable',
      description: 'Branding, departments, roles, and workflows tailored to each institution.'
    },
    {
      icon: Zap,
      title: 'Modern Technology',
      description: 'Built using fast, scalable, cloud-ready web architecture.'
    }
  ];

  const customizationFeatures = [
    'Private cloud deployment per institution',
    'Custom department and level grouping',
    'Role-based admin and staff access',
    'Custom branding (logo, colors, campus name)',
    'Multi-campus support',
    'Academic year and trimester control',
    'Holiday and exam scheduling',
    'Manual + automated timetable control',
    'Printable and exportable timetables'
  ];

  const targetAudience = [
    {
      icon: GraduationCap,
      title: 'Universities',
      items: [
        'Large institutions with complex departments',
        'Multiple rooms, multiple levels',
        'High class overlap management'
      ]
    },
    {
      icon: School,
      title: 'Colleges',
      items: [
        'Growing educational campuses',
        'Structured class management',
        'Clean visual timetables'
      ]
    },
    {
      icon: BookOpen,
      title: 'Training Institutes',
      items: [
        'Skill-based institutes',
        'Weekend & flexible scheduling',
        'Short-term course management'
      ]
    }
  ];

  const includedFeaturesLeft = [
    'Day-wise timetable building',
    'Live running class highlights',
    'Department & level organization',
    'Conflict prevention system',
    'Responsive design'
  ];

  const includedFeaturesRight = [
    'Multi-room scheduling',
    'Advanced teacher management',
    'Weekend scheduling',
    'Export & print reports',
    'Custom branding'
  ];

  const adminFeatures = [
    {
      icon: Layout,
      title: 'Intuitive Interface',
      description: 'Drag and drop scheduling'
    },
    {
      icon: Lock,
      title: 'Full Administrative Control',
      description: 'No student access'
    },
    {
      icon: Settings,
      title: 'Centralized Dashboard',
      description: 'All scheduling in one place'
    }
  ];

  return (
    <div className="py-16 bg-[#F7F9FC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4">
            About UniScheduling
          </h1>
          <p className="text-xl text-[#1F2933] max-w-3xl mx-auto mb-3">
            Smart University Class Scheduling System — built to simplify academic operations with real-time scheduling, automation, and zero conflicts.
          </p>
          <p className="text-lg text-[#1F2933] max-w-2xl mx-auto">
            Trusted by institutions to manage rooms, teachers, and classes with clarity and control.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white rounded-2xl p-8 shadow-lg text-center">
            <h2 className="text-3xl mb-4">Our Mission</h2>
            <p className="text-lg text-gray-100 leading-relaxed">
              Our mission is to eliminate the complexity of manual scheduling by providing universities with a powerful, visual, and conflict-free scheduling platform. UniScheduling helps institutions save time, reduce errors, and gain full control over academic operations.
            </p>
          </div>
        </div>

        {/* What Makes UniScheduling Different */}
        <div className="mb-12">
          <h2 className="text-3xl text-[#0F2A44] text-center mb-8">
            What Makes UniScheduling Different
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg text-[#0F2A44] mb-3">{item.title}</h3>
                  <p className="text-[#1F2933] text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customizable Solution & Who Uses UniScheduling */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* A Customizable Solution - EXPANDED */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl text-[#0F2A44] mb-3">
              A Fully Customizable Solution
            </h2>
            <p className="text-[#1F2933] mb-6">
              Unlike generic scheduling tools, UniScheduling is deployed privately for each institution and configured to match real operational needs.
            </p>
            <ul className="space-y-3">
              {customizationFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#1CB5A3] flex-shrink-0 mt-0.5" />
                  <span className="text-[#1F2933] text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Who Uses UniScheduling - More Informative */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
            <h2 className="text-2xl text-[#0F2A44] mb-6">
              Who Uses UniScheduling?
            </h2>
            <div className="space-y-5">
              {targetAudience.map((audience, index) => {
                const Icon = audience.icon;
                return (
                  <div key={index} className="flex gap-4">
                    <div className="w-12 h-12 bg-primary-blue rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg text-[#0F2A44] mb-2">{audience.title}</h3>
                      <ul className="space-y-1">
                        {audience.items.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-[#1CB5A3] rounded-full mt-2 flex-shrink-0" />
                            <span className="text-[#1F2933] text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* What's Included - 2 Column Layout */}
        <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 mb-12">
          <h2 className="text-3xl text-[#0F2A44] text-center mb-8">
            What's Included
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-4xl mx-auto">
            {/* Left Column */}
            <div className="space-y-3">
              {includedFeaturesLeft.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1CB5A3] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-[#1F2933]">{feature}</span>
                </div>
              ))}
            </div>
            {/* Right Column */}
            <div className="space-y-3">
              {includedFeaturesRight.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1CB5A3] rounded-full mt-2 flex-shrink-0" />
                  <span className="text-[#1F2933]">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Built for Administrators - 3 Feature Blocks */}
        <div className="mb-12">
          <h2 className="text-3xl text-[#0F2A44] text-center mb-8">
            Built for Administrators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-[#1CB5A3] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg text-[#0F2A44] mb-2">{feature.title}</h3>
                  <p className="text-[#1F2933] text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-10 rounded-3xl shadow-xl text-center text-white">
            <h2 className="text-3xl md:text-4xl mb-4">
              Ready to Modernize Your University Scheduling?
            </h2>
            <p className="text-lg text-gray-100 mb-8">
              Discover how UniScheduling can transform your academic operations with a personalized demo.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-4 bg-white text-primary-blue rounded-lg hover:bg-gray-100 transition-colors"
            >
              Request a Personalized Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}