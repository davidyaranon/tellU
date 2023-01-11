import Canyon from "../images/canyon.jpeg";

export const MAP_TILER_KEY = 'c9MoaJaVglEims9riUks';
export const MAP_TILER_ID = 'streets';

export function mapTiler(x: any, y: any, z: any, dpr: any) {
  return `https://api.maptiler.com/maps/${MAP_TILER_ID}/256/${z}/${x}/${y}.png?key=${MAP_TILER_KEY}`
}

export interface Marker {
  location: number[];
  title: string;
  imgSrc: string;
  description: string;
  tag : string;
  color: string;
}

export let markers: Marker[] = [
  {
    location: [40.87910000000000, -124.07814836935913],
    title: "Canyon",
    imgSrc: Canyon,
    description: "The Canyon consists of eight separate buildings: Alder, Cedar, Chinquapin, Hemlock, Madrone, Maple, Pepperwood, and Tan Oak. Each building has three levels of residents and is home to approximately 50 students. Each building has a kitchen, laundry room, and a TV/study lounge on the ground floor.",
    color: "var(--ion-color-housing)",
    tag : "Housing",
  },
  {
    location: [40.87650711366812, -124.08006372823574],
    title: "Library",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
  {
    location: [40.87820892589766, -124.07966164730095],
    title: "The Hill",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-housing)",
    tag : "Housing"
  },
  {
    location: [40.87875191469408, -124.07862230601667],
    title: "Jolly Giant Commons",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-dining)",
    tag : "Dining/Recreation",
  },
  {
    location: [40.878263687897764, -124.07816712005274],
    title: "Cypress",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-housing)",
    tag : "Housing"
  },
  {
    location: [40.877495692957545, -124.0783592939952],
    title: "SAC",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-dining)",
    tag : "Dining/Recreation"
  },
  {
    location: [40.876192370982764, -124.0789702440554],
    title: "Van Duzer Theater",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
  {
    location: [40.87720119793835, -124.07725674812491],
    title: "Founders Hall",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
  {
    location: [40.87551466263999, -124.08060995139243],
    title: "Campus Apartments",
    imgSrc: "",
    description: "",
    color: "#ffaf2e",
    tag : "var(--ion-color-housing)"
  },
  {
    location: [40.874678149454596, -124.08341969266914],
    title: "Hey Juan Burritos",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-dining)",
    tag : "Dining"
  },
  {
    location: [40.87802147101603, -124.07497323187258],
    title: "Creekview",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-housing)",
    tag : "Housing"
  },
  {
    location: [40.87287985572268, -124.07712777876847],
    title: "BSS",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
  {
    location: [40.87395509634375, -124.07998604637758],
    title: "Marketplace",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-dining)",
    tag : "Dining"
  },
  {
    location: [40.877441480341396, -124.07925574696338],
    title: "Nelson Hall",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
  {
    location: [40.875505404545414, -124.07919569964085],
    title: "Gist Hall",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
  {
    location: [40.87663434160527, -124.07610282652482],
    title: "Redwood Bowl",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-toast-success)",
    tag : "Recreation"
  },
  {
    location: [40.87411504682606, -124.07780297128161],
    title: "Campus Events Field",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-toast-success)",
    tag : "Recreation"
  },
  {
    location: [40.873861486807506, -124.0809568314154],
    title: "College Creek",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-housing)",
    tag : "Housing"
  },
  {
    location: [40.87453111017034, -124.079232591335],
    title: "SBS",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-toast-success)",
    tag : ""
  },
  {
    location: [40.87354865256135, -124.07723521298793],
    title: "Forestry",
    imgSrc: "",
    description: "",
    color: "var(--ion-color-primary)",
    tag : "Academics"
  },
];

export const markersCopy : Marker[] = markers;

export const setMarkers = (filter : string) => {
  if (filter === "ALL") {
    markers = markersCopy;
  } else {
    markers = markersCopy.filter((marker) => marker.tag.includes(filter));
  }
}

export const humboldtPOIs = {
  "Canyon": [40.87863884021505, -124.07773811097722, 40.87927157680416, -124.07703000779729, 40.879977314325885, -124.07843012090306, 40.87937703231433, -124.0789772915421],
  "Jolly Giant Commons": [40.878750411486195, -124.07907665054881, 40.878490825932374, -124.07866895477855, 40.87887209186412, -124.0782451657542, 40.87911139595486, -124.07865822594249],
  "Cypress": [40.87818609176301, -124.07890691320519, 40.87854302328025, -124.07842411558251, 40.87832399735009, -124.07807542841057, 40.87791839186204, -124.07850994627098],
  "Cypress ": [40.878185350398375, -124.07813974526456, 40.878205630650044, -124.07735117581419, 40.87841248886186, -124.07745846417478, 40.87837192847912, -124.07809682992033],
  "The Hill": [40.87777807236831, -124.08009685969837, 40.87788758632714, -124.07899178958424, 40.8787515234278, -124.07921173072346, 40.87865417896606, -124.08016123271473],
  "Library": [40.87718807112126, -124.08064213228931, 40.877220520009764, -124.07979991865864, 40.87603612527451, -124.07962289286365, 40.87597933869323, -124.08053484392872],
  "Nelson Hall": [40.87778017236273, -124.07949252376613, 40.87778017236273, -124.07933159122524, 40.87731372200505, -124.07932622680721, 40.87730966590055, -124.0794871593481],
  "Nelson Hall ": [40.87750000239976, -124.07930991022938, 40.877491890213385, -124.0787734684264, 40.877349926790735, -124.07878419726246, 40.87731747796567, -124.07930991022938],
  "SAC": [40.87777176433443, -124.07880571143275, 40.877917888249875, -124.07808951870544, 40.8772431368873, -124.07785078779635, 40.8771399895761, -124.07860108493922],
  "Hey Juan Burritos": [40.87482012069163, -124.08349328108892, 40.87474710802276, -124.0831124074088, 40.87439015603808, -124.08325188227758, 40.874442887702415, -124.08366494246587],
  "Van Duzer Theater": [40.87643441813533, -124.07951361374765, 40.87643441813533, -124.07873577313333, 40.875821935408524, -124.07871431546121, 40.87582599160416, -124.0794867916575],
  "Gist Hall": [40.87513039510785, -124.0796350947864, 40.875124658720615, -124.0786412720985, 40.87570976765772, -124.07864885853122, 40.875675349628104, -124.07960474905546],
  "Founders Hall": [40.877660093432425, -124.077890215258, 40.876472696053035, -124.07738192426496, 40.876616102664464, -124.07669155888635, 40.877769080530484, -124.07714674485027],
  "Redwood Bowl": [40.87738351990805, -124.0767584940093, 40.875869147965986, -124.07660676535465, 40.875915038533826, -124.07539293611754, 40.87746382654376, -124.0755446647722],
  "Creekview Complex": [40.87852624910017, -124.07602395280597, 40.8785033047253, -124.07399837526653, 40.877413437758406, -124.07397561596832, 40.877602731729766, -124.07580394625674],
  "Campus Apartments": [40.87540704075508, -124.08118652028006, 40.875768430638296, -124.08118652028006, 40.875739748973615, -124.0800333825048, 40.875263631524504, -124.08009407396665],
  "College Creek ": [40.87365169040294, -124.08155825548393, 40.87334191786237, -124.08076926647979, 40.873674636459384, -124.08067822928702, 40.873674636459384, -124.08067822928702],
  "College Creek": [40.87367869278657, -124.08151507849966, 40.87371519972021, -124.07972872729574, 40.87255508065106, -124.07969654078757, 40.872534798668354, -124.08138633246695],
  "Marketplace": [40.87416837994466, -124.08021962258616, 40.87416837994466, -124.079650994275, 40.87375869267233, -124.079650994275, 40.87374652370469, -124.08022498700419],
  "SBS": [40.874196010604706, -124.07963377400213, 40.87484907094043, -124.07961768074804, 40.87486123970543, -124.07858771248632, 40.87420006689996, -124.07859844132238],
  "Campus Events Field": [40.87440986131338, -124.07852599690956, 40.87439769246541, -124.07701323102516, 40.87382169776997, -124.07704541753334, 40.87382169776997, -124.07850990365547],
  "BSS": [40.872403722347585, -124.07771440677251, 40.87314604033667, -124.0777465932807, 40.87317849120643, -124.07644840411749, 40.8723834403185, -124.07651814155187],
  "Forestry": [40.873369735739, -124.07759248444609, 40.87341029918665, -124.07654642293028, 40.87375103116581, -124.07661616036467, 40.87372669322545, -124.07760321328215],
}


export const schoolInfo = {
  "Cal Poly Humboldt": [40.87649434150835, -124.07918370203882, 15.5],
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
  "Cal State Fullerton": [33.882321, -117.885243, 15],
  "Cal State East Bay": [37.658206, -122.056675, 15.55],
  "Cal State LA": [34.066371, -118.168618, 15.5],
  "Cal Maritime": [38.068826, -122.231217, 15],
  "Cal State San Bernardino": [34.182086, -117.324099, 15],
  "Cal State Long Beach": [33.783184, -118.114344, 14.85],
  "SF State": [37.724175, -122.480692, 15],
  "San Jose State": [37.335563, -121.880310, 15.55],
  "Chico State": [39.729203, -121.845977, 15],
  "Fresno State": [36.813626, -119.746273, 15],
  "San Diego State": [32.775547, -117.070745, 15.5],
  "Sonoma State": [38.340656, -122.673278, 15],
  "Stanislaus State": [37.5254, -120.855, 15.15],
  "CSUN": [34.240649, -118.529977, 15],
  "CSU Bakersfield": [35.350448, -119.104289, 15.5],
  "CSU Dominguez Hills": [33.863126, -118.2569, 15],
  "CSU Channel Islands": [34.162439, -119.043469, 15],
  "CSU Monterey Bay": [36.652176, -121.800202, 15],
  "": [37.250458, -120.350249, 6],
}; // school latitude, longitude, and zoom level


export const zoomControlButtonsStyleDark = {
  width: "50px",
  height: '50px',
  borderRadius: '7.5px',
  boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
  background: '#2f2f2f',
  lineHeight: '50px',
  fontSize: '25PX',
  fontWeight: '500',
  color: 'WHITE',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '0px',
}

export const zoomControlButtonsStyle = {
  width: "50px",
  height: '50px',
  borderRadius: '7.5px',
  boxShadow: '0 1px 4px -1px rgba(0,0,0,.3)',
  background: 'white',
  lineHeight: '26px',
  fontSize: '25PX',
  fontWeight: '500',
  color: 'BLACK',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '0px',
}; // +/- buttons that appear on map can be styled here