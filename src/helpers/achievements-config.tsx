import empty_achievement from '../images/empty_achievement.png';
import tellU_sovereign from '../images/tellU_sovereign.png';
import Like_a_Lot from '../images/like-a-lot.png';
import early_bird from '../images/early_bird.png';
import tech_whisperer from '../images/tech_whisperer.png';
import party_starter from '../images/party_starter.png';
import backpacker from '../images/backpacker.png';
import social_butterfly from '../images/social_butterfly.png';
import night_owl from '../images/night_owl.png';
import pen_pal from '../images/pen_pal.png';
import picky from '../images/picky.png';
import celebrity from '../images/celebrity.png';
import dining from '../images/dining.png';
import music from '../images/music.png';
import second_thoughts from '../images/second_thoughts.png';
import post_a_lot from '../images/post-a-lot.png';
import memory_collector from '../images/memory_collector.png';



export const NUM_ACHIEVEMENTS: number = 24;

export interface IAchievement {
  description: string;
  title: string;
};

export const listOfAchievements: string[] = [
  "Like-a-Lot",
  "Early Bird",
  "Tech Whisperer",
  "Party Starter",
  "Backpacker",
  "Social Butterfly",
  "Night Owl",
  "Pen Pal",
  "Picky Scholar",
  "Foodie",
  "Music Maestro",
  "Second Thoughts",
  "Memory Collector",
  "Post-a-Lot",
  "Celebrity",
  "tellU Sovereign",
];

// title : icon
export const AchievementIcons: Record<string, string> = {
  "Like-a-Lot": Like_a_Lot,
  "tellU Sovereign": tellU_sovereign,
  "Hidden": empty_achievement,
  "Early Bird": early_bird,
  "Tech Whisperer": tech_whisperer,
  "Party Starter": party_starter,
  "Celebrity": celebrity,
  "Backpacker": backpacker,
  "Social Butterfly": social_butterfly,
  "Night Owl": night_owl,
  "Pen Pal": pen_pal,
  "Picky Scholar": picky,
  "Foodie": dining,
  "Music Maestro": music,
  "Second Thoughts": second_thoughts,
  "Memory Collector": memory_collector,
  "Post-a-Lot": post_a_lot,
  "": "",
};

export const AchievementDescriptions: Record<string, string> = {
  "Like-a-Lot": "Like any 25 posts on tellU.",
  "tellU Sovereign": "Use tellU for over a year!",
  "Early Bird": "Be the first person to comment on a post.",
  "Hidden": "Keep using tellU to unlock more achievements!",
  "Tech Whisperer": "Talk to the tellU AI chatbot",
  "Party Starter": "Use the event tag to promote something in a post",
  "Celebrity": "Get 50 likes on a post",
  "Backpacker": "Make a post at 2 different map pin locations on campus",
  "Social Butterfly": "Tag someone in the comment section of a post",
  "Night Owl": "Post something between 12am and 4am PST",
  "Pen Pal": "Send a DM to someone",
  "Picky Scholar": "Dislike a post",
  "Foodie": "Use the dining tag when making a post",
  "Music Maestro": "Showcase a Spotify song on your user profile",
  "Second Thoughts": "Delete a comment or a post",
  "Memory Collector": "Make 5 posts containing an image",
  "Post-a-Lot": "Post 25 times on tellU",
  "": "",
}
