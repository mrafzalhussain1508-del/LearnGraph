'use client';

import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Youtube, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Sparkles,
  Layers,
  Link as LinkIcon
} from 'lucide-react';
import { Resource, ResourceType } from '@/lib/resourceDb';

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}`;
  }
  if (url.includes('youtube.com/embed/')) return url;
  return null;
}

interface ResourceUploaderProps {
  onResourceCreated?: (resource: Resource) => void;
  defaultTopic?: string;
}

const TOPIC_PRESETS = [
  'Graph Transformations',
  'Quadratic Equations & Roots',
  'Linear Equations & Systems',
  'Function Domain & Inverses',
  'General Mathematics',
];

export default function ResourceUploader({ onResourceCreated, defaultTopic }: ResourceUploaderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('video');
  const [targetTopic, setTargetTopic] = useState(defaultTopic || 'Graph Transformations');
  const [targetClass, setTargetClass] = useState('Grade 10 • Section A');
  const [url, setUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // PDF file state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Drag & Drop for PDFs
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg(null);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg('Please select a valid PDF document.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 15MB limit.');
      return;
    }

    setPdfFile(file);
    if (!title) {
      // Auto-populate title from clean filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName);
    }

    // Convert to data URI for immediate persistent storage and in-browser preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPdfBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearPdfFile = () => {
    setPdfFile(null);
    setPdfBase64('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim()) {
      setErrorMsg('Please provide a title for the resource.');
      return;
    }

    let finalUrl = url.trim();
    let fileName: string | undefined = undefined;
    let fileSize: string | undefined = undefined;

    if (resourceType === 'pdf') {
      if (!pdfBase64 || !pdfFile) {
        setErrorMsg('Please drag-and-drop or select a PDF document to upload.');
        return;
      }
      finalUrl = pdfBase64;
      fileName = pdfFile.name;
      fileSize = `${(pdfFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      if (!finalUrl) {
        setErrorMsg(
          resourceType === 'video'
            ? 'Please enter a valid YouTube video link.'
            : 'Please enter an external resource URL.'
        );
        return;
      }

      if (resourceType === 'video') {
        const embedCheck = getYouTubeEmbedUrl(finalUrl);
        if (!embedCheck) {
          setErrorMsg('Please enter a valid YouTube URL (e.g. https://www.youtube.com/watch?v=...)');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      const parsedTags = tagsInput
        ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
        : [targetTopic, 'Class Notes'];

      const res = await fetch('/api/resources/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          type: resourceType,
          url: finalUrl,
          fileName,
          fileSize,
          targetClass,
          targetTopic,
          tags: parsedTags,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish resource.');
      }

      setSuccessMsg(`"${data.resource.title}" was published to the class study hub!`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setUrl('');
      setTagsInput('');
      clearPdfFile();

      if (onResourceCreated && data.resource) {
        onResourceCreated(data.resource);
      }
    } catch (err: any) {
      console.error('Submit error:', err);
      setErrorMsg(err.message || 'Network error publishing resource. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewEmbedUrl = resourceType === 'video' ? getYouTubeEmbedUrl(url.trim()) : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
      <div className="flex items-center justify-between pb-5 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Publish Class Learning Material</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Share remediation videos, PDFs, and interactive tools with students</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
          <Sparkles className="w-3 h-3 mr-1 text-indigo-500 dark:text-indigo-400" /> Auto-Synced with Student Desks
        </span>
      </div>

      {/* Success Alert */}
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-3 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Resource Published Successfully</p>
            <p className="text-emerald-700 dark:text-emerald-300 mt-0.5">{successMsg}</p>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start space-x-3 text-xs text-rose-800 dark:text-rose-300 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Upload Error</p>
            <p className="text-rose-700 dark:text-rose-300 mt-0.5">{errorMsg}</p>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Resource Type Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Resource Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setResourceType('video');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                resourceType === 'video'
                  ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-2 ring-rose-500/20 text-rose-950 dark:text-rose-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                resourceType === 'video' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <Youtube className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">YouTube Video</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Embedded Player</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setResourceType('pdf');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                resourceType === 'pdf'
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-indigo-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                resourceType === 'pdf' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">PDF Document</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">File Upload / Guide</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setResourceType('link');
                setErrorMsg(null);
              }}
              className={`p-3 rounded-2xl border text-left transition-all flex items-center space-x-3 ${
                resourceType === 'link'
                  ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20 text-cyan-950 dark:text-cyan-200 font-bold'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                resourceType === 'link' ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                <ExternalLink className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold">External Link</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Desmos / Tool</p>
              </div>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Resource Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mastering Horizontal Shifts & Negative Sign Rules"
            className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Target Class & Target Topic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Curriculum Topic <span className="text-rose-500">*</span>
            </label>
            <select
              value={targetTopic}
              onChange={(e) => setTargetTopic(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
            >
              {TOPIC_PRESETS.map((topic) => (
                <option key={topic} value={topic} className="dark:bg-slate-800 dark:text-white">
                  {topic}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Class / Cohort
            </label>
            <select
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium"
            >
              <option value="Grade 10 • Section A" className="dark:bg-slate-800 dark:text-white">Grade 10 • Section A (Math)</option>
              <option value="Grade 10 • Section B" className="dark:bg-slate-800 dark:text-white">Grade 10 • Section B (Math)</option>
              <option value="All Enrolled Classes" className="dark:bg-slate-800 dark:text-white">All Enrolled Classes</option>
            </select>
          </div>
        </div>

        {/* Dynamic Input Zone: Drag-and-Drop for PDF OR URL for Video/Link */}
        {resourceType === 'pdf' ? (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Upload PDF Study Material <span className="text-rose-500">*</span>
            </label>

            {pdfFile ? (
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{pdfFile.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to publish
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearPdfFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-2">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click to select PDF or drag and drop here
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Reteach worksheets, formula cheat sheets, solutions (Max 15MB)
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {resourceType === 'video' ? 'YouTube Video URL' : 'External Link URL'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                {resourceType === 'video' ? <Youtube className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              </div>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  resourceType === 'video'
                    ? 'https://www.youtube.com/watch?v=kYv_w2lU32g'
                    : 'https://www.desmos.com/calculator/...'
                }
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Live YouTube Preview */}
            {previewEmbedUrl && (
              <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Youtube className="w-3.5 h-3.5 text-rose-600" />
                  <span>Live Video Player Preview</span>
                </p>
                <div className="aspect-video rounded-xl overflow-hidden shadow-xs bg-black max-w-md">
                  <iframe
                    src={previewEmbedUrl}
                    title="YouTube Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Teacher Notes & Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explain what misconceptions this video or worksheet targets, or what students should look out for..."
            className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Optional Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
            Tags (Optional, comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. Midterm Review, Graph Shifts, Homework"
            className="w-full px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Resource to Classroom...</span>
            </>
          ) : (
            <>
              <UploadCloud className="w-4 h-4" />
              <span>Publish to Student Study Desks</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
