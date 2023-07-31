import empty_achievement from '../images/empty_achievement.png';
import tellU_sovereign from '../images/tellU_sovereign.png';
import Like_a_Lot from '../images/like-a-lot.png';
import early_bird from '../images/early_bird.png';
import tech_whisperer from '../images/tech_whisperer_.png';
import party_starter from '../images/party_starter.png';
import backpacker from '../images/backpacker.png';
import social_butterfly from '../images/social_butterfly.png';
import night_owl from '../images/night_owl.png';
import pen_pal from '../images/pen_pal.png';
import picky from '../images/picky_.png';
import celebrity from '../images/celebrity.png';
import dining from '../images/dining.png';
import music from '../images/music.png';
import second_thoughts from '../images/second_thoughts.png';
import post_a_lot from '../images/post-a-lot.png';
import class_act from '../images/class_act.png';

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
  "Picture This",
  "Celebrity",
  "Class Act",
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
  "Picture This": post_a_lot,
  "Class Act": class_act,
  "": "",
};

export const AchievementDescriptions: Record<string, string> = {
  "Like-a-Lot": "Like any 25 posts on tellU.", // implemented
  "tellU Sovereign": "Use tellU for over a year!", // implemented
  "Early Bird": "Be the first person to comment on a post.", // implemented
  "Hidden": "Keep using tellU to unlock more achievements!", // implemented
  "Tech Whisperer": "Talk to the tellU AI chatbot", // implemented
  "Party Starter": "Use the event tag to promote something in a post", // implemented
  "Celebrity": "Get 50 likes on a post",
  "Backpacker": "Make a post at 2 different map pin locations on campus",
  "Social Butterfly": "Tag someone in the comment section of a post", // implemented
  "Night Owl": "Post something between 12am and 4am PST",
  "Pen Pal": "Send a DM to someone", // implemented
  "Picky Scholar": "Dislike a post", // implemented
  "Foodie": "Use the dining tag when making a post", // implemented
  "Music Maestro": "Showcase a Spotify song on your user profile", // implemented
  "Second Thoughts": "Delete a comment", // implemented
  "Picture This": "Make a post containing 3 images", // implemented
  "Class Act": "Make a post about a specific class", // implemented
  "": "",
}
