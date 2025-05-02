
import { useState, useEffect } from "react";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Terms = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Legal & Support
            </h1>
            <p className={`text-gray-500 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Terms, conditions, and helpful information
            </p>
          </div>
          
          <div className={`bg-white rounded-xl shadow-sm transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Tabs defaultValue="terms" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="terms" className="p-6">
                <div className="prose max-w-none">
                  <h2>Terms and Conditions</h2>
                  <p>Last updated: May 2, 2025</p>
                  
                  <h3>1. Introduction</h3>
                  <p>These terms and conditions outline the rules and regulations for the use of GCoin's website and services. By accessing this website and using our services, we assume you accept these terms and conditions in full. Do not continue to use GCoin's website and services if you do not accept all of the terms and conditions stated on this page.</p>
                  
                  <h3>2. Definitions</h3>
                  <p>The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements: "Client", "You" and "Your" refers to you, the person accessing this website and accepting the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to GCoin. "Party", "Parties", or "Us", refers to both the Client and ourselves, or either the Client or ourselves.</p>
                  
                  <h3>3. Account Registration and Security</h3>
                  <p>To use certain features of the Service, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your account and password. You agree not to disclose your password to any third party and to take sole responsibility for any activities or actions under your account, whether or not you have authorized such activities or actions.</p>
                  
                  <h3>4. GCoin Services</h3>
                  <p>GCoin provides a digital currency platform allowing users to send and receive GCoins according to our service policies. The company reserves the right to modify, suspend, or discontinue any aspect of the service at any time.</p>
                  
                  <h3>5. Transaction Fees</h3>
                  <p>GCoin charges a percentage-based fee for transactions processed through our platform. These fees may change from time to time, with notice provided to users through our platform.</p>
                  
                  <h3>6. Limitations of Liability</h3>
                  <p>To the maximum extent permitted by applicable law, GCoin shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.</p>
                  
                  <h3>7. Changes to Terms</h3>
                  <p>We reserve the right to modify these terms at any time. If we make changes, we will provide notice of such changes, such as by sending an email, providing notice through the Services, or updating the "Last Updated" date at the beginning of these Terms.</p>
                  
                  <h3>8. Contact Information</h3>
                  <p>Questions about the Terms of Service should be sent to us at support@gcoin.com.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="faq" className="p-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">What is GCoin?</h3>
                      <p className="text-gray-700">GCoin is a digital currency platform that allows users to send and receive digital coins quickly and securely. Our platform provides an easy-to-use interface for managing your digital assets.</p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">How do I create a GCoin account?</h3>
                      <p className="text-gray-700">You can create a GCoin account by clicking on the "Register" button on our homepage. You'll need to provide an email address and create a password. We also offer Google sign-in for faster registration.</p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">Are there any fees for using GCoin?</h3>
                      <p className="text-gray-700">Yes, GCoin charges a small fee for transactions. The fee is typically 3% of the transaction amount, but may vary depending on the size of the transaction. Large transactions may qualify for reduced fees.</p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">How do I send GCoins to someone?</h3>
                      <p className="text-gray-700">To send GCoins, navigate to the "Send" page from your dashboard. Enter the recipient's wallet address and the amount you wish to send. Review the transaction details, including fees, and confirm to complete the transfer.</p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">Is there a daily limit on transactions?</h3>
                      <p className="text-gray-700">Yes, for security purposes, there is a daily transaction limit of 1 million GCoins. If you need to transfer larger amounts, please contact our support team for assistance.</p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">How can I view my transaction history?</h3>
                      <p className="text-gray-700">Your transaction history is available on the "Transactions" page. This page displays all your past transactions, including amounts, recipients, dates, and transaction statuses.</p>
                    </div>
                    
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-lg font-semibold mb-2">Is my GCoin wallet secure?</h3>
                      <p className="text-gray-700">Yes, we implement industry-standard security measures to protect your wallet. This includes encryption, secure servers, and regular security audits. We also recommend enabling two-factor authentication for added security.</p>
                    </div>
                    
                    <div className="pb-4">
                      <h3 className="text-lg font-semibold mb-2">How do I contact GCoin support?</h3>
                      <p className="text-gray-700">You can contact our support team through the live chat feature available on every page of our website. Alternatively, you can email us at support@gcoin.com or visit the Support tab in this section.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="support" className="p-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Support Center</h2>
                  
                  <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3 mb-6">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-blue-800">Live Chat Support</h3>
                      <p className="text-sm text-blue-700 mt-1">Our support team is available to chat with you directly. Click the chat icon at the bottom right of this page.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Email Support</h3>
                      <p className="text-gray-700 mb-4">Send us an email and we'll get back to you within 24 hours.</p>
                      <a href="mailto:support@gcoin.com" className="text-gcoin-blue hover:underline font-medium">support@gcoin.com</a>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-3">Help Center</h3>
                      <p className="text-gray-700 mb-4">Browse our knowledge base for tutorials and guides.</p>
                      <a href="#" className="text-gcoin-blue hover:underline font-medium">Visit Help Center →</a>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6 mt-8">
                    <h3 className="text-lg font-semibold mb-3">Common Support Topics</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium mb-1">Account Recovery</h4>
                        <p className="text-sm text-gray-600">Reset password and restore access</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium mb-1">Transaction Issues</h4>
                        <p className="text-sm text-gray-600">Help with pending or failed transfers</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium mb-1">Security Concerns</h4>
                        <p className="text-sm text-gray-600">Account protection and authentication</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium mb-1">Wallet Management</h4>
                        <p className="text-sm text-gray-600">Adding funds and managing balance</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium mb-1">Fee Structure</h4>
                        <p className="text-sm text-gray-600">Understanding transaction costs</p>
                      </a>
                      
                      <a href="#" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <h4 className="font-medium mb-1">App Features</h4>
                        <p className="text-sm text-gray-600">How to use GCoin effectively</p>
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
