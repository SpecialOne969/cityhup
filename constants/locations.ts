export const COUNTRIES = ['Nigeria'];

export const STATES: Record<string, string[]> = {
  Nigeria: [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
    'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
    'Ekiti', 'Enugu', 'FCT – Abuja', 'Gombe', 'Imo', 'Jigawa',
    'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
    'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
  ],
};

export const LGAS: Record<string, string[]> = {
  Rivers: [
    'Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ogu-Bolo', 'Eleme',
    'Tai', 'Gokana', 'Khana', 'Oyigbo', 'Opobo-Nkoro',
    'Andoni', 'Bonny', 'Degema', 'Asari-Toru', 'Akuku-Toru',
    'Abua-Odual', 'Ahoada East', 'Ahoada West', 'Ogba-Egbema-Ndoni',
    'Emohua', 'Ikwerre', 'Etche', 'Omuma',
  ],
  Lagos: [
    'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin',
    'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki',
    'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island',
    'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu',
    'Surulere',
  ],
  Abuja: [
    'AMAC', 'Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali',
  ],
};

export function getLgasByState(state: string): string[] {
  return LGAS[state] ?? [];
}

export function generateClientCode(state: string): string {
  const statePrefix: Record<string, string> = {
    Rivers: 'RVS',
    Lagos: 'LGS',
    Abuja: 'FCT',
    Kano: 'KNO',
    Oyo: 'OYO',
    Delta: 'DLT',
  };
  const prefix = statePrefix[state] ?? state.substring(0, 3).toUpperCase();
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CH-${prefix}-${num}`;
}
