export const topicPages = {
  9: {
    1: { // Unit 1: Aqeedha
      1: { name: "Tawheed and Its Importance", page: 5, important: true },
      2: { name: "Articles of Faith", page: 12, important: true },
      3: { name: "Belief in Allah", page: 18, important: true },
      4: { name: "Belief in Angels", page: 25 },
      5: { name: "Belief in Divine Books", page: 32 },
      6: { name: "Belief in Messengers", page: 38, important: true }
    },
    2: { // Unit 2: Khadhees
      1: { name: "Introduction to Hadith", page: 45 },
      2: { name: "Classification of Hadith", page: 52, important: true },
      3: { name: "Major Hadith Collections", page: 58, important: true },
      4: { name: "Study of Hadith", page: 65 },
      5: { name: "Application of Hadith", page: 72 },
      6: { name: "Hadith Preservation", page: 78 }
    },
    // ... rest of the units for Book 9
  },
  10: {
    // ... Book 10 data
  }
};

// Additional utility functions
export const getAllTopics = (bookId) => {
  const topics = [];
  for (const unitId in topicPages[bookId]) {
    for (const topicId in topicPages[bookId][unitId]) {
      topics.push({
        ...topicPages[bookId][unitId][topicId],
        unitId: parseInt(unitId),
        topicId: parseInt(topicId),
        bookId: bookId
      });
    }
  }
  return topics;
};

export const searchTopics = (query, bookId = null) => {
  const allTopics = bookId ? getAllTopics(bookId) : [...getAllTopics(9), ...getAllTopics(10)];
  return allTopics.filter(topic => 
    topic.name.toLowerCase().includes(query.toLowerCase()) ||
    unitNames[topic.unitId].toLowerCase().includes(query.toLowerCase())
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