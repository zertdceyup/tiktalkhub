import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Tutorials from "./pages/Tutorials";
import Templates from "./pages/Templates";
import CaseStudies from "./pages/CaseStudies";
import HelpCenter from "./pages/HelpCenter";
import Careers from "./pages/Careers";
import NotFound from "./pages/NotFound";

// Tool pages
import SmartBiz from "./pages/tools/SmartBiz";
import Career from "./pages/tools/Career";
import VideoTools from "./pages/tools/Video";
import SocialTools from "./pages/tools/Social";
import General from "./pages/tools/General";
import TextTools from "./pages/tools/TextTools";
import TikTokTools from "./pages/tools/TikTok";
import AICreator from "./pages/tools/AICreator";
import BlogSEO from "./pages/tools/BlogSEO";
import PDF from "./pages/tools/PDF";
import EmotionalUtility from "./pages/tools/EmotionalUtility";
import BusinessNameGenerator from "./pages/tools/smartbiz/BusinessNameGenerator";
import SloganCreator from "./pages/tools/smartbiz/SloganCreator";
import LogoSketchWizard from "./pages/tools/smartbiz/LogoSketchWizard";
import SmartFlyerDesigner from "./pages/tools/smartbiz/SmartFlyerDesigner";
import InvoiceMaker from "./pages/tools/smartbiz/InvoiceMaker";
import BusinessPlanGenerator from "./pages/tools/smartbiz/BusinessPlanGenerator";
import ResumeBuilder from "./pages/tools/career/ResumeBuilder";
import CoverLetterAI from "./pages/tools/career/CoverLetterAI";
import LinkedInSummary from "./pages/tools/career/LinkedInSummary";
import InterviewCoach from "./pages/tools/career/InterviewCoach";
import BlogIdeaGenerator from "./pages/tools/content/BlogIdeaGenerator";
import HeadlineAnalyzer from "./pages/tools/content/HeadlineAnalyzer";
import CaptionGenerator from "./pages/tools/content/CaptionGenerator";
import TextToSpeech from "./pages/tools/content/TextToSpeech";
import VideoTrimmer from "./pages/tools/video/VideoTrimmer";
import ThumbnailSelector from "./pages/tools/video/ThumbnailSelector";
import GifMaker from "./pages/tools/video/GifMaker";
import QRCodeGenerator from "./pages/tools/utility/QRCodeGenerator";
import ImageOptimizer from "./pages/tools/utility/ImageOptimizer";
import PDFMerger from "./pages/tools/utility/PDFMerger";
import TwitterThreadFormatter from "./pages/tools/social/TwitterThreadFormatter";
import HashtagGenerator from "./pages/tools/social/HashtagGenerator";
import FacebookCaptionCreator from "./pages/tools/social/FacebookCaptionCreator";
import HashtagHeatmap from "./pages/tools/tiktok/HashtagHeatmap";
import ViralHookGenerator from "./pages/tools/tiktok/ViralHookGenerator";
import MindMirror from "./pages/tools/emotional/MindMirror";
import Therapet from "./pages/tools/emotional/Therapet";
import MoodBoardAI from "./pages/tools/emotional/MoodBoardAI";
import YouTubeThumbnailDownloader from "./pages/tools/utility/YouTubeThumbnailDownloader";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Tool Categories */}
          <Route path="/tools/smartbiz" element={<SmartBiz />} />
          <Route path="/tools/smartbiz/business-name-generator" element={<BusinessNameGenerator />} />
          <Route path="/tools/smartbiz/slogan-creator" element={<SloganCreator />} />
          <Route path="/tools/smartbiz/logo-sketch-wizard" element={<LogoSketchWizard />} />
          <Route path="/tools/smartbiz/smart-flyer-designer" element={<SmartFlyerDesigner />} />
          <Route path="/tools/smartbiz/invoice-maker" element={<InvoiceMaker />} />
          <Route path="/tools/smartbiz/business-plan-generator" element={<BusinessPlanGenerator />} />
          <Route path="/tools/career" element={<Career />} />
          <Route path="/tools/career/resume-builder" element={<ResumeBuilder />} />
          <Route path="/tools/career/cover-letter-ai" element={<CoverLetterAI />} />
          <Route path="/tools/career/linkedin-summary" element={<LinkedInSummary />} />
          <Route path="/tools/career/interview-coach" element={<InterviewCoach />} />
          <Route path="/tools/video" element={<VideoTools />} />
          <Route path="/tools/video/trimmer" element={<VideoTrimmer />} />
          <Route path="/tools/video/thumbnail-selector" element={<ThumbnailSelector />} />
          <Route path="/tools/video/gif-maker" element={<GifMaker />} />
          <Route path="/tools/social" element={<SocialTools />} />
          <Route path="/tools/social/hashtag-generator" element={<HashtagGenerator />} />
          <Route path="/tools/social/twitter-thread-formatter" element={<TwitterThreadFormatter />} />
          <Route path="/tools/social/facebook-caption-creator" element={<FacebookCaptionCreator />} />
          <Route path="/tools/general" element={<General />} />
          <Route path="/tools/text-tools" element={<TextTools />} />
          <Route path="/tools/tiktok" element={<TikTokTools />} />
          <Route path="/tools/tiktok/hashtag-heatmap" element={<HashtagHeatmap />} />
          <Route path="/tools/tiktok/viral-hook-generator" element={<ViralHookGenerator />} />
          <Route path="/tools/ai-creator" element={<AICreator />} />
          <Route path="/tools/blog" element={<BlogSEO />} />
          <Route path="/tools/content/blog-idea-generator" element={<BlogIdeaGenerator />} />
          <Route path="/tools/content/headline-analyzer" element={<HeadlineAnalyzer />} />
          <Route path="/tools/content/caption-generator" element={<CaptionGenerator />} />
          <Route path="/tools/content/text-to-speech" element={<TextToSpeech />} />
          <Route path="/tools/pdf" element={<PDF />} />
          <Route path="/tools/utility/qr-code-generator" element={<QRCodeGenerator />} />
          <Route path="/tools/utility/image-optimizer" element={<ImageOptimizer />} />
          <Route path="/tools/utility/pdf-merger" element={<PDFMerger />} />
          <Route path="/tools/utility/youtube-thumbnail-downloader" element={<YouTubeThumbnailDownloader />} />
          <Route path="/tools/emotional" element={<EmotionalUtility />} />
          <Route path="/tools/emotional/mindmirror" element={<MindMirror />} />
          <Route path="/tools/emotional/therapet" element={<Therapet />} />
          <Route path="/tools/emotional/moodboard-ai" element={<MoodBoardAI />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;