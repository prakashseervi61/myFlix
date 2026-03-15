import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronDown, MonitorPlay } from 'lucide-react';
import { useTVDetails, useIMDbRating } from '../hooks/useTV';
// TV episodes natively fetched by useTVEpisodes but wait, apiService.getEpisodesByTmdbId is what the original uses.
// Let's add useTVEpisodesByTmdbId to useTV.js, or just use useQuery directly here since it's specific.
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';
import EpisodeCard from '../components/ui/EpisodeCard';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export function useTVEpisodesByTmdbId(tmdbId) {
  return useQuery({
    queryKey: ['tv', 'episodesByTmdbId', tmdbId],
    queryFn: () => apiService.getEpisodesByTmdbId(tmdbId),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    enabled: !!tmdbId,
  });
}

export default function TVShowDetails() {
  const { id: tmdbId } = useParams();
  const navigate = useNavigate();
  
  const { data: show, isLoading: loadingShow, error: errorShow } = useTVDetails(tmdbId);
  const { data: imdbRating } = useIMDbRating(show?.title);
  const { data: rawEpisodes, isLoading: episodesLoading } = useTVEpisodesByTmdbId(tmdbId);
  
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [availableSeasons, setAvailableSeasons] = useState([1]);
  
  const loading = loadingShow;
  const error = errorShow ? errorShow.message : null;
  const allEpisodes = rawEpisodes || [];

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tmdbId]);

  // Sync seasons when show or episodes load
  useEffect(() => {
    if (show && allEpisodes.length > 0) {
      const uniqueSeasons = [...new Set(allEpisodes.map(ep => ep.season))]
        .filter(s => s > 0)
        .sort((a, b) => a - b);
        
      if (uniqueSeasons.length > 0) {
        setAvailableSeasons(uniqueSeasons);
        setSelectedSeason(prev => uniqueSeasons.includes(prev) ? prev : uniqueSeasons[0]);
      }
    } else if (show?.seasons) {
      const seasonNumbers = show.seasons
        .filter(s => s.season_number > 0)
        .map(s => s.season_number)
        .sort((a, b) => a - b);
      if (seasonNumbers.length > 0) {
        setAvailableSeasons(seasonNumbers);
        setSelectedSeason(prev => seasonNumbers.includes(prev) ? prev : seasonNumbers[0]);
      }
    }
  }, [show, allEpisodes]);

  const episodes = allEpisodes.filter(ep => ep.season === selectedSeason);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">{error}</p>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (loading || !show) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
           <div className="w-full md:w-1/3 skeleton-loader min-h-[500px] rounded-xl" />
           <div className="w-full md:w-2/3 space-y-4">
              <div className="h-12 w-3/4 skeleton-loader rounded" />
              <div className="h-6 w-1/4 skeleton-loader rounded" />
              <div className="h-32 w-full skeleton-loader rounded" />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      
      {/* Background Cover */}
      <div className="absolute inset-0 h-[60vh] z-0 overflow-hidden">
        {show.backdrop && (
          <>
             <img src={show.backdrop} alt="" className="w-full h-full object-cover opacity-20" />
             <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
             <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Back</span>
        </button>

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12 pb-16">
          {/* Metadata Sidebar */}
          <div className="w-full md:w-[300px] lg:w-[350px] shrink-0">
             <div className="rounded-2xl overflow-hidden shadow-2xl relative bg-surface border border-white/5" style={{ viewTransitionName: 'shared-movie-poster' }}>
                {show.poster ? (
                  <img src={show.poster} alt={show.title} className="w-full h-auto object-cover" />
                ) : (
                  <div className="w-full aspect-[2/3] flex items-center justify-center bg-surface text-white/20">
                    <MonitorPlay size={64} />
                  </div>
                )}
             </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 flex flex-col pt-4">
             <div className="flex flex-wrap items-center gap-3 mb-4">
               {show.media_type === 'tv' && (
                 <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded tracking-wider">SERIES</span>
               )}
               <span className="text-white/60 font-medium text-sm border border-white/10 px-2 py-0.5 rounded">
                 {show.year}
               </span>
               <span className="text-white/60 font-medium text-sm">
                 {show.number_of_seasons} {show.number_of_seasons === 1 ? 'Season' : 'Seasons'}
               </span>
             </div>

             <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
               {show.title}
             </h1>

             {/* Ratings Grid */}
             <div className="flex flex-wrap gap-6 mb-8">
               <div className="flex items-center gap-2">
                 <div className="bg-white/10 p-2 rounded-full">
                   <Star size={18} className="text-yellow-500 fill-yellow-500" />
                 </div>
                 <div>
                   <p className="text-white font-bold text-lg leading-none">{show.rating}</p>
                   <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">TMDB</p>
                 </div>
               </div>
               
               {imdbRating && (
                 <div className="flex items-center gap-2">
                   <div className="bg-yellow-500/10 p-2 rounded-full">
                     <span className="font-bold text-yellow-500 text-xs">IMDb</span>
                   </div>
                   <div>
                     <p className="text-white font-bold text-lg leading-none">{imdbRating}</p>
                     <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Rating</p>
                   </div>
                 </div>
               )}
             </div>

             <div className="flex flex-wrap gap-2 mb-8">
               {show.genres?.map(g => (
                 <span key={g} className="px-3 py-1 bg-surface text-white/70 rounded-full text-sm font-medium border border-white/5">
                   {g}
                 </span>
               ))}
             </div>

             <p className="text-lg text-white/80 leading-relaxed mb-12 max-w-3xl">
               {show.plot}
             </p>

             {/* Episode List Section */}
             <div className="mt-8 border-t border-white/10 pt-12">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                 <h2 className="text-2xl font-bold text-white">Episodes</h2>
                 
                 {/* Season Selector */}
                 <div className="relative">
                   <DropdownMenu.Root>
                     <DropdownMenu.Trigger className="flex items-center justify-between w-48 px-4 py-2.5 bg-surface border border-white/10 rounded-lg text-white font-medium hover:border-white/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                       Season {selectedSeason}
                       <ChevronDown size={16} className="text-white/50" />
                     </DropdownMenu.Trigger>

                     <DropdownMenu.Portal>
                       <DropdownMenu.Content 
                         className="w-48 bg-surface border border-white/10 rounded-lg shadow-2xl z-[200] overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                         align="end"
                         style={{ maxHeight: '300px', overflowY: 'auto' }}
                       >
                         {availableSeasons.map(seasonNum => (
                           <DropdownMenu.Item 
                             key={seasonNum}
                             className={`px-4 py-3 text-sm outline-none cursor-pointer transition-colors ${selectedSeason === seasonNum ? 'bg-primary/20 text-primary font-bold' : 'text-white hover:bg-white/5 focus:bg-white/10'}`}
                             onClick={() => setSelectedSeason(seasonNum)}
                           >
                             Season {seasonNum}
                           </DropdownMenu.Item>
                         ))}
                       </DropdownMenu.Content>
                     </DropdownMenu.Portal>
                   </DropdownMenu.Root>
                 </div>
               </div>

               {/* Episode Feed */}
               <div className="space-y-4">
                 {episodesLoading ? (
                   Array.from({ length: 3 }).map((_, i) => (
                     <div key={i} className="h-32 w-full skeleton-loader rounded-xl shadow-lg" />
                   ))
                 ) : episodes.length > 0 ? (
                   episodes.map(episode => (
                     <EpisodeCard key={episode.id} episode={episode} />
                   ))
                 ) : (
                   <div className="text-center py-12 bg-surface rounded-xl border border-white/5">
                     <p className="text-white/50">No episodes found for this season.</p>
                   </div>
                 )}
               </div>

             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
