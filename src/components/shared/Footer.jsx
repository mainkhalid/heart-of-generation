import React from 'react';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function CharityFooter() {
  const settings = useQuery(api.settings.get, { type: "general" });

  const siteName = settings?.siteName || 'chaaritable foundation';
  const contactEmail = settings?.contactEmail || 'office@template.com';
  const contactPhone = settings?.contactPhone || '+45 677 8993000 223';

  const quickLinks = [
    { name: 'Home', path: '/user' },
    { name: 'About', path: '/user/about' },
    { name: 'Events', path: '/user/events' },
    { name: 'Gallery', path: '/user/gallery' },
    { name: 'Contact', path: '/user/contact' }
  ];

  return (
    <footer className="bg-gray-800 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <a href="/user" className="inline-block mb-4">
              <h2 className="text-2xl font-bold text-white">
                {siteName.split(' ')[0]} <span className="text-red-500">{siteName.split(' ').slice(1).join(' ')}</span>
              </h2>
            </a>
            <p className="text-gray-400 text-sm">
              Making a difference in our communities through meaningful action and volunteer engagement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.path}
                    className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="text-red-500" size={16} />
                <span className="text-gray-400 text-sm">{contactPhone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-red-500" size={16} />
                <span className="text-gray-400 text-sm">{contactEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="text-red-500 mt-0.5" size={16} />
                <span className="text-gray-400 text-sm">
                  Nairobi, Kenya
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2025 {siteName}. All rights reserved.
            </p>
            
            {/* Support Developer */}
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Made with</span>
              <Heart className="text-red-500 fill-red-500" size={16} />
              <span className="text-gray-500 text-sm">by</span>
              <button 
                onClick={() => window.open('https://github.com/mainkhalid', '_blank')}
                className="text-red-500 hover:text-red-400 font-semibold text-sm transition-colors"
              >
                Khalid
              </button>
              <span className="text-gray-600 mx-2">•</span>
              <button 
                onClick={() => window.open('https://ko-fi.com/khalid', '_blank')}
                className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <span>Support</span>
                <Heart size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}