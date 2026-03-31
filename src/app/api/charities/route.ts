import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// Fallback charities when Supabase is unavailable
const FALLBACK_CHARITIES = [
  {
    id: 'fallback-1',
    name: 'Golf for Good Foundation',
    description: 'Empowering underprivileged youth through golf programs. We provide equipment, coaching, and scholarships to young people who would otherwise never have the opportunity to play.',
    image_url: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=600',
    upcoming_events: [{ title: 'Annual Charity Golf Day', date: '2026-06-15', description: 'Join us for our biggest fundraising event!', location: 'St Andrews Links' }],
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-2',
    name: 'Green Hearts Initiative',
    description: 'Promoting mental health awareness through outdoor sports and community engagement. Our programs combine the therapeutic benefits of golf with professional mental health support.',
    image_url: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600',
    upcoming_events: [{ title: 'Mental Health Awareness Walk & Golf', date: '2026-05-20', description: 'A combined wellness event', location: 'Royal Liverpool' }],
    is_featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-3',
    name: 'Fairway Future Trust',
    description: 'Building sustainable communities by converting unused land into public golf courses and green spaces. Every project creates jobs, provides recreation, and improves local environments.',
    image_url: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600',
    upcoming_events: [{ title: 'Community Green Space Opening', date: '2026-07-10', description: 'Celebrate the opening of our newest community course', location: 'Manchester' }],
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-4',
    name: 'Swing for Change',
    description: 'Dedicated to using sport as a vehicle for social change. We run after-school programs, holiday camps, and mentoring initiatives that give young people purpose and direction.',
    image_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
    upcoming_events: [{ title: 'Summer Camp Registration Open', date: '2026-04-01', description: 'Register for our summer youth program', location: 'Birmingham' }],
    is_featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-5',
    name: 'Veterans on the Green',
    description: 'Supporting military veterans through golf-based rehabilitation and social programs. Golf provides structure, camaraderie, and a pathway back to civilian life.',
    image_url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600',
    upcoming_events: [{ title: 'Veterans Memorial Tournament', date: '2026-11-11', description: 'Annual tournament honoring our veterans', location: 'Gleneagles' }],
    is_featured: true,
    created_at: new Date().toISOString(),
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  try {
    let query = supabaseAdmin.from('charities').select('*').order('is_featured', { ascending: false }).order('name');

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    // If Supabase is unavailable, return fallback data
    console.error('Charities API error (using fallback):', err);
    let filtered = FALLBACK_CHARITIES;
    if (search) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }
    return NextResponse.json(filtered);
  }
}
