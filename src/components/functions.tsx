export const getColor = (postType: string) => {
  switch (postType) {
    case "general":
      return "#61DBFB";
    case "alert":
      return "#ff3e3e";
    case "buy/Sell":
      return "#179b59";
    case "event":
      return "#fc4ad3";
    case "sighting":
      return "#eed202";
    default:
      break;
  }
};

export function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

// import axios from 'axios';
// export const getParamValues = (url : string) => {
//   return url
//     .slice(1)
//     .split('&')
//     .reduce((prev : any, curr : string) => {
//       const [title, value] = curr.split('=');
//       prev[title] = value;
//       return prev;
//     }, {});
// };
// export const setAuthHeader = () => {
//   try {
//     const params = JSON.parse(localStorage.getItem('params') || '');
//     if (params) {
//       axios.defaults.headers.common[
//         'Authorization'
//       ] = `Bearer ${params.access_token}`;
//     }
//   } catch (error) {
//     console.log('Error setting auth', error);
//   }
// };