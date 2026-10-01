import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

// Rich localized course data for Full Stack Development & Digital Skills in English, Tamil, Telugu, Hindi
const FULL_STACK_COURSE = {
  id: "full-stack-dev",
  title: "Full Stack Web Development",
  titleHi: "फुल स्टैक वेब डेवलपमेंट",
  titleTa: "முழு அடுக்கு வலை உருவாக்கம் (Full Stack)",
  titleTe: "ఫుల్ స్టాక్ వెబ్ డెవలప్‌మెంట్",
  category: "technical",
  level: "Beginner to Pro",
  duration: "40 hours",
  thumbnail: "https://images.unsplash.com/photo-1498050174643-c6b541334c99?w=600&auto=format&fit=crop&q=80",
  totalLessons: 8,
  totalQuizzes: 4,
  totalTests: 2,
  totalAssignments: 2,
  totalProjects: 2,
  xpReward: 1200,
  icon: "Code",
  description: "Learn HTML, CSS, JavaScript, React, Node.js, Express, and Database building from zero to deploying live web applications.",
  descriptionHi: "शून्य से सीखें HTML, CSS, जावास्क्रिप्ट, रिएक्ट और नोड.जेएस से लाइव वेबसाइट बनाना।",
  descriptionTa: "HTML, CSS, JavaScript, React மற்றும் Node.js மூலம் முழு இணையதளங்களை உருவாக்க கற்றுக்கொள்ளுங்கள்.",
  descriptionTe: "HTML, CSS, JavaScript, React మరియు Node.js తో మొదటినుండి పూర్తి వెబ్‌సైట్‌లు నిర్మించండి.",
  
  // Multilingual content
  content: {
    en: {
      overview: "Become a certified full stack developer capable of building modern, responsive, database-backed web applications.",
      modules: [
        {
          id: "mod-1",
          title: "Module 1: Frontend Foundation (HTML, CSS & Modern JS)",
          lessons: [
            {
              id: "fs-les-101",
              title: "HTML5 Semantic Structure & Responsive Design",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              duration: "15 mins",
              keyPoints: [
                "HTML elements: header, nav, main, section, footer",
                "Responsive flexbox and grid layouts",
                "Mobile-first design principles"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 5,
                question: "Which HTML5 element should be used for the primary navigation links?",
                options: [
                  { id: "a", text: "<header>", isCorrect: false },
                  { id: "b", text: "<nav>", isCorrect: true, explanation: "Correct! The <nav> element designates major navigation link sections." },
                  { id: "c", text: "<section>", isCorrect: false }
                ]
              },
              quiz: {
                question: "What CSS layout module is best suited for 1-dimensional row/column alignment?",
                options: [
                  { id: "a", text: "CSS Flexbox", isCorrect: true },
                  { id: "b", text: "Float: left", isCorrect: false },
                  { id: "c", text: "Position: absolute", isCorrect: false }
                ]
              }
            },
            {
              id: "fs-les-102",
              title: "JavaScript ES6+: Async/Await & Fetch API",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
              duration: "20 mins",
              keyPoints: [
                "Arrow functions and destructuring",
                "Promises and Async/Await data fetching",
                "Handling JSON responses from REST APIs"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 8,
                question: "Why do we use async/await with fetch() in JavaScript?",
                options: [
                  { id: "a", text: "To pause code synchronously without blocking browser", isCorrect: true, explanation: "async/await allows asynchronous API requests to be written cleanly." },
                  { id: "b", text: "To change website colors", isCorrect: false }
                ]
              }
            }
          ],
          test: {
            id: "fs-test-1",
            title: "Frontend Foundations Comprehensive Test",
            totalQuestions: 5,
            passScorePct: 70
          },
          assignment: {
            id: "fs-assign-1",
            title: "Build a Responsive Women Artisan Portfolio Page",
            instructions: "Create an accessible single-page portfolio with semantic HTML5, CSS Grid, and interactive modal.",
            rubric: "1. Semantic tags (30%) 2. Mobile responsiveness (40%) 3. Clean CSS styling (30%)"
          }
        },
        {
          id: "mod-2",
          title: "Module 2: Backend Architecture & REST APIs (Node.js & Express)",
          lessons: [
            {
              id: "fs-les-201",
              title: "Building RESTful Endpoints & Middleware in Express",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
              duration: "25 mins",
              keyPoints: [
                "GET, POST, PUT, DELETE HTTP verbs",
                "Request body validation and CORS headers",
                "JWT authentication middleware"
              ]
            }
          ],
          project: {
            id: "fs-proj-1",
            title: "Capstone Project: Village Marketplace Full Stack App",
            instructions: "Build and deploy a full-stack product catalog with product listing, user cart, and REST APIs."
          }
        }
      ]
    },
    hi: {
      overview: "शून्य से फुल स्टैक डेवलपर बनें और आधुनिक वेबसाइट और डेटाबेस आधारित ऐप्स बनाना सीखें।",
      modules: [
        {
          id: "mod-1",
          title: "मॉड्यूल 1: फ्रंटेंड नींव (HTML, CSS और जावास्क्रिप्ट)",
          lessons: [
            {
              id: "fs-les-101",
              title: "HTML5 संरचना और मोबाइल फ्रेंडली वेब डिज़ाइन",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              duration: "15 मिनट",
              keyPoints: [
                "HTML5 मुख्य टैग: header, nav, main, footer",
                "CSS फ्लेक्सबॉक्स और ग्रिड",
                "मोबाइल स्क्रीन के लिए रिस्पॉन्सिव डिज़ाइन"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 5,
                question: "वेबसाइट के मुख्य नेविगेशन मेन्यू के लिए कौन सा HTML टैग उपयोग होता है?",
                options: [
                  { id: "a", text: "<header>", isCorrect: false },
                  { id: "b", text: "<nav>", isCorrect: true, explanation: "शाबाश! <nav> टैग का उपयोग नेविगेशन लिंक के लिए होता है।" },
                  { id: "c", text: "<div>", isCorrect: false }
                ]
              },
              quiz: {
                question: "1-आयामी (row या column) लेआउट के लिए सबसे अच्छा CSS कौन सा है?",
                options: [
                  { id: "a", text: "CSS Flexbox", isCorrect: true },
                  { id: "b", text: "Float Left", isCorrect: false }
                ]
              }
            }
          ],
          test: {
            id: "fs-test-1",
            title: "फ्रंटेंड संपूर्ण परीक्षा",
            totalQuestions: 5,
            passScorePct: 70
          },
          assignment: {
            id: "fs-assign-1",
            title: "महिला कारीगर पोर्टफोलियो वेबसाइट बनाएं",
            instructions: "HTML5 और सुंदर CSS से 1 पेज की मोबाइल फ्रेंडली वेबसाइट तैयार करें।"
          }
        }
      ]
    },
    ta: {
      overview: "பூஜ்ஜியத்திலிருந்து முழு அடுக்கு வலை உருவாக்குநராகி நவீன இணையதளங்களை உருவாக்குங்கள்.",
      modules: [
        {
          id: "mod-1",
          title: "தொகுதி 1: வலை பக்க வடிவமைப்பு (HTML5, CSS3 & JavaScript)",
          lessons: [
            {
              id: "fs-les-101",
              title: "HTML5 அடிப்படைகள் மற்றும் மொபைல் வலை வடிவமைப்பு",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              duration: "15 நிமிடங்கள்",
              keyPoints: [
                "HTML முக்கிய குறிச்சொற்கள்: nav, main, footer",
                "CSS Flexbox தளவமைப்பு",
                "மொபைல் நட்பு வடிவமைப்பு"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 5,
                question: "இணையதள வழிசெலுத்தல் மெனுவுக்கு எந்த HTML குறிச்சொல் பயன்படுகிறது?",
                options: [
                  { id: "a", text: "<header>", isCorrect: false },
                  { id: "b", text: "<nav>", isCorrect: true, explanation: "சரி! <nav> குறிச்சொல் வழிசெலுத்தல் இணைப்புகளுக்குப் பயன்படுகிறது." }
                ]
              },
              quiz: {
                question: "வரிசை மற்றும் நெடுவரிசை சீரமைப்பிற்கு எந்த CSS சிறந்தது?",
                options: [
                  { id: "a", text: "CSS Flexbox", isCorrect: true },
                  { id: "b", text: "Float", isCorrect: false }
                ]
              }
            }
          ],
          test: {
            id: "fs-test-1",
            title: "முழு அடுக்கு அடிப்படை தேர்வு",
            totalQuestions: 5,
            passScorePct: 70
          },
          assignment: {
            id: "fs-assign-1",
            title: "கைவினைஞர் போர்ட்ஃபோலியோ பக்கத்தை உருவாக்கவும்",
            instructions: "HTML5 மற்றும் CSS ஐப் பயன்படுத்தி எளிய வலைப்பக்கத்தை வடிவமைக்கவும்."
          }
        }
      ]
    },
    te: {
      overview: "మొదటి నుండి ఫుల్ స్టాక్ డెవలపర్ అవ్వండి మరియు పూర్తి వెబ్‌సైట్‌లను నిర్మించండి.",
      modules: [
        {
          id: "mod-1",
          title: "మాడ్యూల్ 1: ఫ్రంటెండ్ ఫౌండేషన్ (HTML5, CSS & JS)",
          lessons: [
            {
              id: "fs-les-101",
              title: "HTML5 నిర్మాణం మరియు రెస్పాన్సివ్ వెబ్ డిజైన్",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
              duration: "15 నిమిషాలు",
              keyPoints: [
                "HTML5 ట్యాగ్‌లు: nav, main, section, footer",
                "CSS ఫ్లెక్స్‌బాక్స్ లేఅవుట్",
                "మొబైల్ రెస్పాన్సివ్ నియమాలు"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 5,
                question: "నావిగేషన్ లింక్‌ల కోసం ఏ HTML ట్యాగ్ వాడాలి?",
                options: [
                  { id: "a", text: "<header>", isCorrect: false },
                  { id: "b", text: "<nav>", isCorrect: true, explanation: "సరైన సమాధానం! నావిగేషన్ కోసం <nav> ట్యాగ్ వాడాలి." }
                ]
              },
              quiz: {
                question: "1-డైమెన్షనల్ లేఅవుట్ కోసం ఏ CSS ఉత్తమం?",
                options: [
                  { id: "a", text: "CSS Flexbox", isCorrect: true },
                  { id: "b", text: "Float", isCorrect: false }
                ]
              }
            }
          ],
          test: {
            id: "fs-test-1",
            title: "ఫ్రంటెండ్ సమగ్ర పరీక్ష",
            totalQuestions: 5,
            passScorePct: 70
          },
          assignment: {
            id: "fs-assign-1",
            title: "మహిళా కళాకారిణుల పోర్ట్‌ఫోలియో పేజీని నిర్మించండి",
            instructions: "HTML5 మరియు CSS తో అందమైన రెస్పాన్సివ్ వెబ్‌పేజీ తయారు చేయండి."
          }
        }
      ]
    }
  }
};

const DIGITAL_SKILLS_COURSE = {
  id: "digital-skills-safety",
  title: "Digital Literacy & Online Safety",
  titleHi: "डिजिटल साक्षरता और ऑनलाइन सुरक्षा",
  titleTa: "டிஜிட்டல் அறிவு & இணைய பாதுகாப்பு",
  titleTe: "డిజిటల్ అక్షరాస్యత & ఆన్‌లైన్ రక్షణ",
  category: "digital",
  level: "Beginner",
  duration: "12 hours",
  thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80",
  totalLessons: 6,
  totalQuizzes: 3,
  totalTests: 1,
  totalAssignments: 1,
  totalProjects: 1,
  xpReward: 800,
  icon: "Smartphone",
  description: "Master smartphones, UPI payments, DigiLocker, online banking, identifying scams, and cyber safety.",
  descriptionHi: "स्मार्टफोन, यूपीआई भुगतान, डिजिलॉकर और साइबर फ्रॉड से बचने के सरल उपाय सीखें।",
  descriptionTa: "ஸ்மார்ட்போன், UPI பணம் செலுத்துதல், டிஜிலாக்கர் மற்றும் மோசடிகளிலிருந்து தப்பிப்பது எப்படி என்று கற்றுக்கொள்ளுங்கள்.",
  descriptionTe: "స్మార్ట్‌ఫోన్, UPI చెల్లింపులు, డిజిలాకర్ మరియు ఆన్‌లైన్ మోసాల నుండి రక్షణ పొందడం నేర్చుకోండి.",

  content: {
    en: {
      overview: "Become digitally confident and safeguard your financial and personal data.",
      modules: [
        {
          id: "ds-mod-1",
          title: "Module 1: UPI & Mobile Payments Safety",
          lessons: [
            {
              id: "ds-les-101",
              title: "What is UPI PIN & Why Never Enter PIN to Receive Money",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              duration: "10 mins",
              keyPoints: [
                "UPI PIN is strictly for paying / debiting money",
                "Receiving money NEVER requires entering any PIN or scanning QR code",
                "How to verify receiver name before sending"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 6,
                question: "If a caller claims you won ₹10,000 lottery and asks you to enter UPI PIN, what should you do?",
                options: [
                  { id: "a", text: "Enter PIN immediately", isCorrect: false },
                  { id: "b", text: "Disconnect call! Entering PIN will deduct money from your account", isCorrect: true, explanation: "Correct! PIN is ONLY for paying, never for receiving." }
                ]
              },
              quiz: {
                question: "Do you need to enter your UPI PIN to receive money into your bank account?",
                options: [
                  { id: "a", text: "No, never!", isCorrect: true },
                  { id: "b", text: "Yes, always", isCorrect: false }
                ]
              }
            }
          ],
          test: {
            id: "ds-test-1",
            title: "Digital Safety Certification Test",
            totalQuestions: 5,
            passScorePct: 80
          },
          assignment: {
            id: "ds-assign-1",
            title: "Simulate a Safe UPI Verification at Local Shop",
            instructions: "Practice verifying the merchant QR code and recipient name before payment."
          }
        }
      ]
    },
    hi: {
      overview: "स्मार्टफोन और ऑनलाइन पैसे का सुरक्षित इस्तेमाल सीखें।",
      modules: [
        {
          id: "ds-mod-1",
          title: "मॉड्यूल 1: यूपीआई और ऑनलाइन सुरक्षा",
          lessons: [
            {
              id: "ds-les-101",
              title: "UPI पिन क्या है और पैसे पाने के लिए कभी पिन क्यों न डालें",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              duration: "10 मिनट",
              keyPoints: [
                "UPI पिन केवल पैसे भेजने के लिए होता है",
                "पैसे प्राप्त करने के लिए कभी पिन डालने की आवश्यकता नहीं होती",
                "दुकानदार का नाम देखकर ही पैसे भेजें"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 6,
                question: "अगर कोई कहे 'इनाम पाने के लिए अपना UPI पिन डालें', तो क्या करें?",
                options: [
                  { id: "a", text: "तुरंत पिन डाल दें", isCorrect: false },
                  { id: "b", text: "कॉल काट दें! पिन डालने से आपके खाते से पैसे कट जाएंगे", isCorrect: true, explanation: "शाबाश! पैसे पाने के लिए कभी भी पिन नहीं डाला जाता।" }
                ]
              }
            }
          ],
          test: {
            id: "ds-test-1",
            title: "डिजिटल सुरक्षा प्रमाण पत्र परीक्षा",
            totalQuestions: 5,
            passScorePct: 80
          }
        }
      ]
    },
    ta: {
      overview: "ஸ்மார்ட்போன் மற்றும் ஆன்லைன் பணப் பரிவர்த்தனைகளை பாதுகாப்பாக பயன்படுத்த கற்றுக்கொள்ளுங்கள்.",
      modules: [
        {
          id: "ds-mod-1",
          title: "தொகுதி 1: UPI மற்றும் ஆன்லைன் பாதுகாப்பு",
          lessons: [
            {
              id: "ds-les-101",
              title: "UPI பின் என்றால் என்ன? பணம் பெற ஏன் பின்னை உள்ளிடக் கூடாது?",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              duration: "10 நிமிடங்கள்",
              keyPoints: [
                "UPI பின் பணம் அனுப்புவதற்கு மட்டுமே",
                "பணம் பெறுவதற்கு ஒருபோதும் பின்னை உள்ளிட வேண்டியதில்லை"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 6,
                question: "பரிசு விழுந்துள்ளது என்று கூறி UPI பின் கேட்டால் என்ன செய்ய வேண்டும்?",
                options: [
                  { id: "a", text: "பின்னை உள்ளிட வேண்டும்", isCorrect: false },
                  { id: "b", text: "அழைப்பை துண்டிக்கவும்! பின்னை உள்ளிட்டால் பணம் பறிபோகும்", isCorrect: true, explanation: "மிகச் சரி! பணம் பெற பின்னை உள்ளிடக் கூடாது." }
                ]
              }
            }
          ],
          test: {
            id: "ds-test-1",
            title: "டிஜிட்டல் பாதுகாப்பு சான்றிதழ் தேர்வு",
            totalQuestions: 5,
            passScorePct: 80
          }
        }
      ]
    },
    te: {
      overview: "స్మార్ట్‌ఫోన్ మరియు ఆన్‌లైన్ బ్యాంకింగ్ సురక్షితంగా ఉపయోగించడం నేర్చుకోండి.",
      modules: [
        {
          id: "ds-mod-1",
          title: "మాడ్యూల్ 1: UPI & మొబైల్ చెల్లింపుల రక్షణ",
          lessons: [
            {
              id: "ds-les-101",
              title: "UPI పిన్ అంటే ఏమిటి & డబ్బులు పొందడానికి ఎందుకు పిన్ కొట్టకూడదు",
              videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
              duration: "10 నిమిషాలు",
              keyPoints: [
                "UPI పిన్ కేవలం డబ్బులు పంపడానికి మాత్రమే",
                "డబ్బులు ఖాతాలోకి రావడానికి పిన్ అవసరం లేదు"
              ],
              inVideoQuestion: {
                pauseAtSeconds: 6,
                question: "లాటరీ వచ్చిందని ఎవరైనా UPI పిన్ అడిగితే ఏమి చేయాలి?",
                options: [
                  { id: "a", text: "పిన్ చెప్పేయాలి", isCorrect: false },
                  { id: "b", text: "కాల్ కట్ చేయాలి! పిన్ కొడితే మన డబ్బులు పోతాయి", isCorrect: true, explanation: "సరైన సమాధానం! డబ్బులు రావడానికి ఎప్పుడూ పిన్ కొట్టకూడదు." }
                ]
              }
            }
          ],
          test: {
            id: "ds-test-1",
            title: "డిజిటల్ రక్షణ సర్టిఫికేట్ పరీక్ష",
            totalQuestions: 5,
            passScorePct: 80
          }
        }
      ]
    }
  }
};

// All Skill Cards Catalog (14+ skills across Technical & Vocational)
const ALL_SKILL_COURSES = [
  FULL_STACK_COURSE,
  DIGITAL_SKILLS_COURSE,
  {
    id: "frontend-development",
    title: "Frontend Web Development (React & Tailwind)",
    titleHi: "फ्रंटेंड वेब डेवलपमेंट (रिएक्ट व टेलविंड)",
    category: "technical",
    level: "Intermediate",
    duration: "25 hours",
    thumbnail: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=500&auto=format&fit=crop&q=80",
    totalLessons: 6,
    xpReward: 900,
    icon: "Layout"
  },
  {
    id: "backend-development",
    title: "Backend API Engineering (Node.js & Express)",
    titleHi: "बैकएंड एपीआई इंजीनियरिंग",
    category: "technical",
    level: "Intermediate",
    duration: "30 hours",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&auto=format&fit=crop&q=80",
    totalLessons: 6,
    xpReward: 950,
    icon: "Server"
  },
  {
    id: "artificial-intelligence",
    title: "Artificial Intelligence & Generative AI Basics",
    titleHi: "आर्टिफिशियल इंटेलिजेंस (AI) बेसिक्स",
    category: "technical",
    level: "Beginner",
    duration: "18 hours",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
    totalLessons: 5,
    xpReward: 850,
    icon: "Bot"
  },
  {
    id: "machine-learning",
    title: "Machine Learning with Python",
    titleHi: "पायथन से मशीन लर्निंग सीखें",
    category: "technical",
    level: "Intermediate",
    duration: "35 hours",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&auto=format&fit=crop&q=80",
    totalLessons: 7,
    xpReward: 1100,
    icon: "Cpu"
  },
  {
    id: "python-programming",
    title: "Python Programming for Beginners",
    titleHi: "शुरुआती लोगों के लिए पायथन प्रोग्रामिंग",
    category: "technical",
    level: "Beginner",
    duration: "20 hours",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=80",
    totalLessons: 5,
    xpReward: 800,
    icon: "Terminal"
  },
  {
    id: "java-programming",
    title: "Java & Object Oriented Programming",
    titleHi: "जावा और ऑब्जेक्ट ओरिएंटेड प्रोग्रामिंग",
    category: "technical",
    level: "Intermediate",
    duration: "28 hours",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=80",
    totalLessons: 6,
    xpReward: 950,
    icon: "Coffee"
  },
  {
    id: "database-management",
    title: "Database Management (PostgreSQL & MongoDB)",
    titleHi: "डेटाबेस मैनेजमेंट (SQL व नोएसक्यूएल)",
    category: "technical",
    level: "Intermediate",
    duration: "22 hours",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500&auto=format&fit=crop&q=80",
    totalLessons: 5,
    xpReward: 850,
    icon: "Database"
  },
  {
    id: "communication-skills",
    title: "Professional Communication & English Speaking",
    titleHi: "व्यावसायिक संचार और अंग्रेजी बोलना सीखें",
    category: "soft_skills",
    level: "All Levels",
    duration: "15 hours",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80",
    totalLessons: 4,
    xpReward: 700,
    icon: "MessageCircle"
  },
  {
    id: "tailoring-boutique",
    title: "Village Tailoring to Boutique Mastery",
    titleHi: "सिलाई से बुटीक तक: घर बैठे कमाई",
    category: "vocational",
    level: "All Levels",
    duration: "24 hours",
    thumbnail: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80",
    totalLessons: 6,
    xpReward: 900,
    icon: "Scissors"
  },
  {
    id: "shg-finance-power",
    title: "Self-Help Groups (SHG) & Micro-Finance Mastery",
    titleHi: "स्वयं सहायता समूह (SHG) व सूक्ष्म वित्त प्रबंधन",
    category: "finance",
    level: "Beginner",
    duration: "16 hours",
    thumbnail: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=500&auto=format&fit=crop&q=80",
    totalLessons: 4,
    xpReward: 750,
    icon: "Coins"
  },
  {
    id: "rural-entrepreneurship",
    title: "Rural Women Micro-Enterprise & Business Startup",
    titleHi: "ग्रामीण महिला लघु उद्योग व बिजनेस स्टार्टअप",
    category: "business",
    level: "Intermediate",
    duration: "20 hours",
    thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    totalLessons: 5,
    xpReward: 850,
    icon: "TrendingUp"
  }
];

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
      language: "en",
      literacyLevel: "beginner",
      interests: ["full-stack-dev", "digital-skills-safety", "tailoring-boutique"],
      streak: 7,
      points: 840,
      badges: ["Pratham Kadam", "Digital Nari", "Full Stack Explorer"],
      package: "free",
      assignedMentorId: "mentor-1",
      dependentsCount: 1,
      theme: "system",
      createdAt: new Date().toISOString()
    },
    {
      id: "user-admin",
      phone: "9999999999",
      name: "Womentra Admin Team",
      age: 35,
      gender: "female",
      role: "admin",
      language: "en",
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
      learningGoal: "Digital Skills & Mathematics",
      assignedMentorId: "mentor-2",
      progressPct: 65,
      createdAt: new Date().toISOString()
    }
  ],
  mentors: [
    {
      id: "mentor-1",
      name: "Dr. Ananya Sharma",
      title: "Senior Full-Stack & Rural Enterprise Coach",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      phone: "9811122233",
      languages: ["en", "hi", "mr"],
      skills: ["Full Stack Development", "Digital Safety", "SHG Finance", "Tailoring Business"],
      experienceYears: 9,
      rating: 4.9,
      totalReviews: 142,
      verified: true,
      kycStatus: "approved",
      kycToken: "DIGILOCKER-VERIFIED-9832",
      bio: "Empowered 4,000+ rural women to learn coding, digital skills, and start micro-enterprises.",
      availability: ["Morning (9 AM - 11 AM)", "Evening (4 PM - 7 PM)"],
      activeMentees: 18,
      maxMentees: 25
    },
    {
      id: "mentor-2",
      name: "Kavitha Raman",
      title: "Digital Literacy & Girl Child Tech Tutor",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
      phone: "9822233344",
      languages: ["ta", "te", "en", "hi"],
      skills: ["Girl Child Coding", "Smartphone Safety", "English Communication"],
      experienceYears: 6,
      rating: 4.8,
      totalReviews: 94,
      verified: true,
      kycStatus: "approved",
      kycToken: "DIGILOCKER-VERIFIED-7711",
      bio: "Passionate educator introducing first-generation digital learners to coding with care.",
      availability: ["Afternoon (2 PM - 5 PM)", "Evening (6 PM - 8 PM)"],
      activeMentees: 14,
      maxMentees: 20
    }
  ],
  courses: ALL_SKILL_COURSES,
  userCourseProgress: [
    {
      id: "prog-1",
      userId: "user-1",
      courseId: "full-stack-dev",
      language: "en",
      completedLessons: ["fs-les-101"],
      currentLessonId: "fs-les-102",
      completedQuizzes: ["fs-les-101"],
      completedTests: [],
      completedAssignments: [],
      completedProjects: [],
      finalAssessmentPassed: false,
      progressPct: 25,
      lastActiveAt: new Date().toISOString()
    }
  ],
  certificates: [
    {
      id: "cert-101",
      userId: "user-1",
      userName: "Sunita Devi",
      courseId: "digital-skills-safety",
      courseTitle: "Digital Literacy & Online Safety",
      language: "English",
      issueDate: "2026-09-25",
      verificationToken: "WOM-CERT-2026-9811",
      grade: "A+ Distinction",
      badge: "Digital Nari"
    }
  ],
  schemes: [
    {
      id: "pmmvvy",
      title: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
      titleHi: "प्रधानमंत्री मातृ वंदना योजना",
      tagline: "₹5,000 cash incentive for pregnant & lactating mothers",
      category: "maternal_health",
      benefitAmount: "₹5,000 in 3 installments",
      documents: ["Aadhaar Card", "MCP Card", "Bank Passbook"],
      voiceSummary: "Financial grant of ₹5,000 for mothers directly transferred to bank account."
    },
    {
      id: "lakhpati-didi",
      title: "Lakhpati Didi (SHG-NRLM)",
      titleHi: "लखपति दीदी योजना",
      tagline: "Enable SHG women to earn min ₹1 Lakh/year",
      category: "livelihood",
      benefitAmount: "Zero-interest credit up to ₹5 Lakh + Tech Training",
      documents: ["SHG Passbook", "Aadhaar Card"],
      voiceSummary: "Interest-free loans and vocational training for Self-Help Group women."
    }
  ],
  communityPosts: [
    {
      id: "post-1",
      authorName: "Rekha Devi",
      village: "Sonbhadra, UP",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
      title: "Built my First Web Page with Womentra!",
      titleHi: "मैंने वोमंतरा से अपना पहला वेब पेज बनाया!",
      content: "Learned HTML & CSS in Full Stack course. My village boutique now has an online catalog!",
      hasVoiceNote: true,
      voiceNoteDuration: "0:42",
      likesCount: 52,
      repliesCount: 8,
      category: "success_story",
      createdAt: new Date().toISOString()
    }
  ],
  packages: [
    {
      id: "pkg-free",
      name: "Saathi (Free)",
      price: 0,
      period: "forever",
      tagline: "Always free for every rural woman",
      features: ["All Basic Literacy & Coding Lessons", "Sarkari Saathi Scheme Guidance", "Womentra Didi AI Voice Assistant", "Community Feed"]
    },
    {
      id: "pkg-premium",
      name: "Pragati (Monthly)",
      price: 199,
      period: "per month",
      tagline: "Dedicated 1:1 Mentor & Live Video Calls",
      popular: true,
      features: ["Everything in Free", "1:1 Dedicated Mentor", "Weekly WebRTC Video Classes", "Verified Certificates"]
    }
  ],
  liveSessions: [
    {
      id: "live-101",
      title: "Full Stack Live Coding: Responsive Flexbox & WebRTC",
      mentorId: "mentor-1",
      mentorName: "Dr. Ananya Sharma",
      scheduledTime: "Today at 4:00 PM",
      status: "live",
      participantCount: 34
    }
  ],
  activeLocationShares: []
};

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
        if (!this.data.userCourseProgress) this.data.userCourseProgress = INITIAL_DATA.userCourseProgress;
        if (!this.data.certificates) this.data.certificates = INITIAL_DATA.certificates;
      } else {
        this.save();
      }
    } catch {
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
    if (!this.data[collection]) this.data[collection] = [];
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
