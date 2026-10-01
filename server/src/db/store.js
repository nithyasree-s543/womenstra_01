import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const INITIAL_DATA = {
  users: [
    {
      id: "user-1",
      phone: "9876543210",
      name: "Sunita Devi",
      age: 28,
      gender: "female",
      state: "Uttar Pradesh",
      district: "Varanasi",
      village: "Ramnagar",
      language: "hi",
      literacyLevel: "beginner",
      interests: ["sewing", "financial_literacy", "digital_payments"],
      goals: ["Start village tailoring shop", "Learn online banking safety"],
      streak: 7,
      points: 420,
      badges: ["Pratham Kadam", "Didi Warrior", "Bachat Sakhi", "Digital Nari"],
      package: "free",
      assignedMentorId: "mentor-1",
      dependentsCount: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: "user-admin",
      phone: "9999999999",
      name: "Womentra Admin Team",
      age: 35,
      gender: "female",
      state: "Delhi",
      district: "New Delhi",
      village: "Central",
      language: "hi",
      role: "admin",
      createdAt: new Date().toISOString()
    }
  ],
  dependents: [
    {
      id: "dep-1",
      userId: "user-1",
      name: "Pooja Kumari",
      age: 12,
      relationship: "daughter",
      learningGoal: "School mathematics & English basics",
      assignedMentorId: "mentor-2",
      progressPct: 65,
      createdAt: new Date().toISOString()
    }
  ],
  mentors: [
    {
      id: "mentor-1",
      name: "Dr. Ananya Sharma",
      title: "Senior Micro-Enterprise Coach & SHG Lead",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      phone: "9811122233",
      languages: ["hi", "en", "mr"],
      states: ["Uttar Pradesh", "Bihar", "Madhya Pradesh"],
      skills: ["Tailoring Business", "Self-Help Groups", "Government Schemes", "UPI Safety"],
      experienceYears: 9,
      rating: 4.9,
      totalReviews: 128,
      verified: true,
      kycStatus: "approved",
      kycToken: "DIGILOCKER-VERIFIED-9832",
      bio: "10+ years empowering 4,000+ rural women to set up micro-enterprises and self-help groups. Fluent in simple Hindi & regional dialects.",
      availability: ["Morning (9 AM - 11 AM)", "Evening (4 PM - 7 PM)"],
      activeMentees: 18,
      maxMentees: 25
    },
    {
      id: "mentor-2",
      name: "Kavitha Raman",
      title: "Digital Literacy & Girl Child Tutor",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
      phone: "9822233344",
      languages: ["ta", "te", "en", "hi"],
      states: ["Tamil Nadu", "Andhra Pradesh", "Telangana"],
      skills: ["Girl Child Education", "Smartphone Usage", "English Basics", "Scholarships"],
      experienceYears: 6,
      rating: 4.8,
      totalReviews: 94,
      verified: true,
      kycStatus: "approved",
      kycToken: "DIGILOCKER-VERIFIED-7711",
      bio: "Passionate educator specializing in child learning and introducing first-generation digital learners to technology with care.",
      availability: ["Afternoon (2 PM - 5 PM)", "Evening (6 PM - 8 PM)"],
      activeMentees: 14,
      maxMentees: 20
    },
    {
      id: "mentor-3",
      name: "Rekha Ben Patel",
      title: "Vocational Handicrafts & Dairy Farm Specialist",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
      phone: "9833344455",
      languages: ["gu", "hi", "en"],
      states: ["Gujarat", "Rajasthan", "Maharashtra"],
      skills: ["Dairy Management", "Embroidery & Handicrafts", "Mudra Loans", "FSSAI Food Packaging"],
      experienceYears: 12,
      rating: 5.0,
      totalReviews: 215,
      verified: true,
      kycStatus: "approved",
      kycToken: "DIGILOCKER-VERIFIED-1099",
      bio: "National SHG awardee who turned a 5-member village group into a ₹25 Lakh annual enterprise. Ready to mentor aspiring women entrepreneurs.",
      availability: ["Morning (10 AM - 12 PM)", "Evening (5 PM - 8 PM)"],
      activeMentees: 22,
      maxMentees: 30
    }
  ],
  schemes: [
    {
      id: "pmmvvy",
      title: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
      titleHi: "प्रधानमंत्री मातृ वंदना योजना",
      tagline: "₹5,000 cash incentive for first-time pregnant & lactating mothers",
      category: "maternal_health",
      icon: "Baby",
      color: "from-pink-500 to-rose-600",
      benefitAmount: "₹5,000 in 3 installments",
      eligibilityRules: {
        minAge: 19,
        maxAge: 45,
        gender: "female",
        targetGroup: "Pregnant women for 1st live birth"
      },
      documents: [
        "Aadhaar Card (Mother & Husband)",
        "Mother-Child Protection (MCP) Card",
        "Bank Passbook linked with Aadhaar",
        "LMP (Last Menstrual Period) record"
      ],
      steps: [
        "Register at nearest Anganwadi center or CSC within 150 days of pregnancy",
        "Provide MCP card copy and Aadhaar card",
        "Receive 1st installment (₹1,000) at registration",
        "Receive 2nd installment (₹2,000) after 6 months with antenatal checkup",
        "Receive 3rd installment (₹2,000) after childbirth registration and first vaccine cycle"
      ],
      officialPortal: "https://pmmvy.wcd.gov.in",
      voiceSummary: "यह योजना पहली बार गर्भवती माताओं को ₹5,000 की आर्थिक सहायता देती है। इसे नजदीकी आंगनवाड़ी या जन सेवा केंद्र से भर सकते हैं।"
    },
    {
      id: "lakhpati-didi",
      title: "Lakhpati Didi (SHG-NRLM)",
      titleHi: "लखपति दीदी योजना",
      tagline: "Enable SHG women to earn minimum ₹1 Lakh per year sustainably",
      category: "livelihood",
      icon: "Sparkles",
      color: "from-purple-600 to-indigo-700",
      benefitAmount: "Zero-interest micro-credit up to ₹5 Lakh + Skill Training",
      eligibilityRules: {
        minAge: 18,
        maxAge: 60,
        gender: "female",
        targetGroup: "Active member of Women Self Help Group (SHG)"
      },
      documents: [
        "SHG Membership Passbook",
        "Aadhaar Card",
        "Passport Size Photograph",
        "Bank Account Statement (SHG & Personal)"
      ],
      steps: [
        "Connect with your village Gram Sangathan or Block Resource Person",
        "Choose a vocational track: Solar Didi, Drone Didi, Tailoring or Organic Farming",
        "Complete 14-day technical hands-on training",
        "Access community investment fund & subsidized loan from bank"
      ],
      officialPortal: "https://nrlm.gov.in",
      voiceSummary: "लखपति दीदी योजना स्वयं सहायता समूह की बहनों को हर साल ₹1 लाख से अधिक कमाने के लिए मुफ्त हुनर और आसान लोन देती है।"
    },
    {
      id: "sukanya-samriddhi",
      title: "Sukanya Samriddhi Yojana (SSY)",
      titleHi: "सुकन्या समृद्धि योजना",
      tagline: "High-interest 8.2% government savings scheme for girl child future",
      category: "girl_child",
      icon: "GraduationCap",
      color: "from-amber-500 to-orange-600",
      benefitAmount: "Guaranteed 8.2% annual interest + Tax Exemption",
      eligibilityRules: {
        maxChildAge: 10,
        gender: "female_child",
        targetGroup: "Parents/Guardians of girl child up to 10 years"
      },
      documents: [
        "Birth Certificate of Girl Child",
        "Guardian Aadhaar Card & PAN Card",
        "Address Proof",
        "Initial deposit of minimum ₹250"
      ],
      steps: [
        "Visit any Post Office or Nationalized Bank branch",
        "Fill SSY Form-1 with child details",
        "Deposit ₹250 to ₹1.5 Lakh per year for 15 years",
        "Matures when girl turns 21, with 50% partial withdrawal allowed for higher education at age 18"
      ],
      officialPortal: "https://www.indiapost.gov.in",
      voiceSummary: "सुकन्या समृद्धि योजना में बेटी के नाम से डाकघर में खाता खोलें। सरकार सबसे ज्यादा 8.2% ब्याज देती है जो बेटी की पढ़ाई और शादी में काम आएगा।"
    },
    {
      id: "pm-ujjwala",
      title: "PM Ujjwala Yojana 2.0",
      titleHi: "प्रधानमंत्री उज्ज्वला योजना 2.0",
      tagline: "Free LPG gas connection with stove and first cylinder for rural households",
      category: "household",
      icon: "Flame",
      color: "from-red-500 to-rose-600",
      benefitAmount: "Free LPG connection + Gas stove + 1st cylinder refill",
      eligibilityRules: {
        minAge: 18,
        gender: "female",
        targetGroup: "Adult woman from BPL / SC-ST / Poor rural household"
      },
      documents: [
        "Ration Card",
        "Aadhaar Card of Applicant & Family Members",
        "Bank Account details",
        "Address Proof"
      ],
      steps: [
        "Apply online or visit your local Gas Distributor (Indane, BharatGas, HP)",
        "Submit standard 14-point declaration",
        "Verification by Gas agency",
        "Collect stove and filled cylinder at zero upfront cost"
      ],
      officialPortal: "https://www.pmuy.gov.in",
      voiceSummary: "उज्ज्वला योजना में ग्रामीण महिलाओं को मुफ्त गैस चूल्हा और पहला सिलेंडर मिलता है ताकि धुएं से मुक्ति मिले।"
    },
    {
      id: "mudra-loan-tarun-shishu",
      title: "Pradhan Mantri MUDRA Yojana (Shishu & Kishore)",
      titleHi: "प्रधानमंत्री मुद्रा योजना",
      tagline: "Collateral-free micro loans from ₹50,000 to ₹10 Lakh for women businesses",
      category: "business_loan",
      icon: "BadgeIndianRupee",
      color: "from-emerald-500 to-teal-700",
      benefitAmount: "Up to ₹50,000 (Shishu) / ₹5 Lakh (Kishore) with no property mortgage",
      eligibilityRules: {
        minAge: 18,
        targetGroup: "Small business owners, shopkeepers, tailors, artisans"
      },
      documents: [
        "Identity Proof (Aadhaar/Voter ID)",
        "Business Quotation / Plan summary",
        "Passport photos",
        "Bank Statement for last 6 months"
      ],
      steps: [
        "Prepare simple 1-page business plan with help from Womentra Mentor",
        "Submit at any Grameen Bank, Commercial Bank, or NBFC",
        "Loan disbursed directly into business bank account within 10 days"
      ],
      officialPortal: "https://www.mudra.org.in",
      voiceSummary: "मुद्रा योजना में बिना किसी गिरवी के अपनी दुकान या सिलाई के काम के लिए ₹50,000 से ₹5 लाख तक का सरकारी लोन मिलता है।"
    }
  ],
  schemeApplications: [
    {
      id: "app-101",
      userId: "user-1",
      schemeId: "pmmvvy",
      schemeTitle: "Pradhan Mantri Matru Vandana Yojana",
      status: "submitted",
      trackingNumber: "WOM-PMMVY-2026-9812",
      appliedAt: "2026-09-18T10:30:00Z",
      currentStage: "Document verification at Block Health Center",
      estimatedPayoutDate: "2026-10-15",
      nearestCSC: "Ramnagar Jan Seva Kendra (Near Shiva Temple, 1.2 km)"
    }
  ],
  cscCenters: [
    {
      id: "csc-1",
      name: "Ramnagar Common Service Center (CSC)",
      operatorName: "Vimla Patel",
      phone: "9876123450",
      address: "Near Ancient Shiva Temple, Main Road, Ramnagar",
      distanceKm: "1.2 km",
      lat: 25.2677,
      lng: 83.0234,
      services: ["PMMVY Application", "Aadhaar Card Update", "Bank Account Opening", "Ujjwala KYC"]
    },
    {
      id: "csc-2",
      name: "Kashi Gram Seva Kendra",
      operatorName: "Rajesh Mishra",
      phone: "9876123451",
      address: "Panchayat Bhavan, Chitaipur Gate",
      distanceKm: "2.8 km",
      lat: 25.2855,
      lng: 82.9754,
      services: ["Sukanya Samriddhi", "Mudra Loan Guidance", "Ayushman Golden Card"]
    },
    {
      id: "csc-3",
      name: "Nari Pragati Kendra (Women-Led CSC)",
      operatorName: "Suman Kumari",
      phone: "9876123452",
      address: "Shop #4, Gandhi Chowk, Lanka Road",
      distanceKm: "3.5 km",
      lat: 25.2798,
      lng: 82.9995,
      services: ["All Government Schemes", "DigiLocker Services", "Free Photo Copy for SHG"]
    }
  ],
  courses: [
    {
      id: "digital-upi-safety",
      title: "Digital Money & UPI Scam Suraksha",
      titleHi: "डिजिटल पैसा और यूपीआई फ्रॉड से सुरक्षा",
      category: "digital_skills",
      level: "Beginner",
      duration: "45 mins",
      thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&auto=format&fit=crop&q=80",
      totalLessons: 4,
      xpReward: 150,
      description: "Learn how to send money using PhonePe/GooglePay/BHIM safely without falling for fake prize calls, PIN sharing, or scam QR codes.",
      voiceIntro: "इस कोर्स में आप सुरक्षित तरीके से फोन से पैसे भेजना और किसी भी धोखे या फ्रॉड से बचना सीखेंगे।",
      lessons: [
        {
          id: "les-101",
          title: "What is UPI PIN & Why Never Share It",
          titleHi: "यूपीआई पिन क्या है और इसे कभी किसी को क्यों न बताएं",
          audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
          durationMinutes: 5,
          keyTakeaway: "UPI PIN is only for sending money, never for receiving money!",
          quiz: {
            question: "When someone says 'Enter your UPI PIN to receive ₹5000 prize', what should you do?",
            questionHi: "अगर कोई कहे '₹5000 इनाम पाने के लिए अपना UPI पिन डालें', तो आपको क्या करना चाहिए?",
            options: [
              { id: "a", text: "Enter PIN immediately", textHi: "तुरंत पिन डाल दें", isCorrect: false },
              { id: "b", text: "Never enter PIN! PIN is never needed to receive money", textHi: "पिन कभी न डालें! पैसे पाने के लिए पिन की जरूरत नहीं होती", isCorrect: true },
              { id: "c", text: "Share OTP on phone call", textHi: "फोन पर ओटीपी बता दें", isCorrect: false }
            ]
          }
        },
        {
          id: "les-102",
          title: "Scanning QR Code at Local Shops",
          titleHi: "दुकान पर सुरक्षित QR कोड स्कैन करना",
          audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
          durationMinutes: 6,
          keyTakeaway: "Always check shopkeeper's name on screen before pressing pay.",
          quiz: {
            question: "Before tapping Send on UPI, what should you verify on the screen?",
            questionHi: "UPI पर पैसे भेजने से पहले स्क्रीन पर क्या जांचना चाहिए?",
            options: [
              { id: "a", text: "Receiver's Name and exact Amount", textHi: "दुकानदार/व्यक्ति का नाम और सही रकम", isCorrect: true },
              { id: "b", text: "Battery percentage", textHi: "मोबाइल की बैटरी", isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: "sewing-boutique-business",
      title: "Village Tailoring to Boutique Mastery",
      titleHi: "सिलाई से बुटीक तक: घर बैठे कमाई",
      category: "vocational",
      level: "Intermediate",
      duration: "1.5 hours",
      thumbnail: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&auto=format&fit=crop&q=80",
      totalLessons: 5,
      xpReward: 250,
      description: "Step-by-step guidance on taking perfect body measurements, cutting blouse & salwar patterns, pricing garments, and finding customers via WhatsApp status.",
      voiceIntro: "सिलाई के हुनर को एक सफल बिजनेस में बदलें। सही नाप लेना, फैंसी डिज़ाइन और कपड़ों के सही दाम तय करना सीखें।",
      lessons: [
        {
          id: "les-201",
          title: "Professional Measurement & Pattern Cutting",
          titleHi: "सही नाप और ब्लाउज कटिंग का सरल तरीका",
          audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
          durationMinutes: 8,
          keyTakeaway: "Add 1.5 inches extra margin for comfortable alteration.",
          quiz: {
            question: "Why should you keep 1.5 inches extra margin inside a stitched blouse?",
            questionHi: "ब्लाउज में अंदर 1.5 इंच अतिरिक्त कपड़ा (मार्जिन) क्यों छोड़ना चाहिए?",
            options: [
              { id: "a", text: "So customer can easily alter it later if body size changes", textHi: "ताकि बाद में नाप ढीला या सही किया जा सके", isCorrect: true },
              { id: "b", text: "To waste fabric", textHi: "कपड़ा बर्बाद करने के लिए", isCorrect: false }
            ]
          }
        }
      ]
    },
    {
      id: "shg-financial-power",
      title: "Self-Help Group (SHG) & Bachat Shakti",
      titleHi: "स्वयं सहायता समूह और बचत शक्ति",
      category: "finance",
      level: "Beginner",
      duration: "1 hour",
      thumbnail: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400&auto=format&fit=crop&q=80",
      totalLessons: 4,
      xpReward: 200,
      description: "How to form a 10-woman group, maintain register books, open SHG bank account, and get government revolving funds.",
      voiceIntro: "स्वयं सहायता समूह से जुड़कर महिलाएं कैसे एक-दूसरे का सहारा बनती हैं और बैंक से कम ब्याज पर लोन पाती हैं।"
    },
    {
      id: "ai-smart-future-nari",
      title: "AI & Smartphone Tools for Rural Entrepreneurs",
      titleHi: "महिलाओं के लिए AI और स्मार्ट मोबाइल टूल्स",
      category: "new_world",
      level: "Beginner",
      duration: "50 mins",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
      totalLessons: 3,
      xpReward: 300,
      description: "Use voice AI to write business posters in Hindi, translate customer requests, calculate monthly profits, and get instant answers for farming/health.",
      voiceIntro: "बोलकर काम करने वाले AI का इस्तेमाल सीखें: अपनी दुकान का पोस्टर बनाना, हिसाब-किताब रखना और सरकारी जानकारी पाना।"
    },
    {
      id: "basic-literacy-numbers",
      title: "Daily Literacy & Practical Math for Markets",
      titleHi: "अक्षर ज्ञान और बाज़ार का व्यावहारिक गणित",
      category: "education",
      level: "Absolute Beginner",
      duration: "1.2 hours",
      thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&auto=format&fit=crop&q=80",
      totalLessons: 6,
      xpReward: 220,
      description: "Recognize currency notes (₹10, ₹50, ₹100, ₹500), read signboards, bus numbers, medicine expiry dates, and write your signature proudly.",
      voiceIntro: "दुकान, बस और बैंक में काम आने वाले अक्षर और नोटों की पहचान सीखें, ताकि कभी किसी पर निर्भर न रहना पड़े।"
    }
  ],
  communityPosts: [
    {
      id: "post-1",
      authorName: "Rekha Devi",
      village: "Sonbhadra, UP",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      title: "Got my First PMMVY Installment ₹2,000 Today!",
      titleHi: "आज मेरे खाते में मातृ वंदना योजना की पहली किश्त आ गई!",
      content: "With help from Womentra Didi and Mentor Ananya, I applied at Ramnagar CSC last month. Received notification today on my mobile!",
      hasVoiceNote: true,
      voiceNoteDuration: "0:42",
      likesCount: 38,
      repliesCount: 7,
      category: "success_story",
      createdAt: "2026-09-30T14:15:00Z"
    },
    {
      id: "post-2",
      authorName: "Mamata Murmu",
      village: "Mayurbhanj, Odisha",
      authorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
      title: "SHG Looking for 3 Women for Organic Spice Grinding",
      titleHi: "जैविक मसाला पिसाई के लिए 3 मेहनती बहनों की जरूरत है",
      content: "Our Maa Tarini SHG received ₹1 Lakh grant. We bought an automatic spice grinder. Daily wage ₹350 + profit share. Village elders welcome.",
      hasVoiceNote: true,
      voiceNoteDuration: "1:15",
      likesCount: 52,
      repliesCount: 14,
      category: "opportunity",
      createdAt: "2026-09-29T09:00:00Z"
    }
  ],
  affirmations: [
    {
      id: "aff-1",
      quote: "मैं सक्षम हूँ, मैं सीख रही हूँ, और मेरा भविष्य मेरे हाथों में है।",
      quoteEn: "I am capable, I am learning, and my future is in my hands.",
      author: "Womentra Didi",
      category: "strength"
    },
    {
      id: "aff-2",
      quote: "हर छोटा कदम मेरी और मेरे परिवार की ज़िंदगी बदल रहा है।",
      quoteEn: "Every small step is transforming my life and my family's future.",
      author: "Womentra Didi",
      category: "progress"
    },
    {
      id: "aff-3",
      quote: "मेरी आवाज़ में शक्ति है, मेरे सपनों में दम है।",
      quoteEn: "There is power in my voice and strength in my dreams.",
      author: "Womentra Didi",
      category: "courage"
    }
  ],
  stories: [
    {
      id: "story-1",
      name: "Chhavi Rajawat",
      village: "Soda, Rajasthan",
      title: "India's First MBA Sarpanch who Transformed her Village",
      titleHi: "गाँव की बेटी जिसने कॉर्पोरेट नौकरी छोड़ गाँव को स्मार्ट बनाया",
      audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
      duration: "3 mins",
      image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
      moral: "Education when brought back to the village can lift thousands of lives."
    },
    {
      id: "story-2",
      name: "Kalpana Saroj",
      village: "Roperkheda, Maharashtra",
      title: "From ₹2 Daily Wage Worker to Multi-Crore CEO",
      titleHi: "₹2 की दिहाड़ी से सैकड़ों करोड़ की कंपनी की मालकिन तक का सफर",
      audioUrl: "https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg",
      duration: "4 mins",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      moral: "No circumstance is permanent when backed by unshakeable determination."
    }
  ],
  packages: [
    {
      id: "pkg-free",
      name: "Saathi (Free)",
      nameHi: "साथी (मुफ्त)",
      price: 0,
      period: "forever",
      tagline: "Always free for every rural woman",
      color: "border-slate-300",
      features: [
        "All Basic Literacy & Skill Lessons",
        "Sarkari Saathi Scheme Guidance",
        "Womentra Didi AI Voice Assistant",
        "Sakhi Circle Community Access",
        "Emergency SOS & Family Help Mode"
      ],
      popular: false
    },
    {
      id: "pkg-premium",
      name: "Pragati (Monthly)",
      nameHi: "प्रगति (मासिक)",
      price: 199,
      period: "per month",
      tagline: "Dedicated Mentor & Live Video Classes",
      color: "border-purple-500 ring-2 ring-purple-400",
      features: [
        "Everything in Free Plan",
        "1:1 Assigned Verified Mentor",
        "Weekly Live Video / Audio Tutoring",
        "Verified Course Certificates",
        "Priority Scheme Application Filing",
        "Up to 2 Dependents / Children Link"
      ],
      popular: true
    },
    {
      id: "pkg-career",
      name: "Shakti Pro (Annual)",
      nameHi: "शक्ति प्रो (वार्षिक)",
      price: 1499,
      period: "per year",
      tagline: "Complete Livelihood & Business Incubation",
      color: "border-amber-500",
      features: [
        "Everything in Pragati Plan",
        "Mudra Loan / SHG Bank Documentation Support",
        "Boutique / Agri / Micro-Enterprise Launch Kit",
        "Direct Marketplace Listing for Products",
        "Unlimited Child Dependents Learning"
      ],
      popular: false
    }
  ],
  liveSessions: [
    {
      id: "live-101",
      title: "Live Tailoring Masterclass: Blouse Piping & Finishing",
      titleHi: "लाइव क्लास: ब्लाउज में सुंदर पाइपिंग और फिनिशिंग सीखें",
      mentorId: "mentor-1",
      mentorName: "Dr. Ananya Sharma",
      scheduledTime: "Today at 4:00 PM",
      status: "upcoming",
      lowBandwidthAudioMode: true,
      participantCount: 34,
      guardianApprovalRequired: false
    },
    {
      id: "live-102",
      title: "Girl Child Mathematics: Basic Fractions with Storytelling",
      titleHi: "बच्चों की गणित: कहानियों से सीखें भिन्न (Fractions)",
      mentorId: "mentor-2",
      mentorName: "Kavitha Raman",
      scheduledTime: "Today at 5:30 PM",
      status: "upcoming",
      lowBandwidthAudioMode: true,
      participantCount: 19,
      guardianApprovalRequired: true
    }
  ],
  activeLocationShares: []
};

// Simple file-backed storage manager
class Store {
  constructor() {
    this.data = INITIAL_DATA;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Using in-memory store:', err.message);
      this.data = INITIAL_DATA;
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to persist db.json:', err.message);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  find(collection, predicate) {
    return (this.data[collection] || []).find(predicate);
  }

  filter(collection, predicate) {
    return (this.data[collection] || []).filter(predicate);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].push(item);
    this.save();
    return item;
  }

  update(collection, predicate, updater) {
    const items = this.data[collection] || [];
    const index = items.findIndex(predicate);
    if (index !== -1) {
      items[index] = typeof updater === 'function' ? updater(items[index]) : { ...items[index], ...updater };
      this.save();
      return items[index];
    }
    return null;
  }

  delete(collection, predicate) {
    const items = this.data[collection] || [];
    const initialLen = items.length;
    this.data[collection] = items.filter(item => !predicate(item));
    if (this.data[collection].length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Store();
