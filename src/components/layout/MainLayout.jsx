import React, { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play, Plus } from 'lucide-react' 

import img1 from '../../assets/placeholder_1.jpeg'
import img2 from '../../assets/placeholder_2.jpeg'
import img3 from '../../assets/placeholder_3.jpeg'
import img4 from '../../assets/placeholder_4.jpeg'
import img5 from '../../assets/placeholder_5.jpeg'


function MainLayout() {

    const contentData = [
        { id: 1, title: "Wednesday", desc: "Smart, sarcastic and a little dead inside.", image: img1 },
        { id: 2, title: "Money Heist", desc: "Eight thieves take hostages in the Royal Mint.", image: img2 },
        { id: 3, title: "Breaking Bad", desc: "A chemistry teacher turned drug dealer.", image: img3 },
        { id: 4, title: "Elite", desc: "Three working-class teens enroll in an exclusive school.", image: img4 },
        { id: 5, title: "Lucifer", desc: "The devil decides to take a vacation in LA.", image: img5 },
    ];

    const slides = [
        contentData[contentData.length - 1],
        ...contentData,
        contentData[0]
    ];

    const [curr, setCurr] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [autoSlide, setAutoSlide] = useState(true);

    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const autoSlideInterval = 5000;

    const prev = () => {
        if(isTransitioning) return;
        setIsTransitioning(true);
        setCurr((curr) => curr - 1);
    }

    const next = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurr((curr) => curr + 1);
    }

    const handleTransitionEnd = () => {
        setIsTransitioning(false);
        if (curr === slides.length - 1) {
            setCurr(1);
        }
        if (curr === 0) {
            setCurr(slides.length - 2);
        }
    };

    const minSwipeDistance = 50; 

    const onTouchStart = (e) => {
        setTouchEnd(null); 
        setTouchStart(e.targetTouches[0].clientX);
    }
    const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;
        
        if (isLeftSwipe) next();
        if (isRightSwipe) prev();
    }

    useEffect(() =>{
        if(!autoSlide) return;
        const slideInterval = setInterval(next, autoSlideInterval);
        return () => clearInterval(slideInterval);
    }, [autoSlide]);

    return (
        <div className='w-full bg-[#0f1014] relative pb-8'>
            <div 
                className='relative w-full h-[55vh] md:h-[85vh] overflow-hidden group'
                onMouseEnter={() => setAutoSlide(false)}
                onMouseLeave={() => setAutoSlide(true)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div 
                    className={`flex h-full ${isTransitioning ? 'transition-transform duration-500 ease-out' : ''}`}
                    style={{ transform: `translateX(-${curr * 100}%)` }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {slides.map((item, index) => (
                        <div key={`${item.id}-${index}`} className='min-w-full h-full relative'>
                            <img 
                                src={item.image} 
                                alt={item.title}
                                className='w-full h-full object-cover object-center select-none'
                            />
                            
                            <div className='absolute inset-0 bg-gradient-to-t from-[#0f1014] via-black/40 to-transparent'>
                                <div className='
                                    absolute 
                                    inset-x-0 bottom-8 px-6 flex flex-col items-center text-center
                                    md:inset-x-auto md:left-12 md:bottom-24 md:items-start md:text-left md:px-0
                                    max-w-3xl text-white
                                '>
                                    
                                    <h1 className='text-4xl md:text-7xl font-bold mb-3 md:mb-4 leading-tight drop-shadow-xl tracking-tight'>
                                        {item.title}
                                    </h1>
                                    
                                    <p className='text-sm md:text-lg text-gray-300 mb-6 md:mb-8 drop-shadow-md line-clamp-2 md:line-clamp-3 max-w-lg md:max-w-full'>
                                        {item.desc}
                                    </p>
                                    
                                    <div className='flex gap-3 md:gap-4'>
                                        <button 
                                            type='button' 
                                            className='flex items-center gap-2 px-6 py-2.5 md:px-8 md:py-3 bg-[#ff6f61] hover:bg-[#ff5a4a] text-white rounded-lg font-bold text-sm md:text-base transition-all transform hover:scale-105 shadow-lg shadow-red-500/30 cursor-pointer pointer-events-auto' 
                                            onClick={() => console.log(`Watching ${item.title}`)}
                                        >
                                            <Play size={18} fill="currentColor" className="md:w-5 md:h-5" />
                                            Watch Now
                                        </button>
                                        <button 
                                            type='button' 
                                            className='flex items-center gap-2 px-6 py-2.5 md:px-6 md:py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-lg font-semibold text-sm md:text-base transition-all cursor-pointer pointer-events-auto'
                                            onClick={() => console.log(`Added ${item.title} to list`)}
                                        >
                                            <Plus size={18} className="md:w-5 md:h-5" />
                                            My List
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute inset-0 hidden md:flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button onClick={prev} className='p-3 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/10 transition backdrop-blur-md pointer-events-auto hover:scale-110'>
                        <ChevronLeft size={32} />
                    </button>
                    <button onClick={next} className='p-3 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/10 transition backdrop-blur-md pointer-events-auto hover:scale-110'>
                        <ChevronRight size={32} />
                    </button>
                </div>

                <div className='absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20'>
                    {contentData.map((_, i) => (
                        <div 
                            key={i}
                            className={`transition-all duration-300 h-1.5 rounded-full cursor-pointer shadow-sm
                                ${ (curr === i + 1) || (curr === 0 && i === contentData.length - 1) || (curr === slides.length - 1 && i === 0)
                                    ? "bg-[#ff6f61] w-8" : "bg-white/50 w-2 hover:bg-white" }
                            `}
                            onClick={() => {
                                setIsTransitioning(true);
                                setCurr(i + 1);
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MainLayout