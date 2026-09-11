import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { TopicRating } from '@/lib/types';

const RATINGS_FILE = path.join(process.cwd(), 'src', 'data', 'topic_ratings.json');

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

// Helper to safely write ratings to file
function writeRatingsToFile(data: Record<string, TopicRating[]>): boolean {
  try {
    const dir = path.dirname(RATINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(RATINGS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to write topic_ratings.json:', err);
    return false;
  }
}

// Helper to compute stats for a topic
function calculateStats(ratings: TopicRating[]) {
  const totalVotes = ratings.length;
  const upvotes = ratings.filter((r) => r.userVote === 'up').length;
  const downvotes = ratings.filter((r) => r.userVote === 'down').length;
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

    // Optionally hydrate with Supabase if available
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('topic_ratings')
          .select('*')
          .eq('topic_id', topicId);

        if (!error && data && data.length > 0) {
          const dbRatings: TopicRating[] = data.map((row: any) => ({
            id: row.id || `db-${row.user_id}-${row.topic_id}`,
            topicId: row.topic_id,
            userId: row.user_id,
            userName: row.user_name || 'Member',
            userAvatar: row.user_avatar || '',
            userVote: row.vote || undefined,
            starRating: row.stars || undefined,
            feedbackText: row.feedback || '',
            createdAt: row.updated_at || row.created_at || new Date().toISOString()
          }));

          // Merge db ratings with file ratings (avoid duplicates by userId/id)
          const mergedMap = new Map<string, TopicRating>();
          topicList.forEach((r) => {
            const key = r.userId || r.id;
            mergedMap.set(key, r);
          });
          dbRatings.forEach((r) => {
            const key = r.userId || r.id;
            mergedMap.set(key, r);
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
      list.push(ratingEntry);
    }

    allRatings[topicId] = list;
    writeRatingsToFile(allRatings);

    // Also attempt Supabase upsert in background
    if (isSupabaseConfigured && userId && /^[0-9a-fA-F-]{36}$/.test(userId)) {
      supabase
        .from('topic_ratings')
        .upsert({
          topic_id: topicId,
          user_id: userId,
          vote: ratingEntry.userVote,
          stars: ratingEntry.starRating,
          feedback: ratingEntry.feedbackText,
          updated_at: now
        }, { onConflict: 'user_id,topic_id' })
        .then(() => {})
        .catch(() => {});
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
    console.error('Error saving rating:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to save rating' },
      { status: 500 }
    );
  }
}
