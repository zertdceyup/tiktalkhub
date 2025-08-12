const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Tool {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  icon: string;
  is_active: boolean;
  is_featured: boolean;
  usage_count: number;
  config?: any;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author_id: number;
  status: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string;
  category?: string;
  views: number;
  featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  message: string;
  response: string;
  sentiment_score: number;
  suggested_tools: string[];
  created_at: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Auth endpoints
  async register(userData: {
    email: string;
    password: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ token: string; user: User }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: {
    username?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    return this.request('/auth/verify');
  }

  // Tools endpoints
  async getTools(params?: {
    category?: string;
    featured?: boolean;
  }): Promise<ApiResponse<{ tools: Tool[] }>> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured) searchParams.set('featured', 'true');
    
    const query = searchParams.toString();
    return this.request(`/tools${query ? `?${query}` : ''}`);
  }

  async getTool(slug: string): Promise<ApiResponse<{ tool: Tool }>> {
    return this.request(`/tools/${slug}`);
  }

  async getToolCategories(): Promise<ApiResponse<{ categories: any[] }>> {
    return this.request('/tools/categories/stats');
  }

  // SmartBiz tools
  async generateBusinessNames(data: {
    industry: string;
    keywords?: string[];
    style?: string;
    length?: string;
  }): Promise<ApiResponse<{ businessNames: string[]; processingTime: number }>> {
    return this.request('/tools/smartbiz/business-name-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateSlogans(data: {
    businessName: string;
    industry: string;
    targetAudience?: string;
    tone?: string;
    keywords?: string[];
  }): Promise<ApiResponse<{ slogans: string[]; processingTime: number }>> {
    return this.request('/tools/smartbiz/slogan-creator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateLogoConcepts(data: {
    businessName: string;
    industry: string;
    style?: string;
    colors?: string[];
    symbols?: string[];
  }): Promise<ApiResponse<{ logoConcepts: any[]; processingTime: number }>> {
    return this.request('/tools/smartbiz/logo-sketch-wizard', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateFlyerDesign(data: {
    title: string;
    description: string;
    contactInfo: any;
    template?: string;
    colors?: any;
  }): Promise<ApiResponse<{ flyerDesign: any; processingTime: number }>> {
    return this.request('/tools/smartbiz/smart-flyer-designer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createInvoice(data: {
    invoiceNumber: string;
    businessInfo: any;
    clientInfo: any;
    items: any[];
    dueDate: string;
    notes?: string;
  }): Promise<ApiResponse<{ invoiceUrl: string; processingTime: number }>> {
    return this.request('/tools/smartbiz/invoice-maker', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Career tools
  async buildResume(data: {
    personalInfo: any;
    experience: any[];
    education: any[];
    skills: string[];
    template?: string;
  }): Promise<ApiResponse<{ resume: any; processingTime: number }>> {
    return this.request('/tools/career/resume-builder', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async interviewCoach(data: {
    jobTitle: string;
    industry: string;
    interviewType: 'behavioral' | 'technical' | 'case-study' | 'general';
    experience?: any[];
    difficulty?: 'entry' | 'mid' | 'senior' | 'executive';
  }): Promise<ApiResponse<{ questions: string[]; tips: string[]; preparationChecklist: string[]; processingTime: number }>> {
    return this.request('/tools/career/interview-coach', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCoverLetter(data: {
    personalInfo: any;
    jobTitle: string;
    companyName: string;
    jobDescription?: string;
    tone?: string;
  }): Promise<ApiResponse<{ coverLetter: string; processingTime: number }>> {
    return this.request('/tools/career/cover-letter-ai', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateLinkedInSummary(data: {
    personalInfo: any;
    experience: any[];
    skills: string[];
    industry: string;
    tone?: string;
  }): Promise<ApiResponse<{ linkedinSummary: string; sentiment: any; suggestions: string[]; processingTime: number }>> {
    return this.request('/tools/career/linkedin-summary', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Content tools
  async generateBlogIdeas(data: {
    topic: string;
    industry?: string;
    audience?: string;
    keywords?: string[];
    count?: number;
  }): Promise<ApiResponse<{ ideas: string[]; processingTime: number }>> {
    return this.request('/tools/content/blog-idea-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCaptions(data: {
    content: string;
    platform?: string;
    tone?: string;
    hashtags?: boolean;
    count?: number;
  }): Promise<ApiResponse<{ captions: string[]; processingTime: number }>> {
    return this.request('/tools/content/caption-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeHeadline(data: {
    headline: string;
    type?: string;
  }): Promise<ApiResponse<{ analysis: any; suggestions: string[]; processingTime: number }>> {
    return this.request('/tools/content/headline-analyzer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Video tools
  async trimVideo(data: {
    file: File;
    startTime: number;
    endTime: number;
  }): Promise<ApiResponse<{ videoUrl: string; processingTime: number }>> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('startTime', data.startTime.toString());
    formData.append('endTime', data.endTime.toString());

    return this.request('/tools/video/video-trimmer', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type to let browser set it for FormData
    });
  }

  async extractThumbnail(data: {
    file: File;
    timestamp?: number;
    count?: number;
  }): Promise<ApiResponse<{ thumbnails: string[]; processingTime: number }>> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.timestamp) formData.append('timestamp', data.timestamp.toString());
    if (data.count) formData.append('count', data.count.toString());

    return this.request('/tools/video/thumbnail-selector', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // Social tools
  async generateHashtags(data: {
    content: string;
    platform?: string;
    category?: string;
    trending?: boolean;
    count?: number;
  }): Promise<ApiResponse<{ hashtags: string[]; processingTime: number }>> {
    return this.request('/tools/social/hashtag-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async formatTwitterThread(data: {
    content: string;
    maxTweets?: number;
    addNumbers?: boolean;
  }): Promise<ApiResponse<{ tweets: string[]; processingTime: number }>> {
    return this.request('/tools/social/twitter-thread-formatter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility tools
  async compressPDF(data: {
    file: File;
    quality?: string;
  }): Promise<ApiResponse<{ compressedUrl: string; originalSize: number; compressedSize: number; processingTime: number }>> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.quality) formData.append('quality', data.quality);

    return this.request('/tools/utility/pdf-compressor', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async generateQRCode(data: {
    text: string;
    size?: number;
    format?: string;
    errorCorrection?: string;
  }): Promise<ApiResponse<{ qrCodeUrl: string; processingTime: number }>> {
    return this.request('/tools/utility/qr-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async optimizeImage(data: {
    file: File;
    quality?: number;
    format?: string;
    resize?: { width?: number; height?: number };
  }): Promise<ApiResponse<{ optimizedUrl: string; originalSize: number; optimizedSize: number; processingTime: number }>> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.quality) formData.append('quality', data.quality.toString());
    if (data.format) formData.append('format', data.format);
    if (data.resize) formData.append('resize', JSON.stringify(data.resize));

    return this.request('/tools/utility/image-optimizer', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  // AI endpoints
  async chatWithTiko(data: {
    message: string;
    sessionId?: string;
    context?: any;
  }): Promise<ApiResponse<{
    response: string;
    sessionId: string;
    sentiment: any;
    suggestedTools: string[];
    intent: string;
    confidence: number;
    processingTime: number;
  }>> {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async suggestTools(data: {
    query: string;
    category?: string;
    userPreferences?: any;
  }): Promise<ApiResponse<{
    query: string;
    intent: string;
    confidence: number;
    response: string;
    tools: Tool[];
    processingTime: number;
  }>> {
    return this.request('/ai/suggest-tools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAIInsights(): Promise<ApiResponse<{
    personalizedRecommendations: Tool[];
    usageStats: any;
    trendingTools: Tool[];
    tips: string[];
  }>> {
    return this.request('/ai/insights');
  }

  async analyzeSentiment(data: {
    text: string;
  }): Promise<ApiResponse<{
    sentiment: any;
    keywords: string[];
    processingTime: number;
    textStats: any;
  }>> {
    return this.request('/ai/analyze-sentiment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversationHistory(sessionId: string, limit?: number): Promise<ApiResponse<{
    sessionId: string;
    conversations: AIConversation[];
    count: number;
  }>> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/ai/conversations/${sessionId}${params}`);
  }

  // Blog endpoints
  async getBlogPosts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
  }): Promise<ApiResponse<{
    posts: BlogPost[];
    pagination: any;
  }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.category) searchParams.set('category', params.category);
    if (params?.featured) searchParams.set('featured', 'true');
    
    const query = searchParams.toString();
    return this.request(`/blog${query ? `?${query}` : ''}`);
  }

  async getBlogPost(slug: string): Promise<ApiResponse<{ post: BlogPost }>> {
    return this.request(`/blog/${slug}`);
  }

  async generateBlogContent(data: {
    topic: string;
    keywords?: string[];
    audience?: string;
    tone?: string;
    length?: string;
  }): Promise<ApiResponse<{
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    processingTime: number;
  }>> {
    return this.request('/blog/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // File management
  async uploadFile(file: File, metadata?: any): Promise<ApiResponse<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.request('/files/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async deleteFile(filename: string): Promise<ApiResponse<any>> {
    return this.request(`/files/${filename}`, {
      method: 'DELETE',
    });
  }
}

// Create and export API client instance
export const api = new ApiClient(API_BASE_URL);

// Export utility functions
export const setAuthToken = (token: string) => api.setToken(token);
export const clearAuthToken = () => api.clearToken();

// Error handling utilities
export const isApiError = (error: any): boolean => {
  return error instanceof Error;
};

export const getErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.errors?.length > 0) return error.errors[0].msg || error.errors[0];
  return 'An unexpected error occurred';
};

// Response type guards
export const isSuccessResponse = <T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } => {
  return response.success === true && response.data !== undefined;
};

export default api;