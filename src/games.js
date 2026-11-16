// ============================================================
// games.js - HoyoLab Game Configurations
// ============================================================

const GAMES = {
  genshin: {
    name: 'Genshin Impact',
    short: 'GI',
    enabled: process.env.ENABLE_GENSHIN !== 'false',
    act_id: 'e202102251931481',
    signUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/sign',
    infoUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/info',
    rewardUrl: 'https://sg-hk4e-api.hoyolab.com/event/sol/home',
    referer: 'https://act.hoyolab.com/ys/event/signin-sea-v3/index.html?act_id=e202102251931481',
    icon: '⚔️',
  },

  starrail: {
    name: 'Honkai: Star Rail',
    short: 'HSR',
    enabled: process.env.ENABLE_STARRAIL !== 'false',
    act_id: 'e202303301540311',
    signUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
    infoUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/info',
    rewardUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/home',
    referer: 'https://act.hoyolab.com/bbs/event/signin/hkrpg/index.html?act_id=e202303301540311',
    icon: '🚂',
  },

  zzz: {
    name: 'Zenless Zone Zero',
    short: 'ZZZ',
    enabled: process.env.ENABLE_ZZZ !== 'false',
    act_id: 'e202406031448091',
    signUrl: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/sign',
    infoUrl: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/info',
    rewardUrl: 'https://sg-act-nap-api.hoyolab.com/event/luna/zzz/os/home',
    referer: 'https://act.hoyolab.com/bbs/event/signin/zzz/e202406031448091.html',
    icon: '📺',
  },

  honkai3rd: {
    name: 'Honkai Impact 3rd',
    short: 'HI3',
    enabled: process.env.ENABLE_HONKAI3RD === 'true',
    act_id: 'e202110291205111',
    signUrl: 'https://sg-public-api.hoyolab.com/event/mani/sign',
    infoUrl: 'https://sg-public-api.hoyolab.com/event/mani/info',
    rewardUrl: 'https://sg-public-api.hoyolab.com/event/mani/home',
    referer: 'https://act.hoyolab.com/bbs/event/signin-bh3/index.html?act_id=e202110291205111',
    icon: '🔥',
  },

  tot: {
    name: 'Tears of Themis',
    short: 'ToT',
    enabled: process.env.ENABLE_TOT === 'true',
    act_id: 'e202202281857121',
    signUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/sign',
    infoUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/info',
    rewardUrl: 'https://sg-public-api.hoyolab.com/event/luna/os/home',
    referer: 'https://act.hoyolab.com/bbs/event/signin/nxx/index.html?act_id=e202202281857121',
    icon: '⚖️',
  },
};

module.exports = { GAMES };
