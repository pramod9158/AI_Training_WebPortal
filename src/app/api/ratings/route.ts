import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { TopicRating } from '@/lib/types';

const RATINGS_FILE = path.join(process.cwd(), 'src', 'data', 'topic_ratings.json');

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

// Helper to safely read ratings from file
function readRatingsFromFile(): Record<string, TopicRating[]> {
  try {
    if (!fs.existsSync(RATINGS_FILE)) {
      const dir = path.dirname(RATINGS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(RATINGS_FILE, JSON.stringify({}, null, 2), 'utf-8');
      return {};
    }
    const content = fs.readFileSync(RATINGS_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Failed to read topic_ratings.json:', err);
    return {};
  }
}

// Helper to safely write ratings to file (handles read-only serverless filesystems gracefully)
function writeRatingsToFile(data: Record<string, TopicRating[]>): boolean {
  try {
    const dir = path.dirname(RATINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Gracefully handle read-only filesystems (e.g. Vercel)
    return false;
  }
}

// Helper to compute stats for a topic
function calculateStats(ratings: TopicRating[]) {
  const upvotes = ratings.filter((r) => r.userVote === 'up').length;
  const downvotes = ratings.filter((r) => r.userVote === 'down').length;
  const totalVotes = upvotes + downvotes;
  const starRatings = ratings
    .map((r) => r.starRating)
    .filter((s): s is number => typeof s === 'number' && s > 0);

  const starRatingsCount = starRatings.length;
  const avgStars = starRatingsCount > 0
    ? Number((starRatings.reduce((sum, val) => sum + val, 0) / starRatingsCount).toFixed(1))
    : 0;

  return {
    totalVotes,
    upvotes,
    downvotes,
    avgStars,
    starRatingsCount
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get('topicId');

  const allRatings = readRatingsFromFile();

  if (topicId) {
    let topicList = allRatings[topicId] || [];

    // Hydrate with Supabase if available
    if (isSupabaseConfigured) {
      try {
        const sb = getSupabaseClient(req);
        const { data, error } = await sb
          .from('topic_ratings')
          .select('*')
          .eq('topic_id', topicId);

        if (!error && data && data.length > 0) {
          // Fetch user profiles to enrich ratings with author names and avatars
          const userIds = Array.from(new Set(data.map((r: any) => r.user_id).filter(Boolean)));
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
            } catch (pErr) {
              console.warn('Could not fetch user_profiles for ratings:', pErr);
            }
          }

          const dbRatings: TopicRating[] = data.map((row: any) => {
            const prof = profileMap.get(row.user_id);
            return {
              id: row.id || `db-${row.user_id}-${row.topic_id}`,
              topicId: row.topic_id,
              userId: row.user_id,
              userName: row.user_name || prof?.display_name || 'Member',
              userAvatar: row.user_avatar || prof?.avatar_url || '',
              userVote: row.vote || undefined,
              starRating: row.stars || undefined,
              feedbackText: row.feedback || '',
              createdAt: row.updated_at || row.created_at || new Date().toISOString()
            };
          });

          // Merge db ratings with file ratings (avoid duplicates by userId/id)
          const mergedMap = new Map<string, TopicRating>();
          topicList.forEach((r) => {
            const key = r.userId || r.id;
            mergedMap.set(key, r);
          });
          dbRatings.forEach((r) => {
            const key = r.userId || r.id;
            const existing = mergedMap.get(key);
            mergedMap.set(key, {
              ...r,
              userName: r.userName !== 'Member' ? r.userName : (existing?.userName || r.userName),
              userAvatar: r.userAvatar || existing?.userAvatar || ''
            });
          });

          topicList = Array.from(mergedMap.values());
          allRatings[topicId] = topicList;
          writeRatingsToFile(allRatings);
        }
      } catch (e) {
        // Fallback silently to file ratings
      }
    }

    // Sort newest reviews first
    const sorted = [...topicList].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const stats = calculateStats(sorted);

    return NextResponse.json({
      success: true,
      topicId,
      ratings: sorted,
      stats
    });
  }

  return NextResponse.json({
    success: true,
    ratings: allRatings
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topicId, userId, userName, userAvatar, userVote, starRating, feedbackText } = body;

    if (!topicId) {
      return NextResponse.json({ success: false, error: 'topicId is required' }, { status: 400 });
    }

    const allRatings = readRatingsFromFile();
    const list = allRatings[topicId] || [];

    const effectiveUserId = userId || `anon-${Date.now()}`;
    const existingIndex = list.findIndex(
      (r) => r.userId === effectiveUserId || (userId && r.userId === userId)
    );

    const now = new Date().toISOString();
    const ratingEntry: TopicRating = {
      id: existingIndex >= 0 ? list[existingIndex].id : `rat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      topicId,
      userId: effectiveUserId,
      userName: userName || (existingIndex >= 0 ? list[existingIndex].userName : 'Member'),
      userAvatar: userAvatar || (existingIndex >= 0 ? list[existingIndex].userAvatar : ''),
      userVote: userVote !== undefined ? userVote : (existingIndex >= 0 ? list[existingIndex].userVote : undefined),
      starRating: starRating !== undefined ? starRating : (existingIndex >= 0 ? list[existingIndex].starRating : undefined),
      feedbackText: feedbackText !== undefined ? feedbackText : (existingIndex >= 0 ? list[existingIndex].feedbackText : ''),
      createdAt: now
    };

    if (existingIndex >= 0) {
      list[existingIndex] = ratingEntry;
    } else {
      list.unshift(ratingEntry);
    }

    allRatings[topicId] = list;
    writeRatingsToFile(allRatings);

    // Supabase upsert
    if (isSupabaseConfigured && userId && /^[0-9a-fA-F-]{36}$/.test(userId)) {
      try {
        const sb = getSupabaseClient(req);
        const payload: any = {
          topic_id: topicId,
          user_id: userId,
          vote: ratingEntry.userVote || null,
          stars: ratingEntry.starRating || null,
          feedback: ratingEntry.feedbackText || '',
          updated_at: now
        };
        if (userName) payload.user_name = userName;
        if (userAvatar) payload.user_avatar = userAvatar;

        const { error } = await sb
          .from('topic_ratings')
          .upsert(payload, { onConflict: 'user_id,topic_id' });

        if (error && (error.message?.includes('column') || error.code === 'PGRST204')) {
          // If user_name/user_avatar columns don't exist yet on table, retry with standard columns
          delete payload.user_name;
          delete payload.user_avatar;
          await sb.from('topic_ratings').upsert(payload, { onConflict: 'user_id,topic_id' });
        }
      } catch (sbErr) {
        console.warn('Supabase rating upsert warning in API route:', sbErr);
      }
    }

    const sorted = [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const stats = calculateStats(sorted);

    return NextResponse.json({
      success: true,
      rating: ratingEntry,
      ratings: sorted,
      stats
    });
  } catch (err: any) {
    console.error('Error saving rating in /api/ratings:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save rating' },
      { status: 500 }
    );
  }
}
