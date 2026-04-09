// Debug script for Faculty Achievements
console.log('🔍 Starting Faculty Achievements Debug...');

// Check if DOM is ready
if (document.readyState === 'loading') {
  console.log('⏳ DOM is still loading...');
  document.addEventListener('DOMContentLoaded', runDebug);
} else {
  console.log('✅ DOM is ready');
  runDebug();
}

function runDebug() {
  console.log('\n=== DEBUGGING FACULTY ACHIEVEMENTS ===\n');
  
  // 1. Check if data is loaded
  console.log('1️⃣ Checking facultyAchievements data:');
  if (typeof facultyAchievements !== 'undefined') {
    console.log('✅ facultyAchievements is defined');
    console.log(`   Total faculty members: ${Object.keys(facultyAchievements).length}`);
    console.log('   Faculty names:', Object.keys(facultyAchievements));
  } else {
    console.error('❌ facultyAchievements is NOT defined!');
  }
  
  // 2. Check if functions exist
  console.log('\n2️⃣ Checking functions:');
  if (typeof openAchievementModal === 'function') {
    console.log('✅ openAchievementModal function exists');
  } else {
    console.error('❌ openAchievementModal function NOT found!');
  }
  
  if (typeof closeAchievementModal === 'function') {
    console.log('✅ closeAchievementModal function exists');
  } else {
    console.error('❌ closeAchievementModal function NOT found!');
  }
  
  // 3. Check modal HTML elements
  console.log('\n3️⃣ Checking modal HTML elements:');
  const modal = document.getElementById('achievementModal');
  if (modal) {
    console.log('✅ Modal element found');
    console.log('   Modal classes:', modal.className);
    console.log('   Modal display:', window.getComputedStyle(modal).display);
  } else {
    console.error('❌ Modal element NOT found!');
  }
  
  const modalPhoto = document.getElementById('modalPhoto');
  const modalName = document.getElementById('modalName');
  const modalDesignation = document.getElementById('modalDesignation');
  const modalEmail = document.getElementById('modalEmail');
  const modalPhone = document.getElementById('modalPhone');
  const modalAchievements = document.getElementById('modalAchievements');
  
  console.log('   modalPhoto:', modalPhoto ? '✅' : '❌');
  console.log('   modalName:', modalName ? '✅' : '❌');
  console.log('   modalDesignation:', modalDesignation ? '✅' : '❌');
  console.log('   modalEmail:', modalEmail ? '✅' : '❌');
  console.log('   modalPhone:', modalPhone ? '✅' : '❌');
  console.log('   modalAchievements:', modalAchievements ? '✅' : '❌');
  
  // 4. Check faculty cards
  console.log('\n4️⃣ Checking faculty cards:');
  const facultyCards = document.querySelectorAll('.faculty-card');
  console.log(`   Found ${facultyCards.length} faculty cards`);
  
  if (facultyCards.length > 0) {
    console.log('   First 5 faculty cards:');
    facultyCards.forEach((card, index) => {
      if (index < 5) {
        const name = card.getAttribute('data-faculty');
        const nameElement = card.querySelector('.faculty-name');
        console.log(`   ${index + 1}. ${name || 'NO NAME'} (${nameElement ? nameElement.textContent : 'NO ELEMENT'})`);
      }
    });
  } else {
    console.error('❌ No faculty cards found!');
  }
  
  // 5. Check event listeners
  console.log('\n5️⃣ Checking event listeners:');
  const testCard = facultyCards[0];
  if (testCard) {
    console.log('   Testing click on first card...');
    const facultyName = testCard.getAttribute('data-faculty');
    console.log(`   Faculty name: ${facultyName}`);
    
    // Check if this faculty exists in data
    if (facultyAchievements && facultyAchievements[facultyName]) {
      console.log('✅ Faculty data exists for:', facultyName);
    } else {
      console.error('❌ Faculty data NOT found for:', facultyName);
    }
  }
  
  // 6. Test modal opening
  console.log('\n6️⃣ Testing modal functionality:');
  if (typeof openAchievementModal === 'function' && facultyCards.length > 0) {
    const testName = facultyCards[0].getAttribute('data-faculty');
    console.log(`   Attempting to open modal for: ${testName}`);
    
    try {
      // Don't actually open, just test the function
      console.log('   Modal function is callable');
      console.log('   ✅ You can manually test by clicking a faculty card');
    } catch (error) {
      console.error('❌ Error testing modal:', error);
    }
  }
  
  // 7. Check CSS
  console.log('\n7️⃣ Checking CSS:');
  if (modal) {
    const styles = window.getComputedStyle(modal);
    console.log('   Modal position:', styles.position);
    console.log('   Modal z-index:', styles.zIndex);
    console.log('   Modal display:', styles.display);
  }
  
  console.log('\n=== DEBUG COMPLETE ===\n');
  console.log('💡 Try clicking on a faculty card to test the modal!');
}

// Add a global test function
window.testAchievementModal = function(facultyName) {
  console.log(`\n🧪 Testing modal for: ${facultyName}`);
  if (typeof openAchievementModal === 'function') {
    openAchievementModal(facultyName);
    console.log('✅ Modal opened successfully');
  } else {
    console.error('❌ Cannot open modal - function not found');
  }
};

console.log('\n💡 You can test manually by running:');
console.log('   testAchievementModal("Dr. Praveen J")');
