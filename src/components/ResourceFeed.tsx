'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Youtube, 
  ExternalLink, 
  Download, 
  Search, 
  Filter, 
  Sparkles, 
  Trash2, 
  BookOpen, 
  Calendar, 
  User, 
  Layers, 
  RefreshCw,
  Play,
  CheckCircle2
} from 'lucide-react';
import { Resource, ResourceType } from '@/lib/resourceDb';
import { getYouTubeEmbedUrl } from './ResourceUploader';

interface ResourceFeedProps {
  isTeacherView?: boolean;
  recommendedTopics?: string[]; // e.g. ['Graph Transformations', 'Quadratic Equations & Roots']
  title?: string;
  subtitle?: string;
  onTriggerQuiz?: (topicName: string) => void;
  clearedTopics?: Set<string>;
  onToggleCleared?: (topicName: string) => void;
}

export default function ResourceFeed({
  isTeacherView = false,
  recommendedTopics = [],
  title = 'Study Materials & Diagnostic Video Hub',
  subtitle = 'Curated video lessons, formula guides, and worksheets published by your instructors',
  onTriggerQuiz,
  clearedTopics,
  onToggleCleared,
}: ResourceFeedProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [localClearedTopics, setLocalClearedTopics] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!clearedTopics && typeof window !== 'undefined') {
      const saved = localStorage.getItem('learngraph_cleared_topics');
      if (saved) {
        try {
          setLocalClearedTopics(new Set(JSON.parse(saved)));
        } catch (e) {}
      }
    }
  }, [clearedTopics]);

  const effectiveClearedTopics = clearedTopics || localClearedTopics;

  const handleToggleTopic = (topic: string) => {
    if (onToggleCleared) {
      onToggleCleared(topic);
    } else {
      setLocalClearedTopics((prev) => {
        const next = new Set(prev);
        if (next.has(topic)) next.delete(topic);
        else next.add(topic);
        if (typeof window !== 'undefined') {
          localStorage.setItem('learngraph_cleared_topics', JSON.stringify(Array.from(next)));
        }
        return next;
      });
    }
  };

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/resources');
      const data = await res.json();
      if (data.success && Array.isArray(data.resources)) {
        setResources(data.resources);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleDelete = async (id: string, resourceTitle: string) => {
    if (!confirm(`Are you sure you want to remove "${resourceTitle}" from the classroom?`)) {
      return;
    }
    setIsDeletingId(id);
    try {
      const res = await fetch(`/api/resources?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setResources((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert(data.error || 'Failed to delete resource');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Error deleting resource');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Extract unique topics for filter
  const allTopics = Array.from(
    new Set(resources.map((r) => r.targetTopic).filter(Boolean))
  );

  // Filter resources
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      !searchQuery ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.targetTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'all' || resource.type === selectedType;

    const matchesTopic = selectedTopic === 'all' || resource.targetTopic === selectedTopic;

    return matchesSearch && matchesType && matchesTopic;
  });

  // Check if resource is recommended for student
  const isRecommended = (resource: Resource) => {
    if (!recommendedTopics || recommendedTopics.length === 0) return false;
    return recommendedTopics.some(
      (topic) =>
        resource.targetTopic.toLowerCase().includes(topic.toLowerCase()) ||
        topic.toLowerCase().includes(resource.targetTopic.toLowerCase())
    );
  };

  // Helper to open or download PDF
  const handleOpenPdf = (resource: Resource) => {
    if (!resource.url) return;

    if (resource.url.startsWith('data:')) {
      // Open in new tab or trigger download
      const win = window.open();
      if (win) {
        win.document.write(
          `<iframe src="${resource.url}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
        );
        win.document.title = resource.fileName || resource.title;
      } else {
        const link = document.createElement('a');
        link.href = resource.url;
        link.download = resource.fileName || `${resource.title}.pdf`;
        link.click();
      }
    } else {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span className="text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-400">
              Curated Study Vault
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
            {title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <button
          onClick={fetchResources}
          className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : ''}`} />
          <span>Refresh Materials</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, lesson name, or formula..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 text-slate-900 dark:text-white font-medium"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: 'all', label: 'All Formats' },
              { id: 'video', label: 'Videos', icon: Youtube },
              { id: 'pdf', label: 'PDFs & Guides', icon: FileText },
              { id: 'link', label: 'Interactive', icon: ExternalLink },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                    selectedType === type.id
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Filter Pills */}
        {allTopics.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1">
              Curriculum:
            </span>
            <button
              onClick={() => setSelectedTopic('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors cursor-pointer ${
                selectedTopic === 'all'
                  ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Topics
            </button>
            {allTopics.map((topic) => {
              const isRec = recommendedTopics.some((t) =>
                topic.toLowerCase().includes(t.toLowerCase())
              );
              const isTopicCleared = effectiveClearedTopics.has(topic);
              return (
                <div key={topic} className="inline-flex items-center space-x-1 shrink-0">
                  <button
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-2.5 py-1 rounded-full text-[11px] transition-colors flex items-center space-x-1 cursor-pointer ${
                      selectedTopic === topic
                        ? 'bg-indigo-600 text-white font-bold'
                        : isTopicCleared
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-semibold'
                        : isRec
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isTopicCleared ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    ) : isRec ? (
                      <Sparkles className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />
                    ) : null}
                    <span>{topic}</span>
                    {isTopicCleared && <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold ml-0.5">• Cleared</span>}
                  </button>

                  {/* Prominent Test My Knowledge trigger next to cleared / reviewed topics */}
                  {onTriggerQuiz && isTopicCleared && (
                    <button
                      type="button"
                      onClick={() => onTriggerQuiz(topic)}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 flex items-center space-x-1 shadow-2xs hover:scale-105 transition-all cursor-pointer"
                      title={`Test My Knowledge on ${topic}`}
                    >
                      <Sparkles className="w-3 h-3 text-slate-900" />
                      <span>Test Knowledge</span>
                    </button>
                  )}
                </div>
              );
            })}

            {onTriggerQuiz && selectedTopic !== 'all' && (
              <button
                onClick={() => onTriggerQuiz(selectedTopic)}
                className="ml-auto px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-xs flex items-center space-x-1.5 hover:scale-105 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Test My Knowledge on {selectedTopic} →</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-pulse"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredResources.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Learning Materials Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedType !== 'all' || selectedTopic !== 'all'
              ? 'No resources match your active search and filter criteria. Try resetting filters.'
              : 'Your instructors have not published any class materials yet.'}
          </p>
        </div>
      )}

      {/* Responsive Resource Cards Grid (1 col on mobile, 2 on tablet, 3 on desktop) */}
      {!isLoading && filteredResources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => {
            const embedUrl = resource.type === 'video' ? getYouTubeEmbedUrl(resource.url) : null;
            const isRec = isRecommended(resource);

            return (
              <div
                key={resource.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  isRec
                    ? 'border-rose-300 dark:border-rose-900/80 ring-2 ring-rose-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Card Top: Badges and Header */}
                <div className="p-5 pb-3 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {/* Format Type Badge */}
                    <span
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                        resource.type === 'video'
                          ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                          : resource.type === 'pdf'
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900'
                          : 'bg-cyan-50 dark:bg-cyan-950/50 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-900'
                      }`}
                    >
                      {resource.type === 'video' ? (
                        <Youtube className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      ) : resource.type === 'pdf' ? (
                        <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      ) : (
                        <ExternalLink className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      )}
                      <span>
                        {resource.type === 'video'
                          ? 'YouTube Lesson'
                          : resource.type === 'pdf'
                          ? 'PDF Study Guide'
                          : 'Interactive Tool'}
                      </span>
                    </span>

                    {/* Recommendation Badge */}
                    {isRec && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs">
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Recommended for You</span>
                      </span>
                    )}

                    {/* Teacher Delete Action */}
                    {isTeacherView && (
                      <button
                        onClick={() => handleDelete(resource.id, resource.title)}
                        disabled={isDeletingId === resource.id}
                        title="Delete resource"
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Title & Topic */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      {resource.targetTopic}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {resource.title}
                    </h3>
                  </div>

                  {/* Description */}
                  {resource.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {resource.description}
                    </p>
                  )}
                </div>

                {/* Media / Action Body */}
                <div className="px-5 pb-5 pt-1 space-y-4">
                  {/* VIDEO: Native Responsive YouTube Iframe */}
                  {resource.type === 'video' && embedUrl && (
                    <div className="space-y-2">
                      <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-xs border border-slate-200 dark:border-slate-800">
                        <iframe
                          src={embedUrl}
                          title={resource.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium"
                      >
                        <span>Open directly on YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* PDF: Download / Open Button Card */}
                  {resource.type === 'pdf' && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 dark:from-indigo-950/30 dark:to-slate-805/80 border border-indigo-100 dark:border-indigo-900/60 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {resource.fileName || `${resource.title}.pdf`}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {resource.fileSize || 'PDF Document'} • Instant Access
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleOpenPdf(resource)}
                        className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download / Open PDF</span>
                      </button>
                    </div>
                  )}

                  {/* EXTERNAL LINK: Direct Button */}
                  {resource.type === 'link' && (
                    <div className="p-4 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-100 dark:border-cyan-900/60 space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-xs">
                          <ExternalLink className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {resource.url.replace(/^https?:\/\//, '')}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Interactive Web Tool</p>
                        </div>
                      </div>

                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center space-x-1.5 block text-center"
                      >
                        <span>Open Interactive Tool</span>
                        <ExternalLink className="w-3.5 h-3.5 ml-1 inline-block" />
                      </a>
                    </div>
                  )}

                  {/* Topic Status & Prominent "Test My Knowledge" Trigger */}
                  <div className="p-3 bg-slate-50/90 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleTopic(resource.targetTopic)}
                        className={`inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                          effectiveClearedTopics.has(resource.targetTopic)
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Mark topic as reviewed / cleared"
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${
                          effectiveClearedTopics.has(resource.targetTopic) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                        }`} />
                        <span>{effectiveClearedTopics.has(resource.targetTopic) ? 'Topic Cleared ✓' : 'Mark Reviewed'}</span>
                      </button>

                      {effectiveClearedTopics.has(resource.targetTopic) ? (
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                          Concept Cleared
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Study to clear</span>
                      )}
                    </div>

                    {/* Prominent "Test My Knowledge" button next to reviewed/cleared topics */}
                    {onTriggerQuiz && (
                      <button
                        onClick={() => onTriggerQuiz(resource.targetTopic)}
                        className={`w-full py-2.5 px-3 rounded-xl font-black text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer ${
                          effectiveClearedTopics.has(resource.targetTopic)
                            ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-rose-600 hover:from-indigo-700 hover:to-rose-700 text-white shadow-indigo-600/30 ring-2 ring-indigo-400/30 hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Sparkles className={`w-3.5 h-3.5 ${
                          effectiveClearedTopics.has(resource.targetTopic) ? 'text-amber-300 animate-pulse' : 'text-slate-400'
                        }`} />
                        <span>
                          {effectiveClearedTopics.has(resource.targetTopic)
                            ? `Test My Knowledge on ${resource.targetTopic} →`
                            : `Test My Knowledge →`}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Card Footer: Metadata */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1 truncate">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{resource.authorName}</span>
                    </span>
                    <span className="shrink-0">
                      {new Date(resource.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
