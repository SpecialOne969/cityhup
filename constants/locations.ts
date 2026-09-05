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
  // ── Nigeria ──────────────────────────────────────────────────────────────
  Abia: ['Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North', 'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo', 'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'],
  Adamawa: ['Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Lamurde', 'Madagali', 'Maiha', 'Mayo-Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan', 'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'],
  'Akwa Ibom': ['Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan', 'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene', 'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara', 'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan', 'Urue-Offong/Oruko', 'Uyo'],
  Anambra: ['Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South', 'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala', 'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South', 'Orumba North', 'Orumba South', 'Oyi'],
  Bauchi: ['Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa', 'Giade', 'Itas/Gadau', "Jama'are", 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira', 'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'],
  Bayelsa: ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa'],
  Benue: ['Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West', 'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo', 'Ohimini', 'Oju', 'Okpokwu', 'Otukpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'],
  Borno: ['Abadam', 'Askira-Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa', 'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala-Balge', 'Konduga', 'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar', 'Monguno', 'Ngala', 'Nganzai', 'Shani'],
  'Cross River': ['Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal', 'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala'],
  Delta: ['Aniocha North', 'Aniocha South', 'Asaba', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West', 'Ika North-East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West', 'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North', 'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South-West'],
  Ebonyi: ['Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South', 'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'],
  Edo: ['Akoko-Edo', 'Benin City', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West', 'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Oredo', 'Orhionmwon', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'],
  Ekiti: ['Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure', 'Gbonyin', 'Ido-Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun', 'Ise-Orun', 'Moba', 'Oye'],
  Enugu: ['Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo-Etiti', 'Igbo-Eze North', 'Igbo-Eze South', 'Isi-Uzo', 'Nkanu East', 'Nkanu West', 'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo-Uwani'],
  'FCT – Abuja': ['AMAC (Abuja Municipal)', 'Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali'],
  Gombe: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shomgom', 'Yamaltu-Deba'],
  Imo: ['Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North', 'Ideato South', 'Ihitte-Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli', 'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji-Egbema', 'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal', 'Owerri North', 'Owerri West', 'Unuimo'],
  Jigawa: ['Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki', 'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kaugama', 'Kazaure', 'Kiri Kasama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim', 'Roni', 'Sule-Tankarkar', 'Taura', 'Yankwashi'],
  Kaduna: ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', "Jema'a", 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'],
  Kano: ['Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta', 'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam', 'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya', 'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa', 'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa', 'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'],
  Katsina: ['Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dan Musa', 'Dandume', 'Danja', 'Daura', 'Dutsi', 'Dutsin-Ma', 'Faskari', 'Funtua', 'Ingawa', 'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada', "Mai'Adua", 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa', 'Safana', 'Sandamu', 'Zango'],
  Kebbi: ['Aleiro', 'Arewa-Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza', 'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko-Besse', 'Maiyama', 'Ngaski', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'],
  Kogi: ['Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela-Odolu', 'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa-Muro', 'Ofu', 'Ogori-Magongo', 'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'],
  Kwara: ['Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South', 'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke-Ero', 'Oyun', 'Pategi'],
  Lagos: ['Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo', 'Shomolu', 'Surulere'],
  Nasarawa: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba'],
  Niger: ['Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara', 'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa', 'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'],
  Ogun: ['Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South', 'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North-East', 'Ijebu Ode', 'Ikenne', 'Imeko-Afon', 'Ipokia', 'Obafemi-Owode', 'Odeda', 'Odogbolu', 'Ogun Waterside', 'Remo North', 'Shagamu'],
  Ondo: ['Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West', 'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje', 'Ile Oluji-Oke Igbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West', 'Ose', 'Owo'],
  Osun: ['Aiyedire', 'Atakunmosa East', 'Atakunmosa West', 'Ayedaade', 'Boluwaduro', 'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central', 'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila', 'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo', 'Obokun', 'Odo-Otin', 'Ola-Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'],
  Oyo: ['Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West', 'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin', 'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South', 'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona-Ara', 'Orelope', 'Ori-Ire', 'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'],
  Plateau: ['Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam', 'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin', "Qua'an Pan", 'Riyom', 'Shendam', 'Wase'],
  Rivers: ['Abua-Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru', 'Bonny', 'Degema', 'Eleme', 'Emohua', 'Etche', 'Gokana', 'Ikwerre', 'Khana', 'Obio-Akpor', 'Ogba-Egbema-Ndoni', 'Ogu-Bolo', 'Okrika', 'Omuma', 'Opobo-Nkoro', 'Oyigbo', 'Port Harcourt', 'Tai'],
  Sokoto: ['Binji', 'Bodinga', 'Dange-Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela', 'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North', 'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'],
  Taraba: ['Ardo-Kola', 'Bali', 'Donga', 'Gashaka', 'Gasso', 'Ibi', 'Jalingo', 'Karim Lamido', 'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'],
  Yobe: ['Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani', 'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'],
  Zamfara: ['Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau', 'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Tsafe', 'Zurmi'],

  // ── Ghana ─────────────────────────────────────────────────────────────────
  'Greater Accra': ['Accra Metropolitan', 'Adentan Municipal', 'Ashaiman Municipal', 'Ayawaso Central Municipal', 'Ayawaso East Municipal', 'Ayawaso North Municipal', 'Ayawaso West Municipal', 'Ga Central Municipal', 'Ga East Municipal', 'Ga North Municipal', 'Ga South Municipal', 'Ga West Municipal', 'Korle Klottey Municipal', 'Kpone-Katamanso District', 'La-Dade-Kotopon Municipal', 'La Nkwantanang Madina Municipal', 'Ledzokuku Municipal', 'Ningo-Prampram District', 'Okaikwei North Municipal', 'Shai-Osudoku District', 'Tema Metropolitan', 'Weija-Gbawe Municipal'],
  Ashanti: ['Amansie Central District', 'Amansie West District', 'Asokwa Municipal', 'Bosomtwe District', 'Ejisu Municipal', 'Kumasi Metropolitan', 'Kwabre East District', 'Kwadaso Municipal', 'Nhyiaeso Municipal', 'Offinso Municipal', 'Offinso North District', 'Old Tafo Municipal', 'Oforikrom Municipal', 'Suame Municipal'],
  Western: ['Effia-Kwesimintsim Municipal', 'Ellembelle District', 'Mpohor District', 'Nzema East Municipal', 'Prestea-Huni Valley Municipal', 'Sekondi-Takoradi Metropolitan', 'Shama District', 'Tarkwa-Nsuaem Municipal', 'Wassa East District'],
  'Western North': ['Amenfi Central', 'Amenfi East', 'Amenfi West', 'Aowin', 'Bia East', 'Bia West', 'Bibiani-Anhwiaso-Bekwai', 'Bodi', 'Juaboso', 'Sefwi Akontombra', 'Sefwi Wiawso', 'Suaman'],
  Eastern: ['Atiwa East District', 'Atiwa West District', 'Birim North District', 'Birim South District', 'Koforidua', 'Kwaebibirem Municipal', 'New Juaben Municipal', 'Suhum Municipal', 'West Akim Municipal'],
  Central: ['Assin Central Municipal', 'Assin North District', 'Assin South District', 'Asikuma-Odoben-Brakwa District', 'Cape Coast Metropolitan', 'Komenda-Edina-Eguafo-Abirem Municipal', 'Mfantsiman Municipal'],
  Northern: ['Kumbungu District', 'Mion District', 'Nanton District', 'Sagnarigu Municipal', 'Tamale Metropolitan', 'Tolon District'],
  'North East': ['Bunkpurugu-Nakpayili', 'Chereponi', 'East Mamprusi', 'Mamprugu Moaduri', 'Nalerigu', 'West Mamprusi', 'Yunyoo-Nasuan'],
  Savannah: ['Bole', 'Central Gonja', 'East Gonja', 'Kpandai', 'North Gonja', 'Sawla-Tuna-Kalba', 'West Gonja'],
  'Upper East': ['Bawku East', 'Bawku West', 'Binduri', 'Bolgatanga', 'Bongo', 'Builsa North', 'Builsa South', 'Kassena-Nankana East', 'Kassena-Nankana West', 'Pusiga', 'Talensi', 'Tempane'],
  'Upper West': ['Daffiama-Bussie-Issa', 'Jirapa', 'Lambussie-Karni', 'Lawra', 'Nadowli-Kaleo', 'Nandom', 'Sissala East', 'Sissala West', 'Wa East', 'Wa Municipal', 'Wa West'],
  Volta: ['Agotime-Ziope', 'Akatsi North', 'Akatsi South', 'Anloga', 'Central Tongu', 'Ho Municipal', 'Ho West', 'Hohoe', 'Keta Municipal', 'Ketu North', 'Ketu South', 'Kpando', 'North Dayi', 'North Tongu', 'South Dayi', 'South Tongu'],
  Oti: ['Biakoye', 'Buem', 'Guan', 'Jasikan', 'Kadjebi', 'Krachi East', 'Krachi Nchumuru', 'Krachi West', 'Nkwanta North', 'Nkwanta South'],
  Bono: ['Banda', 'Berekum East', 'Berekum West', 'Dormaa Central', 'Dormaa East', 'Dormaa West', 'Jaman North', 'Jaman South', 'Sunyani Municipal', 'Sunyani West', 'Tain', 'Wenchi Municipal'],
  'Bono East': ['Atebubu-Amantin', 'Kintampo North', 'Kintampo South', 'Nkoranza North', 'Nkoranza South', 'Pru East', 'Pru West', 'Sene East', 'Sene West', 'Techiman Municipal', 'Techiman North'],
  Ahafo: ['Asunafo North', 'Asunafo South', 'Asutifi North', 'Asutifi South', 'Tano North', 'Tano South'],

  // ── Benin Republic ───────────────────────────────────────────────────────
  Alibori: ['Banikoara', 'Gogounou', 'Kandi', 'Karimama', 'Malanville', 'Ségbana'],
  Atacora: ['Boukoumbé', 'Cobly', 'Kérou', 'Kouandé', 'Matéri', 'Natitingou', 'Pehunco', 'Tanguiéta', 'Toukountouna'],
  Atlantique: ['Abomey-Calavi', 'Allada', 'Kpomassè', 'Ouidah', 'Sô-Ava', 'Toffo', 'Tori-Bossito', 'Zè'],
  Borgou: ['Bembèrèkè', 'Kalalé', 'Nikki', 'Parakou', 'Pèrèrè', 'Sinendé', 'Tchaourou'],
  Collines: ['Bantè', 'Dassa-Zoumè', 'Glazoué', 'Ouèssè', 'Savalou', 'Savè'],
  Couffo: ['Aplahoué', 'Djakotomey', 'Dogbo', 'Klouékanmè', 'Lalo', 'Toviklin'],
  Donga: ['Bassila', 'Copargo', 'Djougou', 'Ouaké'],
  Littoral: ['Cotonou'],
  Mono: ['Athiémé', 'Bopa', 'Comè', 'Grand-Popo', 'Houéyogbé', 'Lokossa'],
  Ouémé: ['Adjarra', 'Adjohoun', 'Akpro-Missérété', 'Avrankou', 'Bonou', 'Dangbo', 'Porto-Novo', 'Sèmè-Kpodji'],
  'Plateau': ['Adja-Ouèrè', 'Ifangni', 'Kétou', 'Pobè', 'Sakété'],
  Zou: ['Abomey', 'Agbangnizoun', 'Bohicon', 'Cové', 'Djidja', 'Ouinhi', 'Zagnanado', 'Za-Kpota', 'Zogbodomey'],

  // ── Liberia ───────────────────────────────────────────────────────────────
  Bomi: ['Klay', 'Suehn-Mecca', 'Tewor'],
  Bong: ['Gbarnga', 'Salala', 'Suakoko'],
  Gbarpolu: ['Belleh', 'Bokomu', 'Bopolu', 'Gbarma', 'Kongba'],
  'Grand Bassa': ['Buchanan', 'Compound Number One', 'Commonwealth', 'District Number One'],
  'Grand Cape Mount': ['Commonwealth', 'Garwula', 'Gola Konneh', 'Porkpa', 'Tewor'],
  'Grand Gedeh': ['Cavalla', 'Gbarzon', 'Konobo', 'Tchien'],
  'Grand Kru': ['Buah', 'Flandee', 'Forpoh', 'Garraway', 'Jloh', 'Sasstown', 'Trehn', 'Wedabo'],
  Lofa: ['Kolahun', 'Voinjama', 'Zorzor'],
  Margibi: ['Firestone', 'Harbel', 'Kakata'],
  Maryland: ['Grand Cess', 'Karloken', 'Pleebo-Sodoken', 'Rock Cess'],
  Montserrado: ['Congo Town', 'Gardnersville', 'Monrovia', 'Old Road', 'Paynesville', 'Sinkor'],
  Nimba: ['Ganta', 'Saclepea', 'Sanniquellie', 'Tappita'],
  Rivercess: ['Cesstos City', 'Central Rivercess', 'Timbo'],
  'River Gee': ['Fish Town', 'Konobo', 'Po River', 'Tuzon'],
  Sinoe: ['Butaw', 'Dugbe River', 'Greenville', 'Juarzon', 'Kpayan', 'Sanquin'],
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
