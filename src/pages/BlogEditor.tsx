
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Image, 
  Link as LinkIcon, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const BlogEditor = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Education");
  const [author, setAuthor] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    // Check if admin is already logged in
    const adminAuth = localStorage.getItem("gcoin-admin-auth");
    if (adminAuth === "true") {
      setIsAdminAuthenticated(true);
    } else {
      navigate("/admin");
    }

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSave = () => {
    if (!title || !content || !excerpt || !author) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, we would save to a database
    // For now, we'll just show a success message
    toast({
      title: "Blog post saved",
      description: "Your blog post has been saved successfully.",
    });

    // Optionally navigate back to the admin dashboard or blog list
    setTimeout(() => {
      navigate("/admin");
    }, 1500);
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (!isAuthenticated || !isAdminAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <Header />
      <Sidebar />
      
      <main className="pt-20 pb-16 px-4 md:ml-64">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <Link to="/admin" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Admin Dashboard
              </Link>
              
              <h1 className={`text-3xl font-bold text-indigo-800 transition-all duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                Blog Post Editor
              </h1>
              <p className={`text-gray-600 transition-all duration-500 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
                Create and edit blog posts for the GCoin blog
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {previewMode ? "Edit" : "Preview"}
              </Button>
              <Button
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Save className="h-4 w-4" />
                Save Post
              </Button>
            </div>
          </div>
          
          <div className={`grid md:grid-cols-3 gap-6 mb-8 transition-all duration-500 delay-200 transform ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
                <div className="p-6">
                  {!previewMode ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter blog post title"
                          className="text-lg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt</label>
                        <Textarea
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="Write a short excerpt for the blog post (displayed in the blog list)"
                          className="h-20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Editor</label>
                        <div className="border rounded-md">
                          <div className="flex items-center gap-1 p-2 border-b">
                            <ToggleGroup type="multiple">
                              <ToggleGroupItem value="bold" aria-label="Bold">
                                <Bold className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="italic" aria-label="Italic">
                                <Italic className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="link" aria-label="Link">
                                <LinkIcon className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="list" aria-label="Bullet List">
                                <List className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="ordered-list" aria-label="Ordered List">
                                <ListOrdered className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="align-left" aria-label="Align Left">
                                <AlignLeft className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="align-center" aria-label="Align Center">
                                <AlignCenter className="h-4 w-4" />
                              </ToggleGroupItem>
                              <ToggleGroupItem value="align-right" aria-label="Align Right">
                                <AlignRight className="h-4 w-4" />
                              </ToggleGroupItem>
                            </ToggleGroup>
                          </div>
                          <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your blog post content here..."
                            className="min-h-[400px] p-4 border-0 focus-visible:ring-0 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="blog-preview">
                      <h1 className="text-3xl font-bold mb-4">{title || "Blog Post Title"}</h1>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span>{author || "Author Name"}</span>
                        <span>•</span>
                        <span>{formatDate()}</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs">
                          {category}
                        </span>
                      </div>
                      {imageUrl && (
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-64 object-cover rounded-lg mb-6"
                        />
                      )}
                      <div className="prose max-w-none">
                        {content.split('\n').map((paragraph, index) => (
                          paragraph ? <p key={index}>{paragraph}</p> : <br key={index} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"></div>
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Post Settings</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author Name
                      </label>
                      <Input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Enter author name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="Education">Education</option>
                        <option value="Analysis">Analysis</option>
                        <option value="Security">Security</option>
                        <option value="Investment">Investment</option>
                        <option value="News">News</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Featured Image URL
                      </label>
                      <div className="flex gap-2">
                        <Input
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="Enter image URL"
                        />
                        <Button variant="outline" size="icon">
                          <Image className="h-4 w-4" />
                        </Button>
                      </div>
                      {imageUrl && (
                        <div className="mt-2 relative h-32 rounded-md overflow-hidden">
                          <img
                            src={imageUrl}
                            alt="Featured"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/400x300?text=Image+Not+Found";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Tabs defaultValue="status">
                        <TabsList className="w-full">
                          <TabsTrigger value="status" className="flex-1">Status</TabsTrigger>
                          <TabsTrigger value="visibility" className="flex-1">Visibility</TabsTrigger>
                        </TabsList>
                        <TabsContent value="status" className="pt-4">
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                            <option value="scheduled">Scheduled</option>
                          </select>
                        </TabsContent>
                        <TabsContent value="visibility" className="pt-4">
                          <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="protected">Password Protected</option>
                          </select>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BlogEditor;
