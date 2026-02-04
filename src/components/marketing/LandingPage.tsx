import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  Building, 
  Filter,
  PlayCircle,
  ArrowRight,
  School,
  BookOpen,
  GraduationCap,
  Search,
  AlertTriangle,
  Briefcase,
  Code
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    { icon: Calendar, title: 'Day-wise Timetable', description: 'View classes clearly by day, room, and time.', benefit: 'Instant daily schedule visibility.' },
    { icon: Building, title: 'Multi-Room & Level Scheduling', description: 'Schedule overlapping classes across multiple rooms.', benefit: 'Supports overlapping rooms and levels.' },
    { icon: Users, title: 'Teacher Filters & Expertise', description: 'Filter by department, expertise, and active status.', benefit: 'Find teachers by skills and availability.' },
    { icon: Clock, title: 'Live Class Highlight & Conflicts', description: 'Highlight running classes and detect clashes instantly.', benefit: 'Detect clashes in real time.' },
    { icon: Search, title: 'Smart Gap Finder', description: 'Automatically finds free time slots between classes for rooms and levels.', benefit: 'Perfect for rescheduling and extra sessions.' },
    { icon: AlertTriangle, title: 'Conflict Detection System', description: 'Instantly detects clashes between rooms, teachers, and time slots.', benefit: 'Prevents double bookings in real time.' },
  ];

  const targetAudience = [
    { icon: GraduationCap, title: 'Universities', description: 'Large-scale scheduling for multiple departments', support: 'Multi-campus scheduling support' },
    { icon: School, title: 'Colleges', description: 'Efficient timetable management for growing institutions', support: 'Flexible timetable control' },
    { icon: BookOpen, title: 'Training Institutes', description: 'Professional course scheduling with flexibility', support: 'Batch-wise class management' },
    { icon: Briefcase, title: 'Private Education Providers', description: 'For private institutions managing multiple programs and batches', support: 'Program & batch scheduling' },
    { icon: Code, title: 'Technical & IT Academies', description: 'For bootcamps and skill-focused training centers', support: 'Intensive course scheduling' },
  ];

  const steps = [
    { 
      number: '01', 
      title: 'Send Your Details', 
      description: 'Tell us about your campus, rooms, and teachers.'
    },
    { 
      number: '02', 
      title: 'We Set Up Your System', 
      description: 'We configure everything for your institution.'
    },
    { 
      number: '03', 
      title: 'You Manage Daily Scheduling', 
      description: 'Build and manage timetables easily.'
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-primary-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6">
                Smart Daily Scheduling for Universities
              </h1>
              <p className="text-xl md:text-2xl text-gray-100 mb-3">
                Automate rooms, teachers, and class schedules in real time with zero conflicts.
              </p>
              <p className="text-lg text-gray-200 mb-8">
                Designed for universities, colleges, and training institutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-white text-[#0F2A44] rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Request a Demo
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/how-it-works"
                  className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-[#0F2A44] transition-colors inline-flex items-center justify-center gap-2"
                >
                  See How It Works
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 transform hover:scale-105 transition-transform duration-300">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                    <h3 className="text-[#0F2A44]">Monday, 10:00 AM - 12:00 PM</h3>
                    <span className="px-3 py-1 bg-[#1CB5A3] text-white text-sm rounded-full">Live</span>
                  </div>
                  
                  {/* Timetable Grid */}
                  <div className="space-y-2">
                    {/* Room 1.1 - LIVE Class */}
                    <div className="bg-[#1CB5A3] border-2 border-[#1CB5A3] rounded-lg p-3 text-white relative animate-pulse">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs opacity-90">Room 1.1 - CS Department</div>
                          <div className="text-sm mt-1">Advanced AI & ML</div>
                          <div className="text-xs opacity-90 mt-1">Prof. Sarah Johnson</div>
                        </div>
                        <span className="px-2 py-1 bg-white text-[#1CB5A3] text-xs rounded">LIVE</span>
                      </div>
                    </div>

                    {/* Room 2.1 - LIVE Class */}
                    <div className="bg-[#1CB5A3] border-2 border-[#1CB5A3] rounded-lg p-3 text-white animate-pulse">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs opacity-90">Room 2.1 - IT Department</div>
                          <div className="text-sm mt-1">Cloud Computing</div>
                          <div className="text-xs opacity-90 mt-1">Dr. Michael Chen</div>
                        </div>
                        <span className="px-2 py-1 bg-white text-[#1CB5A3] text-xs rounded">LIVE</span>
                      </div>
                    </div>

                    {/* Room 3.1 - Available */}
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs">Room 3.1 - Open Lab</div>
                          <div className="text-sm mt-1 italic">Available</div>
                        </div>
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">OPEN</span>
                      </div>
                    </div>

                    {/* Room 4.1 - Upcoming */}
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-3 text-gray-700">
                      <div>
                        <div className="text-xs text-gray-500">Room 4.1 - CS Department</div>
                        <div className="text-sm mt-1">Data Structures</div>
                        <div className="text-xs text-gray-500 mt-1">Next: 12:00 PM</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-[#0F2A44] mb-4">
              Key Features
            </h2>
            <p className="text-xl text-[#1F2933]">
              Everything you need for efficient class scheduling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 bg-white border border-[#E5E7EB] rounded-xl hover:shadow-xl hover:border-primary-blue transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-primary-blue rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl text-[#0F2A44] mb-2">{feature.title}</h3>
                  <p className="text-[#1F2933]">{feature.description}</p>
                  <p className="text-sm text-[#1F2933] mt-2">{feature.benefit}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Who Is This For */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-[#0F2A44] mb-4">
              Who Is This For?
            </h2>
            <p className="text-xl text-[#1F2933]">
              Designed for educational institutions of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-8">
            {targetAudience.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow text-center"
                >
                  <div className="w-16 h-16 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl text-[#0F2A44] mb-3">{item.title}</h3>
                  <p className="text-[#1F2933]">{item.description}</p>
                  <p className="text-sm text-[#1F2933] mt-2">{item.support}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl text-[#0F2A44] mb-4">
              How It Works
            </h2>
            <p className="text-xl text-[#1F2933]">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-blue rounded-full flex items-center justify-center mx-auto mb-6 text-3xl text-white">
                    {step.number}
                  </div>
                  <h3 className="text-2xl text-[#0F2A44] mb-4">{step.title}</h3>
                  <p className="text-[#1F2933]">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-border-light" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl text-[#0F2A44] mb-4">
              Watch How the System Works
            </h2>
            <p className="text-xl text-[#1F2933]">
              See UniScheduling in action with a quick demo
            </p>
          </div>

          {/* YouTube-style Thumbnail */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-video bg-gradient-to-br from-gray-800 to-gray-900 group cursor-pointer">
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                <PlayCircle className="w-12 h-12 text-primary-blue" />
              </div>
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-6 left-6 text-white z-10">
              <p className="text-lg">Watch 2-minute system walkthrough</p>
            </div>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-gray-500 mt-4">
            YouTube demo link will be connected later
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl mb-4">
            Ready to Transform Your Scheduling?
          </h2>
          <p className="text-lg text-gray-100 mb-8">
            Join institutions using UniScheduling to simplify academic operations.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#0F2A44] rounded-lg hover:bg-gray-100 transition-colors"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}