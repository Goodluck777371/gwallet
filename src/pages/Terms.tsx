
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";

const Terms = () => {
  const [activeTab, setActiveTab] = useState("terms");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-16">
        <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <Tabs defaultValue="terms" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className="space-y-6">
              <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
              
              <div className="prose max-w-none">
                <h2>1. Introduction</h2>
                <p>
                  Welcome to GCoin, a digital currency platform that allows users to buy, sell, and transfer digital currency. These Terms and Conditions govern your use of our website, mobile applications, and services.
                </p>
                
                <h2>2. Acceptance of Terms</h2>
                <p>
                  By accessing or using GCoin, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.
                </p>
                
                <h2>3. Eligibility</h2>
                <p>
                  You must be at least 18 years old to use GCoin. By using our services, you represent and warrant that you are 18 years of age or older and have the legal capacity to enter into these terms.
                </p>
                
                <h2>4. Account Registration</h2>
                <p>
                  To use GCoin, you must create an account. You agree to provide accurate and complete information during registration and to keep your account information updated.
                </p>
                
                <h2>5. Privacy Policy</h2>
                <p>
                  Your use of GCoin is also governed by our Privacy Policy, which describes how we collect, use, and share your information.
                </p>
                
                <h2>6. Transactions</h2>
                <p>
                  All transactions made through GCoin are subject to verification. We reserve the right to decline or delay any transaction if we suspect fraudulent activity or violation of our terms.
                </p>
                
                <h2>7. Fees</h2>
                <p>
                  GCoin charges fees for certain transactions. These fees are clearly displayed before you confirm any transaction.
                </p>
                
                <h2>8. Security</h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                </p>
                
                <h2>9. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your account at any time for any reason, including but not limited to violation of these terms.
                </p>
                
                <h2>10. Changes to Terms</h2>
                <p>
                  We may modify these Terms and Conditions at any time. If we make material changes, we will provide notice as appropriate. Your continued use of GCoin after such modifications constitutes your acceptance of the updated terms.
                </p>
                
                <h2>11. Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, GCoin shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.
                </p>
                
                <h2>12. Governing Law</h2>
                <p>
                  These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in which GCoin is registered.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-6">
              <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is GCoin?</AccordionTrigger>
                  <AccordionContent>
                    GCoin is a digital currency platform that allows users to buy, sell, and transfer digital currency easily and securely.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do I create a GCoin account?</AccordionTrigger>
                  <AccordionContent>
                    You can create a GCoin account by clicking on the "Register" button on our homepage and following the registration process. You'll need to provide some personal information and verify your email address.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>How do I buy GCoins?</AccordionTrigger>
                  <AccordionContent>
                    Once you've created an account, you can buy GCoins by navigating to the "Buy" section, selecting the amount you wish to purchase, and completing the payment process using your preferred payment method.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>What are the fees for transactions?</AccordionTrigger>
                  <AccordionContent>
                    GCoin charges a 3% fee for most transactions. This fee is automatically calculated and displayed before you confirm any transaction.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger>How do I transfer GCoins to another user?</AccordionTrigger>
                  <AccordionContent>
                    To transfer GCoins, navigate to the "Send" section, enter the recipient's wallet address and the amount you wish to send, then confirm the transaction. The recipient will receive the GCoins in their account instantly.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger>How do I sell my GCoins?</AccordionTrigger>
                  <AccordionContent>
                    To sell your GCoins, go to the "Sell" section, enter the amount you wish to sell, select your preferred payout method, and follow the instructions to complete the transaction.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-7">
                  <AccordionTrigger>Is my GCoin wallet secure?</AccordionTrigger>
                  <AccordionContent>
                    Yes, GCoin uses advanced security measures to protect your wallet and transactions. However, we also recommend that you take additional security precautions, such as using a strong, unique password and enabling two-factor authentication.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-8">
                  <AccordionTrigger>What should I do if I forget my password?</AccordionTrigger>
                  <AccordionContent>
                    If you forget your password, you can reset it by clicking on the "Forgot Password" link on the login page and following the instructions sent to your registered email address.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-9">
                  <AccordionTrigger>How do I contact GCoin support?</AccordionTrigger>
                  <AccordionContent>
                    You can contact GCoin support by using the live chat feature available on our platform, or by sending an email to support@gcoin.com. Our support team is available 24/7 to assist you.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-10">
                  <AccordionTrigger>Can I use GCoin on my mobile device?</AccordionTrigger>
                  <AccordionContent>
                    Yes, GCoin is fully responsive and works on all mobile devices. You can access it through your mobile browser or download our mobile app from the App Store or Google Play.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>
            
            <TabsContent value="support" className="space-y-6">
              <h1 className="text-3xl font-bold mb-6">Customer Support</h1>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-gray-600 mb-4">Our support team is available 24/7 to help you with any questions or concerns.</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="min-w-[24px] mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gcoin-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-gray-600">support@gcoin.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="min-w-[24px] mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gcoin-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">+1 (555) 123-4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="min-w-[24px] mr-3 mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gcoin-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Live Chat</p>
                        <p className="text-gray-600">Available 24/7 via the chat icon on the bottom right</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h2 className="text-xl font-semibold mb-4">Help Center</h2>
                  <p className="text-gray-600 mb-4">Explore our comprehensive resources to find answers to your questions.</p>
                  
                  <div className="space-y-4">
                    <div className="group">
                      <a href="#" className="block p-3 bg-white rounded border border-gray-100 hover:border-gcoin-blue/30 hover:bg-gcoin-blue/5 transition-all">
                        <h3 className="font-medium text-gcoin-blue group-hover:text-gcoin-blue/80">Getting Started Guide</h3>
                        <p className="text-sm text-gray-500">Learn the basics of using GCoin</p>
                      </a>
                    </div>
                    
                    <div className="group">
                      <a href="#" className="block p-3 bg-white rounded border border-gray-100 hover:border-gcoin-blue/30 hover:bg-gcoin-blue/5 transition-all">
                        <h3 className="font-medium text-gcoin-blue group-hover:text-gcoin-blue/80">Security Best Practices</h3>
                        <p className="text-sm text-gray-500">Tips to keep your account secure</p>
                      </a>
                    </div>
                    
                    <div className="group">
                      <a href="#" className="block p-3 bg-white rounded border border-gray-100 hover:border-gcoin-blue/30 hover:bg-gcoin-blue/5 transition-all">
                        <h3 className="font-medium text-gcoin-blue group-hover:text-gcoin-blue/80">Transaction Troubleshooting</h3>
                        <p className="text-sm text-gray-500">Solutions for common transaction issues</p>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Terms;
