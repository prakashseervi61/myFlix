import React, { useState, useEffect } from 'react';
import { Star, Send, User, MessageSquare, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewSection = ({ movieId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedReviews = localStorage.getItem(`reviews_${movieId}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      setReviews([]);
    }
  }, [movieId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    
    const newReview = {
      id: Date.now(),
      userName: user.name || user.email.split('@')[0],
      rating,
      text: comment.trim(),
      date: new Date().toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      timestamp: Date.now()
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${movieId}`, JSON.stringify(updatedReviews));
    
    setComment('');
    setRating(5);
    
    setTimeout(() => setIsSubmitting(false), 500);
  };

  return (
    <div className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <MessageSquare className="text-cyan-500" size={24} />
        <h2 className="text-2xl font-bold text-white">Guest Reviews</h2>
        <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded-full text-xs font-medium">
          {reviews.length}
        </span>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-gray-900/40 p-6 rounded-2xl border border-white/5 space-y-4 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{user.name || user.email}</p>
              <p className="text-xs text-gray-400">Posting as {user.name || 'User'}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Your Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= (hover || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-600'
                    } transition-colors duration-200`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think of the movie? Share your thoughts..."
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 min-h-[120px] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-cyan-900/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Send size={18} />
                Post Review
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-gray-900/40 p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-4">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-2">
            <LogIn className="text-cyan-500" size={32} />
          </div>
          <h3 className="text-xl font-bold text-white">Want to share your thoughts?</h3>
          <p className="text-gray-400 max-w-xs mx-auto">
            Login to write a review or join the discussion
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-95"
          >
            Login to write a review
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div 
              key={review.id} 
              className="bg-gray-900/30 border border-white/5 p-6 rounded-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">
                    <User size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{review.userName}</h4>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-700'}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                {review.text}
              </p>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500 italic">
            No reviews yet. Be the first to review this movie!
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
