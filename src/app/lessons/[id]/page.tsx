'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { getLessonById, parseMediaUrl, LessonItem } from '@/lib/actions/lessons';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Maximize,
  FileText,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LessonPlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [user, setUser] = useState<UserSession | null>(null);
  const [lesson, setLesson] = useState<LessonItem | null>(null);
  const [parsedMedia, setParsedMedia] = useState<{ type: 'video' | 'iframe'; src: string }>({ type: 'video', src: '' });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);
  
  // Moving Watermark position
  const [watermarkPos, setWatermarkPos] = useState({ top: 20, right: 20 });

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }
      setUser(currentUser);

      const loadedLesson = await getLessonById(params.id);
      setLesson(loadedLesson);
      if (loadedLesson) {
        const mediaInfo = await parseMediaUrl(loadedLesson.videoPath || '');
        setParsedMedia(mediaInfo);
      }
    }
    loadData();
  }, [params.id, router]);

  // Moving watermark timer every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = Math.floor(Math.random() * 70) + 10;
      const randomRight = Math.floor(Math.random() * 70) + 10;
      setWatermarkPos({ top: randomTop, right: randomRight });
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleSeek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  if (!lesson || !user) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex items-center justify-center font-arabic">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-cyan-electric border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-chalk">جاري تحميل الفيديو المشفر والدرس...</p>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col font-arabic">
        
        {/* Top Player Header */}
        <header className="bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/student" className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-chalk hover:text-cyan-electric transition-colors">
              <ArrowRight className="w-4 h-4" />
              <span>العودة للوحة الطالب</span>
            </Link>

            <div className="text-center truncate px-4">
              <h1 className="text-base font-black text-slate-900 dark:text-chalk truncate">{lesson.title}</h1>
              <span className="text-xs text-cyan-electric font-semibold">{lesson.gradeName} • {lesson.branchName}</span>
            </div>

            {lesson.pdfPath && (
              <a
                href={lesson.pdfPath}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-electric/25 transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>تحميل مذكرة PDF</span>
              </a>
            )}
          </div>
        </header>

        {/* Video Player Main Showcase */}
        <main className="flex-1 max-w-6xl mx-auto w-full p-4 lg:p-8 space-y-6">
          
          <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl group">
            
            {/* MOVING WATERMARK OVERLAY (Security Deterrent) */}
            <div
              className="absolute pointer-events-none z-30 select-none transition-all duration-1000 ease-in-out px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/40 text-xs font-mono font-bold"
              style={{
                top: `${watermarkPos.top}%`,
                right: `${watermarkPos.right}%`,
              }}
            >
              <span>{user.fullName}</span> • <span>{user.phone}</span>
            </div>

            {/* Video Element or Google Drive / YouTube Iframe */}
            {parsedMedia.type === 'iframe' ? (
              <iframe
                src={parsedMedia.src}
                className="w-full aspect-video border-0 bg-black"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
                title={lesson.title}
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={parsedMedia.src}
                  poster={lesson.thumbnailPath}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full aspect-video object-contain bg-black cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Video Controls Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 z-20 space-y-3 opacity-90 group-hover:opacity-100 transition-opacity">
                  <div className="w-full bg-white/20 rounded-full h-1.5 cursor-pointer overflow-hidden">
                    <div className="bg-cyan-electric h-1.5 rounded-full shadow-cyan-glow transition-all" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex items-center justify-between text-white text-xs font-bold">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlay} className="p-2 rounded-lg hover:bg-white/10 transition-colors text-cyan-electric">
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>

                      <button onClick={() => handleSeek(-10)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="إرجاع 10 ثوانٍ">
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSeek(10)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="تقديم 10 ثوانٍ">
                        <RotateCw className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1.5">
                        {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSpeedChange(s)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              playbackSpeed === s ? 'bg-cyan-electric text-black' : 'bg-white/10 text-white/80 hover:bg-white/20'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={toggleFullscreen} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Maximize className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>

          {/* Lesson Details & PDF Download Card */}
          <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-chalk">{lesson.title}</h2>
              <span className="text-xs font-bold text-emerald-500 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                محتوى محمي ومشفر
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed">
              {lesson.description}
            </p>
          </div>

        </main>
      </div>
    </DarkGradientBg>
  );
}
