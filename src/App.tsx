import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import React from 'react';

import { AuthProvider } from "@/contexts/AuthContext";
import CMPBanner from "@/components/CMPBanner";
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
import JobMatchOptimizer from "./pages/tools/career/JobMatchOptimizer";
import BlogIdeaGenerator from "./pages/tools/content/BlogIdeaGenerator";
import HeadlineAnalyzer from "./pages/tools/content/HeadlineAnalyzer";
import CaptionGenerator from "./pages/tools/content/CaptionGenerator";
import TextToSpeech from "./pages/tools/content/TextToSpeech";
const VideoTrimmer = React.lazy(() => import('./pages/tools/video/VideoTrimmer'));
import ThumbnailSelector from "./pages/tools/video/ThumbnailSelector";
const GifMaker = React.lazy(() => import('./pages/tools/video/GifMaker'));
import ShortsVerticalCropper from "./pages/tools/video/ShortsVerticalCropper";
import NoiseRemover from "./pages/tools/video/NoiseRemover";
import BatchTrimmer from "./pages/tools/video/BatchTrimmer";
import ThumbnailOptimizer from "./pages/tools/video/ThumbnailOptimizer";
import SmartCaptionGenerator from "./pages/tools/video/SmartCaptionGenerator";
import QRCodeGenerator from "./pages/tools/utility/QRCodeGenerator";
import ImageRemixer from "./pages/tools/general/ImageRemixer";
import TwitterThreadPreviewer from "./pages/tools/general/TwitterThreadPreviewer";
import TextSummarizer from "./pages/tools/content/TextSummarizer";
import VoiceNotesToText from "./pages/tools/content/VoiceNotesToText";
const ImageOptimizer = React.lazy(() => import('./pages/tools/utility/ImageOptimizer'));
const PDFMerger = React.lazy(() => import('./pages/tools/utility/PDFMerger'));
import TwitterThreadFormatter from "./pages/tools/social/TwitterThreadFormatter";
import HashtagGenerator from "./pages/tools/social/HashtagGenerator";
import FacebookCaptionCreator from "./pages/tools/social/FacebookCaptionCreator";
import BioLinkBuilder from "./pages/tools/social/BioLinkBuilder";
import LinkShortener from "./pages/tools/social/LinkShortener";
import HashtagHeatmap from "./pages/tools/tiktok/HashtagHeatmap";
import ViralHookGenerator from "./pages/tools/tiktok/ViralHookGenerator";
import MindMirror from "./pages/tools/emotional/MindMirror";
import Therapet from "./pages/tools/emotional/Therapet";
import MoodBoardAI from "./pages/tools/emotional/MoodBoardAI";
import YouTubeThumbnailDownloader from "./pages/tools/utility/YouTubeThumbnailDownloader";
const PDFSplitter = React.lazy(() => import('./pages/tools/utility/PDFSplitter'));
const PDFPasswordProtector = React.lazy(() => import('./pages/tools/utility/PDFPasswordProtector'));
const PDFToImage = React.lazy(() => import('./pages/tools/utility/PDFToImage'));
import CaptionOverlay from "./pages/tools/video/CaptionOverlay";
const VideoPro = React.lazy(() => import('./pages/tools/video/VideoPro'));
import TrendingAudio from "./pages/tools/tiktok/TrendingAudio";
const AdminSettings = React.lazy(() => import('./pages/admin/Settings'));
const ReadabilityChecker = React.lazy(() => import('./pages/tools/content/ReadabilityChecker'));
const ContentRepurposer = React.lazy(() => import('./pages/tools/content/ContentRepurposer'));
const IdeaToScript = React.lazy(() => import('./pages/tools/content/IdeaToScript'));
const SocialHookAnalyzer = React.lazy(() => import('./pages/tools/content/SocialHookAnalyzer'));
const ContentRepurposePacks = React.lazy(() => import('./pages/tools/content/ContentRepurposePacks'));
const HookLab = React.lazy(() => import('./pages/tools/content/HookLab'));
const AdminPosts = React.lazy(() => import('./pages/admin/Posts'));
const AdminTools = React.lazy(() => import('./pages/admin/Tools'));
const AdminTemplates = React.lazy(() => import('./pages/admin/Templates'));
const AdminTikoConfig = React.lazy(() => import('./pages/admin/TikoConfig'));
const AdminPageBuilder = React.lazy(() => import('./pages/admin/PageBuilder'));
import ThemeTokens from "./components/ThemeTokens";
import PageRenderer from "./components/PageRenderer";

const queryClient = new QueryClient();

function GlobalAutosave() {
  const location = useLocation();
  React.useEffect(() => {
    const key = `autosave:${location.pathname}`;
    // restore
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        const formEls = Array.from(document.querySelectorAll('input, textarea, select')) as (HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement)[];
        formEls.forEach((el) => {
          const name = el.name || el.id;
          if (!name) return;
          if (data[name] !== undefined) {
            if ((el as HTMLInputElement).type === 'checkbox' || (el as HTMLInputElement).type === 'radio') {
              (el as HTMLInputElement).checked = !!data[name];
            } else {
              (el as any).value = data[name];
            }
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    } catch {}
    // save loop
    const interval = setInterval(() => {
      try {
        const formEls = Array.from(document.querySelectorAll('input, textarea, select')) as (HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement)[];
        const data: Record<string, any> = {};
        formEls.forEach((el) => {
          const name = el.name || el.id;
          if (!name) return;
          if ((el as HTMLInputElement).type === 'checkbox' || (el as HTMLInputElement).type === 'radio') {
            data[name] = (el as HTMLInputElement).checked;
          } else {
            data[name] = (el as any).value;
          }
        });
        localStorage.setItem(key, JSON.stringify(data));
      } catch {}
    }, 1500);
    return () => clearInterval(interval);
  }, [location.pathname]);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
                 <BrowserRouter>
           <CMPBanner />
           <PageRenderer />
         <ThemeTokens>
         <GlobalAutosave />
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
          <Route path="/admin/settings" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><AdminSettings /></React.Suspense>} />
          <Route path="/admin/posts" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><AdminPosts /></React.Suspense>} />
          <Route path="/admin/tools" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><AdminTools /></React.Suspense>} />
          <Route path="/admin/templates" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><AdminTemplates /></React.Suspense>} />
          <Route path="/admin/tiko" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><AdminTikoConfig /></React.Suspense>} />
          <Route path="/admin/page-builder" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><AdminPageBuilder /></React.Suspense>} />
          
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
           <Route path="/tools/career/job-match-optimizer" element={<JobMatchOptimizer />} />
          <Route path="/tools/video" element={<VideoTools />} />
          <Route path="/tools/video/trimmer" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><VideoTrimmer /></React.Suspense>} />
          <Route path="/tools/video/pro" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><VideoPro /></React.Suspense>} />
          <Route path="/tools/video/thumbnail-selector" element={<ThumbnailSelector />} />
            <Route path="/tools/video/thumbnail-optimizer" element={<ThumbnailOptimizer />} />
            <Route path="/tools/video/gif-maker" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><GifMaker /></React.Suspense>} />
            <Route path="/tools/video/batch-trimmer" element={<BatchTrimmer />} />
<Route path="/tools/video/shorts-vertical-cropper" element={<ShortsVerticalCropper />} />
<Route path="/tools/video/caption-overlay" element={<CaptionOverlay />} />
            <Route path="/tools/video/smart-caption-generator" element={<SmartCaptionGenerator />} />
<Route path="/tools/video/noise-remover" element={<NoiseRemover />} />
          <Route path="/tools/social" element={<SocialTools />} />
          <Route path="/tools/social/hashtag-generator" element={<HashtagGenerator />} />
          <Route path="/tools/social/twitter-thread-formatter" element={<TwitterThreadFormatter />} />
          <Route path="/tools/social/facebook-caption-creator" element={<FacebookCaptionCreator />} />
           <Route path="/tools/social/bio-link-builder" element={<BioLinkBuilder />} />
           <Route path="/tools/social/link-shortener" element={<LinkShortener />} />
          <Route path="/tools/general" element={<General />} />
          <Route path="/tools/text-tools" element={<TextTools />} />
          <Route path="/tools/tiktok" element={<TikTokTools />} />
          <Route path="/tools/tiktok/hashtag-heatmap" element={<HashtagHeatmap />} />
          <Route path="/tools/tiktok/viral-hook-generator" element={<ViralHookGenerator />} />
          <Route path="/tools/tiktok/trending-audio" element={<TrendingAudio />} />
          <Route path="/tools/ai-creator" element={<AICreator />} />
          <Route path="/tools/blog" element={<BlogSEO />} />
          <Route path="/tools/content/blog-idea-generator" element={<BlogIdeaGenerator />} />
          <Route path="/tools/content/headline-analyzer" element={<HeadlineAnalyzer />} />
          <Route path="/tools/content/caption-generator" element={<CaptionGenerator />} />
          <Route path="/tools/content/text-to-speech" element={<TextToSpeech />} />
          <Route path="/tools/pdf" element={<PDF />} />
          <Route path="/tools/utility/qr-code-generator" element={<QRCodeGenerator />} />
           <Route path="/tools/general/image-remixer" element={<ImageRemixer />} />
           <Route path="/tools/general/twitter-thread-previewer" element={<TwitterThreadPreviewer />} />
           <Route path="/tools/content/text-summarizer" element={<TextSummarizer />} />
           <Route path="/tools/content/voice-notes-to-text" element={<VoiceNotesToText />} />
          <Route path="/tools/content/readability-checker" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><ReadabilityChecker /></React.Suspense>} />
          <Route path="/tools/content/content-repurposer" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><ContentRepurposer /></React.Suspense>} />
          <Route path="/tools/content/idea-to-script" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><IdeaToScript /></React.Suspense>} />
          <Route path="/tools/content/social-hook-analyzer" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><SocialHookAnalyzer /></React.Suspense>} />
          <Route path="/tools/content/repurpose-packs" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><ContentRepurposePacks /></React.Suspense>} />
          <Route path="/tools/content/hook-lab" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><HookLab /></React.Suspense>} />
          <Route path="/tools/utility/image-optimizer" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><ImageOptimizer /></React.Suspense>} />
          <Route path="/tools/utility/pdf-merger" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><PDFMerger /></React.Suspense>} />
          <Route path="/tools/utility/youtube-thumbnail-downloader" element={<YouTubeThumbnailDownloader />} />
          <Route path="/tools/utility/pdf-splitter" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><PDFSplitter /></React.Suspense>} />
          <Route path="/tools/utility/pdf-password-protector" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><PDFPasswordProtector /></React.Suspense>} />
          <Route path="/tools/utility/pdf-to-image" element={<React.Suspense fallback={<div className='p-8'>Loading…</div>}><PDFToImage /></React.Suspense>} />
          <Route path="/tools/emotional" element={<EmotionalUtility />} />
          <Route path="/tools/emotional/mindmirror" element={<MindMirror />} />
          <Route path="/tools/emotional/therapet" element={<Therapet />} />
          <Route path="/tools/emotional/moodboard-ai" element={<MoodBoardAI />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ThemeTokens>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;