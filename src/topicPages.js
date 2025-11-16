import { topicNames } from './topicNames';

// Page numbers for each topic - you'll need to fill these in with actual page numbers
export const topicPages = {
  9: {
    1: { // Aqeedha
      1: { page: 5,},
      2: { page: 12,},
      3: { page: 18,},
      4: { page: 25 },
      5: { page: 32 },
      6: { page: 38 }
    },
    2: { // Hadhees
      1: { page: 45 },
      2: { page: 52,},
      3: { page: 58,},
      4: { page: 65 },
      5: { page: 72 },
      6: { page: 78 },
      7: { page: 85 },
      8: { page: 92 }
    },
    3: { // Fiqh
      1: { page: 98 },
      2: { page: 105 },
      3: { page: 112 },
      4: { page: 120 },
      5: { page: 128 },
      6: { page: 135 },
      7: { page: 142 },
      8: { page: 150 },
      9: { page: 158 },
      10: { page: 165 },
      11: { page: 172 },
      12: { page: 180 },
      13: { page: 188 },
      14: { page: 195 },
      15: { page: 202 },
      16: { page: 210 }
    },
    4: { // Thaareekh
      1: { page: 218 },
      2: { page: 225 },
      3: { page: 232 },
      4: { page: 240 },
      5: { page: 248 }
    },
    5: { // Saqaafa
      1: { page: 255 },
      2: { page: 262 },
      3: { page: 270 },
      4: { page: 278 }
    },
    6: { // Akhlaaq
      1: { page: 285 },
      2: { page: 292 },
      3: { page: 300 },
      4: { page: 308 },
      5: { page: 315 },
      6: { page: 322 },
      7: { page: 330 },
      8: { page: 338 },
      9: { page: 345 },
      10: { page: 352 }
    }
  },
  10: {
    1: { // Aqeedha
      1: { page: 8,},
      2: { page: 15,},
      3: { page: 22,},
      4: { page: 30 },
      5: { page: 37 },
      6: { page: 44 },
      7: { page: 51 },
      8: { page: 58 },
      9: { page: 65 }
    },
    2: { // Hadhees
      1: { page: 72 },
      2: { page: 80 },
      3: { page: 88 },
      4: { page: 95 },
      5: { page: 102 },
      6: { page: 110 },
      7: { page: 118 }
    },
    3: { // Fiqh
      1: { page: 125 },
      2: { page: 132 },
      3: { page: 140 },
      4: { page: 148 },
      5: { page: 155 },
      6: { page: 162 },
      7: { page: 170 },
      8: { page: 178 },
      9: { page: 185 },
      10: { page: 192 }
    },
    4: { // Thaareekh
      1: { page: 200 },
      2: { page: 208 },
      3: { page: 215 },
      4: { page: 222 },
      5: { page: 230 },
      6: { page: 238 },
      7: { page: 245 }
    },
    5: { // Saqaafa
      1: { page: 252 },
      2: { page: 260 },
      3: { page: 268 },
      4: { page: 275 }
    },
    6: { // Akhlaaq
      1: { page: 282 },
      2: { page: 290 },
      3: { page: 298 },
      4: { page: 305 },
      5: { page: 312 },
      6: { page: 320 },
      7: { page: 328 },
      8: { page: 335 },
      9: { page: 342 }
    }
  }
};

export const getAllTopics = (bookId) => {
  const topics = [];
  for (const unitId in topicPages[bookId]) {
    for (const topicId in topicPages[bookId][unitId]) {
      topics.push({
        ...topicPages[bookId][unitId][topicId],
        unitId: parseInt(unitId),
        topicId: parseInt(topicId),
        bookId: parseInt(bookId),
        name: topicNames[bookId]?.[unitId]?.[topicId] || `Topic ${topicId}`
      });
    }
  }
  return topics;
};

export const searchTopics = (query, bookId = null) => {
  const allTopics = bookId ? getAllTopics(bookId) : [...getAllTopics(9), ...getAllTopics(10)];
  return allTopics.filter(topic => 
    topic.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const unitNames = {
  1: "Aqeedha",
  2: "Khadhees", 
  3: "Fiqh",
  4: "Thaareekh",
  5: "Sqaafa",
  6: "Akhlaaq"
};
