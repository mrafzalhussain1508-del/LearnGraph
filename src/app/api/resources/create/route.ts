import { NextRequest, NextResponse } from 'next/server';
import { resourceDb, ResourceType } from '@/lib/resourceDb';
import { verifyJWT } from '@/lib/jwt';

export const dynamic = 'force-dynamic';

/**
 * PRODUCTION STORAGE INTEGRATION SCAFFOLDING
 * =========================================================================
 * 1. AWS S3 / Cloudflare R2 Integration:
 *    To enable direct S3 / R2 uploads:
 *    ```ts
 *    import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
 *    const s3 = new S3Client({
 *      region: process.env.AWS_REGION,
 *      credentials: {
 *        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
 *        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
 *      }
 *    });
 *    // Upload buffer or generate Presigned URL:
 *    // const presignedUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket, Key }), { expiresIn: 3600 });
 *    ```
 *
 * 2. Uploadthing Integration:
 *    ```ts
 *    import { UTApi } from 'uploadthing/server';
 *    const utapi = new UTApi();
 *    // const uploadResult = await utapi.uploadFiles(file);
 *    // const fileUrl = uploadResult.data?.url;
 *    ```
 *
 * Currently, local Base64 data URIs and external video URLs are supported
 * directly with instant persistence to data/resources.json.
 * =========================================================================
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description = '',
      type,
      url,
      fileName,
      fileSize,
      targetClass = 'Grade 10 • Section A',
      targetTopic = 'General Mathematics',
      tags = [],
    } = body;

    // 1. Validation
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'A resource title is required.' },
        { status: 400 }
      );
    }

    const validTypes: ResourceType[] = ['pdf', 'video', 'link'];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Resource type must be "pdf", "video", or "link".' },
        { status: 400 }
      );
    }

    if (!url || typeof url !== 'string' || !url.trim()) {
      return NextResponse.json(
        { success: false, error: 'A valid document URL, video link, or file upload is required.' },
        { status: 400 }
      );
    }

    // 2. Identify Author from Session Cookie (with graceful fallback)
    const sessionCookie = req.cookies.get('learngraph_session')?.value;
    const userPayload = sessionCookie ? await verifyJWT(sessionCookie) : null;

    const authorName = userPayload?.name || body.authorName || 'Dr. Sarah Jenkins';
    const authorRole = userPayload?.role || 'teacher';

    // 3. Save to database
    const resource = resourceDb.create({
      title,
      description,
      type,
      url,
      fileName,
      fileSize,
      targetClass,
      targetTopic,
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      authorName,
      authorRole,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Resource published to student study desks successfully.',
        resource,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in /api/resources/create:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish resource. ' + (error?.message || '') },
      { status: 500 }
    );
  }
}
