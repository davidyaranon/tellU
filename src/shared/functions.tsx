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
    case "research" :
      return "#743dff";
    case "housing" :
      return "#ffaf2e";
    case "dining" :
      return "#1ef8f1";
    default:
      break;
  }
};

export function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

export const zoomControlButtonsStyleDark = {
  width: "50px",
  height: '50px',
  borderRadius: '7.5px',
  boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
  background: '#2f2f2f',
  lineHeight: '26px',
  fontSize: '25PX',
  fontWeight: '700',
  color: 'WHITE',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '-7.5px',
}

export const zoomControlButtonsStyle = {
  width: "50px",
  height: '50px',
  borderRadius: '7.5px',
  boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
  background: 'white',
  lineHeight: '26px',
  fontSize: '25PX',
  fontWeight: '700',
  color: 'BLACK',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '-7.5px',
}; // +/- buttons that appear on map can be styled here

export const schoolInfo = {
  "Cal Poly Humboldt": [40.875130691835615, -124.07857275064532, 15.74],
  "UC Berkeley": [37.87196553251828, -122.25832234237413, 15.5],
  "UC Davis": [38.53906813693881, -121.7519863294826, 15],
  "UC Irvine": [33.642798513829284, -117.83657521816043, 14.5],
  "UCLA": [34.068060230062784, -118.4450963024167, 15.5],
  "UC Merced": [37.362385, -120.427911, 15],
  "UC Riverside": [33.972975051337265, -117.32790083366463, 16],
  "UC San Diego": [32.8791284369769, -117.2368054903461, 15],
  "UCSF": [37.76894651194302, -122.42952641954717, 13],
  "UC Santa Barbara": [34.41302723872466, -119.84749752183016, 15],
  "UC Santa Cruz": [36.994178678923895, -122.05892788857311, 15],
  "Cal Poly Pomona": [34.055493, -117.819520, 15],
  "Cal Poly San Luis Obispo": [35.304962, -120.662559, 15],
  "Cal State Fullerton" : [33.882321, -117.885243, 15],
  "Cal State East Bay" : [37.658206, -122.056675, 15.55],
  "Cal State LA" : [34.066371, -118.168618, 15.5],
  "Cal Maritime" : [38.068826, -122.231217, 15],
  "Cal State San Bernardino" : [34.182086, -117.324099, 15],
  "Cal State Long Beach" : [33.783184, -118.114344, 14.85],
  "SF State": [37.724175, -122.480692, 15],
  "San Jose State" : [37.335563, -121.880310,15.55],
  "Chico State" : [39.729203, -121.845977, 15],
  "Fresno State" : [36.813626, -119.746273, 15],
  "San Diego State" : [32.775547, -117.070745, 15.5],
  "Sonoma State" : [38.340656, -122.673278, 15],
  "Stanislaus State" : [37.5254, -120.855, 15.15],
  "CSUN" : [34.240649, -118.529977, 15],
  "CSU Bakersfield" : [35.350448, -119.104289, 15.5],
  "CSU Dominguez Hills" : [33.863126, -118.2569, 15],
  "CSU Channel Islands" : [34.162439, -119.043469, 15],
  "CSU Monterey Bay" : [36.652176, -121.800202, 15],
  "": [37.250458, -120.350249, 6],
}; // school latitude, longitude, and zoom level