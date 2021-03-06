// react
import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';

// utils
import ApiService from '../../services/ApiService';
import { MAX_WORDS_COUNT } from './helper';
import getRandomNum from '../../utils/getRandomNum';
import AuthContext from '../../context/index.js';

// components
import Level from './components/Level/Level';
import Levels from './components/Levels/Levels';

// styles
import cl from './Audiocall.module.scss';

function Audiocall() {
  const { state } = useLocation();
  const { isAuth } = useContext(AuthContext);
  const [isGame, setIsGame] = useState(false);
  const [level, setLevel] = useState(0);
  const [words, setWords] = useState([]);
  const [statistic, setStatistic] = useState({});

  const levels = [1, 2, 3, 4, 5, 6];

  const setStatisticData = (data) => {
    setStatistic(data);
  };

  const changeLevel = (lvl) => {
    setIsGame(true);
    setLevel(lvl);
  };

  const setWordList = (wordList) => {
    const wordListMapped = wordList.map((item) => {
      const word = { ...item };
      word.id = item._id || item.id;
      word.options = {
        ...item.userWord?.optional,
        statistics: {
          ...(item.userWord?.optional.statistics || { row: 0, wrong: 0, correct: 0 }),
        },
      };
      return word;
    });

    setWords(wordListMapped);
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (state === 'header') {
      const pageNum = getRandomNum(0, 29);

      if (isAuth) {
        ApiService.getWords(userId, level, pageNum, MAX_WORDS_COUNT, setWordList);
      } else {
        ApiService.getUnauthorizedWords(level, pageNum, setWordList);
      }
    } else {
      const pageNum = localStorage.getItem('page-num');

      if (isAuth) {
        ApiService.getNonEasyWords(userId, level, pageNum, MAX_WORDS_COUNT, setWordList);
      } else {
        ApiService.getUnauthorizedWords(level, pageNum, setWordList);
      }
    }

    if (isAuth) {
      ApiService.getStatistics(userId, setStatisticData);
    }

    return () => {
      words.length = 0;
    };
  }, [level, isGame]);

  const tryAgain = () => {
    setIsGame(false);
    setLevel(0);
  };

  return (
    <div className={cl.audiocall}>
      <div className={cl['back-btn']}>
        <Link to="/">
          <span>??????????</span>
        </Link>
      </div>
      {!isGame ? (
        <Levels levels={levels} changeLevel={changeLevel} state={state} />
      ) : (
        <Level words={words} tryAgain={tryAgain} statistic={statistic} />
      )}
    </div>
  );
}

export default Audiocall;
