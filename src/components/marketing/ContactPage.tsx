import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    instituteName: '',
    contactPerson: '',
    email: '',
    phone: '',
    numTeachers: '',
    numRooms: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real application, this would send data to a backend
    console.log('Form submitted:', formData);
  };

  const whyChooseItems = [
    {
      title: 'Customized system setup',
      description: 'for every institution'
    },
    {
      title: 'Secure private admin-only',
      description: 'access'
    },
    {
      title: 'Dedicated onboarding',
      description: '& training support'
    },
    {
      title: 'Automatic conflict',
      description: 'detection'
    },
    {
      title: 'Regular feature updates',
      description: '& enhancements'
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center py-20 px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#14B8A6]" />
          </div>
          <h2 className="text-3xl text-[#0F172A] mb-4">Request Received!</h2>
          <p className="text-xl text-[#0F172A] mb-8">
            Thank you for your interest in UniScheduling. Our team will review your request and contact you within 1-2 business days.
          </p>
          <div className="bg-[#F8FAFC] rounded-xl p-6 mb-8">
            <h3 className="text-lg text-[#0F172A] mb-4">What happens next?</h3>
            <ul className="text-left space-y-3 text-[#0F172A]">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#14B8A6] rounded-full mt-2 flex-shrink-0" />
                <span>Our team reviews your requirements</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#14B8A6] rounded-full mt-2 flex-shrink-0" />
                <span>We schedule a discovery call to understand your needs</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#14B8A6] rounded-full mt-2 flex-shrink-0" />
                <span>You receive a personalized demo and custom quote</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#14B8A6] rounded-full mt-2 flex-shrink-0" />
                <span>Upon approval, we set up your private admin system</span>
              </li>
            </ul>
          </div>
          <Link
            to="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-[#0F172A] mb-4">
            Request Access to UniScheduling
          </h1>
          <p className="text-xl text-[#0F172A] max-w-3xl mx-auto">
            Fill out the form below and our team will contact you to set up your custom scheduling system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl text-[#0F172A] mb-6">Institution Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="instituteName" className="block text-sm text-[#0F172A] mb-2">
                    Institute Name *
                  </label>
                  <input
                    type="text"
                    id="instituteName"
                    name="instituteName"
                    required
                    value={formData.instituteName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
                    placeholder="University of Technology"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactPerson" className="block text-sm text-[#0F172A] mb-2">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      id="contactPerson"
                      name="contactPerson"
                      required
                      value={formData.contactPerson}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
                      placeholder="Dr. Jane Smith"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm text-[#0F172A] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
                      placeholder="jane@university.edu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm text-[#0F172A] mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="numTeachers" className="block text-sm text-[#0F172A] mb-2">
                      Number of Teachers *
                    </label>
                    <select
                      id="numTeachers"
                      name="numTeachers"
                      required
                      value={formData.numTeachers}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select range</option>
                      <option value="1-20">1-20</option>
                      <option value="21-50">21-50</option>
                      <option value="51-100">51-100</option>
                      <option value="100+">100+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="numRooms" className="block text-sm text-[#0F172A] mb-2">
                    Number of Rooms *
                  </label>
                  <select
                    id="numRooms"
                    name="numRooms"
                    required
                    value={formData.numRooms}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select range</option>
                    <option value="1-10">1-10</option>
                    <option value="11-25">11-25</option>
                    <option value="26-50">26-50</option>
                    <option value="50+">50+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm text-[#0F172A] mb-2">
                    Additional Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none bg-white"
                    placeholder="Tell us about your scheduling needs, special requirements, or any questions you have..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Request My System
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Get in Touch Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl text-[#0F172A] mb-6">Get in Touch</h3>
              
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-[#14B8A6]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Email</div>
                    <div className="text-[#0F172A]">sales@unischeduling.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-[#14B8A6]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Phone</div>
                    <div className="text-[#0F172A]">+1 (800) UNI-SCHED</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-[#14B8A6]" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Office</div>
                    <div className="text-[#0F172A]">123 Education Lane<br />Tech City, TC 12345</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose UniScheduling Card - REDESIGNED */}
            <div className="bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white rounded-2xl p-8 shadow-xl shadow-blue-500/20">
              <h3 className="text-xl mb-6">Why Choose UniScheduling?</h3>
              <ul className="space-y-4">
                {whyChooseItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="block">{item.title}</span>
                      <span className="text-white/80 text-sm">{item.description}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}