// All the editable copy/data for the home page lives here.

export type Category = 'apps' | 'web' | 'games';

export interface Project {
  name: string;
  cat: Category;
  catLabel: string;
  tech: string;
  status: string;
  year: string;
  description: string;
  href: string;
  cta?: string; // button label, defaults to "View project"
  color: string; // CSS color / var
  art: string; // placeholder pattern class (art-a … art-g) used when there is no image
  addressBar: string; // text shown in the fake browser bar
  image?: { src: string; alt: string; fit: 'cover' | 'contain' };
}

const LIME = 'var(--lime)';
const ICE = 'var(--ice)';

export const projects: Project[] = [
  {
    name: 'Home Hub',
    cat: 'apps', catLabel: 'App',
    tech: 'Node · Express', status: 'Deployed', year: '2022',
    description: 'A home automation and control center bringing smart devices, media and environmental controls into one interface.',
    href: 'https://github.com/rdappel/home-hub',
    color: LIME, art: 'art-a', addressBar: 'home-hub',
  },
  {
    name: 'Grade Assist',
    cat: 'apps', catLabel: 'App',
    tech: 'Node.js', status: 'Live', year: '[Year]',
    description: '[One-line description of Grade Assist]',
    href: '#work',
    color: ICE, art: 'art-b', addressBar: 'grade-assist',
  },
  {
    name: 'ryan-appel.com',
    cat: 'web', catLabel: 'Web',
    tech: 'Astro', status: 'Live', year: '2026',
    description: 'This site — a single-page portfolio with a long-form blog.',
    href: '/',
    color: ICE, art: 'art-c', addressBar: 'ryan-appel.com',
  },
  {
    name: 'FVTC Software',
    cat: 'web', catLabel: 'Web',
    tech: 'Node · Express', status: 'Live', year: '2022',
    description: 'A course platform for instructors: link a GitHub repo and its markdown files become live course pages — lessons, exercises, hints and solutions.',
    href: 'https://fvtc.software/appel/version-control-essentials/',
    color: ICE, art: 'art-d', addressBar: 'fvtc.software',
    image: {
      src: '/images/work/fvtc-software.png', fit: 'cover',
      alt: 'FVTC Software course page: a Version Control Essentials lesson on branching, rendered from markdown with a sidebar of sections, code samples and a branching diagram',
    },
  },
  {
    name: 'Arcade Shooter',
    cat: 'games', catLabel: 'Game',
    tech: 'Katana Engine', status: 'Alpha', year: '2015',
    description: 'A two-player vertical shmup built on the Katana Engine — homing missiles with curling smoke trails, waves of enemy fighters, and the spatial-partitioning collision system from the Lab.',
    href: 'https://github.com/RDAppel/ArcadeShooter',
    color: LIME, art: 'art-e', addressBar: '▶ Katana Engine',
    image: {
      src: '/images/work/arcade-shooter.png', fit: 'cover',
      alt: 'Arcade Shooter gameplay: two player ships fire homing missiles that leave curling smoke trails toward enemy fighters over a starfield',
    },
  },
  {
    name: 'Cube Creator 3D',
    cat: 'games', catLabel: 'Game',
    tech: 'Nintendo 3DS', status: 'Prototype', year: '2014',
    description: 'A Minecraft-style 3D sandbox for the Nintendo 3DS — explore randomly generated worlds and build them block by block. I designed and built the initial prototype at Big John Games; the game launched on the eShop in 2015.',
    href: 'https://www.nintendolife.com/games/3ds-eshop/cube_creator_3d', cta: 'See more',
    color: ICE, art: 'art-f', addressBar: '▶ Nintendo 3DS',
    image: {
      src: '/images/work/cube-creator-3d.jpg', fit: 'contain',
      alt: 'Cube Creator 3D on Nintendo 3DS: a blocky mountain landscape on the top screen and a grid of building blocks to choose from on the touch screen',
    },
  },
  {
    name: 'Strike Force Foxx',
    cat: 'games', catLabel: 'Game',
    tech: 'Nintendo 3DS', status: 'Archived', year: '2014',
    description: 'A Choplifter-inspired helicopter rescue game for the Nintendo 3DS from Big John Games — fly Captain Foxx behind enemy lines to rescue hostages while dodging tanks, subs and soldiers and nursing your armor and fuel. I was lead programmer.',
    href: 'https://www.nintendolife.com/games/3ds-eshop/strike_force_foxx', cta: 'See more',
    color: ICE, art: 'art-g', addressBar: '▶ Nintendo 3DS',
    image: {
      src: '/images/work/strike-force-foxx.webp', fit: 'contain',
      alt: "Strike Force Foxx on Nintendo 3DS: Captain Foxx's helicopter fires on an anti-aircraft gun over a tropical island, with armor, fuel and rescue counters on the touch screen",
    },
  },
];

export const projectFilters = [
  { id: 'all', label: 'All', color: LIME },
  { id: 'apps', label: 'Apps', color: ICE },
  { id: 'web', label: 'Web', color: ICE },
  { id: 'games', label: 'Games', color: LIME },
];

export const coursesCurrent = [
  ['Modern JavaScript', 'Software · Web'],
  ['Advanced JavaScript', 'Web Dev'],
  ['C# Intro to Programming', 'Software · Web'],
  ['C# Intermediate', 'Software Dev'],
  ['C++ Programming', 'Software Dev'],
  ['Version Control Essentials', 'Software · Web'],
  ['Data Access for Programmers', 'Software · Web'],
  ['HTML5', 'Software · Web'],
  ['PHP', 'Web Dev'],
  ['Systems Analysis', 'Software Dev'],
].map(([name, track]) => ({ name, track, status: 'Active' }));

export const coursesArchived = [
  { name: 'Intro to Mobile Development', track: 'Software Dev', status: 'Archived' },
  { name: 'iOS Development', track: 'Software Dev', status: 'Sunset' },
  { name: 'Intro to Game Development', track: 'Software Dev', status: 'Sunset' },
];

// [name, years, focus]
export const languages: [string, number, string][] = [
  ['HTML', 20, 'Markup'], ['C#', 20, 'Apps'], ['JavaScript', 15, 'Frontend'], ['PHP', 15, 'Backend'],
  ['CSS', 15, 'UI'], ['C++', 10, 'Games'], ['Node', 7, 'Backend'],
];
export const frameworks: [string, number, string][] = [
  ['Allegro', 10, 'Games'], ['React', 6, 'Component UI'], ['Astro', 2, 'Static sites'], ['Vue', 2, 'Components'],
];
export const databases = [
  { label: 'SQL', items: ['MySQL', 'PostgreSQL', 'SQL Server', 'SQLite'] },
  { label: 'NoSQL', items: ['MongoDB', 'Firebase'] },
];
export const craft = [
  { label: 'Graphics', items: ['OpenGL', 'GLSL', 'HLSL'] },
  { label: 'Tools & practice', items: ['Visual Studio', 'Node-RED', 'UI / UX'] },
];

export const accentCycle = [LIME, ICE];
