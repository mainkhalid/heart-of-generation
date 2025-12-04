import React from 'react'
import { Header } from '../components/shared/Header'
import ContactSection from '../components/ContactSection'

const ContactPage = () => {
  return (
   <>
    <Header 
      title="Contact Us"
      subtitle="We'd love to hear from you"
      backgroundImage="https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
      overlayOpacity="bg-opacity-50"
      textColor="text-white"
      accentColor="bg-green-500"
    />
    <ContactSection />
   </>
  )
}

export default ContactPage
