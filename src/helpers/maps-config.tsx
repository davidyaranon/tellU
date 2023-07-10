/* Images */
import Canyon from "../images/canyon.jpeg";
import Canyon_ from '../images/canyon_.jpg';
import Canyon_2 from "../images/canyon_2.jpeg";
import Canyon_3 from "../images/canyon_3.jpeg";
import Canyon_4 from "../images/canyon_4.jpeg";
import Canyon_Bathroom from '../images/canyon_bathroom.jpeg';
import Creekview_1 from "../images/creekview_1.jpeg";
import Creekview_2 from "../images/creekview_2.jpeg";
import Creekview_3 from "../images/creekview_3.jpeg";
import Creekview_4 from "../images/creekview_4.jpeg";
import Creekview_5 from "../images/creekview_5.jpeg";
import Creekview_Bathroom from '../images/creekview_bathroom.jpeg';
import Creek_0 from '../images/creek_0.jpeg';
import Creek_1 from "../images/creek_1.jpeg";
import Creek_2 from "../images/creek_2.jpeg";
import Creek_3 from "../images/creek_3.jpeg";
import Cypress_0 from '../images/cypress_0.jpeg';
import Cypress_1 from "../images/cypress_1.jpeg";
import Cypress_2 from "../images/cypress_2.jpeg";
import Cypress_3 from "../images/cypress_3.jpeg";
import Hill_1 from "../images/hill_1.jpeg";
import Hill_2 from "../images/hill_2.jpeg";
import Hill_3 from "../images/hill_3.jpeg";
import Hill_Bathroom from '../images/hill_bathroom.jpeg';
import Hill_Gender_Neutral_Bathroom from '../images/hill_gender_neutral.jpeg';
import Apts_0 from '../images/apts_0.jpeg';
import Apts_1 from "../images/apts_1.jpeg";
import Apts_2 from "../images/apts_2.jpeg";
import j_0 from '../images/j_0.jpeg';
import j_1 from "../images/j_1.jpeg";
import j_3 from "../images/j_3.jpg";

/* Icons */
import ShowerIcon from '@mui/icons-material/Shower';
import SchoolIcon from '@mui/icons-material/School';
import HotelIcon from '@mui/icons-material/Hotel';
import WeekendIcon from '@mui/icons-material/Weekend';

/* Pigeon Map Details */
export const MAP_TILER_KEY = 'c9MoaJaVglEims9riUks';
export const MAP_TILER_ID = 'streets';
export function mapTiler(x: any, y: any, z: any, dpr: any) {
  return `https://api.maptiler.com/maps/${MAP_TILER_ID}/256/${z}/${x}/${y}.png?key=${MAP_TILER_KEY}`
}

export interface MapMarker {
  location: number[];
  title: string;
  imgSrc: string[];
  description: string[];
  tag: string;
  color: string;
  chip?: any[];
}

export let markers: MapMarker[] = [
  {
    location: [40.87910000000000, -124.07814836935913],
    title: "Canyon",
    imgSrc: [Canyon, Canyon_2, Canyon_3, Canyon_4, Canyon_, /* add_img */],
    description: ["The Canyon consists of eight separate buildings: Alder, Cedar, Chinquapin, Hemlock, Madrone, Maple, Pepperwood, and Tan Oak. Each building has three levels of residents and is home to approximately 50 students. Each building has a kitchen, laundry room, and a TV/study lounge on the ground floor."],
    color: "var(--ion-color-housing)",
    tag: "Housing",
    chip: [
      { title: 'Freshmen', color: "ion-blue", icon: SchoolIcon, image: null },
      { title: 'Communal Bathrooms', color: "ion-blue", icon: ShowerIcon, local: true, image: Canyon_Bathroom },
      { title: 'Single', color: "primary", icon: HotelIcon, local: false, image: 'mapImages/canyon-single_0.jpg' },
      { title: 'Double', color: "primary", icon: HotelIcon, local: false, image: 'mapImages/canyon-double_0.jpg' },
      { title: 'Triple', color: "primary", icon: HotelIcon, local: false, image: 'mapImages/canyon-triple.jpg' },
      { title: 'Suite', color: "primary", icon: HotelIcon, local: false, image: 'mapImages/canyon-suite.png' }
    ]
  },
  {
    location: [40.87650711366812, -124.08006372823574],
    title: "Library",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
  {
    location: [40.87820892589766, -124.07966164730095],
    title: "The Hill",
    imgSrc: [Hill_1, Hill_2, Hill_3, /* add_img */],
    description: ["Redwood and Sunset Halls, known as \"The Hill\", are traditional residence halls. Each building is three stories and houses approximately 225 students in primarily double rooms with a limited number of triple and single rooms.",
      "The triple rooms are the same size as double rooms. The buildings are L-shaped and there are approximately 40 students per floor on each wing.",
      "On the first floor, one wing of the \"L\" is female, the other wing is male. On the second and third floors, men and women are assigned rooms next to each other. Bathrooms are not co-ed.",
      "Each room is furnished with a bed, dresser, desk and closet or wardrobe for each resident. All beds are twin extra long. Each floor has a study area and a TV lounge.On the first floor of each building, there is a kitchen, laundry and lounge area with vending machines and ping pong tables. Custodial services clean the hallways, bathrooms and lounges."
    ],
    chip: [
      { title: 'Freshmen', color: "ion-blue", icon: SchoolIcon, image: null },
      { title: 'Communal Bathrooms', color: "ion-blue", icon: ShowerIcon, local: true, image: Hill_Bathroom },
      { title: 'Gender Neutral Private Bathroom ', color: "ion-blue", icon: ShowerIcon, local: true, image: Hill_Gender_Neutral_Bathroom },
      { title: 'Double', color: "primary", icon: HotelIcon, local: false, image: 'mapImages/hill-double_0.jpg' },
      { title: 'Triple', color: "primary", icon: HotelIcon, local: false, image: 'mapImages/hill-triple.jpg' },
      { title: 'Lounge Area', color: "primary", icon: WeekendIcon, local: true, image: '' },
    ],
    color: "var(--ion-color-housing)",
    tag: "Housing"
  },
  {
    location: [40.87875191469408, -124.07862230601667],
    title: "Jolly Giant Commons",
    imgSrc: [j_0, j_1, j_3, /* add_img */],
    description: [""],
    color: "var(--ion-color-dining)",
    tag: "Dining/Recreation",
  },
  {
    location: [40.878263687897764, -124.07816712005274],
    title: "Cypress",
    imgSrc: [Cypress_1, Cypress_0, Cypress_2, Cypress_3, /* add_img */],
    description: ["Cypress is a series of suites built up the slope of a hillside and houses 231 students. A suite houses 7 to 12 students. Each suite has a living room, bathroom, and a small kitchen area with cooking facilities and a dining table.",
      "Some suites have either a balcony or patio off the living room. There is a main laundry facility on the ground floor of the Cypress complex. There are some suites that have washers and dryers in the suites. A basketball hoop, barbecue, lawn, and recreation area are located on the grounds adjacent to Cypress.",
      "The suites consist of double and single rooms. All rooms are furnished with a bed, desk and wardrobe closet for each resident. All beds are twin extra long. The rooms are wired for optional telephone service and cable TV service. Every resident has the ability to access the internet through wired or wireless connections. Custodial services clean the common areas: kitchen, bathroom, living room and hallway."
    ],
    color: "var(--ion-color-housing)",
    tag: "Housing",
    chip: [
      { title: "Freshman", color: "ion-blue", icon: SchoolIcon, image: null },
      { title: "Single", color: "primary", icon: HotelIcon, image: null },
      { title: "Double", color: "primary", icon: HotelIcon, image: null },
    ]
  },
  {
    location: [40.877495692957545, -124.0783592939952],
    title: "SAC",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-dining)",
    tag: "Dining/Recreation"
  },
  {
    location: [40.876192370982764, -124.0789702440554],
    title: "Van Duzer Theater",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
  {
    location: [40.87720119793835, -124.07725674812491],
    title: "Founders Hall",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
  {
    location: [40.87551466263999, -124.08060995139243],
    title: "Campus Apartments",
    imgSrc: [Apts_0, Apts_1, Apts_2, /* add_img */],
    description: ["The Campus Apartments are home to 207 students in a four level complex comprised of 54 apartments. Each apartment has two rooms with private entrances that share an adjoining kitchen",
      "Rooms house either one or two residents and have private bathrooms. The rooms are furnished with a bed, desk, chair and dresser for each resident and a shared closet. Individual apartments are single gender or coed.",
      "Residents in each unit are responsible for the cleaning of the common area kitchen and bathroom. All residents are responsible for supplying toiletries and bathroom tissue. Laundry facilities are located next to the second floor, and there is a lounge available to residents next to the mailboxes. All beds are extra long twin beds, EXCEPT for the following: double rooms 1-16, 25-32, 40-47 on the A2 or B1 side and double rooms 17-24, 33-39, 48-55 on the A1 or B2 side. Single rooms have either a regular twin or an extra long twin.",
      "Private Bathroom in apartment, toilet and shower behind a full door with a lock - 1 toilet & 1 shower."],
    color: "var(--ion-color-housing)",
    tag: "Housing",
    chip: [
      { title: "Freshman", color: "ion-blue", icon: SchoolIcon, image: null },
      { title: 'Double', color: "primary", icon: HotelIcon, local: true, image: null },
      { title: 'Private Bathrooms', color: "ion-blue", icon: ShowerIcon, local: true, image: Hill_Bathroom },
    ]
  },
  {
    location: [40.874678149454596, -124.08341969266914],
    title: "Hey Juan Burritos",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-dining)",
    tag: "Dining"
  },
  {
    location: [40.87802147101603, -124.07497323187258],
    title: "Creekview",
    imgSrc: [Creekview_1, Creekview_2, Creekview_3, Creekview_4, Creekview_5, /* add_img */],
    description: ["The complex is comprised of four, three story buildings, with a centrally located lounge and a laundry room.",
      "Creekview Apartments(Fern and Willow) have a full kitchen, living room, dining area and bathroom. All rooms are furnished with a bed, desk, dresser and closet. All beds are standard twin. The apartments house 6 students, either in two double rooms and one single or in three doubles. Individual apartments are single gender or coed. ",
      "Creekview Suites(Juniper and Laurel) have a mini kitchenette(with induction stovetop), living room, dining area and a bathroom. Individual suites are single gender or coed. In the coed suites, we assign same genders only to the double rooms and will not assign men and women to the same room. All rooms are furnished with a bed, desk, dresser and closet. All beds are standard twin, except for rooms that end with the number 6; these rooms have extra long twin beds. The suites house 6 students in two double rooms and two single rooms, or suites in Juniper have a double, single and triple room. The newly created triple rooms offer a unique space that combines a former double and single room for our lowest rate."
    ],
    color: "var(--ion-color-housing)",
    tag: "Housing",
    chip: [
      { title: 'Freshman & Upperclassmen', color: "ion-blue", icon: SchoolIcon, image: null },
      { title: 'Private bathrooms', color: "ion-blue", icon: ShowerIcon, local: true, image: Creekview_Bathroom },
      { title: '6 Person Apartment', color: "primary", icon: HotelIcon, local: false, image: '/mapImages/creekview-6.jpg' },
      { title: '6 Person Suite', color: "primary", icon: HotelIcon, local: false, image: '/mapImages/creekview_suite.jpeg' },
    ]
  },
  {
    location: [40.87287985572268, -124.07712777876847],
    title: "BSS",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
  {
    location: [40.87395509634375, -124.07998604637758],
    title: "Marketplace",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-dining)",
    tag: "Dining"
  },
  {
    location: [40.877441480341396, -124.07925574696338],
    title: "Nelson Hall",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
  {
    location: [40.875505404545414, -124.07919569964085],
    title: "Gist Hall",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
  {
    location: [40.87663434160527, -124.07610282652482],
    title: "Redwood Bowl",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-toast-success)",
    tag: "Recreation"
  },
  {
    location: [40.87411504682606, -124.07780297128161],
    title: "Campus Events Field",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-toast-success)",
    tag: "Recreation"
  },
  {
    location: [40.873861486807506, -124.0809568314154],
    title: "College Creek",
    imgSrc: [Creek_0, Creek_1, Creek_2, Creek_3, /* add_img */],
    description: ["The College Creek complex offers 97 apartments to call home, complete with kitchens and furnished living areas, all located next to a community center and NCAA soccer field. Each fully furnished apartment includes all the amenities to help make your stay more comfortable. Residents in each apartment are responsible for the cleaning of the common area kitchen, bathroom, living room and hallway. All residents are responsible for supplying toiletries and bathroom tissue.",
      "Two private bathrooms in each apartment, toilet and shower behind a full door with a lock - 1 toilet & 1 shower in each."],
    color: "var(--ion-color-housing)",
    tag: "Housing",
    chip: [
      { title: 'Upperclassmen', color: "ion-blue", icon: SchoolIcon, image: null },
      { title: '6 Person Apartment', color: "primary", icon: HotelIcon, local: true, image: null },
      { title: '4-5 Person Apartment', color: "primary", icon: HotelIcon, local: true, image: null },
    ]
  },
  {
    location: [40.87453111017034, -124.079232591335],
    title: "SBS",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-toast-success)",
    tag: ""
  },
  {
    location: [40.87354865256135, -124.07723521298793],
    title: "Forestry",
    imgSrc: [/* add_img */],
    description: [""],
    color: "var(--ion-color-primary)",
    tag: "Academics"
  },
];

export const markersCopy: MapMarker[] = markers;
export const setMarkers = (filter: string) => {
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
};

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
}; // +/- buttons that appear on map can be styled here

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