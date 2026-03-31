'use client';

import { motion } from 'framer-motion';
import { Heart, Search, Calendar, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import type { Charity } from '@/types';

export default function CharitiesPage() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/charities?search=${encodeURIComponent(search)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCharities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search]);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Heart className="h-4 w-4" />
            Our Charity Partners
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
            Charities That <span className="text-amber-500">Matter</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Every charity on our platform has been vetted and verified. Choose the cause that speaks to your heart.
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search charities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
            />
          </div>
        </div>

        {/* Charity Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-80" />
            ))}
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No charities found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {charities.map((charity, i) => (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group"
              >
                {/* Image */}
                <div className="h-48 bg-linear-to-br from-amber-100 to-amber-200 relative overflow-hidden">
                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="h-16 w-16 text-amber-400" />
                    </div>
                  )}
                  {charity.is_featured && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                      <Star className="h-3 w-3" /> Featured
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{charity.name}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-3">{charity.description}</p>

                  {/* Upcoming Events */}
                  {charity.upcoming_events && charity.upcoming_events.length > 0 && (
                    <div className="border-t border-slate-100 pt-4 mt-4">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Upcoming Event</h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-amber-500" />
                          {charity.upcoming_events[0].title}
                        </div>
                        {charity.upcoming_events[0].location && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="h-3 w-3" />
                            {charity.upcoming_events[0].location}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
