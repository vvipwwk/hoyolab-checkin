const { runAllCheckIns } = require('../src/checkin');
const { buildCookieString } = require('../src/api');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check if cookies configured
  const cookie = buildCookieString();
  if (!cookie || cookie.includes('your_') || cookie.length < 20) {
    return res.status(400).json({
      success: false,
      message: 'HoyoLab cookies not configured in environment variables. Please set LTUID_V2 and LTOKEN_V2 in Vercel settings.'
    });
  }

  try {
    const results = await runAllCheckIns();
    return res.status(200).json({
      success: true,
      message: 'Daily check-in executed successfully',
      results: results.map(r => ({
        game: r.game?.name,
        icon: r.game?.icon,
        success: r.success,
        alreadyCheckedIn: r.alreadyCheckedIn,
        totalDays: r.totalDays,
        reward: r.reward ? `${r.reward.name} x${r.reward.cnt}` : null,
        error: r.error
      })),
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
};
