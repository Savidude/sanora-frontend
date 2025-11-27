import React, { useState, useRef, useEffect } from 'react';
import { ContinuationMessageData, ErrorType } from '../../../../types/chat';
import { WordTipsComponent } from '../WordTipsComponent';
import { ErrorClassificationComponent } from '../ErrorClassificationComponent';
import { renderMarkdown } from '../../../../utils/markdown';
import styles from './ContinuationMessage.module.css';

export interface ContinuationMessageProps {
  data: ContinuationMessageData;
  hasError: ErrorType;
  timestamp: Date;
  isMobile: boolean;
}

export const ContinuationMessage: React.FC<ContinuationMessageProps> = ({
  data,
  hasError,
  isMobile
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // If hasError is 'NO', combine feedback and continuation into one slide (2 slides total)
  // Otherwise, separate them (3 slides total)
  const totalSlides = hasError === 'NO' ? 2 : 3;

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
        
        {/* Conditional rendering based on hasError */}
        {hasError === 'NO' ? (
          <>
            {/* Slide 1: Combined Feedback + Continuation (when no error) */}
            <div className={styles.slide}>
              <div className={styles.slideContent}>
                {/* Error Classification Section */}
                <ErrorClassificationComponent 
                  classification={hasError}
                  size={isMobile ? 'large' : 'medium'}
                />

                {/* General Feedback Text */}
                {data.feedbackText && (
                  <section className={styles.generalFeedback} aria-label="General feedback">
                    <p className={styles.feedbackText}>{renderMarkdown(data.feedbackText)}</p>
                  </section>
                )}

                {/* Conversation Continuation */}
                <section className={styles.continuationSection} aria-label="Continue the conversation">
                  <h3 className={styles.sectionTitle}>Continue the Conversation</h3>
                  {data.conversationContinuation ? (
                    <div className={styles.continuationPrompt}>
                      {renderMarkdown(data.conversationContinuation)}
                    </div>
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
          </>
        ) : (
          <>
            {/* Slide 1: Feedback (when there is an error) */}
            <div className={styles.slide}>
              <div className={styles.slideContent}>
                {/* Error Classification Section */}
                <ErrorClassificationComponent 
                  classification={hasError}
                  size={isMobile ? 'large' : 'medium'}
                />

                {/* Feedback Details Section */}
                {data.errorDetails && (
                  <section className={styles.feedbackSection} aria-label="Feedback details">
                    <h3 className={styles.sectionTitle}>Feedback</h3>
                    
                    {data.errorDetails.userMistake && (
                      <div className={styles.mistake}>
                        <strong className={styles.mistakeLabel}>Your response:</strong>
                        <p className={styles.mistakeText} lang="fi">{renderMarkdown(data.errorDetails.userMistake)}</p>
                      </div>
                    )}
                    
                    {data.errorDetails.corrections && data.errorDetails.corrections.length > 0 && (
                      <div className={styles.corrections}>
                        <strong className={styles.correctionsLabel}>Suggestions:</strong>
                        <ul className={styles.correctionsList}>
                          {data.errorDetails.corrections.map((correction, index) => (
                            <li key={index} className={styles.correctionItem} lang="fi">
                              {renderMarkdown(correction)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {data.errorDetails.explanation && (
                      <div className={styles.explanation}>
                        <strong className={styles.explanationLabel}>Explanation:</strong>
                        <p className={styles.explanationText}>{renderMarkdown(data.errorDetails.explanation)}</p>
                      </div>
                    )}
                  </section>
                )}
              </div>
            </div>

            {/* Slide 2: Conversation Continuation */}
            <div className={styles.slide}>
              <div className={styles.slideContent}>
                <section className={styles.continuationSection} aria-label="Continue the conversation">
                  <h3 className={styles.sectionTitle}>Continue the Conversation</h3>
                  {data.conversationContinuation ? (
                    <div className={styles.continuationPrompt}>
                      {renderMarkdown(data.conversationContinuation)}
                    </div>
                  ) : (
                    <span className={styles.fallback}>No data</span>
                  )}
                </section>
              </div>
            </div>

            {/* Slide 3: Word Tips */}
            <div className={styles.slide}>
              <div className={styles.slideContent}>
                <WordTipsComponent 
                  tips={data.wordTips || []}
                  layout="card"
                  maxVisible={6}
                />
              </div>
            </div>
          </>
        )}
        
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
