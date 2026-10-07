const SOUNDS = {
  click: "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3",
  win: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
  lose: "https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3",
  spin: "https://assets.mixkit.co/active_storage/sfx/2005/2005-preview.mp3",
  coin: "https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3",
  crash: "https://assets.mixkit.co/active_storage/sfx/2011/2011-preview.mp3",
  cashout: "https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3",
  dice: "https://assets.mixkit.co/active_storage/sfx/2004/2004-preview.mp3",
  ball: "https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3",
  roulette: "https://assets.mixkit.co/active_storage/sfx/2006/2006-preview.mp3",
};

const audioCache = {};

export const preloadSounds = () => {
  Object.keys(SOUNDS).forEach((key) => {
    const audio = new Audio(SOUNDS[key]);
    audio.preload = "auto";
    audio.volume = 0.4;
    audioCache[key] = audio;
  });
};

export const playSound = (soundName) => {
  try {
    let audio = audioCache[soundName];
    if (!audio) {
      audio = new Audio(SOUNDS[soundName]);
      audio.volume = 0.4;
      audioCache[soundName] = audio;
    }
    const clone = audio.cloneNode();
    clone.volume = 0.4;
    clone.play().catch(() => {});
  } catch (err) {
    console.log("Sound error:", err);
  }
};