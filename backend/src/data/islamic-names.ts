export const ISLAMIC_NAMES = [
  // Popular Arabic names
  'Muhammad', 'Ahmed', 'Ali', 'Hassan', 'Hussein', 'Omar', 'Khalid', 'Abdullah', 'Ibrahim', 'Youssef',
  'Mahmoud', 'Mohamed', 'Ahmad', 'Rashid', 'Tariq', 'Saeed', 'Nasser', 'Faisal', 'Salim', 'Karim',
  'Hamza', 'Zaid', 'Malik', 'Fahad', 'Sultan', 'Waleed', 'Majid', 'Rami', 'Adnan', 'Jamal',
  'Sami', 'Bilal', 'Yasir', 'Amjad', 'Marwan', 'Basel', 'Osama', 'Hani', 'Tamer', 'Wael',
  
  // Persian/Farsi names
  'Darius', 'Cyrus', 'Reza', 'Arash', 'Babak', 'Farhad', 'Kaveh', 'Kourosh', 'Mehdi', 'Ramin',
  'Siavash', 'Shahram', 'Behrouz', 'Farzad', 'Hooman', 'Kamran', 'Nima', 'Pouya', 'Sahand', 'Vahid',
  
  // Turkish names
  'Mehmet', 'Mustafa', 'Ahmet', 'Emre', 'Burak', 'Cem', 'Deniz', 'Erhan', 'Hakan', 'Kemal',
  'Murat', 'Onur', 'Serkan', 'Tolga', 'Umut', 'Volkan', 'Yusuf', 'Berk', 'Can', 'Efe',
  
  // Pakistani/Urdu names
  'Asim', 'Faheem', 'Imran', 'Junaid', 'Kashif', 'Nadeem', 'Omer', 'Rizwan', 'Shahid', 'Usman',
  'Waseem', 'Zeeshan', 'Aamir', 'Danish', 'Farhan', 'Haroon', 'Irfan', 'Jameel', 'Nasir', 'Salman',
  
  // Indonesian/Malay names
  'Rahman', 'Hidayat', 'Ismail', 'Hakim', 'Farid', 'Aziz', 'Wahid', 'Amin', 'Latif', 'Syukur',
  'Bayu', 'Dimas', 'Eko', 'Faisal', 'Hadi', 'Irwan', 'Joko', 'Lukman', 'Nico', 'Putra',
  
  // North African names
  'Yassine', 'Amine', 'Zakaria', 'Ismail', 'Ayoub', 'Mehdi', 'Salam', 'Nabil', 'Hakim', 'Fouad',
  'Kamal', 'Larbi', 'Mustapha', 'Rachid', 'Samir', 'Tarek', 'Walid', 'Yasin', 'Zine', 'Brahim',
  
  // West African names
  'Mamadou', 'Amadou', 'Ibrahima', 'Moussa', 'Ousmane', 'Sekou', 'Abdoulaye', 'Bakary', 'Cheikh', 'Demba',
  'Lamine', 'Modou', 'Saliou', 'Thierno', 'Yaya', 'Aliou', 'Boubacar', 'Daouda', 'Elhadji', 'Famara'
] as const

export function getRandomIslamicName(): string {
  const randomIndex = Math.floor(Math.random() * ISLAMIC_NAMES.length)
  return ISLAMIC_NAMES[randomIndex]
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}