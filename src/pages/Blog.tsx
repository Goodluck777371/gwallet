
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// Mock blog posts
const blogPosts = [
  {
    id: 1,
    title: "Understanding Cryptocurrency: A Beginner's Guide",
    excerpt: "Cryptocurrency can be confusing for beginners. This guide breaks down the basics of digital currencies, blockchain technology, and what makes GCoin special.",
    date: "2023-09-15",
    author: "Sarah Johnson",
    readTime: "5 min read",
    category: "Education",
    image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2232&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "The Future of GCoin in Global Transactions",
    excerpt: "As GCoin continues to grow, we explore its potential impact on global transactions and how it's becoming a preferred digital currency for many users worldwide.",
    date: "2023-08-22",
    author: "Michael Chen",
    readTime: "8 min read",
    category: "Analysis",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2232&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Security Tips for Protecting Your Crypto Wallet",
    excerpt: "Your crypto wallet security is paramount. Learn essential tips to protect your digital assets from threats and ensure your investments remain safe.",
    date: "2023-07-10",
    author: "David Williams",
    readTime: "6 min read",
    category: "Security",
    image: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?q=80&w=2340&auto=format&fit=crop"
  },
  {
    id: 4,
    title: "GCoin Staking: Maximizing Your Earnings",
    excerpt: "Staking your GCoin can be a great way to earn passive income. This article explains the staking process and strategies to maximize your returns.",
    date: "2023-06-05",
    author: "Emma Rodriguez",
    readTime: "7 min read",
    category: "Investment",
    image: "https://images.unsplash.com/photo-1640833906651-6bd1af7aeea3?q=80&w=2232&auto=format&fit=crop"
  }
];

const Blog = () => {
  const { isAuthenticated } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header />
      <Sidebar />
      
      <main className="pt-20 pb-16 px-4 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Link to="/dashboard" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-4">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
            
            <h1 className={`text-3xl font-bold mb-2 text-indigo-800 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              GCoin Blog
            </h1>
            <p className={`text-gray-600 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
              Stay updated with the latest news, tips, and insights about GCoin
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogPosts.map((post, index) => (
              <Card key={post.id} className={`overflow-hidden border-none shadow-md transition-all duration-500 delay-${200 + (index * 100)} transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-xs text-indigo-600 mb-2">
                    <span className="px-2 py-1 bg-indigo-50 rounded-full">{post.category}</span>
                  </div>
                  <CardTitle className="text-lg hover:text-indigo-600 transition-colors">
                    <Link to={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-gray-600 text-sm mb-4">
                    {post.excerpt}
                  </p>
                </CardContent>
                <CardFooter className="flex items-center justify-between text-xs text-gray-500 pt-0">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className={`text-center transition-all duration-500 delay-700 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button variant="outline" className="px-6">
              Load More Articles
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blog;
