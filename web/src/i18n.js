/**
 * i18n.js - Internationalization configuration
 * English and Hindi translations
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // App
            app: {
                name: 'Health Assistant'
            },

            // Common
            common: {
                loading: 'Loading...',
                error: 'Error',
                retry: 'Retry',
                back: 'Back',
                next: 'Next',
                save: 'Save',
                cancel: 'Cancel',
                user: 'User',
                loadMore: 'Load More',
                goHome: 'Go Home',
                goBack: 'Go Back'
            },

            // Navigation
            nav: {
                home: 'Home',
                dashboard: 'Dashboard',
                chat: 'Chat',
                settings: 'Settings'
            },

            // Auth
            auth: {
                login: 'Login',
                logout: 'Logout',
                register: 'Sign Up',
                email: 'Email',
                password: 'Password',
                confirmPassword: 'Confirm Password',
                name: 'Full Name',
                namePlaceholder: 'Enter your name',
                welcomeBack: 'Welcome Back',
                loginSubtitle: 'Sign in to your account',
                createAccount: 'Create Account',
                registerSubtitle: 'Start your health journey today',
                noAccount: "Don't have an account?",
                hasAccount: 'Already have an account?',
                forgotPassword: 'Forgot password?',
                or: 'or',
                loginError: 'Invalid email or password',
                registerError: 'Registration failed',
                passwordHint: 'At least 8 characters with uppercase, lowercase, and number',
                demoCredentials: 'Demo credentials'
            },

            // Validation
            validation: {
                nameRequired: 'Name is required',
                nameTooShort: 'Name must be at least 2 characters',
                emailRequired: 'Email is required',
                emailInvalid: 'Invalid email format',
                passwordRequired: 'Password is required',
                passwordTooShort: 'Password must be at least 8 characters',
                passwordWeak: 'Password must contain uppercase, lowercase, and number',
                passwordMismatch: 'Passwords do not match'
            },

            // Home
            home: {
                heroTitle: 'Your Privacy-First Health & Education Assistant',
                heroSubtitle: 'Get personalized health information and educational content in your language, with your privacy protected.',
                getStarted: 'Get Started Free',
                goDashboard: 'Go to Dashboard',
                startChat: 'Start Chatting',
                featuresTitle: 'Why Choose Us?',
                ctaTitle: 'Ready to Start Your Health Journey?',
                ctaSubtitle: 'Join thousands of users getting personalized health guidance.'
            },

            // Features
            features: {
                ai: {
                    title: 'AI-Powered Guidance',
                    desc: 'Get instant answers to your health and education questions from our smart assistant.'
                },
                privacy: {
                    title: 'Privacy First',
                    desc: 'Your data stays on your device. We never store personal information without consent.'
                },
                multilingual: {
                    title: 'Multilingual Support',
                    desc: 'Access content in English and Hindi with more languages coming soon.'
                },
                offline: {
                    title: 'Works Offline',
                    desc: 'Continue learning even without internet connection.'
                },
                voice: {
                    title: 'Voice Enabled',
                    desc: 'Speak your questions and listen to responses hands-free.'
                },
                verified: {
                    title: 'Verified Content',
                    desc: 'All health content is reviewed by medical professionals.'
                }
            },

            // Onboarding
            onboarding: {
                step: 'Step {{current}} of {{total}}',
                skip: 'Skip',
                complete: 'Complete Setup',
                topicsTitle: 'What interests you?',
                topicsSubtitle: 'Select topics to personalize your feed.',
                languagesTitle: 'Preferred languages',
                languagesSubtitle: 'We will show content in these languages.',
                voiceTitle: 'Enable voice features?',
                voiceSubtitle: 'Speak your questions and hear responses.',
                voiceEnable: 'Enable Voice',
                voiceEnableDesc: 'Use speech-to-text and text-to-speech',
                voiceDisable: 'Text Only',
                voiceDisableDesc: 'Type and read without voice features',
                privacyTitle: 'Your Privacy Matters',
                privacySubtitle: 'Review how we handle your data.'
            },

            // Topics
            topics: {
                health: 'Health',
                education: 'Education',
                nutrition: 'Nutrition',
                mentalHealth: 'Mental Health',
                fitness: 'Fitness',
                vaccination: 'Vaccination',
                firstAid: 'First Aid'
            },

            // Privacy
            privacy: {
                dataUsageTitle: 'How we use your data:',
                dataUsage1: 'Preferences are stored locally on your device',
                dataUsage2: 'Chat history is encrypted and auto-deleted after 30 days',
                dataUsage3: 'We never sell your personal information',
                dataUsage4: 'You can delete all your data anytime',
                retentionTitle: 'Data Retention:',
                retentionDesc: 'Conversations are automatically deleted after 30 days. You can request immediate deletion at any time.',
                consentText: 'I understand and agree to the privacy policy and data handling practices.'
            },

            // Dashboard
            dashboard: {
                welcome: 'Hello, {{name}}!',
                subtitle: 'Here is your personalized content.',
                forYou: 'For You',
                trending: 'Trending',
                askQuestion: 'Ask Question',
                healthTips: 'Health Tips',
                education: 'Education',
                settings: 'Settings',
                noContent: 'No content available yet.'
            },

            // Chat
            chat: {
                title: 'Health Assistant',
                subtitle: 'Ask me anything about health or education',
                welcomeMessage: "Hello! I'm your health and education assistant. How can I help you today?",
                inputPlaceholder: 'Type your question...',
                send: 'Send',
                thinking: 'Thinking...',
                newChat: 'New Chat',
                error: 'Failed to send message',
                errorMessage: "I'm sorry, I couldn't process your request. Please try again.",
                disclaimer: 'This is for informational purposes only. Always consult a healthcare professional.',
                healthAdvice: 'Health info',
                listen: 'Listen',
                stopSpeaking: 'Stop'
            },

            // Content
            content: {
                health: 'Health',
                education: 'Education',
                verified: 'Verified',
                source: 'Source',
                views: 'views',
                likes: 'likes'
            },

            // Settings
            settings: {
                title: 'Settings',
                profile: 'Profile',
                language: 'Language',
                topics: 'Topics of Interest',
                voice: 'Voice Features',
                enableVoice: 'Enable voice input and text-to-speech',
                save: 'Save Changes',
                saved: 'Settings saved!',
                saveFailed: 'Failed to save settings'
            },

            // Errors
            errors: {
                loadFailed: 'Failed to load content',
                pageNotFound: 'Page not found',
                notFound: 'Content not found'
            },

            // Footer
            footer: {
                rights: 'All rights reserved.'
            }
        }
    },

    hi: {
        translation: {
            // App
            app: {
                name: 'स्वास्थ्य सहायक'
            },

            // Common
            common: {
                loading: 'लोड हो रहा है...',
                error: 'त्रुटि',
                retry: 'पुनः प्रयास करें',
                back: 'वापस',
                next: 'आगे',
                save: 'सेव करें',
                cancel: 'रद्द करें',
                user: 'उपयोगकर्ता',
                loadMore: 'और लोड करें',
                goHome: 'होम पर जाएं',
                goBack: 'वापस जाएं'
            },

            // Navigation
            nav: {
                home: 'होम',
                dashboard: 'डैशबोर्ड',
                chat: 'चैट',
                settings: 'सेटिंग्स'
            },

            // Auth
            auth: {
                login: 'लॉगिन',
                logout: 'लॉगआउट',
                register: 'साइन अप',
                email: 'ईमेल',
                password: 'पासवर्ड',
                confirmPassword: 'पासवर्ड पुष्टि',
                name: 'पूरा नाम',
                namePlaceholder: 'अपना नाम दर्ज करें',
                welcomeBack: 'वापस आपका स्वागत है',
                loginSubtitle: 'अपने खाते में लॉगिन करें',
                createAccount: 'खाता बनाएं',
                registerSubtitle: 'आज ही अपनी स्वास्थ्य यात्रा शुरू करें',
                noAccount: 'खाता नहीं है?',
                hasAccount: 'पहले से खाता है?',
                forgotPassword: 'पासवर्ड भूल गए?',
                or: 'या',
                loginError: 'अमान्य ईमेल या पासवर्ड',
                registerError: 'पंजीकरण विफल',
                passwordHint: 'कम से कम 8 अक्षर, अपरकेस, लोअरकेस और संख्या के साथ',
                demoCredentials: 'डेमो क्रेडेंशियल्स'
            },

            // Validation
            validation: {
                nameRequired: 'नाम आवश्यक है',
                nameTooShort: 'नाम कम से कम 2 अक्षर का होना चाहिए',
                emailRequired: 'ईमेल आवश्यक है',
                emailInvalid: 'अमान्य ईमेल प्रारूप',
                passwordRequired: 'पासवर्ड आवश्यक है',
                passwordTooShort: 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए',
                passwordWeak: 'पासवर्ड में अपरकेस, लोअरकेस और संख्या होनी चाहिए',
                passwordMismatch: 'पासवर्ड मेल नहीं खाते'
            },

            // Home
            home: {
                heroTitle: 'आपका गोपनीयता-प्रथम स्वास्थ्य और शिक्षा सहायक',
                heroSubtitle: 'अपनी भाषा में व्यक्तिगत स्वास्थ्य जानकारी और शैक्षिक सामग्री प्राप्त करें।',
                getStarted: 'मुफ्त में शुरू करें',
                goDashboard: 'डैशबोर्ड पर जाएं',
                startChat: 'चैट शुरू करें',
                featuresTitle: 'हमें क्यों चुनें?',
                ctaTitle: 'अपनी स्वास्थ्य यात्रा शुरू करने के लिए तैयार?',
                ctaSubtitle: 'हजारों उपयोगकर्ताओं से जुड़ें।'
            },

            // Features
            features: {
                ai: {
                    title: 'AI-संचालित मार्गदर्शन',
                    desc: 'हमारे स्मार्ट सहायक से स्वास्थ्य और शिक्षा के प्रश्नों के तुरंत उत्तर पाएं।'
                },
                privacy: {
                    title: 'गोपनीयता प्राथमिक',
                    desc: 'आपका डेटा आपके डिवाइस पर रहता है।'
                },
                multilingual: {
                    title: 'बहुभाषी समर्थन',
                    desc: 'अंग्रेजी और हिंदी में सामग्री उपलब्ध।'
                },
                offline: {
                    title: 'ऑफ़लाइन काम करता है',
                    desc: 'इंटरनेट के बिना भी सीखना जारी रखें।'
                },
                voice: {
                    title: 'आवाज सक्षम',
                    desc: 'अपने प्रश्न बोलें और हैंड्स-फ्री जवाब सुनें।'
                },
                verified: {
                    title: 'सत्यापित सामग्री',
                    desc: 'सभी स्वास्थ्य सामग्री चिकित्सा पेशेवरों द्वारा समीक्षित।'
                }
            },

            // Onboarding
            onboarding: {
                step: 'चरण {{current}} / {{total}}',
                skip: 'छोड़ें',
                complete: 'सेटअप पूरा करें',
                topicsTitle: 'आपकी रुचि क्या है?',
                topicsSubtitle: 'अपने फ़ीड को वैयक्तिकृत करने के लिए विषय चुनें।',
                languagesTitle: 'पसंदीदा भाषाएं',
                languagesSubtitle: 'हम इन भाषाओं में सामग्री दिखाएंगे।',
                voiceTitle: 'आवाज सुविधाएं सक्षम करें?',
                voiceSubtitle: 'अपने प्रश्न बोलें और जवाब सुनें।',
                voiceEnable: 'आवाज सक्षम करें',
                voiceEnableDesc: 'स्पीच-टू-टेक्स्ट और टेक्स्ट-टू-स्पीच का उपयोग करें',
                voiceDisable: 'केवल टेक्स्ट',
                voiceDisableDesc: 'आवाज सुविधाओं के बिना टाइप और पढ़ें',
                privacyTitle: 'आपकी गोपनीयता मायने रखती है',
                privacySubtitle: 'हम आपके डेटा को कैसे संभालते हैं, देखें।'
            },

            // Topics
            topics: {
                health: 'स्वास्थ्य',
                education: 'शिक्षा',
                nutrition: 'पोषण',
                mentalHealth: 'मानसिक स्वास्थ्य',
                fitness: 'फिटनेस',
                vaccination: 'टीकाकरण',
                firstAid: 'प्राथमिक चिकित्सा'
            },

            // Privacy
            privacy: {
                dataUsageTitle: 'हम आपके डेटा का उपयोग कैसे करते हैं:',
                dataUsage1: 'प्राथमिकताएं आपके डिवाइस पर संग्रहीत हैं',
                dataUsage2: 'चैट इतिहास एन्क्रिप्टेड है और 30 दिनों बाद ऑटो-डिलीट',
                dataUsage3: 'हम कभी आपकी व्यक्तिगत जानकारी नहीं बेचते',
                dataUsage4: 'आप कभी भी अपना सारा डेटा हटा सकते हैं',
                retentionTitle: 'डेटा प्रतिधारण:',
                retentionDesc: 'बातचीत 30 दिनों के बाद स्वचालित रूप से हटा दी जाती हैं।',
                consentText: 'मैं गोपनीयता नीति को समझता/समझती हूं और सहमत हूं।'
            },

            // Dashboard
            dashboard: {
                welcome: 'नमस्ते, {{name}}!',
                subtitle: 'यहां आपकी व्यक्तिगत सामग्री है।',
                forYou: 'आपके लिए',
                trending: 'ट्रेंडिंग',
                askQuestion: 'प्रश्न पूछें',
                healthTips: 'स्वास्थ्य सुझाव',
                education: 'शिक्षा',
                settings: 'सेटिंग्स',
                noContent: 'अभी कोई सामग्री उपलब्ध नहीं है।'
            },

            // Chat
            chat: {
                title: 'स्वास्थ्य सहायक',
                subtitle: 'स्वास्थ्य या शिक्षा के बारे में कुछ भी पूछें',
                welcomeMessage: 'नमस्ते! मैं आपका स्वास्थ्य और शिक्षा सहायक हूं। आज मैं आपकी कैसे मदद कर सकता/सकती हूं?',
                inputPlaceholder: 'अपना प्रश्न लिखें...',
                send: 'भेजें',
                thinking: 'सोच रहा हूं...',
                newChat: 'नई चैट',
                error: 'संदेश भेजने में विफल',
                errorMessage: 'क्षमा करें, आपका अनुरोध प्रोसेस नहीं हो सका। कृपया पुनः प्रयास करें।',
                disclaimer: 'यह केवल जानकारी के लिए है। हमेशा डॉक्टर से परामर्श लें।',
                healthAdvice: 'स्वास्थ्य जानकारी',
                listen: 'सुनें',
                stopSpeaking: 'रोकें'
            },

            // Content
            content: {
                health: 'स्वास्थ्य',
                education: 'शिक्षा',
                verified: 'सत्यापित',
                source: 'स्रोत',
                views: 'व्यूज',
                likes: 'लाइक्स'
            },

            // Settings
            settings: {
                title: 'सेटिंग्स',
                profile: 'प्रोफाइल',
                language: 'भाषा',
                topics: 'रुचि के विषय',
                voice: 'आवाज सुविधाएं',
                enableVoice: 'आवाज इनपुट और टेक्स्ट-टू-स्पीच सक्षम करें',
                save: 'बदलाव सेव करें',
                saved: 'सेटिंग्स सेव हो गईं!',
                saveFailed: 'सेटिंग्स सेव करने में विफल'
            },

            // Errors
            errors: {
                loadFailed: 'सामग्री लोड करने में विफल',
                pageNotFound: 'पेज नहीं मिला',
                notFound: 'सामग्री नहीं मिली'
            },

            // Footer
            footer: {
                rights: 'सर्वाधिकार सुरक्षित।'
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
