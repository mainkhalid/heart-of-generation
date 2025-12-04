import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon } from 'lucide-react';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const NAV_LINKS = [
  { to: '/user', label: 'Home' },
  { to: '/user/about', label: 'About Us' },
  { to: '/user/events', label: 'Events' },
  { to: '/user/gallery', label: 'Gallery' },
  { to: '/user/donate', label: 'Donate', highlight: true },
  { to: '/user/contact', label: 'Contact' },
];

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Fetch settings from Convex
  const settings = useQuery(api.settings.get, { type: "general" });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    
    const handleClickOutside = (e) => {
      if (!e.target.closest('header')) {
        setMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [mobileMenuOpen]);

  // Default values while loading
  const siteName = settings?.siteName || 'Imani Foundation';
  const contactEmail = settings?.contactEmail || 'contact@imanifoundation.gmail.com';
  const contactPhone = settings?.contactPhone || '+254 377 120 091';

  return (
    <>
      {/* Top Bar */}
      <div className="bg-red-600 text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span>MAIL: {contactEmail}</span>
            <span>PHONE: {contactPhone}</span>
          </div>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="bg-slate-800 hover:bg-slate-900 px-6 py-1 rounded transition-colors">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      {/* Main Navbar */}
      <header className={`bg-white shadow-sm sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/user" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <span className="text-2xl font-bold text-slate-800">
                {siteName.split(' ')[0]} <span className="text-red-600">{siteName.split(' ').slice(1).join(' ')}</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  highlight={link.highlight}
                  isActive={location.pathname === link.to}
                >
                  {link.label}
                </NavLink>
              ))}

              {/* Clerk User Button */}
              <SignedIn>
                <div className="ml-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-slate-800 p-2 rounded-md hover:bg-slate-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon /> : <MenuIcon />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pb-4 border-t border-slate-200">
              {NAV_LINKS.map((link) => (
                <MobileNavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  highlight={link.highlight}
                  isActive={location.pathname === link.to}
                >
                  {link.label}
                </MobileNavLink>
              ))}

              {/* Clerk section for mobile */}
              <SignedIn>
                <div className="px-4 py-3 border-t border-slate-200 mt-2">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

// Reusable NavLink Components
const NavLink = ({ to, children, highlight, isActive }) => (
  <Link
    to={to}
    className={`${
      highlight 
        ? 'bg-black hover:bg-slate-900 px-6 py-2 rounded text-white font-bold transition-colors'
        : isActive
          ? 'text-red-600 font-bold border-b-3 border-red-600 pb-1'
          : 'text-slate-700 hover:text-red-600 font-bold transition-colors'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, onClick, highlight, isActive }) => (
  <Link
    to={to}
    className={`block py-3 px-4 ${
      highlight 
        ? 'bg-slate-800 text-white font-medium hover:bg-slate-900'
        : isActive
          ? 'bg-orange-50 text-red-600 border-l-4 border-red-600 font-medium'
          : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'
    } transition-colors duration-200`}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
  >
    {children}
  </Link>
);