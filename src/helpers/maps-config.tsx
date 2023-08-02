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
import ShowerIconOutlined from '@mui/icons-material/ShowerOutlined';
import SchoolIconOutlined from '@mui/icons-material/SchoolOutlined';
import HotelIconOutlined from '@mui/icons-material/HotelOutlined';
import WeekendIconOutlined from '@mui/icons-material/WeekendOutlined';

/* Pigeon Map Details */
export const MAP_TILER_KEY = 'c9MoaJaVglEims9riUks';
export function mapTiler(darkMode: boolean, x: any, y: any, z: any, dpr: any) {
  let MAP_TILER_ID = darkMode ? 'streets-v2-dark' : 'streets';
  return `https://api.maptiler.com/maps/${MAP_TILER_ID}/256/${z}/${x}/${y}.png?key=${MAP_TILER_KEY}`
};

export interface MapMarker {
  location: number[];
  title: string;
  imgSrc: string[];
  description: string[];
  tag: string;
  color: string;
  chip?: any[];
}


export let markers: Record<string, MapMarker[]> = (() => {
  let initialMarkers: Record<string, MapMarker[]> =
  {
    "Cal Poly Humboldt":
      [
        {
          location: [40.87910000000000, -124.07814836935913],
          title: "Canyon",
          imgSrc: [Canyon, Canyon_2, Canyon_3, Canyon_4, Canyon_, /* add_img */],
          description: ["The Canyon consists of eight separate buildings: Alder, Cedar, Chinquapin, Hemlock, Madrone, Maple, Pepperwood, and Tan Oak. Each building has three levels of residents and is home to approximately 50 students. Each building has a kitchen, laundry room, and a TV/study lounge on the ground floor."],
          color: "var(--ion-color-housing)",
          tag: "Housing",
          chip: [
            { title: 'Freshmen', color: "primary", icon: SchoolIconOutlined, image: null },
            { title: 'Communal Bathrooms', color: "primary", icon: ShowerIconOutlined, local: true, image: Canyon_Bathroom },
            { title: 'Single', color: "primary", icon: HotelIconOutlined, local: false, image: 'mapImages/canyon-single_0.jpg' },
            { title: 'Double', color: "primary", icon: HotelIconOutlined, local: false, image: 'mapImages/canyon-double_0.jpg' },
            { title: 'Triple', color: "primary", icon: HotelIconOutlined, local: false, image: 'mapImages/canyon-triple.jpg' },
            { title: 'Suite', color: "primary", icon: HotelIconOutlined, local: false, image: 'mapImages/canyon-suite.png' }
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
            { title: 'Freshmen', color: "primary", icon: SchoolIconOutlined, image: null },
            { title: 'Communal Bathrooms', color: "primary", icon: ShowerIconOutlined, local: true, image: Hill_Bathroom },
            { title: 'Gender Neutral Private Bathroom ', color: "primary", icon: ShowerIconOutlined, local: true, image: Hill_Gender_Neutral_Bathroom },
            { title: 'Double', color: "primary", icon: HotelIconOutlined, local: false, image: 'mapImages/hill-double_0.jpg' },
            { title: 'Triple', color: "primary", icon: HotelIconOutlined, local: false, image: 'mapImages/hill-triple.jpg' },
            { title: 'Lounge Area', color: "primary", icon: WeekendIconOutlined, local: true, image: '' },
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
            { title: "Freshman", color: "primary", icon: SchoolIconOutlined, image: null },
            { title: "Single", color: "primary", icon: HotelIconOutlined, image: null },
            { title: "Double", color: "primary", icon: HotelIconOutlined, image: null },
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
            { title: "Freshman", color: "primary", icon: SchoolIconOutlined, image: null },
            { title: 'Double', color: "primary", icon: HotelIconOutlined, local: true, image: null },
            { title: 'Private Bathrooms', color: "primary", icon: ShowerIconOutlined, local: true, image: Hill_Bathroom },
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
            { title: 'Freshman & Upperclassmen', color: "primary", icon: SchoolIconOutlined, image: null },
            { title: 'Private bathrooms', color: "primary", icon: ShowerIconOutlined, local: true, image: Creekview_Bathroom },
            { title: '6 Person Apartment', color: "primary", icon: HotelIconOutlined, local: false, image: '/mapImages/creekview-6.jpg' },
            { title: '6 Person Suite', color: "primary", icon: HotelIconOutlined, local: false, image: '/mapImages/creekview_suite.jpeg' },
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
            { title: 'Upperclassmen', color: "primary", icon: SchoolIconOutlined, image: null },
            { title: '6 Person Apartment', color: "primary", icon: HotelIconOutlined, local: true, image: null },
            { title: '4-5 Person Apartment', color: "primary", icon: HotelIconOutlined, local: true, image: null },
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
      ],
    "UC Davis": [
      {
        location: [
          38.543132,
          -121.747517
        ],
        title: "Agricultural & Resource Economics Library",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Academics (Library)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.533489,
          -121.763429
        ],
        title: "Carlson Health Sciences Library",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Academics (Library)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.535978,
          -121.74973
        ],
        title: "Law Library",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Academics (Library)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.53974,
          -121.749113
        ],
        title: "Peter J. Shields Library",
        imgSrc: [
          ""
        ],
        description: [
          "The Peter J. Shields Library supports the teaching, research, and instruction needs for academic departments and programs in the Arts, Humanities, Social Sciences, Biological & Agricultural Sciences, Computer Sciences, and Mathematics/Statistics",
        ],
        tag: "Academics (Library)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537312,
          -121.75084
        ],
        title: "Physical Sciences & Engineering Library",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Academics (Library)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541793,
          -121.748273
        ],
        title: "Women's Resources & Research Center ",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Academics (Library)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.542754,
          -121.749193
        ],
        title: "Campus Store",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Stores",
        color: "var(--ion-color-buysell)",
        chip: []
      },
      {
        location: [
          38.543373,
          -121.740219
        ],
        title: "Downtown Store",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Stores",
        color: "var(--ion-color-buysell)",
        chip: []
      },
      {
        location: [
          38.542435,
          -121.749233
        ],
        title: "The Market",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Stores",
        color: "var(--ion-color-buysell)",
        chip: []
      },
      {
        location: [
          38.534379,
          -121.747242
        ],
        title: "Welcome Center Store",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Stores",
        color: "var(--ion-color-buysell)",
        chip: []
      },
      {
        location: [
          38.547244,
          -121.763255
        ],
        title: "Cuarto Dining Commons",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.538064,
          -121.756434
        ],
        title: "Latitude Dining Commons",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.53792,
          -121.756279
        ],
        title: "Latitude Market",
        imgSrc: [
          "https://campusmap.ucdavis.edu/photos/Latitude%20Market.jpg",
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.545036,
          -121.758272
        ],
        title: "Segundo Market",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.543936,
          -121.758088
        ],
        title: "Segundo Dining Commons",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.536192,
          -121.757503
        ],
        title: "Tercero Dining Commons",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.536102,
          -121.757106
        ],
        title: "Tercero Market",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.539815,
          -121.754787
        ],
        title: "Bio Brew",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.540882,
          -121.752912
        ],
        title: "California Coffee",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.542061,
          -121.749853
        ],
        title: "Coffee House",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.539527,
          -121.751609
        ],
        title: "CoHo South Cafe",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.538534,
          -121.753203
        ],
        title: "Gunrock Pub",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.535413,
          -121.746331
        ],
        title: "Hyatt Place Gallery",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.536234,
          -121.750222
        ],
        title: "King Hall Coffee",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.538064,
          -121.756434
        ],
        title: "Latitude Dining Commons",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.541812,
          -121.759624
        ],
        title: "Peet's at the ARC",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.538776,
          -121.752788
        ],
        title: "Peet's at the Silo",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.541317,
          -121.771848
        ],
        title: "Sage Street Market Cafe",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.531837,
          -121.761797
        ],
        title: "Scrubs Cafe",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.538789,
          -121.753043
        ],
        title: "Silo",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Dining",
        color: "var(--ion-color-dining)",
        chip: []
      },
      {
        location: [
          38.547231,
          -121.763612
        ],
        title: "Cuarto Residence Halls",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.544237,
          -121.755798
        ],
        title: "Regan Residence Halls",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.54492,
          -121.757908
        ],
        title: "Segundo Residence Halls",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.5383,
          -121.744
        ],
        title: "Solano Park Apartments",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.536121,
          -121.757141
        ],
        title: "Tercero Residence Halls",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.542499,
          -121.77353
        ],
        title: "The Green",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.549371,
          -121.76704
        ],
        title: "8th & Wake",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.545606,
          -121.761236
        ],
        title: "Atriums at La Rue Park",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.543345,
          -121.764981
        ],
        title: "Baggins End (Domes)",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.54117,
          -121.762198
        ],
        title: "The Colleges at La Rue",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.544283,
          -121.761079
        ],
        title: "Living Groups at La Rue Parkway",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.54538,
          -121.755597
        ],
        title: "Primero Grove Apartments",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.540194,
          -121.770623
        ],
        title: "The Ramble Apartments",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.545005,
          -121.763171
        ],
        title: "Russell Park Apartments",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.54146,
          -121.772557
        ],
        title: "Solstice",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.5432,
          -121.755412
        ],
        title: "Tri-Cooperatives",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.541407,
          -121.770971
        ],
        title: "Viridian",
        imgSrc: [
          ""
        ],
        description: [""],
        tag: "Housing (Private)",
        color: "var(--ion-color-housing)",
        chip: []
      },
      {
        location: [
          38.535269,
          -121.753024
        ],
        title: "Academic Surge",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.54291,
          -121.759651
        ],
        title: "Activities & Recreation Center (ARC)",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Recreation",
        color: "var(--ion-color-toast-success)",
        chip: []
      },
      {
        location: [
          38.542632,
          -121.76441
        ],
        title: "Agriculture Field Station",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537502,
          -121.760505
        ],
        title: "Animal Sciences Teaching Facility",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.529221,
          -121.782744
        ],
        title: "Aquatic Biology & Environmental Science Bldg",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.524462,
          -121.784803
        ],
        title: "Aquatic Weed Laboratory",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.538964,
          -121.748536
        ],
        title: "Art Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541846,
          -121.753228
        ],
        title: "Asmundson Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537197,
          -121.753252
        ],
        title: "Bainer Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.540173,
          -121.756137
        ],
        title: "Briggs Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.5412832,
          -121.752998
        ],
        title: "California Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.518019,
          -121.752345
        ],
        title: "California Raptor Museum",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.538232,
          -121.751178
        ],
        title: "Chemistry",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.531096,
          -121.776179
        ],
        title: "Civil & Industrial Services",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.544399,
          -121.754
        ],
        title: "Cowell Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.543292,
          -121.754145
        ],
        title: "Cruess Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.551548,
          -121.711945
        ],
        title: "Design & Construction Management (DCM)",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.54157,
          -121.747704
        ],
        title: "Dutton Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.535159,
          -121.751604
        ],
        title: "Earth and Physical Sciences Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.53801,
          -121.762246
        ],
        title: "Edwards Family Athletics Center",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Recreation",
        color: "var(--ion-color-toast-success)",
        chip: []
      },
      {
        location: [
          38.538494,
          -121.750235
        ],
        title: "Everson Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.542584,
          -121.750214
        ],
        title: "Freeborn Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.534808,
          -121.747233
        ],
        title: "Gallagher Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.536124,
          -121.753522
        ],
        title: "Ghausi Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537721,
          -121.755458
        ],
        title: "Giedt Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.53961,
          -121.756743
        ],
        title: "Green Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539814,
          -121.753498
        ],
        title: "Haring Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.54063,
          -121.75085
        ],
        title: "Hart Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.543801,
          -121.748684
        ],
        title: "Hickey Gym",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Recreation",
        color: "var(--ion-color-toast-success)",
        chip: []
      },
      {
        location: [
          38.542039,
          -121.754525
        ],
        title: "Hoagland Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537604,
          -121.791059
        ],
        title: "Hopkins Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.543486,
          -121.750707
        ],
        title: "Hunt Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.540962,
          -121.753678
        ],
        title: "Hutchison Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.536994,
          -121.754909
        ],
        title: "Kemper Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541561,
          -121.751996
        ],
        title: "Kerr Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.535978,
          -121.74973
        ],
        title: "King Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.540801,
          -121.755232
        ],
        title: "Kleiber Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.535875,
          -121.752731
        ],
        title: "Mathematical Sciences Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.5335,
          -121.763491
        ],
        title: "Medical Sciences",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.53477,
          -121.754508
        ],
        title: "Meyer Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.534401,
          -121.749163
        ],
        title: "Mondavi Center for the Performing Arts",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537044,
          -121.749164
        ],
        title: "Mrak Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539163,
          -121.747428
        ],
        title: "Music Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539053,
          -121.734647
        ],
        title: "Neurosciences Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541793,
          -121.748273
        ],
        title: "North Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.54001,
          -121.747623
        ],
        title: "Olson Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.538702,
          -121.751509
        ],
        title: "Peter A. Rock Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.536598,
          -121.751303
        ],
        title: "Physics Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.543427,
          -121.752028
        ],
        title: "Plant & Environmental Sciences",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.540558,
          -121.751837
        ],
        title: "Robbins Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.537037,
          -121.751798
        ],
        title: "Roessler Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.533504,
          -121.763894
        ],
        title: "Schalm Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.540516,
          -121.746933
        ],
        title: "School of Education Building",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539455,
          -121.755868
        ],
        title: "Sciences Lecture Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.536654,
          -121.756698
        ],
        title: "Scrub Oak Hall (Auditorium)",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.543132,
          -121.747517
        ],
        title: "Social Sciences & Humanities",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541188,
          -121.748093
        ],
        title: "South Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539992,
          -121.747023
        ],
        title: "Sproul Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.540827,
          -121.754596
        ],
        title: "Storer Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539527,
          -121.751609
        ],
        title: "Student Community Center",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.542689,
          -121.761542
        ],
        title: "Student Health & Wellness Center",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Recreation",
        color: "var(--ion-color-toast-success)",
        chip: []
      },
      {
        location: [
          38.533978,
          -121.764782
        ],
        title: "Tupper Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.536057,
          -121.7466
        ],
        title: "Urban Forestry",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.532823,
          -121.763704
        ],
        title: "Valley Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.542947,
          -121.752287
        ],
        title: "Veihmeyer Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541216,
          -121.746955
        ],
        title: "Voorhies Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.539654,
          -121.750731
        ],
        title: "Walker Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.541337,
          -121.751393
        ],
        title: "Wellman Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.542042,
          -121.75159
        ],
        title: "Wickson Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.538748,
          -121.747897
        ],
        title: "Wright Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
      {
        location: [
          38.542401,
          -121.747709
        ],
        title: "Young Hall",
        imgSrc: [
          ""
        ],
        description: [
          ""
        ],
        tag: "Academics (Building)",
        color: "var(--ion-color-primary)",
        chip: []
      },
    ],
    "": [{ location: [], title: "", color: "", imgSrc: [""], description: [""], tag: "" }]
  }

  initialMarkers["UC Davis"] = initialMarkers["UC Davis"].map(marker => {
    if (marker.imgSrc.length === 0 || (marker.imgSrc.length === 1 && marker.imgSrc[0] === "")) {
      return {
        ...marker,
        imgSrc: [`https://campusmap.ucdavis.edu/photos/${encodeURIComponent(marker.title)}.jpg`],
      };
    }
    return marker;
  });

  return initialMarkers;
})();

export const davisPOIs: Record<string, number[]> = {
  "8th & Wake": [38.55001975490122, -121.76730662067794, 38.55004444041633, -121.76706199533058, 38.54929769983496, -121.7669357370868, 38.549254499729315, -121.76730662067794],
  "The Green": [38.543411953158646, -121.77862108347288, 38.54337431077106, -121.7717147661843, 38.54207563633434, -121.77181102147756, 38.54218856547713, -121.7787414025894],
  "Solstice": [38.54189967457975, -121.7734333132694, 38.54183584952752, -121.7720021442509, 38.54114849922179, -121.77203980659348, 38.54116322822576, -121.7734144820981],
  "Sage Street Market Cafe": [38.541549519070145, -121.77205721230317, 38.541541127440595, -121.77160123677064, 38.54110895719519, -121.77160660118867, 38.54110895719519, -121.7720786699752],
  "Viridian": [38.54225629997353, -121.77152353505707, 38.542239516878375, -121.7704131005249, 38.54102273204533, -121.77043455819702, 38.54103951542442, -121.77155035714722],
  "The Ramble Apartments": [38.540929065928225, -121.77147893370298, 38.54091006508869, -121.76943834910755, 38.53924747219322, -121.7695112271288, 38.53929497538068, -121.77156395806112],
  "Hopkins Building": [38.53783303447959, -121.79187698244723, 38.53781195637095, -121.79053635362591, 38.53706894909447, -121.79054309045415, 38.53701098366507, -121.79178940368001],
  "Aquatic Weed Laboratory": [38.52471977776095, -121.7852187423973, 38.52469879377714, -121.78425851156997, 38.523934972602135, -121.78438725760269, 38.523972744169455, -121.7852348356514],
  "Aquatic Biology & Environmental Science Bldg": [38.529712256757705, -121.7832025878227, 38.52967029169556, -121.78229600117567, 38.52873026788876, -121.78233355210187, 38.52879321629518, -121.78318113015058],
  "Civil & Industrial Services": [38.53128466267311, -121.77648745403671, 38.53128466267311, -121.77584908829117, 38.53086921655847, -121.77587591038132, 38.530890198743, -121.77646599636459],
  "Scrubs Cafe": [38.532116104071875, -121.76212494797099, 38.532086174365965, -121.7612832148454, 38.53151750758832, -121.7613433386401, 38.531513231881235, -121.7621304137705],
  "Valley Hall": [38.53303177461833, -121.76418032771683, 38.53306534510157, -121.76319863921738, 38.532528215489954, -121.76320936805344, 38.53255758986924, -121.76415887004471],
  "Schalm Hall": [38.53364423718272, -121.76417563194656, 38.53367361110635, -121.763714291996, 38.53334630099385, -121.7636981987419, 38.53333371211362, -121.76413808102035],
  "Medical Sciences": [38.533717358986124, -121.76373745403671, 38.53378869556449, -121.76315273247147, 38.533297730622664, -121.76314736805344, 38.533234786157045, -121.76374281845474],
  "Tupper Hall": [38.53441390524572, -121.76531508516592, 38.534388727856694, -121.76422074388785, 38.53356206535656, -121.76424220155997, 38.53355367279515, -121.76526144098563],
  "California Raptor Museum": [38.51830600502179, -121.75275282758184, 38.51830600502179, -121.7518623341889, 38.51773518761885, -121.75186769860693, 38.51777296243979, -121.752779649672],
  "Design & Construction Management (DCM)": [38.55188831372427, -121.712469287739, 38.55189250893549, -121.71133739553471, 38.55121707677881, -121.71134275995274, 38.55127581026171, -121.712469287739],
  "Neurosciences Building": [38.53951086164224, -121.73509068768087, 38.53951669429827, -121.73403180279543, 38.538472641333264, -121.73403180279543, 38.53857179785271, -121.7351056015525],
  "Downtown Store": [38.543484005906, -121.74061029243856, 38.5435516430021, -121.7398482093925, 38.54306972730437, -121.7398482093925, 38.54303590853767, -121.74063191181574],
  "Solano Park Apartments": [38.539543942893545, -121.74554861628326, 38.53980037238428, -121.74199413211218, 38.536858126455925, -121.74213217033241, 38.53697959770619, -121.74572116405855],
  "Hyatt Place Gallery": [38.53578358179978, -121.74672939378506, 38.53579617355594, -121.74568305766483, 38.53512461015171, -121.74569915514361, 38.53512461015171, -121.74670793048003],
  "Urban Forestry": [38.536207503045134, -121.74689573439905, 38.53624108085878, -121.74631622516323, 38.535871724046594, -121.74632159098948, 38.53586332955155, -121.74690646605157],
  "Gallagher Hall": [38.53491891477829, -121.74761129075114, 38.53496088779474, -121.74696202577398, 38.53473423321505, -121.74695665994773, 38.534679668116986, -121.74754690083606],
  "Welcome Center Store": [38.53455707325108, -121.74748614509471, 38.5346410196817, -121.74680468516001, 38.53434720674599, -121.74673492941866, 38.53426745731355, -121.74744858431092],
  "Mondavi Center for the Performing Arts": [38.534679709424424, -121.74980941237258, 38.53475104504856, -121.74873652876663, 38.534155180604145, -121.74861851156997, 38.53408804063906, -121.7496323865776],
  "King Hall": [38.536088396408594, -121.75026453569981, 38.53614714224795, -121.74911655024144, 38.535765293434494, -121.74911118582341, 38.53569815497207, -121.75021089151952],
  "King Hall Coffee": [38.536296933342804, -121.75040833816635, 38.53630952170451, -121.75004892215836, 38.53610810765299, -121.75004892215836, 38.53609132312325, -121.75039224491226],
  "Mrak Hall": [38.53719923432916, -121.74954497486684, 38.53726217532614, -121.74870812565419, 38.53683837155015, -121.74870276123616, 38.53682578328098, -121.7495020595226],
  "Earth and Physical Sciences Building": [38.535567786619225, -121.75185880985642, 38.535546805798845, -121.7513170036354, 38.534787295981026, -121.75133846130753, 38.53471176417954, -121.75189636078262],
  "Meyer Hall": [38.53502772854202, -121.75514084771694, 38.53505035852009, -121.75388961737374, 38.534439346614334, -121.75392578010042, 38.53446763431713, -121.75520594062496],
  "Academic Surge": [38.53553312694528, -121.75363510021197, 38.53554991160526, -121.75223498710619, 38.535075743453305, -121.7522725380324, 38.535088332028714, -121.75367265113817],
  "Mathematical Sciences Building": [38.536027817676256, -121.75311992030717, 38.536019425402486, -121.75228307109452, 38.53572569520441, -121.75229379993058, 38.535708910585434, -121.7531252847252],
  "Ghausi Hall": [38.53643064566496, -121.75380656581498, 38.53651876398679, -121.7532862172661, 38.53572149905006, -121.75324866633989, 38.5357047144301, -121.7537368283806],
  "Physics Building": [38.53677352457422, -121.75174316299584, 38.53685325029956, -121.7509438647094, 38.53626579551332, -121.7509438647094, 38.5362448148965, -121.75163587463524],
  "Physical Sciences & Engineering Building": [38.53743650423414, -121.75107261074211, 38.5374784647665, -121.7506380928817, 38.53718054445666, -121.75062199962761, 38.537146975893705, -121.75101360214379],
  "Roessler Hall": [38.53725695066276, -121.75207426752853, 38.5372905191744, -121.75153782572555, 38.53687091165296, -121.75153246130752, 38.53682055858592, -121.75202598776626],
  "Wright Hall": [38.53894849891889, -121.74812983734896, 38.538990458569266, -121.74764167530824, 38.53857505695221, -121.74762021763613, 38.53851211710398, -121.7481191085129],
  "Music Building": [38.539351310552135, -121.74763094647219, 38.53938068214549, -121.74727153046419, 38.53899465453296, -121.7472554372101, 38.53896528278197, -121.74755584461977],
  "Art Building": [38.539079043202086, -121.74889809821701, 38.539175550186215, -121.74818463061905, 38.538898616754, -121.74818463061905, 38.53884826510632, -121.74888736938095],
  "Olsen Hall": [38.54019362217178, -121.74790759576409, 38.54024397287767, -121.74741943372338, 38.53979920708935, -121.74740870488732, 38.539778227503106, -121.7478378583297],
  "Cuarto Dining Commons": [38.547413559608025, -121.76340252149582, 38.54743453696703, -121.76290899503708, 38.547136657895386, -121.76290363061905, 38.54711568044946, -121.76339715707779],
  "Cuarto Residence Halls": [38.54794282251997, -121.76540371562194, 38.5478589136403, -121.76341888095092, 38.5465331403461, -121.7633974232788, 38.546516358248994, -121.76568266535949],
  "Atriums at La Rue Park": [38.54588234378067, - 121.76174495959543, 38.545869757094295, -121.76074181342386, 38.54530335392791, -121.76076863551401, 38.5453117451185, -121.76176105284952],
  "Living Groups at La Rue Parkway": [38.54522036967453, -121.76212237930679, 38.54522036967453, -121.76050768947982, 38.54377287297801, -121.76046477413558, 38.54380224276577, -121.76213310814285],
  "Russell Park Apartments": [38.54599624596459, -121.764055793718, 38.54598805656311, -121.76216055510312, 38.54401438361062, -121.76218149696626, 38.54401438361062, -121.76406626464959],
  "Baggins End (Domes)": [38.54379057197781, -121.76559154683895, 38.54378067501735, -121.76417431894335, 38.54296417108732, -121.76421228040485, 38.54295427401311, -121.76559154683895],
  "Agriculture Field Station": [38.542784987469496, -121.76457916213076, 38.54278918321182, -121.76421438170473, 38.542529046724326, -121.76421974612276, 38.542503872175594, -121.76463280631106],
  "Student Health & Wellness Center": [38.5428856417982, -121.76209588745937, 38.54291340717919, -121.76095991422608, 38.54246453220573, -121.76096583075332, 38.54245990461409, -121.7621195535684],
  "The Colleges at La Rue": [38.54173943443861, -121.76398944093987, 38.54185078668424, -121.76085738525694, 38.54063827517236, -121.76090484064608, 38.540588784472384, -121.76398944093987],
  "Peter J. Shields library": [38.54007131405323, -121.74993510064809, 38.54023075810549, -121.74834723291127, 38.539332831728, -121.74839551267354, 38.53923212900529, -121.74980099019734],
  "Sproul Hall": [38.540094075974444, -121.74730410549957, 38.54013183905945, -121.74679985020477, 38.53993043571034, -121.7467891213687, 38.53987169296061, -121.74725046131927],
  "School of Education Building": [38.540647822032604, -121.74746675959396, 38.540723347601336, -121.74657090178299, 38.54036250250172, -121.74657090178299, 38.54029956421755, -121.74737020006943],
  "Voorhies Hall": [38.54137299472984, -121.74734928472519, 38.54145271535739, -121.74650707109451, 38.541033132115814, -121.74650707109451, 38.5409869778098, -121.74731173379898],
  "Dutton Hall": [38.54178153889856, -121.74798563194656, 38.54182769269469, -121.74748674106979, 38.54131160765197, -121.74746528339767, 38.54130741182343, -121.7479212589302],
  "South Hall": [38.541428911310156, -121.7483102589302, 38.54144149877374, -121.74792938525009, 38.540988348696445, -121.74793474966812, 38.54096736945704, -121.74828343684005],
  "North Hall": [38.542024715504716, -121.74848192030716, 38.542033107077835, -121.74810104662704, 38.541550590032635, -121.74810641104507, 38.541538002588126, -121.74842291170883],
  "Young Hall": [38.54255379473982, -121.748430514225, 38.54264190556064, -121.74708404529953, 38.54226848276979, -121.74710550297165, 38.54214260948203, -121.7483393191185],
  "Social Sciences & Humanities": [38.54322497682233, -121.74849783944961, 38.54335401915113, -121.74701930447246, 38.54278325325165, -121.74705103269085, 38.54267902594612, -121.7484407286565],
  "Hickey Gym" : [38.54405462271987, -121.74948037828167, 38.54419358976897, -121.74802722587924, 38.54352356759424, -121.7480399171666, 38.54340445188745, -121.74934711976442],
  "Campus Store": [38.54300749107694, -121.74953900496293, 38.54305364408637, -121.74888991038132, 38.542638265935416, -121.74888991038132, 38.542608895672295, -121.74946926752854],
  "The Market": [38.542508197536336, -121.74939953009415, 38.54256693813279, -121.74893282572556, 38.54229001775805, -121.74893282572556, 38.54223547271008, -121.74943171660233],
  "Coffee House": [38.54220540438281, -121.75036530192185, 38.54230190717224, -121.74933533366013, 38.54182358772901, -121.74934069807816, 38.541743867512565, -121.75031165774155],
  "Freeborn Hall": [38.54284315954781, -121.7506818025856, 38.54290189987069, -121.74981813128281, 38.542394214067, -121.74979130919266, 38.542293515630455, -121.75054769213486],
  "Hunt Hall": [38.5438569666127, -121.75131049702836, 38.54386955365137, -121.75026443551255, 38.54305139155702, -121.75024297784043, 38.54298425989508, -121.7511388356514],
  








}

export const humboldtPOIs: Record<string, number[]> = {
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

export const schoolInfo: Record<string, number[]> = {
  "Cal Poly Humboldt": [40.87649434150835, -124.07918370203882, 15.5],
  "UC Berkeley": [37.87196553251828, -122.25832234237413, 15.5],
  "UC Davis": [38.539058013776575, -121.7560062230687, 14.5],
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
  background: '#0D1117',
  lineHeight: '50px',
  fontSize: '25PX',
  fontWeight: '500',
  color: 'WHITE',
  cursor: 'pointer',
  border: 'none',
  display: 'block',
  outline: 'none',
  textIndent: '0px',
} //  /- buttons that appear on map can be styled here

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
}; //  /- buttons that appear on map can be styled here