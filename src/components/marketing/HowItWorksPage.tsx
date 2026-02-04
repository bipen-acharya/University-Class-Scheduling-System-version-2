import { 
  UserPlus, 
  BookOpen, 
  Calendar, 
  Building,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HowItWorksPage() {
  const steps = [
    {
      icon: UserPlus,
      number: '1',
      title: 'Share Your Institution Details',
      description: 'Provide your university information so we can configure the system perfectly for you.',
      details: [
        'Campus & department information',
        'Number of rooms & teachers',
        'Course structure & levels',
        'Scheduling preferences'
      ],
      image: 'teacher-form'
    },
    {
      icon: BookOpen,
      number: '2',
      title: 'We Configure Everything for You',
      description: 'Our team sets up your scheduling system so you can go live without technical effort.',
      details: [
        'Custom platform setup',
        'Secure data import',
        'Room & department structuring',
        'Admin access configuration'
      ],
      image: 'subjects-rooms'
    },
    {
      icon: Calendar,
      number: '3',
      title: 'Manage Your Daily Scheduling',
      description: 'Easily create and control schedules with real-time visibility and automatic conflict detection.',
      details: [
        'Day-wise timetable creation',
        'Teacher & room assignments',
        'Automatic conflict prevention',
        'Live "Now Running" class indicators'
      ],
      image: 'timetable-builder'
    }
  ];

  const features = [
    {
      icon: Building,
      title: 'Multiple Rooms Per Time Slot',
      description: 'Run multiple classes at the same time across different rooms without clashes.'
    },
    {
      icon: Clock,
      title: 'Real-Time Updates',
      description: 'Instant live updates showing which class is currently running.'
    },
    {
      icon: CheckCircle,
      title: 'Smart Validation',
      description: 'Automatic detection of room and teacher scheduling conflicts before they occur.'
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4">
            How UniScheduling Works
          </h1>
          <p className="text-xl text-[#1F2933] max-w-3xl mx-auto">
            A simple 3-step process to launch and manage your university scheduling system.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-16 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <div
                key={index}
                className={`flex flex-col ${
                  isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-10 items-center`}
              >
                {/* Content */}
                <div className="w-full lg:w-1/2">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-14 h-14 bg-primary-blue rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
                      {step.number}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl text-[#0F2A44] mb-2">
                        {step.title}
                      </h2>
                      <p className="text-lg text-[#1F2933]">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-3 ml-1">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 bg-primary-blue rounded-full mt-2 flex-shrink-0" />
                        <span className="text-[#1F2933]">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Visual */}
                <div className="w-full lg:w-1/2">
                  <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E5E7EB] shadow-lg">
                    <div className="bg-white rounded-xl p-5 border border-gray-200">
                      {/* Mockup illustration based on step */}
                      {step.image === 'teacher-form' && (
                        <div className="space-y-3">
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="h-10 bg-gray-100 rounded"></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-10 bg-gray-100 rounded"></div>
                            <div className="h-10 bg-gray-100 rounded"></div>
                          </div>
                          <div className="h-10 bg-primary-blue rounded flex items-center justify-center text-white">
                            Save Teacher
                          </div>
                        </div>
                      )}
                      {step.image === 'subjects-rooms' && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500 mb-3">Subjects</div>
                            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-sm">CS-101</div>
                            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-sm">AI-202</div>
                            <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-sm">CY-303</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-sm text-gray-500 mb-3">Rooms</div>
                            <div className="bg-purple-50 border border-purple-200 p-2.5 rounded text-sm">Room 1.1</div>
                            <div className="bg-purple-50 border border-purple-200 p-2.5 rounded text-sm">Room 2.1</div>
                            <div className="bg-purple-50 border border-purple-200 p-2.5 rounded text-sm">Room 11.1</div>
                          </div>
                        </div>
                      )}
                      {step.image === 'timetable-builder' && (
                        <div>
                          <div className="flex gap-2 mb-4">
                            <div className="flex-1 h-10 bg-primary-blue rounded text-white flex items-center justify-center hover:bg-[#1E40AF] transition-colors cursor-pointer">
                              Monday
                            </div>
                            <div className="flex-1 h-10 bg-gray-100 rounded text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                              Jan 6
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div key={i} className="h-12 bg-blue-50 border border-primary-blue rounded text-primary-blue flex items-center justify-center text-sm hover:bg-primary-blue hover:text-white transition-colors cursor-pointer">
                                Class {i}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Key Capabilities Section */}
        <div className="max-w-5xl mx-auto mb-16">
          <h2 className="text-3xl text-[#0F2A44] text-center mb-10">
            Key Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-primary-blue rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg text-[#0F2A44] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#1F2933] text-sm">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] p-10 rounded-3xl shadow-xl text-center text-white">
            <h2 className="text-3xl md:text-4xl mb-4">
              Ready to Streamline Your Scheduling?
            </h2>
            <p className="text-lg text-gray-100 mb-8">
              See UniScheduling in action with a personalized demo.
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