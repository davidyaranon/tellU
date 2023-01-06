export const getColor = (postType: string) => {
  switch (postType) {
    case "general":
      return "#61DBFB";
    case "alert":
      return "#fb6961";
    case "buy/Sell":
      return "#179b59";
    case "event":
      return "#fc4ad3";
    case "sighting":
      return "#eed202";
    case "research" :
      return "#743dff";
    case "housing" :
      return "#ffaf2e";
    case "dining" :
      return "#D5CB9F";
    default:
      break;
  }
};