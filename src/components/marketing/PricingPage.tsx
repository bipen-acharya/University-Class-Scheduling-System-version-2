import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Basic',
      subtitle: 'Best for small departments & trial use',
      monthlyPrice: 29,
      yearlyPrice: 279,
      features: [
        'Day-wise timetable',
        'Up to 10 Rooms',
        'Up to 10 Teachers',
        'Manual class scheduling',
        'Live class highlight',
        'Basic conflict detection',
        'Email support',
      ],
      buttonText: 'Get Started',
      buttonLink: '/contact',
      popular: false,
    },
    {
      name: 'Premium',
      subtitle: 'Best for Universities & Colleges',
      monthlyPrice: 79,
      yearlyPrice: 759,
      features: [
        'Everything in Basic',
        'Unlimited Rooms',
        'Unlimited Teachers',
        'Multi-room & multi-level scheduling',
        'Teacher expertise filtering',
        'Teacher active/inactive tracking',
        'Live class status tracking',
        'Class gap finder (room-based)',
        'Conflict checker (teacher + room)',
        'Reports & analytics',
        'Priority email + chat support',
      ],
      buttonText: 'Start Free Trial',
      buttonLink: '/contact',
      popular: true,
    },
    {
      name: 'Custom',
      subtitle: 'For large institutions & multi-campus setups',
      monthlyPrice: null,
      yearlyPrice: null,
      features: [
        'Everything in Premium',
        'Multi-campus management',
        'Role-based admin system',
        'Custom branding',
        'API access',
        'Dedicated account manager',
        'Staff training & onboarding',
        'SLA & 24/7 priority support',
      ],
      buttonText: 'Request Custom Quote',
      buttonLink: '/contact',
      popular: false,
    },
  ];

  return (
    <div className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl text-[#0F2A44] mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-[#1F2933] max-w-3xl mx-auto">
            Choose the plan that fits your institution and start scheduling smarter today
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span
            className={`text-lg transition-colors ${
              !isYearly ? 'text-[#0F2A44]' : 'text-gray-400'
            }`}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative w-16 h-8 bg-gray-200 rounded-full transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
            aria-label="Toggle billing period"
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-primary-blue rounded-full transition-transform duration-300 ${
                isYearly ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
          <span
            className={`text-lg transition-colors ${
              isYearly ? 'text-[#0F2A44]' : 'text-gray-400'
            }`}
          >
            Yearly
          </span>
          {isYearly && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full animate-fade-in">
              Save 20%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? 'bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white shadow-2xl scale-105 border-2 border-primary-blue'
                  : 'bg-white border border-gray-200 shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white text-primary-blue rounded-full shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Most Popular</span>
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3
                  className={`text-2xl mb-2 ${
                    plan.popular ? 'text-white' : 'text-[#0F2A44]'
                  }`}
                >
                  {plan.name}
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    plan.popular ? 'text-gray-100' : 'text-gray-600'
                  }`}
                >
                  {plan.subtitle}
                </p>

                {/* Pricing */}
                {plan.monthlyPrice ? (
                  <div>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl">
                        ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </span>
                      <span
                        className={`text-lg ${
                          plan.popular ? 'text-gray-100' : 'text-gray-600'
                        }`}
                      >
                        / {isYearly ? 'year' : 'month'}
                      </span>
                    </div>
                    {isYearly && (
                      <p
                        className={`text-sm mt-2 ${
                          plan.popular ? 'text-gray-200' : 'text-gray-500'
                        }`}
                      >
                        ${(plan.yearlyPrice / 12).toFixed(2)} per month
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl">Contact Us</div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        plan.popular ? 'text-white' : 'text-primary-blue'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.popular ? 'text-gray-100' : 'text-gray-700'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                to={plan.buttonLink}
                className={`block w-full py-4 px-6 rounded-lg text-center transition-all ${
                  plan.popular
                    ? 'bg-white text-primary-blue hover:bg-gray-100'
                    : 'bg-primary-blue text-white hover:bg-[#1E40AF]'
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="bg-[#F8FAFC] rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl text-[#0F2A44] mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[#1F2933] mb-8 max-w-2xl mx-auto">
            Choose a plan that fits your institution and start scheduling smarter today.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary-blue text-white rounded-lg hover:bg-[#1E40AF] transition-colors"
          >
            Request Your Custom Quote
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
