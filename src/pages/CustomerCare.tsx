
import { useState } from "react";
import { ArrowLeft, Mail, Phone, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const CustomerCare = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: "We've received your message and will respond shortly.",
      });
      setName("");
      setEmail("");
      setMessage("");
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className="text-3xl font-bold mb-2">
              Customer Care
            </h1>
            <p className="text-gray-500">
              We're here to help! Contact our support team through any of these channels.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className="bg-blue-50 p-3 rounded-full mb-4">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="font-medium mb-2">Email Support</h3>
              <p className="text-gray-500 mb-4 text-sm">Get help via email</p>
              <a 
                href="mailto:support@gwallet.app" 
                className="text-blue-600 hover:underline font-medium"
              >
                support@gwallet.app
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className="bg-green-50 p-3 rounded-full mb-4">
                <MessageSquare className="h-6 w-6 text-green-500" />
              </div>
              <h3 className="font-medium mb-2">WhatsApp Support</h3>
              <p className="text-gray-500 mb-4 text-sm">Chat with us directly</p>
              <a 
                href="https://wa.me/1234567890" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:underline font-medium"
              >
                +1 (234) 567-890
              </a>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
              <div className="bg-purple-50 p-3 rounded-full mb-4">
                <Phone className="h-6 w-6 text-purple-500" />
              </div>
              <h3 className="font-medium mb-2">Phone Support</h3>
              <p className="text-gray-500 mb-4 text-sm">Call our helpline</p>
              <a 
                href="tel:+12345678901" 
                className="text-purple-600 hover:underline font-medium"
              >
                +1 (234) 567-8901
              </a>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Message
                </label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="h-32"
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
          
          <div className="mt-8 bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-2">Support Hours</h2>
            <p className="text-gray-600 mb-4">Our customer support team is available during the following hours:</p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Monday - Friday:</span>
                <span>9:00 AM - 8:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Saturday:</span>
                <span>10:00 AM - 6:00 PM EST</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sunday:</span>
                <span>Closed</span>
              </div>
            </div>
            
            <p className="mt-4 text-sm text-gray-500">
              For urgent matters outside of business hours, please email us at{" "}
              <a href="mailto:urgent@gwallet.app" className="text-blue-600 hover:underline">
                urgent@gwallet.app
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerCare;
