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

  async generateBusinessPlan(data: {
    businessName: string;
    industry: string;
    targetMarket: string;
    tone?: 'professional' | 'friendly' | 'concise' | 'visionary';
    length?: 'short' | 'medium' | 'long';
    problem?: string;
    solution?: string;
    revenueStreams?: string[];
    channels?: string[];
    costStructure?: string[];
    generatePDF?: boolean;
  }): Promise<ApiResponse<{ plan: any; pdfUrl?: string; processingTime: number }>> {
    return this.request('/tools/smartbiz/business-plan-generator', {
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

  async jobMatchOptimizer(data: { jobDescription: string; resume: string }): Promise<ApiResponse<{ atsScore: number; jobKeywords: string[]; resumeKeywords: string[]; overlap: string[]; missing: string[]; suggestions: string[]; optimizedSummary: string; processingTime: number }>> {
    return this.request('/tools/career/job-match-optimizer', { method: 'POST', body: JSON.stringify(data) });
  }

  // Content tools
  async generateBlogIdeas(data: {
    niche: string;
    targetAudience?: string;
    contentType?: 'how-to' | 'listicle' | 'review' | 'tutorial' | 'news' | 'opinion';
    keywords?: string[];
    count?: number;
  }): Promise<ApiResponse<{ niche: string; contentType: string; targetAudience: string; blogIdeas: any[]; processingTime: number }>> {
    return this.request('/tools/content/blog-idea-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateCaptions(data: {
    platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok' | 'general';
    content: string;
    tone?: 'professional' | 'casual' | 'funny' | 'inspirational' | 'promotional';
    includeHashtags?: boolean;
    includeEmojis?: boolean;
    callToAction?: string;
  }): Promise<ApiResponse<{ caption: string; hashtags: string[]; analysis: any; platform: string; tone: string; processingTime: number }>> {
    return this.request('/tools/content/caption-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async analyzeHeadline(data: {
    headline: string;
    type?: 'blog' | 'email' | 'ad' | 'social' | 'news';
  }): Promise<ApiResponse<{ headline: string; type: string; analysis: any; suggestions: string[]; alternatives: string[]; processingTime: number }>> {
    return this.request('/tools/content/headline-analyzer', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async textToSpeech(data: {
    text: string;
    voice?: 'male' | 'female' | 'child';
    speed?: number; // 0.5 - 2.0
    language?: 'en' | 'es' | 'fr' | 'de' | 'it';
  }): Promise<ApiResponse<{ audioData: any; textAnalysis: any; settings: any; processingTime: number }>> {
    return this.request('/tools/content/text-to-speech', {
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
    formData.append('video', data.file);
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
    formData.append('video', data.file);
    if (data.timestamp) formData.append('timestamp', data.timestamp.toString());
    if (data.count) formData.append('count', data.count.toString());

    return this.request('/tools/video/thumbnail-selector', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async createGif(data: {
    file: File;
    startTime?: number;
    duration?: number;
    quality?: 'low' | 'medium' | 'high';
    fps?: number;
  }): Promise<ApiResponse<{ gif: any; processingTime: number }>> {
    const formData = new FormData();
    formData.append('video', data.file);
    if (data.startTime !== undefined) formData.append('startTime', String(data.startTime));
    if (data.duration !== undefined) formData.append('duration', String(data.duration));
    if (data.quality) formData.append('quality', data.quality);
    if (data.fps !== undefined) formData.append('fps', String(data.fps));

    return this.request('/tools/video/gif-maker', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async captionOverlay(data: {
    file: File;
    captions: { start: number; end: number; text: string }[];
    font?: string;
    size?: number;
    color?: string;
    background?: string;
    position?: 'top' | 'bottom' | 'middle';
  }): Promise<ApiResponse<{ output: { url: string; style: any; srt: string; captionCount: number }; processingTime: number }>> {
    const formData = new FormData();
    formData.append('video', data.file);
    formData.append('captions', JSON.stringify(data.captions));
    if (data.font) formData.append('font', data.font);
    if (data.size) formData.append('size', String(data.size));
    if (data.color) formData.append('color', data.color);
    if (data.background) formData.append('background', data.background);
    if (data.position) formData.append('position', data.position);
    return this.request('/tools/video/caption-overlay', { method: 'POST', body: formData, headers: {} });
  }

  async shortsVerticalCropper(data: {
    file: File;
    aspect?: '9:16' | '1:1' | '4:5';
    strategy?: 'center' | 'smart-face' | 'smart-motion' | 'manual';
    gravity?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    background?: 'blur' | 'black' | 'white';
    resolution?: '720x1280' | '1080x1920' | '1440x2560';
    startTime?: number;
    endTime?: number;
    safeZones?: { top?: number; bottom?: number; left?: number; right?: number };
  }): Promise<ApiResponse<{ output: { url: string; aspect: string; strategy: string; gravity: string; background: string; resolution: string; duration: number; safeZones: any; cropTimeline: any[] }; processingTime: number }>> {
    const formData = new FormData();
    formData.append('video', data.file);
    if (data.aspect) formData.append('aspect', data.aspect);
    if (data.strategy) formData.append('strategy', data.strategy);
    if (data.gravity) formData.append('gravity', data.gravity);
    if (data.background) formData.append('background', data.background);
    if (data.resolution) formData.append('resolution', data.resolution);
    if (data.startTime !== undefined) formData.append('startTime', String(data.startTime));
    if (data.endTime !== undefined) formData.append('endTime', String(data.endTime));
    if (data.safeZones) formData.append('safeZones', JSON.stringify(data.safeZones));
    return this.request('/tools/video/shorts-vertical-cropper', { method: 'POST', body: formData, headers: {} });
  }

  async removeNoise(data: { file: File; mode?: 'mild'|'moderate'|'aggressive'; humHz?: number; dereverb?: boolean }): Promise<ApiResponse<{ output: { url: string; settings: any; stats: any }; processingTime: number }>> {
    const formData = new FormData();
    formData.append('video', data.file);
    if (data.mode) formData.append('mode', data.mode);
    if (data.humHz !== undefined) formData.append('humHz', String(data.humHz));
    if (data.dereverb !== undefined) formData.append('dereverb', String(data.dereverb));
    return this.request('/tools/video/noise-remover', { method: 'POST', body: formData, headers: {} });
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
    maxTweetLength?: number;
  }): Promise<ApiResponse<{ thread: string[]; totalTweets: number; originalLength: number; processingTime: number }>> {
    return this.request('/tools/social/twitter-thread-formatter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateFacebookCaption(data: {
    topic: string;
    tone?: 'professional' | 'casual' | 'engaging' | 'promotional';
    includeEmojis?: boolean;
    callToAction?: string;
  }): Promise<ApiResponse<{ caption: string; processingTime: number }>> {
    return this.request('/tools/social/facebook-caption-creator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async buildBioLink(data: { title: string; bio?: string; theme?: 'light'|'dark'|'neon'; links: { label: string; url: string }[]; socials?: Record<string,string> }): Promise<ApiResponse<{ shareId: string; preview: any; processingTime: number }>> {
    return this.request('/tools/social/bio-link-builder', { method: 'POST', body: JSON.stringify(data) });
  }

  async shortenLink(data: { url: string; customCode?: string; expireDays?: number }): Promise<ApiResponse<{ shortCode: string; shortUrl: string; target: string; expiresAt: string; processingTime: number }>> {
    return this.request('/tools/social/link-shortener', { method: 'POST', body: JSON.stringify(data) });
  }

  // TikTok tools
  async tiktokHashtagHeatmap(data: {
    hashtags: string[];
    timeframe?: '24h' | '7d' | '30d';
  }): Promise<ApiResponse<{ timeframe: string; heatmapData: any[]; processingTime: number }>> {
    return this.request('/tools/tiktok/hashtag-heatmap', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async tiktokViralHookGenerator(data: {
    topic: string;
    style?: 'question' | 'shocking' | 'storytelling' | 'tutorial' | 'trend';
    count?: number;
  }): Promise<ApiResponse<{ topic: string; style: string; hooks: any[]; processingTime: number }>> {
    return this.request('/tools/tiktok/viral-hook-generator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async tiktokTrendingAudio(data: { query?: string; timeframe?: '24h'|'7d'|'30d'; limit?: number }): Promise<ApiResponse<{ query: string; timeframe: string; results: any[]; processingTime: number }>> {
    return this.request('/tools/tiktok/trending-audio', { method: 'POST', body: JSON.stringify(data) });
  }

  // Emotional tools
  async mindMirror(data: { journalEntry: string; mood?: 'happy' | 'sad' | 'anxious' | 'excited' | 'angry' | 'calm' | 'stressed' | 'neutral' }): Promise<ApiResponse<{ originalEntry: string; sentiment: any; mood?: string; reflection: string; suggestions: string[]; processingTime: number }>> {
    return this.request('/tools/emotional/mindmirror', { method: 'POST', body: JSON.stringify(data) });
  }

  async therapet(data: { currentMood: 'happy' | 'sad' | 'anxious' | 'excited' | 'angry' | 'calm' | 'stressed' | 'neutral'; petType?: 'cat' | 'dog' | 'bird' | 'fish' | 'hamster'; interaction?: 'feed' | 'play' | 'pet' | 'talk' | 'exercise' }): Promise<ApiResponse<{ pet: any; interaction: string; response: string; moodBoost: number; processingTime: number }>> {
    return this.request('/tools/emotional/therapet', { method: 'POST', body: JSON.stringify(data) });
  }

  async moodboardAI(data: { colors: string[]; images?: string[]; description?: string }): Promise<ApiResponse<{ moodAnalysis: any; recommendations: any; processingTime: number }>> {
    return this.request('/tools/emotional/moodboard-ai', { method: 'POST', body: JSON.stringify(data) });
  }

  // Utility tools
  async compressPDF(data: {
    file: File;
    quality?: string;
  }): Promise<ApiResponse<{ compressedUrl: string; originalSize: number; compressedSize: number; processingTime: number }>> {
    const formData = new FormData();
    formData.append('pdf', data.file);
    if (data.quality) formData.append('quality', data.quality);

    return this.request('/tools/utility/pdf-compressor', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async mergePDFs(data: { files: File[] }): Promise<ApiResponse<{ mergedPdf: string; fileCount: number; totalPages: number; mergedSize: number; processingTime: number }>> {
    const formData = new FormData();
    data.files.forEach((f) => formData.append('pdfs', f));
    return this.request('/tools/utility/pdf-merger', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async generateQRCode(data: {
    text: string;
    size?: number;
    format?: 'png' | 'svg';
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: string;
    backgroundColor?: string;
  }): Promise<ApiResponse<{ qrCode: string; format: string; size: number; processingTime: number }>> {
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
    formData.append('image', data.file);
    if (data.quality !== undefined) formData.append('quality', String(data.quality));
    if (data.format) formData.append('format', data.format);
    if (data.resize?.width) formData.append('width', String(data.resize.width));
    if (data.resize?.height) formData.append('height', String(data.resize.height));

    return this.request('/tools/utility/image-optimizer', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async youtubeThumbnail(data: { url?: string; videoId?: string }): Promise<ApiResponse<{ videoId: string; thumbnails: { label: string; url: string; width: number; height: number }[]; processingTime: number }>> {
    return this.request('/tools/utility/youtube-thumbnail', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async splitPDF(data: { file: File; ranges?: string; mode?: 'ranges' | 'every'; everyN?: number }): Promise<ApiResponse<{ pageCount: number; parts: { label: string; pdf: string }[]; processingTime: number }>> {
    const formData = new FormData();
    formData.append('pdf', data.file);
    if (data.ranges) formData.append('ranges', data.ranges);
    if (data.mode) formData.append('mode', data.mode);
    if (data.everyN) formData.append('everyN', String(data.everyN));
    return this.request('/tools/utility/pdf-splitter', { method: 'POST', body: formData, headers: {} });
  }

  async protectPDF(data: { file: File; password?: string }): Promise<ApiResponse<{ protectedPdf: string; processingTime: number }>> {
    const formData = new FormData();
    formData.append('pdf', data.file);
    if (data.password) formData.append('password', data.password);
    return this.request('/tools/utility/pdf-password-protector', { method: 'POST', body: formData, headers: {} });
  }

  async pdfToImage(data: { file: File; format?: 'png'|'jpg'; width?: number; height?: number }): Promise<ApiResponse<{ pageCount: number; images: { page: number; url: string }[]; processingTime: number }>> {
    const formData = new FormData();
    formData.append('pdf', data.file);
    if (data.format) formData.append('format', data.format);
    if (data.width) formData.append('width', String(data.width));
    if (data.height) formData.append('height', String(data.height));
    return this.request('/tools/utility/pdf-to-image', { method: 'POST', body: formData, headers: {} });
  }

  async optimizeThumbnails(data: { file: File; count?: number; title?: string; style?: 'clean'|'bold'|'minimal'|'vibrant'; colorScheme?: string; addBorder?: boolean; badgeText?: string }): Promise<ApiResponse<{ video: any; candidates: any[]; processingTime: number }>> {
    const formData = new FormData();
    formData.append('video', data.file);
    if (data.count !== undefined) formData.append('count', String(data.count));
    if (data.title) formData.append('title', data.title);
    if (data.style) formData.append('style', data.style);
    if (data.colorScheme) formData.append('colorScheme', data.colorScheme);
    if (data.addBorder !== undefined) formData.append('addBorder', String(data.addBorder));
    if (data.badgeText) formData.append('badgeText', data.badgeText);
    return this.request('/tools/video/thumbnail-optimizer', { method: 'POST', body: formData, headers: {} });
  }

  async remixImage(data: { file: File; effect?: 'grayscale'|'sepia'|'blur'|'pixelate'|'invert'|'none'; intensity?: number; hue?: number; saturation?: number }): Promise<ApiResponse<{ remixed: string; processingTime: number; meta: any }>> {
    const formData = new FormData();
    formData.append('image', data.file);
    if (data.effect) formData.append('effect', data.effect);
    if (data.intensity !== undefined) formData.append('intensity', String(data.intensity));
    if (data.hue !== undefined) formData.append('hue', String(data.hue));
    if (data.saturation !== undefined) formData.append('saturation', String(data.saturation));
    return this.request('/tools/utility/image-remixer', { method: 'POST', body: formData, headers: {} });
  }

  async summarizeText(data: { text: string; length?: 'short'|'medium'|'long' }): Promise<ApiResponse<{ summary: string; keywords: string[]; processingTime: number }>> {
    return this.request('/tools/content/text-summarizer', { method: 'POST', body: JSON.stringify(data) });
  }

  async voiceNotesToText(data: { file: File; language?: 'en'|'es'|'fr'|'de'|'it' }): Promise<ApiResponse<{ transcript: string; language: string; confidence: number; wordCount: number; processingTime: number }>> {
    const formData = new FormData();
    formData.append('audio', data.file);
    if (data.language) formData.append('language', data.language);
    return this.request('/tools/content/voice-notes-to-text', { method: 'POST', body: formData, headers: {} });
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

  async batchTrimVideos(data: { files: File[]; startTime: number; endTime: number; outputFormat?: 'mp4'|'webm'|'mov' }): Promise<ApiResponse<{ items: any[]; processingTime: number }>> {
    const formData = new FormData();
    data.files.forEach((f) => formData.append('videos', f));
    formData.append('startTime', String(data.startTime));
    formData.append('endTime', String(data.endTime));
    if (data.outputFormat) formData.append('outputFormat', data.outputFormat);
    return this.request('/tools/video/batch-trimmer', { method: 'POST', body: formData, headers: {} });
  }

  async generateSmartCaptions(data: { file: File; language?: 'en'|'es'|'fr'|'de'|'it'; maxLineLength?: number; includePunctuation?: boolean }): Promise<ApiResponse<{ language: string; captions: { start: number; end: number; text: string }[]; srt: string; processingTime: number }>> {
    const formData = new FormData();
    formData.append('video', data.file);
    if (data.language) formData.append('language', data.language);
    if (data.maxLineLength !== undefined) formData.append('maxLineLength', String(data.maxLineLength));
    if (data.includePunctuation !== undefined) formData.append('includePunctuation', String(data.includePunctuation));
    return this.request('/tools/video/smart-caption-generator', { method: 'POST', body: formData, headers: {} });
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