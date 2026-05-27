const SIGNS = [
  'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
  'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
];

const descriptions = [
  'A surprise is on its way to you today.',
  'Expect a moment of peace amidst chaos.',
  'Focus on what truly matters to you.',
  'Trust the timing of your life.',
  'Your efforts are being noticed.',
];

const moods = ['Happy', 'Focused', 'Calm', 'Energetic', 'Peaceful'];
const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange'];

export function generateHoroscope(sign, period) {
  return {
    sign,
    period,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    lucky_number: Math.floor(Math.random() * 100),
    mood: moods[Math.floor(Math.random() * moods.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    date: new Date().toLocaleDateString(),
  };
}

export { SIGNS };
