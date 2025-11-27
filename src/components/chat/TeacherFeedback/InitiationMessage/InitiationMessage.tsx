import React, { useState, useRef, useEffect } from 'react';
import { InitiationMessageData } from '../../../../types/chat';
import { WordTipsComponent } from '../WordTipsComponent';
import { renderMarkdown } from '../../../../utils/markdown';
import styles from './InitiationMessage.module.css';

export interface InitiationMessageProps {
  data: InitiationMessageData;
  timestamp: Date;
  isMobile: boolean;
}

export const InitiationMessage: React.FC<InitiationMessageProps> = ({
  data,
  isMobile
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const totalSlides = 2; // Main content + Word Tips

  const scrollToSlide = (index: number) => {
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
      setCurrentSlide(index);
      
      // Scroll the component into view at the top
      setTimeout(() => {
        scrollContainerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.offsetWidth;
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const index = Math.round(scrollLeft / slideWidth);
      
      if (index !== currentSlide) {
        setCurrentSlide(index);
        
        // Scroll to top of component when slide changes via swipe
        setTimeout(() => {
          scrollContainerRef.current?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      }
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
      
      {/* Horizontal Scroll Container */}
      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        
        {/* Slide 1: Main Content (Greeting + Scenario + Prompt) */}
        <div className={styles.slide}>
          <div className={styles.slideContent}>
            {/* Greeting Section */}
            <section className={styles.greetingSection} aria-label="Greeting">
              <h3 className={styles.sectionTitle}>Greeting</h3>
              {data.greeting ? (
                <p className={styles.greetingText} lang="fi">{renderMarkdown(data.greeting)}</p>
              ) : (
                <span className={styles.fallback}>No data</span>
              )}
            </section>

            {/* Scenario Section */}
            <section className={styles.scenarioSection} aria-label="Scenario">
              <h3 className={styles.sectionTitle}>Scenario</h3>
              {data.scenario ? (
                <p className={styles.scenarioText}>{renderMarkdown(data.scenario)}</p>
              ) : (
                <span className={styles.fallback}>No data</span>
              )}
            </section>

            {/* Initial Prompt Section */}
            <section className={styles.promptSection} aria-label="Let's Practice">
              <h3 className={styles.sectionTitle}>Let's Practice</h3>
              {data.conversationContinuation ? (
                <div className={styles.promptText}>{renderMarkdown(data.conversationContinuation)}</div>
              ) : (
                <span className={styles.fallback}>No data</span>
              )}
            </section>
          </div>
        </div>

        {/* Slide 2: Word Tips */}
        <div className={styles.slide}>
          <div className={styles.slideContent}>
            <WordTipsComponent 
              tips={data.wordTips || []}
              layout="card"
              maxVisible={6}
            />
          </div>
        </div>
        
      </div>

      {/* Navigation Indicators */}
      <div className={styles.navigation}>
        <div className={styles.indicators}>
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              className={`${styles.indicator} ${currentSlide === index ? styles.indicatorActive : ''}`}
              onClick={() => scrollToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        {currentSlide < totalSlides - 1 && (
          <div className={styles.swipeHint}>
            <span className={styles.swipeText}>Swipe for more</span>
            <svg className={styles.swipeIcon} width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
    </div>
  );
};
