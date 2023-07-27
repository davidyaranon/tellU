import empty_achievement from '../images/empty_achievement.png';
import tellU_sovereign from '../images/tellU_sovereign.png';
import Like_a_Lot from '../images/like-a-lot.png';
export const NUM_ACHIEVEMENTS: number = 24;

export interface IAchievement {
  description: string;
  title: string;
};

// title : icon
export const AchievementIcons: Record<string, string> = {
  "Like-a-Lot": Like_a_Lot,
  "tellU Sovereign": tellU_sovereign,
  "Hidden": empty_achievement,
  "": "",
};

export const AchievementDescriptions: Record<string, string> = {
  "Like-a-Lot": "Like any 10 posts on tellU",
  "tellU Sovereign": "Use tellU for over a year!",
  "Hidden": "Keep using tellU to unlock more achievements!"
}
