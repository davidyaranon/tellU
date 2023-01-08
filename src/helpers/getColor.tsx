export const getColor = (postType: string) => {
  switch (postType) {
    case "general":
      return "#2FD0FA";
    case "alert":
      return "#fb6961";
    case "buy/Sell":
      return "#179b59";
    case "event":
      return "#FB61DB";
    case "sighting":
      return "#DBFB61";
    case "research" :
      return "#CE61FB";
    case "housing" :
      return "#ffaf2e";
    case "dining" :
      return "#D5CB9F";
    default:
      break;
  }
};