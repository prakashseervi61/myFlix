import React from 'react'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import HeroSection from './components/sections/HeroSection'
import Row from './components/sections/Row'

// Enhanced movie data with ratings and genres
const movieCategories = {
  trending: [
    { id: 1, title: "Wednesday", rating: 8.7, genre: "Comedy", poster: "/src/assets/placeholder_1.jpeg" },
    { id: 2, title: "Money Heist", rating: 8.3, genre: "Crime", poster: "/src/assets/placeholder_2.jpeg" },
    { id: 3, title: "Breaking Bad", rating: 9.5, genre: "Drama", poster: "/src/assets/placeholder_3.jpeg" },
    { id: 4, title: "Elite", rating: 7.5, genre: "Drama", poster: "/src/assets/placeholder_4.jpeg" },
    { id: 5, title: "Lucifer", rating: 8.1, genre: "Fantasy", poster: "/src/assets/placeholder_5.jpeg" },
  ],
  popular: [
    { id: 6, title: "Stranger Things", rating: 8.9, genre: "Sci-Fi", poster: "/src/assets/placeholder_3.jpeg" },
    { id: 7, title: "The Crown", rating: 8.6, genre: "Drama", poster: "/src/assets/placeholder_1.jpeg" },
    { id: 8, title: "Ozark", rating: 8.4, genre: "Crime", poster: "/src/assets/placeholder_2.jpeg" },
    { id: 9, title: "Dark", rating: 8.8, genre: "Mystery", poster: "/src/assets/placeholder_4.jpeg" },
    { id: 10, title: "Narcos", rating: 8.7, genre: "Crime", poster: "/src/assets/placeholder_5.jpeg" },
  ],
  recommended: [
    { id: 11, title: "The Witcher", rating: 8.2, genre: "Fantasy", poster: "/src/assets/placeholder_5.jpeg" },
    { id: 12, title: "Squid Game", rating: 8.0, genre: "Thriller", poster: "/src/assets/placeholder_1.jpeg" },
    { id: 13, title: "Bridgerton", rating: 7.3, genre: "Romance", poster: "/src/assets/placeholder_3.jpeg" },
    { id: 14, title: "Peaky Blinders", rating: 8.8, genre: "Crime", poster: "/src/assets/placeholder_2.jpeg" },
    { id: 15, title: "The Umbrella Academy", rating: 7.9, genre: "Action", poster: "/src/assets/placeholder_4.jpeg" },
  ]
};

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <HeroSection />
      <main>
        <div className="space-y-8 py-12">
          <Row title="Trending Now" movies={movieCategories.trending} />
          <Row title="Popular Movies" movies={movieCategories.popular} />
          <Row title="Recommended for You" movies={movieCategories.recommended} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App