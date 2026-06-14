import { useState, useEffect } from 'react';

export const useTypewriter = (
  words: string[],
  typingSpeed = 80,
  deletingSpeed = 40,
  delayBeforeDelete = 2000,
  delayBeforeType = 500
) => {
  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeoutId: any;

    const currentWord = words[wordIndex];

    if (isDeleting) {
      // Deleting backwards
      if (text.length > 0) {
        timeoutId = setTimeout(() => {
          setText(text.slice(0, -1));
        }, deletingSpeed);
      } else {
        // Finished deleting, start typing next word
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
        timeoutId = setTimeout(() => {}, delayBeforeType);
      }
    } else {
      // Typing forwards
      if (text.length < currentWord.length) {
        timeoutId = setTimeout(() => {
          setText(currentWord.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing, pause before deleting
        timeoutId = setTimeout(() => {
          setIsDeleting(true);
        }, delayBeforeDelete);
      }
    }

    return () => clearTimeout(timeoutId);
  }, [
    text,
    isDeleting,
    wordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    delayBeforeDelete,
    delayBeforeType,
  ]);

  return text;
};
