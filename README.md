<div align="center">
  <img src="public/logo.png" alt="myFlix Logo" width="120">
  <h1 style="font-size: 3rem; font-weight: bold; border-bottom: none;">myFlix</h1>
  <p style="font-size: 1.2rem; font-style: italic;">Your Cinematic & Television Universe, Reimagined.</p>
  
  <p>
    <a href="#"><img src="https://img.shields.io/badge/version-2.0-blueviolet?style=for-the-badge&logo=none" alt="Version"></a>
    <a href="#"><img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge&logo=none" alt="Status"></a>
        <a href="https://github.com/prakashseervi61/myFlix/">
          <img src="https://img.shields.io/github/stars/prakashseervi61/myFlix?style=for-the-badge&logo=github&color=FFD700" alt="Stars Badge"/>
        </a>
  </p>
</div>

---

### **🎥 Welcome to myFlix**

**myFlix** is a premium, cinematic experience built for both film lovers and binge-watchers. Built with a modern tech stack and a mobile-first philosophy, it flawlessly merges Movie and TV Show metadata into a stunning, intuitive interface to discover, track, and enjoy your favorite titles.

---

### ✨ **Feature Highlights**

| Icon | Feature | Description |
| :---: | :--- | :--- |
| 📺 | **Movies & TV Hubs** | Dedicated, separate native homepages for exploring Movies and TV Series with zero overlap. |
| 🎨 | **Glassmorphism UI/UX** | A dark-themed, immersive interface powered by modern glassmorphism design, animated transitions, and elegant blurring. |
| 📱 | **Fully Responsive** | Flawless layouts on any device. Features a fluid 100dvh mobile sidebar and global scroll lock for safe viewing. |
| 🎛️ | **Advanced Browse Panel** | Discover precisely what you want with a unified Browse page supporting multi-layered filters and native Movie/TV tab toggling. |
| 🔍 | **Instant Multi-Search** | A centralized, high-speed search engine that probes the database for Movies, TV Shows, and Actors simultaneously. |
| 🍿 | **Personal Watchlist** | Curate your own unified collection of films and TV series. |
| 🎬 | **Dynamic Hero Section** | An immersive, full-screen Hero Carousel displaying an interleaved mix of the Top 5 Trending Movies and TV Shows natively. |

---

### 🧠 **Architecture & Scalability**

myFlix is built on a highly modular, Context API-driven architecture that promotes scalability and data persistence without redundant API fetches. We aggregate data universally via **TMDB**, fetch precise IMDb ratings via **OMDb API**, and structure episodic data via the **TVMaze API**.

---

### 🛠️ **Tech Stack & Tools**

<div align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white" alt="React Query">
  <img src="https://img.shields.io/badge/React_Router_DOM-CA4245?style=for-the-badge&logo=react-router&logoColor=white" alt="React Router">
</div>

---

### ⚙️ **Installation & Setup**

Get myFlix running locally in just a few minutes.

1.  **Clone the repo:**
    ```sh
    git clone https://github.com/prakashseervi61/myFlix.git
    cd myFlix
    ```
2.  **Install dependencies:**
    ```sh
    npm install
    ```
3.  **Set up your environment:**
    Create a `.env` file in the root and add your securely-generated API keys:
    ```env
    VITE_TMDB_API_KEY=your_tmdb_api_key_here
    VITE_OMDB_API_KEY=your_omdb_api_key_here
    VITE_TVMAZE_BASE_URL=https://api.tvmaze.com
    ```
4.  **Launch the dev server:**
    ```sh
    npm run dev
    ```
    The app will be natively hosted at `http://localhost:5173`.

---

### 🗺️ **Roadmap / Future Vision**

myFlix is an ever-evolving project. Here is a glimpse of what's on the horizon:

-   [ ] **User Reviews & Ratings:** A community-driven rating and review system.
-   [ ] **Social Sharing:** Share your favorite films and TV moments with friends on social media.
-   [ ] **Personalized Recommendations:** An AI-fueled recommendation engine based on watchlist history.
-   [ ] **Enhanced Episode Tracking:** Ability to securely check off which TV show episodes you have watched so far.

---

<div align="center">
  <h3><b>Join the Cinematic Journey</b></h3>
  <p>Star the repo, fork it, and contribute your ideas. Let's build the ultimate movie experience together.</p>
</div>
