/**
 * seed.js - Database seeding script
 * Inserts sample users (admin + regular user) and 6 content items (3 education, 3 health)
 * Run: node seed/seed.js or npm run seed from /backend
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

// Import models
const User = require('../backend/src/models/User');
const Content = require('../backend/src/models/Content');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare';

// Sample users data
const usersData = [
  {
    name: 'Admin User',
    email: 'admin@healthcare.local',
    password: 'Admin123!',
    role: 'admin',
    preferences: {
      topics: ['health', 'education'],
      languages: ['en', 'hi'],
      voiceEnabled: true
    }
  },
  {
    name: 'Regular User',
    email: 'user@healthcare.local',
    password: 'User123!',
    role: 'user',
    preferences: {
      topics: ['health'],
      languages: ['en'],
      voiceEnabled: false
    }
  },
  {
    name: 'Curator User',
    email: 'curator@healthcare.local',
    password: 'Curator123!',
    role: 'curator',
    preferences: {
      topics: ['education'],
      languages: ['hi'],
      voiceEnabled: true
    }
  }
];

// Sample content data - 3 education + 3 health items in EN and HI
const contentData = [
  // Education Content - English
  {
    title: 'Understanding Vaccination Schedules',
    bodyMarkdown: `# Understanding Vaccination Schedules

Vaccinations are crucial for preventing serious diseases. Here's what you need to know:

## Why Vaccinations Matter
- They protect individuals and communities
- They have eradicated many deadly diseases
- They are safe and well-tested

## Common Vaccination Schedule
1. **Birth**: BCG, Hepatitis B, OPV
2. **6 weeks**: DPT, IPV, Hepatitis B
3. **10 weeks**: DPT, IPV
4. **14 weeks**: DPT, IPV, Hepatitis B

> **Note**: Always consult with a healthcare professional for personalized advice.`,
    type: 'education',
    tags: ['vaccination', 'immunization', 'prevention', 'children'],
    language: 'en',
    verified: true,
    sourceUrl: 'https://www.who.int/immunization',
    metrics: { views: 150, likes: 45 }
  },
  // Education Content - Hindi
  {
    title: 'टीकाकरण अनुसूची को समझना',
    bodyMarkdown: `# टीकाकरण अनुसूची को समझना

गंभीर बीमारियों से बचाव के लिए टीकाकरण महत्वपूर्ण है। यहाँ जानिए:

## टीकाकरण क्यों महत्वपूर्ण है
- यह व्यक्तियों और समुदायों की रक्षा करता है
- इसने कई घातक बीमारियों को समाप्त किया है
- यह सुरक्षित और अच्छी तरह से परीक्षित है

## सामान्य टीकाकरण अनुसूची
1. **जन्म**: BCG, हेपेटाइटिस B, OPV
2. **6 सप्ताह**: DPT, IPV, हेपेटाइटिस B
3. **10 सप्ताह**: DPT, IPV
4. **14 सप्ताह**: DPT, IPV, हेपेटाइटिस B

> **नोट**: व्यक्तिगत सलाह के लिए हमेशा स्वास्थ्य पेशेवर से परामर्श करें।`,
    type: 'education',
    tags: ['vaccination', 'immunization', 'prevention', 'children'],
    language: 'hi',
    verified: true,
    sourceUrl: 'https://www.who.int/immunization',
    metrics: { views: 120, likes: 38 }
  },
  // Education Content - English
  {
    title: 'Hand Hygiene: Your First Line of Defense',
    bodyMarkdown: `# Hand Hygiene: Your First Line of Defense

Proper hand washing is one of the most effective ways to prevent the spread of diseases.

## When to Wash Your Hands
- Before and after eating
- After using the toilet
- After coughing or sneezing
- After touching animals

## Proper Hand Washing Steps
1. Wet hands with clean water
2. Apply soap
3. Scrub for at least 20 seconds
4. Rinse thoroughly
5. Dry with clean towel

**Remember**: Hand sanitizer is a good alternative when soap isn't available!`,
    type: 'education',
    tags: ['hygiene', 'prevention', 'handwashing', 'basics'],
    language: 'en',
    verified: true,
    sourceUrl: 'https://www.cdc.gov/handwashing',
    metrics: { views: 200, likes: 67 }
  },
  // Health Content - English
  {
    title: 'Recognizing Dehydration Symptoms',
    bodyMarkdown: `# Recognizing Dehydration Symptoms

Dehydration occurs when your body loses more fluids than it takes in.

## Warning Signs
- Extreme thirst
- Dark yellow urine
- Dizziness or lightheadedness
- Fatigue
- Dry mouth and lips

## What to Do
1. Drink water or oral rehydration solution
2. Rest in a cool place
3. Avoid caffeine and alcohol

⚠️ **EMERGENCY**: Seek immediate medical care if you experience confusion, rapid heartbeat, or fainting.

*This is general information only. Please consult a healthcare professional for medical advice.*`,
    type: 'health',
    tags: ['dehydration', 'symptoms', 'emergency', 'first-aid'],
    language: 'en',
    verified: true,
    sourceUrl: 'https://www.mayoclinic.org',
    metrics: { views: 180, likes: 52 }
  },
  // Health Content - Hindi
  {
    title: 'निर्जलीकरण के लक्षणों को पहचानना',
    bodyMarkdown: `# निर्जलीकरण के लक्षणों को पहचानना

निर्जलीकरण तब होता है जब शरीर लेने से ज्यादा तरल पदार्थ खो देता है।

## चेतावनी के संकेत
- अत्यधिक प्यास
- गहरे पीले रंग का मूत्र
- चक्कर आना
- थकान
- सूखा मुंह और होंठ

## क्या करें
1. पानी या ORS पिएं
2. ठंडी जगह पर आराम करें
3. कैफीन और शराब से बचें

⚠️ **आपातकाल**: भ्रम, तेज धड़कन, या बेहोशी होने पर तुरंत चिकित्सा सहायता लें।

*यह केवल सामान्य जानकारी है। चिकित्सा सलाह के लिए स्वास्थ्य पेशेवर से परामर्श करें।*`,
    type: 'health',
    tags: ['dehydration', 'symptoms', 'emergency', 'first-aid'],
    language: 'hi',
    verified: true,
    sourceUrl: 'https://www.mayoclinic.org',
    metrics: { views: 140, likes: 41 }
  },
  // Health Content - English
  {
    title: 'Common Cold vs Flu: Know the Difference',
    bodyMarkdown: `# Common Cold vs Flu: Know the Difference

Understanding the difference can help you get proper treatment.

## Common Cold Symptoms
- Runny or stuffy nose
- Sneezing
- Mild body aches
- Gradual onset

## Flu Symptoms
- High fever (often above 101°F)
- Severe body aches
- Extreme fatigue
- Sudden onset

## When to See a Doctor
- Symptoms lasting more than 10 days
- Difficulty breathing
- Persistent fever
- Chest pain

*Disclaimer: This information is for educational purposes only and should not replace professional medical advice.*`,
    type: 'health',
    tags: ['cold', 'flu', 'symptoms', 'comparison'],
    language: 'en',
    verified: true,
    sourceUrl: 'https://www.cdc.gov/flu',
    metrics: { views: 220, likes: 78 }
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Content.deleteMany({});

    // Hash passwords and insert users
    console.log('👤 Seeding users...');
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(user.password, salt);
        return {
          name: user.name,
          email: user.email,
          passwordHash,
          role: user.role,
          preferences: user.preferences
        };
      })
    );
    const insertedUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Get admin user ID for content authorship
    const adminUser = insertedUsers.find(u => u.role === 'admin');

    // Add authorId to content and insert
    console.log('📚 Seeding content...');
    const contentWithAuthor = contentData.map(content => ({
      ...content,
      authorId: adminUser._id
    }));
    const insertedContent = await Content.insertMany(contentWithAuthor);
    console.log(`✅ Inserted ${insertedContent.length} content items`);

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log('─'.repeat(40));
    console.log(`Users: ${insertedUsers.length}`);
    insertedUsers.forEach(u => {
      console.log(`  - ${u.email} (${u.role})`);
    });
    console.log(`Content items: ${insertedContent.length}`);
    console.log(`  - Education: ${insertedContent.filter(c => c.type === 'education').length}`);
    console.log(`  - Health: ${insertedContent.filter(c => c.type === 'health').length}`);
    console.log('─'.repeat(40));
    console.log('\n🎉 Seeding completed successfully!');

    console.log('\n📝 Test credentials:');
    console.log('  Admin: admin@healthcare.local / Admin123!');
    console.log('  User: user@healthcare.local / User123!');
    console.log('  Curator: curator@healthcare.local / Curator123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
}

// Run seeding
seedDatabase();
