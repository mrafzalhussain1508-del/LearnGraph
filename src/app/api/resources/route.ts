import { NextRequest, NextResponse } from 'next/server';
import { resourceDb, ResourceType } from '@/lib/resourceDb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeFilter = searchParams.get('type') as ResourceType | null;
    const topicFilter = searchParams.get('topic');
    const searchQuery = searchParams.get('search')?.toLowerCase().trim();

    let resources = resourceDb.getAll();

    if (typeFilter && ['pdf', 'video', 'link'].includes(typeFilter)) {
      resources = resources.filter((r) => r.type === typeFilter);
    }

    if (topicFilter && topicFilter !== 'all') {
      const lowerTopic = topicFilter.toLowerCase().trim();
      resources = resources.filter(
        (r) =>
          r.targetTopic.toLowerCase().includes(lowerTopic) ||
          r.tags.some((t) => t.toLowerCase().includes(lowerTopic))
      );
    }

    if (searchQuery) {
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery) ||
          r.description.toLowerCase().includes(searchQuery) ||
          r.targetTopic.toLowerCase().includes(searchQuery) ||
          r.tags.some((t) => t.toLowerCase().includes(searchQuery))
      );
    }

    return NextResponse.json({
      success: true,
      count: resources.length,
      resources,
    });
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve resources.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Resource ID is required for deletion.' },
        { status: 400 }
      );
    }

    const removed = resourceDb.delete(id);
    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Resource not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete resource.' },
      { status: 500 }
    );
  }
}
