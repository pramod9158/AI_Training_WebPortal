import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { TopicComment } from '@/lib/types';

const COMMENTS_FILE = path.join(process.cwd(), 'src', 'data', 'topic_comments.json');

// Helper to get authenticated client if Bearer token passed in header
function getSupabaseClient(req?: NextRequest) {
  const authHeader = req?.headers.get('authorization') || req?.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseAnonKey) {
      return createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader }
        }
      });
    }
  }
  return supabase;
}

// Helper to safely read comments from file
function readCommentsFromFile(): Record<string, TopicComment[]> {
  try {
    if (!fs.existsSync(COMMENTS_FILE)) {
      const dir = path.dirname(COMMENTS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const content = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Failed to read topic_comments.json:', err);
    return {};
  }
}

// Helper to safely write comments to file (handles read-only serverless filesystems gracefully)
function writeCommentsToFile(data: Record<string, TopicComment[]>): boolean {
  try {
    const dir = path.dirname(COMMENTS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Gracefully handle read-only filesystems (e.g. Vercel)
    return false;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get('topicId');
  const allComments = readCommentsFromFile();

  if (topicId) {
    let topicList = allComments[topicId] || [];

    // Hydrate with Supabase if available
    if (isSupabaseConfigured) {
      try {
        const sb = getSupabaseClient(req);
        const { data, error } = await sb
          .from('topic_comments')
          .select('*')
          .eq('topic_id', topicId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Fetch user profiles to enrich any missing names or avatars
          const userIds = Array.from(new Set(data.map((d: any) => d.user_id).filter(Boolean)));
          let profileMap = new Map<string, { display_name?: string; avatar_url?: string }>();
          if (userIds.length > 0) {
            try {
              const { data: profiles } = await sb
                .from('user_profiles')
                .select('id, display_name, avatar_url')
                .in('id', userIds);
              if (profiles) {
                profiles.forEach((p: any) => profileMap.set(p.id, p));
              }
            } catch {}
          }

          const dbComments: TopicComment[] = data.map((d: any) => {
            const prof = profileMap.get(d.user_id);
            return {
              id: d.id,
              topicId: d.topic_id,
              userId: d.user_id,
              userName: d.user_name || prof?.display_name || 'Learner',
              userAvatar: d.user_avatar || prof?.avatar_url || '',
              content: d.content,
              isQuestion: Boolean(d.is_question),
              parentId: d.parent_id || undefined,
              upvotes: 0,
              userUpvoted: false,
              createdAt: d.created_at
            };
          });

          // Merge: Supabase comments + any pending local file comments
          const mergedMap = new Map<string, TopicComment>();
          dbComments.forEach((c) => mergedMap.set(c.id, c));
          topicList.forEach((c) => {
            if (!mergedMap.has(c.id)) {
              mergedMap.set(c.id, c);
            }
          });

          topicList = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          allComments[topicId] = topicList;
          writeCommentsToFile(allComments);
        }
      } catch (err) {
        console.warn('Error fetching comments from Supabase:', err);
      }
    }

    return NextResponse.json({
      success: true,
      topicId,
      comments: topicList
    });
  }

  return NextResponse.json({
    success: true,
    comments: allComments
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, userId, userName, userAvatar, content, isQuestion, parentId } = body;

    if (!topicId || !content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: 'topicId and content are required' },
        { status: 400 }
      );
    }

    const trimmed = content.trim();
    const allComments = readCommentsFromFile();
    const list = allComments[topicId] || [];

    const now = new Date().toISOString();
    let commentId = `cmt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Try Supabase insert
    if (isSupabaseConfigured) {
      try {
        const sb = getSupabaseClient(req);
        const isUserUuid = Boolean(userId && /^[0-9a-fA-F-]{36}$/.test(userId));
        const isParentUuid = Boolean(parentId && /^[0-9a-fA-F-]{36}$/.test(parentId));

        const payload: any = {
          topic_id: topicId,
          user_name: userName || 'Learner',
          user_avatar: userAvatar || '',
          content: trimmed,
          is_question: Boolean(isQuestion),
          created_at: now
        };

        if (isUserUuid) {
          payload.user_id = userId;
        }
        if (isParentUuid) {
          payload.parent_id = parentId;
        }

        const { data, error } = await sb.from('topic_comments').insert(payload).select().single();
        if (!error && data?.id) {
          commentId = data.id;
        } else if (error) {
          console.warn('Supabase comment insert failed in API route:', error.message);
        }
      } catch (err) {
        console.warn('Supabase comment insert caught error in API route:', err);
      }
    }

    const newComment: TopicComment = {
      id: commentId,
      topicId,
      userId: userId || 'anon',
      userName: userName || 'Learner',
      userAvatar: userAvatar || '',
      content: trimmed,
      isQuestion: Boolean(isQuestion),
      parentId: parentId || undefined,
      upvotes: 0,
      userUpvoted: false,
      createdAt: now
    };

    list.unshift(newComment);
    allComments[topicId] = list;
    writeCommentsToFile(allComments);

    return NextResponse.json({
      success: true,
      comment: newComment,
      comments: list
    });
  } catch (err: any) {
    console.error('Error in POST /api/comments:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');
    const topicId = searchParams.get('topicId');

    if (!commentId || !topicId) {
      return NextResponse.json(
        { success: false, error: 'commentId and topicId are required' },
        { status: 400 }
      );
    }

    // Delete from Supabase
    if (isSupabaseConfigured && /^[0-9a-fA-F-]{36}$/.test(commentId)) {
      try {
        const sb = getSupabaseClient(req);
        await sb.from('topic_comments').delete().eq('id', commentId);
      } catch (err) {
        console.warn('Failed to delete comment from Supabase:', err);
      }
    }

    // Delete from file cache
    const allComments = readCommentsFromFile();
    if (allComments[topicId]) {
      allComments[topicId] = allComments[topicId].filter(
        (c) => c.id !== commentId && c.parentId !== commentId
      );
      writeCommentsToFile(allComments);
    }

    return NextResponse.json({ success: true, commentId });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
