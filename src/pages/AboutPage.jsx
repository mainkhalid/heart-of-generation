import React from 'react';
import { Header } from '../components/shared/Header';
import { Users, Heart, Target, Award } from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { label: 'Years Active', value: '10+' },
    { label: 'Events Organized', value: '150+' },
    { label: 'Volunteers', value: '500+' },
    { label: 'Communities Served', value: '25+' }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-green-500" />,
      title: 'Compassion',
      description: 'We believe in showing kindness and empathy to all communities we serve.'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'Community',
      description: 'Together we create lasting impact through collaboration and shared purpose.'
    },
    {
      icon: <Target className="w-8 h-8 text-green-500" />,
      title: 'Impact',
      description: 'Every action we take is focused on creating meaningful, sustainable change.'
    },
    {
      icon: <Award className="w-8 h-8 text-green-500" />,
      title: 'Excellence',
      description: 'We strive for the highest standards in everything we do for our community.'
    }
  ];

  return (
    <>
      <Header
        title="About Us"
        subtitle="Making a difference, one step at a time"
        backgroundImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
        overlayOpacity="bg-opacity-50"
        textColor="text-white"
        accentColor="bg-green-500"
        height="h-96"
      />

      {/* Mission Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Our Mission</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            We are dedicated to creating positive change in our communities through meaningful action, 
            volunteer engagement, and sustainable programs. Our goal is to empower individuals and 
            strengthen communities by addressing critical needs and fostering lasting relationships.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-red-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Founded over a decade ago, our organization began with a simple idea: that every person 
              has the power to make a difference. What started as a small group of passionate volunteers 
              has grown into a thriving community of changemakers dedicated to serving those in need.
            </p>
            <p>
              Through the years, we've organized hundreds of events, mobilized thousands of volunteers, 
              and touched countless lives. From food drives to educational programs, environmental 
              initiatives to community building events, we've remained committed to our core mission 
              of creating positive, lasting impact.
            </p>
            <p>
              Today, we continue to evolve and expand our reach, always staying true to the values 
              that inspired our founding: compassion, community, and the unwavering belief that 
              together, we can build a better tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Us in Making a Difference
          </h2>
          <p className="text-lg text-white mb-8 opacity-90">
            Whether you want to volunteer, donate, or partner with us, there are many ways to get involved.
          </p>
          <button className="bg-white text-blue-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
            Get Involved
          </button>
        </div>
      </section>
    </>
  );
};

export default AboutPage;