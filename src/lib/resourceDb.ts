import fs from 'fs';
import path from 'path';

export type ResourceType = 'pdf' | 'video' | 'link';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url: string; // YouTube embed/watch URL, External Link, or PDF data URI / storage URL
  fileName?: string;
  fileSize?: string;
  targetClass: string; // e.g. "Grade 10 • Section A"
  targetTopic: string; // e.g. "Graph Transformations", "Quadratic Equations & Roots"
  tags: string[];
  authorName: string;
  authorRole: string;
  createdAt: string;
}

export interface CreateResourceInput {
  title: string;
  description: string;
  type: ResourceType;
  url: string;
  fileName?: string;
  fileSize?: string;
  targetClass?: string;
  targetTopic?: string;
  tags?: string[];
  authorName?: string;
  authorRole?: string;
}

// Initial realistic educational seed resources for math remediation
const SEED_RESOURCES: Resource[] = [
  {
    id: 'res-01',
    title: 'Mastering Horizontal & Vertical Graph Shifts',
    description: 'A 12-minute breakdown of the Horizontal Translation Rule. Understand why f(x - 4) shifts right instead of left, with dynamic Desmos graphs.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=kYv_w2lU32g',
    targetClass: 'Grade 10 • Section A',
    targetTopic: 'Graph Transformations',
    tags: ['Graph Shifts', 'Common Misconceptions', 'Core Curriculum'],
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'teacher',
    createdAt: '2026-09-10T14:30:00.000Z',
  },
  {
    id: 'res-02',
    title: 'The Ghost Parentheses Rule: Quadratic Formula Cheat Sheet',
    description: 'Never drop a negative sign again. This one-page reference sheet covers substitution into -b ± √(b² - 4ac) when b or c is negative.',
    type: 'pdf',
    url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbMyAwIFJdCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnRyYWlsZXIKPDwKL1Jvb3QgMSAwIFIKPj4KJSVFT0YK',
    fileName: 'Ghost_Parentheses_Quadratic_Formula_Guide.pdf',
    fileSize: '1.4 MB',
    targetClass: 'Grade 10 • Section A',
    targetTopic: 'Quadratic Equations & Roots',
    tags: ['Formula Cheat Sheet', 'Negative Signs', 'Algebra'],
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'teacher',
    createdAt: '2026-09-11T09:15:00.000Z',
  },
  {
    id: 'res-03',
    title: 'Interactive Desmos Graph: Dynamic Function Transformer',
    description: 'Direct interactive slider sandbox for testing f(x - h) + k in real time. Manipulate vertex coordinates and reflections across the x-axis.',
    type: 'link',
    url: 'https://www.desmos.com/calculator/transformations',
    targetClass: 'Grade 10 • Section A',
    targetTopic: 'Graph Transformations',
    tags: ['Interactive Sandbox', 'Desmos', 'Visualizer'],
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'teacher',
    createdAt: '2026-09-11T16:45:00.000Z',
  },
  {
    id: 'res-04',
    title: 'Function Domain, Inverses & Radical Restrictions',
    description: 'Step-by-step video lesson explaining how square root restrictions and non-zero denominator conditions dictate function domains.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=hVK0eWfEw-w',
    targetClass: 'Grade 10 • Section A',
    targetTopic: 'Function Domain & Inverses',
    tags: ['Domain & Range', 'Radicals', 'Video Lesson'],
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'teacher',
    createdAt: '2026-09-12T11:20:00.000Z',
  },
  {
    id: 'res-05',
    title: 'Midterm Diagnostic Reteach Worksheet & Solution Key',
    description: 'Comprehensive practice problem set targeting the top 4 cognitive misconceptions diagnosed from the September 2026 midterm exam.',
    type: 'pdf',
    url: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbMyAwIFJdCj4+CmVuZG9iagozIDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgMiAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCnRyYWlsZXIKPDwKL1Jvb3QgMSAwIFIKPj4KJSVFT0YK',
    fileName: 'Midterm_Reteach_Practice_SectionA.pdf',
    fileSize: '2.8 MB',
    targetClass: 'Grade 10 • Section A',
    targetTopic: 'Linear Equations & Systems',
    tags: ['Practice Worksheet', 'Midterm Reteach', 'Self Study'],
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'teacher',
    createdAt: '2026-09-12T18:00:00.000Z',
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __learngraph_resource_db: Map<string, Resource> | undefined;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'resources.json');

function loadPersistedResources(): Resource[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading persisted resources:', err);
  }
  return [];
}

function persistResources(resources: Resource[]): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(resources, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving resources to disk:', err);
  }
}

function initResourceMap(): Map<string, Resource> {
  const map = new Map<string, Resource>();

  // Add seed resources first
  for (const res of SEED_RESOURCES) {
    map.set(res.id, res);
  }

  // Overlay persisted resources
  const persisted = loadPersistedResources();
  for (const res of persisted) {
    map.set(res.id, res);
  }

  return map;
}

class ResourceDatabase {
  private resources: Map<string, Resource>;

  constructor() {
    if (!global.__learngraph_resource_db) {
      global.__learngraph_resource_db = initResourceMap();
    }
    this.resources = global.__learngraph_resource_db;
  }

  private save(): void {
    persistResources(Array.from(this.resources.values()));
  }

  getAll(): Resource[] {
    return Array.from(this.resources.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getById(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  getByTopic(topic: string): Resource[] {
    const term = topic.toLowerCase().trim();
    return this.getAll().filter(
      (r) => r.targetTopic.toLowerCase().includes(term) || r.tags.some((t) => t.toLowerCase().includes(term))
    );
  }

  create(input: CreateResourceInput): Resource {
    const id = `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newResource: Resource = {
      id,
      title: input.title.trim(),
      description: input.description.trim(),
      type: input.type,
      url: input.url.trim(),
      fileName: input.fileName?.trim(),
      fileSize: input.fileSize?.trim(),
      targetClass: input.targetClass?.trim() || 'Grade 10 • Section A',
      targetTopic: input.targetTopic?.trim() || 'General Mathematics',
      tags: input.tags && input.tags.length > 0 ? input.tags : ['Study Material'],
      authorName: input.authorName?.trim() || 'Dr. Sarah Jenkins',
      authorRole: input.authorRole?.trim() || 'teacher',
      createdAt: new Date().toISOString(),
    };

    this.resources.set(id, newResource);
    this.save();
    return newResource;
  }

  delete(id: string): boolean {
    const removed = this.resources.delete(id);
    if (removed) {
      this.save();
    }
    return removed;
  }
}

export const resourceDb = new ResourceDatabase();
