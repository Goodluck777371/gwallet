
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, AlertCircle, CheckCircle, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const AccordionItem = ({ title, children, defaultOpen = false }: AccordionItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        className="flex justify-between items-center w-full py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        }`}
      >
        <div className="text-gray-600">{children}</div>
      </div>
    </div>
  );
};

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
            <h1 className="text-3xl font-bold">Help Center</h1>
            <p className="text-gray-500">Terms, Support, and Frequently Asked Questions</p>
          </div>

          <Tabs defaultValue="terms" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="terms" className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <section className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Terms of Service</h2>
                  <p className="mb-4">
                    Welcome to Gcoin Wallet. These Terms of Service govern your use of our service. By using Gcoin Wallet, you agree to these terms.
                  </p>
                  
                  <AccordionItem title="1. Acceptance of Terms">
                    <p>
                      By accessing or using the Gcoin Wallet service, website, or any applications made available by Gcoin Wallet, you agree to be bound by these terms. If you don't agree to these terms, you must not use our service.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="2. Description of Service">
                    <p>
                      Gcoin Wallet provides a digital wallet for managing Gcoins, a digital currency. The service allows you to send, receive, and store Gcoins. Features may be added, modified, or removed at any time.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="3. Account Registration">
                    <p>
                      To use certain features of the service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="4. Privacy">
                    <p>
                      Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. By using our service, you agree to our collection and use of information in accordance with our Privacy Policy.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="5. Security">
                    <p>
                      You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="6. User Conduct">
                    <p>
                      You agree not to use the service for any illegal purposes or in any manner that could damage, disable, overburden, or impair the service. You agree not to attempt to gain unauthorized access to any part of the service or any systems or networks connected to the service.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="7. Transactions">
                    <p>
                      All transactions made through Gcoin Wallet are final and cannot be reversed. You are solely responsible for verifying all transaction details before confirming a transaction. Gcoin Wallet is not responsible for any loss of funds due to incorrect transaction details.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="8. Fees">
                    <p>
                      Gcoin Wallet may charge fees for certain transactions. These fees will be clearly displayed before you confirm a transaction. We reserve the right to change our fee structure at any time.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="9. Modifications to Terms">
                    <p>
                      We reserve the right to modify these Terms at any time. We will notify users of significant changes to these Terms. Your continued use of the service after such modifications constitutes your acceptance of the modified Terms.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="10. Limitation of Liability">
                    <p>
                      To the maximum extent permitted by law, Gcoin Wallet shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
                    </p>
                  </AccordionItem>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <section className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                  <p className="mb-4">
                    Find answers to the most common questions about using Gcoin Wallet.
                  </p>
                  
                  <AccordionItem title="What is Gcoin?" defaultOpen>
                    <p>
                      Gcoin is a digital currency designed for simple, secure transactions. It can be used for transferring value between users, purchasing goods and services, and more.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="How do I create a Gcoin Wallet account?">
                    <p>
                      To create a Gcoin Wallet account, click on the "Register" button on the homepage. You'll need to provide your email address and create a password. Once registered, you'll have access to your own Gcoin wallet.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="Is my Gcoin Wallet secure?">
                    <p>
                      Yes, Gcoin Wallet employs industry-leading security measures to protect your account and funds. We use encryption for all sensitive data and implement strict security protocols. However, it's also important that you maintain good security practices, such as using a strong password and enabling two-factor authentication when available.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="How do I send Gcoins to someone?">
                    <p>
                      To send Gcoins:
                      <ol className="list-decimal pl-6 mt-2 space-y-1">
                        <li>Go to the "Send" page</li>
                        <li>Enter the recipient's wallet address or scan their QR code</li>
                        <li>Enter the amount you want to send</li>
                        <li>Review and confirm the transaction</li>
                      </ol>
                      The recipient will receive the Gcoins in their wallet shortly after.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="How do I receive Gcoins?">
                    <p>
                      To receive Gcoins, you need to share your wallet address with the sender. You can find your wallet address on the dashboard or by clicking "Receive" on your wallet card. You can share the address as text or as a QR code that the sender can scan.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="What are the fees for transactions?">
                    <p>
                      Gcoin Wallet charges a small fee for transactions to maintain the network. The exact fee amount is displayed before you confirm each transaction. Fees may vary depending on network conditions and transaction size.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="Can I buy or sell Gcoins?">
                    <p>
                      Yes, you can buy and sell Gcoins directly through the Gcoin Wallet app. Go to the "Buy/Sell" section to purchase Gcoins with your local currency or to sell your Gcoins for local currency.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="How long do transactions take?">
                    <p>
                      Most Gcoin transactions are processed within seconds. However, during times of high network activity, transactions may take longer to confirm.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="What if I forget my password?">
                    <p>
                      If you forget your password, you can reset it by clicking on the "Forgot Password" link on the login page. You'll receive an email with instructions to create a new password.
                    </p>
                  </AccordionItem>
                  
                  <AccordionItem title="Is there a mobile app?">
                    <p>
                      Yes, Gcoin Wallet is available as a mobile app for both iOS and Android devices. You can download it from the App Store or Google Play Store to manage your Gcoins on the go.
                    </p>
                  </AccordionItem>
                </section>
              </div>
            </TabsContent>
            
            <TabsContent value="support" className={`transition-all duration-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <section className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Support</h2>
                  <p className="mb-4">
                    Need help with your Gcoin Wallet? We're here to assist you.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 mt-8">
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                      <div className="flex items-center mb-4">
                        <MessageSquare className="h-6 w-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-medium">Live Chat Support</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Get immediate assistance from our support team via live chat. Our representatives are available to help you with any questions or issues.
                      </p>
                      <Button className="w-full" onClick={() => {
                        // This would open the chat widget
                        const chatElement = document.getElementById('livechat-toggle-button');
                        if (chatElement) {
                          chatElement.click();
                        }
                      }}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
                      </Button>
                    </div>
                    
                    <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                      <div className="flex items-center mb-4">
                        <HelpCircle className="h-6 w-6 text-green-600 mr-3" />
                        <h3 className="text-lg font-medium">Help Center</h3>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Browse our detailed guides and tutorials on how to use Gcoin Wallet effectively. Find answers to common questions and learn about all features.
                      </p>
                      <Button variant="outline" className="w-full">
                        <HelpCircle className="mr-2 h-4 w-4" /> View Knowledge Base
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">Contact Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="font-medium">Email Support:</p>
                          <p className="text-blue-600">support@gcoinwallet.com</p>
                        </div>
                        <div>
                          <p className="font-medium">Phone Support:</p>
                          <p>+1 (800) 123-4567 (Monday to Friday, 9 AM - 5 PM EST)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-100">
                      <div className="flex items-start">
                        <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-lg font-medium mb-2">Important Security Notice</h3>
                          <p className="text-gray-700">
                            Gcoin Wallet support will never ask for your password, private keys, or seed phrase. Be cautious of phishing attempts and only use official channels to seek support.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-medium mb-3">Common Support Topics</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <Link to="/faq#account" className="text-blue-600 hover:underline">Account setup and recovery</Link>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <Link to="/faq#transactions" className="text-blue-600 hover:underline">Transaction issues</Link>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <Link to="/faq#wallet" className="text-blue-600 hover:underline">Wallet security</Link>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <Link to="/faq#buysell" className="text-blue-600 hover:underline">Buying and selling Gcoins</Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Terms;
