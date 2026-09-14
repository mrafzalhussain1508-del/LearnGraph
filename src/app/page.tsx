'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  UploadCloud, 
  School, 
  BookOpen, 
  BrainCircuit, 
  Target, 
  BarChart3, 
  CheckCircle2, 
  FileCheck, 
  TrendingUp,
  Layers,
  Search,
  Compass
} from 'lucide-react';
import HeroTransformCard from '@/components/HeroTransformCard';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Subtle decorative background grids */}
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] dark:bg-[radial-gradient(#312e81_1px,transparent_1px)] [background-size:20px_20px] opacity-60 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-200/40 to-cyan-100/40 dark:from-indigo-900/30 dark:to-cyan-900/20 blur-3xl -z-10 rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* 1. Badge: Fades in and slides down slightly */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>AI-Powered Answer Sheet Diagnostic Platform</span>
            </motion.div>

            {/* 2. Main Heading: Slides up with a smooth spring effect. Delay: 0.1s */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]"
            >
              LearnGraph —{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-400 dark:via-blue-400 dark:to-cyan-300 bg-clip-text text-transparent">
                From Marks to Understanding
              </span>
            </motion.h1>

            {/* 3. Subheadline: Fades in and slides up. Delay: 0.2s */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
            >
              A <strong>72/100</strong> doesn't teach a student what they got wrong. LearnGraph analyzes handwritten working steps to expose exact conceptual misconceptions, turning raw tests into structured study guides for students and surgical reteach roadmaps for teachers.
            </motion.p>

            {/* 4. Button Group: Fades in together (Delay: 0.3s) with Hover Micro-Interactions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              className="flex flex-wrap items-center justify-center gap-3 pt-2"
            >
              {/* Primary Blue Button: scale 1.05 with gentle shadow glow */}
              <motion.div 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Link
                  href="/upload"
                  className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-200"
                >
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload Test Paper</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>

              {/* Secondary Button: scale 1.02 */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Link
                  href="/teacher"
                  className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200"
                >
                  <School className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Teacher Class View</span>
                </Link>
              </motion.div>

              {/* Secondary Button: scale 1.02 */}
              <motion.div 
                whileHover={{ scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Link
                  href="/student"
                  className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold text-sm border border-slate-200 dark:border-slate-700 shadow-xs hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md transition-all duration-200"
                >
                  <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>Student Study Guide</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* 5. Bottom Dashboard Card: Springs up from below (y: 50 to 0) with delay 0.5s */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.5 }}
            className="mt-14"
          >
            <HeroTransformCard />
          </motion.div>
        </div>
      </section>

      {/* 2. THREE-STEP "HOW IT WORKS" SECTION */}
      <motion.section 
        className="py-20 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <motion.div 
            className="text-center max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">
              The Cognitive Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How LearnGraph Operates in 3 Simple Steps
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mt-3 text-sm sm:text-base">
              Moving away from summative punishment to formative mastery acceleration.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line on desktop */}
            <div className="hidden md:block absolute top-1/2 left-[18%] right-[18%] h-0.5 bg-gradient-to-r from-indigo-200 via-blue-300 to-indigo-200 dark:from-indigo-900 dark:via-blue-800 dark:to-indigo-900 -translate-y-8 -z-0"></div>

            {/* Step 1: 0.1s delay */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-indigo-600/30">
                  01
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Upload Answer Sheet
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Snap or scan handwritten student math exams. Multimodal AI performs Optical Character Recognition (OCR) directly across messy pencil annotations, cancelled working, and handwritten figures.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Direct OCR Intake</span>
                <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </motion.div>

            {/* Step 2: 0.3s delay (0.2s stagger) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:border-indigo-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-900 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-indigo-900/30">
                  02
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Cognitive Gap Diagnosis
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  The model looks beyond arithmetic slips to detect root structural misunderstandings—such as shifting functions the wrong direction or ignoring domain restrictions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Misconception Detection</span>
                <BrainCircuit className="w-4 h-4 text-indigo-400" />
              </div>
            </motion.div>

            {/* Step 3: 0.5s delay (0.2s stagger) */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="relative bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:hover:border-cyan-500/50 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-lg mb-5 shadow-md shadow-cyan-600/30">
                  03
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Actionable Mastery Prescriptions
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Students receive clean, color-coded study notebooks detailing the exact rules to fix errors. Teachers receive a Section Heatmap with tailored 15-minute reteach strategies.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Targeted Intervention</span>
                <Target className="w-4 h-4 text-cyan-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* 3. PARADIGM COMPARISON: RAW MARKS VS DEEP UNDERSTANDING */}
      <motion.section 
        className="py-20 bg-slate-50/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 transition-colors"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
          <motion.div 
            className="text-center max-w-3xl mx-auto mb-16 space-y-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-red-400">
              The Educational Problem
            </span>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Traditional Grading Hides What Students Truly Understand
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              Raw scores reduce rich mathematical reasoning down to a single cold number. LearnGraph exposes the root causes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* The Old Way: Slide in subtly from the left (x: -30 to 0) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-rose-200 dark:border-rose-950/60 shadow-xs space-y-4 relative hover:shadow-md transition-all"
            >
              <div className="absolute top-4 right-4 bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                Traditional Grading
              </div>
              <div className="flex items-center space-x-2 text-rose-600 dark:text-red-400">
                <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center font-bold">
                  ✕
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">The Raw Marks Illusion</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A student receives 72/100 marked in red ink at the top of the exam paper.
              </p>
              <ul className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Zero Formative Insight:</strong> Student does not know which 28% was missed or why they missed it.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Blind Reteaching:</strong> Teacher has to spend hours manually skimming 30 papers to discover common mistakes.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Anxiety & Discouragement:</strong> Emphasizes evaluation instead of growth and diagnostic intervention.</span>
                </li>
              </ul>
            </motion.div>

            {/* The LearnGraph Way: Slide in subtly from the right (x: 30 to 0) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-7 border border-emerald-300 dark:border-emerald-950/60 shadow-xs space-y-4 relative hover:shadow-md transition-all"
            >
              <div className="absolute top-4 right-4 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                LearnGraph Standard
              </div>
              <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center font-bold">
                  ✓
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">The Topic Understanding Engine</h4>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Every line of student scratch work is indexed against a domain concept tree.
              </p>
              <ul className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span><strong>Targeted Remediation:</strong> Students get a personalized notebook guide pinpointing exact misconceptions in yellow highlight.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span><strong>Traffic Light Classroom Map:</strong> Teachers spot class-wide red zones (e.g. 35% on Graphs) in 3 seconds flat.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-500 font-bold">✔</span>
                  <span><strong>15-Minute Reteach Plans:</strong> Immediate, AI-recommended visual activities and counter-intuitive examples for next class.</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Quick Nav Cards: Staggered Fade-Up with hover micro-interactions */}
          <div className="mt-12 grid sm:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/teacher"
                className="group p-5 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between shadow-2xs h-full"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                      Explore Teacher Classroom Map
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Section A analytics with horizontal bar charts & AI reteach guidance
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/student"
                className="group p-5 bg-white dark:bg-slate-900 hover:bg-rose-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700 transition-all flex items-center justify-between shadow-2xs h-full"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
                      Explore Student Study Guide
                    </h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Aesthetic notebook layout with red headers & yellow highlights
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
