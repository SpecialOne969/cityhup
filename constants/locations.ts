export const COUNTRIES = ['Nigeria', 'Ghana', 'Benin Republic', 'Liberia'];

export const STATES: Record<string, string[]> = {
  Nigeria: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT – Abuja', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ],
  Ghana: [
    'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
    'Northern', 'Upper East', 'Upper West', 'Volta', 'Bono',
    'Western North', 'Ahafo', 'Bono East', 'Oti', 'North East', 'Savannah',
  ],
  'Benin Republic': [
    'Alibori', 'Atacora', 'Atlantique', 'Borgou', 'Collines',
    'Couffo', 'Donga', 'Littoral', 'Mono', 'Ouémé', 'Plateau', 'Zou',
  ],
  Liberia: [
    'Bomi', 'Bong', 'Gbarpolu', 'Grand Bassa', 'Grand Cape Mount',
    'Grand Gedeh', 'Grand Kru', 'Lofa', 'Margibi', 'Maryland',
    'Montserrado', 'Nimba', 'Rivercess', 'River Gee', 'Sinoe',
  ],
};

export const LGAS: Record<string, string[]> = {
  // Nigeria — Rivers
  Rivers: [
    'Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu-Bolo', 'Eleme',
    'Tai', 'Gokana', 'Khana', 'Oyigbo', 'Opobo-Nkoro',
    'Andoni', 'Bonny', 'Degema', 'Asari-Toru', 'Akuku-Toru',
    'Abua-Odual', 'Ahoada East', 'Ahoada West', 'Ogba-Egbema-Ndoni',
    'Emohua', 'Ikwerre', 'Etche', 'Omuma',
  ],
  // Nigeria — Lagos
  Lagos: [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin',
    'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki',
    'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island',
    'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu',
    'Surulere',
  ],
  // Nigeria — FCT Abuja
  'FCT – Abuja': ['AMAC', 'Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
  // Nigeria — other major states
  Kano: [
    'Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa',
    'Kumbotso', 'Ungogo', 'Dawakin Tofa', 'Tofa', 'Bichi', 'Gwarzo',
  ],
  Oyo: [
    'Ibadan North', 'Ibadan North-East', 'Ibadan North-West',
    'Ibadan South-East', 'Ibadan South-West', 'Egbeda', 'Ona-Ara',
    'Lagelu', 'Oluyole', 'Ido', 'Akinyele',
  ],
  Delta: [
    'Warri South', 'Warri North', 'Warri South-West', 'Sapele',
    'Uvwie', 'Effurun', 'Udu', 'Ethiope East', 'Ethiope West',
    'Oshimili North', 'Oshimili South', 'Asaba',
  ],
  Enugu: [
    'Enugu North', 'Enugu South', 'Igbo-Eze North', 'Igbo-Eze South',
    'Udi', 'Nkanu West', 'Nkanu East', 'Awgu', 'Oji River',
  ],
  Anambra: [
    'Awka North', 'Awka South', 'Onitsha North', 'Onitsha South',
    'Nnewi North', 'Nnewi South', 'Idemili North', 'Idemili South',
    'Ogbaru', 'Orumba North', 'Orumba South',
  ],
  'Akwa Ibom': [
    'Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak',
    'Ikono', 'Ini', 'Itu', 'Nsit Ibom', 'Nsit Ubium',
  ],
  'Cross River': [
    'Calabar Municipal', 'Calabar South', 'Abi', 'Biase',
    'Boki', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu',
  ],
  Edo: [
    'Benin City', 'Oredo', 'Egor', 'Ikpoba Okha', 'Ovia North-East',
    'Ovia South-West', 'Orhionmwon', 'Uhunmwonde',
  ],
  Imo: [
    'Owerri Municipal', 'Owerri North', 'Owerri West',
    'Orlu', 'Okigwe', 'Ehime Mbano', 'Aboh Mbaise',
  ],
  Kaduna: [
    'Kaduna North', 'Kaduna South', 'Chikun', 'Igabi',
    'Zaria', 'Sabon Gari', 'Kaura', 'Birnin Gwari',
  ],
  Abia: [
    'Aba North', 'Aba South', 'Umuahia North', 'Umuahia South',
    'Obingwa', 'Osisioma', 'Ugwunagbo',
  ],

  // Ghana
  'Greater Accra': [
    'Accra Metropolitan', 'Tema Metropolitan', 'Ashaiman Municipal',
    'Ga East Municipal', 'Ga West Municipal', 'Ga South Municipal',
    'Ga Central Municipal', 'Ga North Municipal', 'Adentan Municipal',
    'Ayawaso Central Municipal', 'Ayawaso East Municipal',
    'Ayawaso North Municipal', 'Ayawaso West Municipal',
    'Korle Klottey Municipal', 'La-Dade-Kotopon Municipal',
    'La Nkwantanang Madina Municipal', 'Ledzokuku Municipal',
    'Ningo-Prampram District', 'Okaikwei North Municipal',
    'Weija-Gbawe Municipal', 'Kpone-Katamanso District',
    'Shai-Osudoku District',
  ],
  Ashanti: [
    'Kumasi Metropolitan', 'Oforikrom Municipal', 'Old Tafo Municipal',
    'Kwadaso Municipal', 'Suame Municipal', 'Asokwa Municipal',
    'Nhyiaeso Municipal', 'Bosomtwe District', 'Ejisu Municipal',
    'Kwabre East District', 'Offinso North District', 'Offinso Municipal',
    'Amansie Central District', 'Amansie West District',
  ],
  Western: [
    'Sekondi-Takoradi Metropolitan', 'Shama District', 'Wassa East District',
    'Effia-Kwesimintsim Municipal', 'Mpohor District', 'Tarkwa-Nsuaem Municipal',
    'Prestea-Huni Valley Municipal', 'Nzema East Municipal', 'Ellembelle District',
  ],
  Eastern: [
    'Koforidua', 'New Juaben Municipal', 'Birim North District',
    'Birim South District', 'Kwaebibirem Municipal', 'West Akim Municipal',
    'Atiwa West District', 'Atiwa East District', 'Suhum Municipal',
  ],
  Central: [
    'Cape Coast Metropolitan', 'Komenda-Edina-Eguafo-Abirem Municipal',
    'Mfantsiman Municipal', 'Asikuma-Odoben-Brakwa District',
    'Assin Central Municipal', 'Assin North District', 'Assin South District',
  ],
  Northern: [
    'Tamale Metropolitan', 'Sagnarigu Municipal', 'Tolon District',
    'Kumbungu District', 'Nanton District', 'Mion District',
  ],

  // Benin Republic
  Alibori: ['Banikoara', 'Gogounou', 'Kandi', 'Karimama', 'Malanville', 'Ségbana'],
  Atacora: ['Boukoumbé', 'Cobly', 'Kérou', 'Kouandé', 'Matéri', 'Natitingou', 'Pehunco', 'Tanguiéta', 'Toukountouna'],
  Atlantique: ['Abomey-Calavi', 'Allada', 'Kpomassè', 'Ouidah', 'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè'],
  Borgou: ['Bembèrèkè', 'Kalalé', 'Nikki', 'Parakou', 'Pèrèrè', 'Sinendé', 'Tchaourou'],
  Littoral: ['Cotonou'],
  Ouémé: ['Adjarra', 'Adjohoun', 'Akpro-Missérété', 'Avrankou', 'Bonou', 'Dangbo', 'Porto-Novo', 'Sèmè-Kpodji'],
  Zou: ['Abomey', 'Agbangnizoun', 'Bohicon', 'Cové', 'Djidja', 'Ouinhi', 'Zagnanado', 'Za-Kpota', 'Zogbodomey'],

  // Liberia
  Montserrado: ['Monrovia', 'Gardnersville', 'Paynesville', 'Congo Town', 'Sinkor', 'Old Road'],
  Nimba: ['Sanniquellie', 'Ganta', 'Tappita', 'Saclepea'],
  Bong: ['Gbarnga', 'Suakoko', 'Salala'],
  Margibi: ['Kakata', 'Harbel', 'Firestone'],
  'Grand Bassa': ['Buchanan', 'Compound Number One'],
  Lofa: ['Voinjama', 'Kolahun', 'Zorzor'],
};

export function getLgasByState(state: string): string[] {
  return LGAS[state] ?? [];
}

export function generateClientCode(state: string): string {
  const statePrefix: Record<string, string> = {
    // Nigeria
    Rivers: 'RVS', Lagos: 'LGS', 'FCT – Abuja': 'FCT',
    Kano: 'KNO', Oyo: 'OYO', Delta: 'DLT', Enugu: 'ENG',
    Anambra: 'ANM', 'Akwa Ibom': 'AKI', 'Cross River': 'CRS',
    Edo: 'EDO', Imo: 'IMO', Kaduna: 'KDN', Abia: 'ABI',
    // Ghana
    'Greater Accra': 'GHA', Ashanti: 'ASH', Western: 'GHW',
    Eastern: 'GHE', Central: 'GHC', Northern: 'GHN',
    // Benin Republic
    Littoral: 'BEN', Atlantique: 'BNA', Ouémé: 'BNO', Borgou: 'BNB',
    // Liberia
    Montserrado: 'LBM', Nimba: 'LBN', Bong: 'LBB',
  };
  const prefix = statePrefix[state] ?? state.substring(0, 3).toUpperCase();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CH-${prefix}-${num}`;
}
