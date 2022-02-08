import React, { useContext, useEffect, useMemo, useState } from 'react';
import AuthContext from '../../context';
import ApiService from '../../services/ApiService';

// styles
import cl from './Sprint.module.scss';
import SprintTimer from './SprintTimer';

function getRandomNum(min, max) {
  const rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
}

function isRight() {
  return Math.random() > 0.5;
}

function SprintGame({ level }) {
  const { isAuth } = useContext(AuthContext);
  const [wordIndex, setWordIndex] = useState(-1);
  const [words, setWords] = useState(['']);

  const translate = useMemo(() => {
    let result = '';
    if (isRight()) {
      result = words[wordIndex]?.wordTranslate;
    } else {
      let tmpIndex = 0;
      tmpIndex = getRandomNum(0, 19);
      // words.length - 1
      while (tmpIndex === wordIndex) {
        tmpIndex = getRandomNum(0, 19);
      }
      result = words[tmpIndex]?.wordTranslate;
    }
    return result;
  }, [words, wordIndex]);

  const setWordsList = (wordsList) => {
    const arr = wordsList.map((item) => {
      return {
        id: item._id,
        word: item.word,
        wordTranslate: item.wordTranslate,
        countRight: 0,
      };
    });
    setWords([...arr]);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (isAuth) {
      ApiService.getWords(userId, level - 1, getRandomNum(0, 30), 20, setWordsList);
    } else {
      ApiService.getUnauthorizedWords(level - 1, getRandomNum(0, 30), setWordsList);
    }
    setWordIndex(0);
  }, []);

  const checkAnswer = (ans) => {
    if (ans === 'yes') {
      if (translate === words[wordIndex].wordTranslate) {
        if (words[wordIndex].countRight !== 3) {
          words[wordIndex].countRight++;
          console.log('yes');
        }
      } else {
        words[wordIndex].countRight = 0;
        console.log('no');
      }
    } else if (translate !== words[wordIndex].wordTranslate) {
      if (words[wordIndex].countRight !== 3) {
        words[wordIndex].countRight++;
        console.log('yes');
      }
    } else {
      words[wordIndex].countRight = 0;
      console.log('no');
    }
    if (wordIndex < words.length) {
      setWordIndex(wordIndex + 1);
    } else {
      setWordIndex(0);
    }
  };

  const handleKeyPress = (e) => {
    console.log(e);
  };

  return (
    <div
      className={cl.sprintGame}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === 'ArrowRight') {
          checkAnswer('yes');
        }
        if (e.key === 'ArrowLeft') {
          checkAnswer('no');
        }
      }}
      tabIndex="-1"
    >
      <div className={cl.wordWrapper}>
        <span>{words[wordIndex]?.word}</span>
        <span>{translate}</span>
      </div>
      <SprintTimer secCount={60} />
      <div className={cl.btnWrapper}>
        <button
          className={`${cl.answBtn} ${cl.btnNo}`}
          onClick={() => {
            checkAnswer('no');
          }}
        >
          No
        </button>
        <button
          className={`${cl.answBtn} ${cl.btnOk}`}
          onClick={() => {
            checkAnswer('yes');
          }}
        >
          Yes
        </button>
      </div>
    </div>
  );
}

export default SprintGame;
