/**
 * @description returns color of text in top right of post if it has a flair
 * 
 * @param {string} postType the post flair
 * @returns {string} color value corresponding to post flair
 */
export const getColor = (postType: string) => {
  switch (postType) {
    case "general":
      return "#2FD0FA";
    case "alert":
      return "#fb6961";
    case "buy/Sell":
      return "#8efb61";
    case "event":
      return "#FB61DB";
    case "sighting":
      return "#DBFB61";
    case "research" :
      return "#D5CB9F";
    case "housing" :
      return "#ffaf2e";
    case "dining" :
      return "#CE61FB";
    default:
      break;
  }
};