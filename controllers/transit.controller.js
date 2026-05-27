import PlanetTransit from '../models/PlanetTransit.js';

// Static planet transit data (seeded/hardcoded for UI)
const STATIC_TRANSITS = [
  { _id: '6850587a4a2dbd90589ad960', title: 'Sun Transit', description: 'Know the impact of Sun transit, expect great changes.', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg', slug: 'sun-transit', color: '#FF9E80' },
  { _id: '6850587a4a2dbd90589ad961', title: 'Moon Transit', description: 'Moon transit affects emotions, mood swings and intuition.', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/FullMoon2010.jpg', slug: 'moon-transit', color: '#EA80FC' },
  { _id: '6850587a4a2dbd90589ad962', title: 'Mars Transit', description: 'Mars transit brings energy, action, passion, and challenges.', image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg', slug: 'mars-transit', color: '#FF80AB' },
  { _id: '6850587a4a2dbd90589ad963', title: 'Mercury Transit', description: 'Mercury transit affects communication, travel, and decisions.', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg', slug: 'mercury-transit', color: '#B9F6CA' },
  { _id: '6850587a4a2dbd90589ad964', title: 'Jupiter Transit', description: 'Jupiter transit brings growth, expansion, luck, and wisdom.', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Jupiter.jpg', slug: 'jupiter-transit', color: '#FFE57F' },
  { _id: '6850587a4a2dbd90589ad965', title: 'Venus Transit', description: 'Venus transit influences love, beauty, comfort, and luxury.', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg', slug: 'venus-transit', color: '#F4FF81' },
  { _id: '6850587a4a2dbd90589ad966', title: 'Saturn Transit', description: 'Saturn transit teaches discipline, karma, hard work and patience.', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c7/Saturn_during_Equinox.jpg', slug: 'saturn-transit', color: '#84FFFF' },
  { _id: '6850587a4a2dbd90589ad967', title: 'Rahu Transit', description: 'Rahu transit brings unexpected events, illusions, and ambitions.', image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg', slug: 'rahu-transit', color: '#80DEEA' },
  { _id: '6850587a4a2dbd90589ad968', title: 'Ketu Transit', description: 'Ketu transit supports spirituality, detachment, and past-life karmas.', image: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg', slug: 'ketu-transit', color: '#FF8A80' },
];

export const getTransits = async (req, res) => {
  try {
    return res.status(200).json({ success: true, message: 'Transits fetched successfully', data: STATIC_TRANSITS });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};

export const getPlanetTransits = async (req, res) => {
  try {
    const planetTransits = await PlanetTransit.find({}, { title: 1, description: 1, image: 1, slug: 1, color: 1 });
    return res.status(200).json({ success: true, message: 'Planet transits fetched', data: planetTransits });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
  }
};
