import { useState, useEffect } from 'react';

export function useCountdown(dueDate?: string) {
  const [timeLeft, setTimeLeft] = useState('Calculating...');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    // 1. If there is no due date, safely abort the effect early without setting state
    if (!dueDate) return;

    const targetDate = new Date(dueDate);
    targetDate.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft('Past Due');
        setIsLate(true);
      } else {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${d}d ${h}h ${m}m`);
        setIsLate(false);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 60000); 
    return () => clearInterval(interval);
  }, [dueDate]);

  // 2. Derive the state immediately during the render phase if dueDate is missing
  if (!dueDate) {
    return { timeLeft: 'No Due Date', isLate: false };
  }

  return { timeLeft, isLate };
}