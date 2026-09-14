let currentHunterId = 1;
let currentHunterName = "Sung Jin-Woo";
const BASE_URL = window.location.origin;

// 1. Array of your custom anime wallpapers (pic1 to pic12)
const backgroundImages = [
  "/static/images/pic1.jpeg",
  "/static/images/pic2.jpeg",
  "/static/images/pic3.jpeg",
  "/static/images/pic4.jpeg",
  "/static/images/pic5.jpeg",
  "/static/images/pic6.jpeg",
  "/static/images/pic7.jpeg",
  "/static/images/pic8.jpeg",
  "/static/images/pic9.jpeg",
  "/static/images/pic10.jpeg",
  "/static/images/pic12.jpeg"
];

let bgIndex = 0;
let isBufferActive = false;

// 2. Preload & smoothly crossfade wallpapers every 4.5 seconds
function initBackgroundSlideshow() {
  const bgMain = document.getElementById("bg-slideshow");
  const bgBuffer = document.getElementById("bg-slideshow-buffer");
  if (!bgMain || backgroundImages.length === 0) return;

  // Preload all 8 images
  backgroundImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // Set initial image
  bgMain.style.backgroundImage = `url('${backgroundImages[0]}')`;

  if (!bgBuffer) {
    // Single container fallback
    setInterval(() => {
      bgIndex = (bgIndex + 1) % backgroundImages.length;
      bgMain.style.backgroundImage = `url('${backgroundImages[bgIndex]}')`;
    }, 4000);
    return;
  }

  // Cross-fading between main and buffer containers
  setInterval(() => {
    bgIndex = (bgIndex + 1) % backgroundImages.length;
    const nextImgUrl = `url('${backgroundImages[bgIndex]}')`;

    if (!isBufferActive) {
      bgBuffer.style.backgroundImage = nextImgUrl;
      bgBuffer.style.opacity = "1";
      bgMain.style.opacity = "0";
    } else {
      bgMain.style.backgroundImage = nextImgUrl;
      bgMain.style.opacity = "1";
      bgBuffer.style.opacity = "0";
    }
    isBufferActive = !isBufferActive;
  }, 4500);
}

// Mobile Device Detection Utility
function isMobileDevice() {
  return (
    window.innerWidth <= 768 ||
    'ontouchstart' in window ||
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)
  );
}

// Global Shared AudioContext to prevent mobile audio pool exhaustion
let globalAudioCtx = null;
function getSharedAudioContext() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!globalAudioCtx) {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (err) {
    return null;
  }
}

// 3. Futuristic Web Audio Synthesizer (No external sound files required)
function playSystemSound(type = "login") {
  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    if (type === "login") {
      // Deep sub-bass resonance + high-tech ascending arpeggio
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(65, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.3);
      gain1.gain.setValueAtTime(0.35, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.9);

      // High cyber chime
      const notes = [440, 660, 880, 1320];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.08);
        osc.stop(ctx.currentTime + i * 0.08 + 0.5);
      });
    } else if (type === "quest") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "typing") {
      // Crisp mechanical cyber key click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 1200 + Math.random() * 450;
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.4, ctx.currentTime + 0.035);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } else if (type === "focus") {
      // Subtle pulse hum
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "hover") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === "menuOpen") {
      // Fast cyber slide whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.14);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } else if (type === "menuClose") {
      // Fast descending cyber dismiss
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } else if (type === "levelup") {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "creatorIntro") {
      // Ascending cosmic awakening whoosh + crystal harmonic chord
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(80, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.1);

      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const chordOsc = ctx.createOscillator();
        const chordGain = ctx.createGain();
        chordOsc.type = "sine";
        chordOsc.frequency.setValueAtTime(freq, ctx.currentTime + 0.2 + i * 0.06);
        chordGain.gain.setValueAtTime(0.12, ctx.currentTime + 0.2 + i * 0.06);
        chordGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
        chordOsc.connect(chordGain);
        chordGain.connect(ctx.destination);
        chordOsc.start(ctx.currentTime + 0.2 + i * 0.06);
        chordOsc.stop(ctx.currentTime + 1.4);
      });
    }
  } catch (e) {
    // Audio contexts may be blocked before interaction, handled gracefully
  }
}

// 4. Hunter Authentication Handler
async function handleHunterAuth(event) {
  event.preventDefault();
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const feedbackElem = document.getElementById("login-feedback");
  const submitBtn = document.getElementById("btn-login");

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username) return;

  submitBtn.disabled = true;
  submitBtn.querySelector(".btn-text").innerText = "SYNCHRONIZING...";

  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      if (feedbackElem) {
        feedbackElem.className = "login-feedback error";
        feedbackElem.innerText = `⚠ ${data.error || "Access Denied: Verification failed."}`;
        feedbackElem.classList.remove("hidden");
      }
      submitBtn.disabled = false;
      submitBtn.querySelector(".btn-text").innerText = "AUTHENTICATE & CONNECT";
      return;
    }

    // Success
    const character = data.character || {};
    currentHunterId = character.id || 1;
    currentHunterName = character.name || username;

    localStorage.setItem("hunter_profile", JSON.stringify({
      id: currentHunterId,
      name: currentHunterName,
      level: character.level || 1
    }));

    if (feedbackElem) {
      feedbackElem.className = "login-feedback success";
      feedbackElem.innerText = `✔ [SYSTEM CONFIRMED]: Welcome back, Hunter ${currentHunterName}.`;
      feedbackElem.classList.remove("hidden");
    }

    // Trigger the 3D text animation sequence
    setTimeout(() => {
      trigger3DWelcomeSequence(currentHunterName);
    }, 400);

  } catch (err) {
    console.error("Auth request error:", err);
    // Fallback in case server isn't reached
    currentHunterName = username;
    trigger3DWelcomeSequence(username);
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector(".btn-text").innerText = "AUTHENTICATE & CONNECT";
  }
}

// Quick Register helper for testing
function quickRegisterDemo() {
  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const newCodename = prompt("Enter new Hunter Codename:", "Sung Jin-Woo");
  if (newCodename) {
    usernameInput.value = newCodename;
    passwordInput.value = "hunter123";
    document.getElementById("login-form").requestSubmit();
  }
}

// 5. Interactive 3D Parallax Tilt & Specular Tracking for Login Card
function init3DCardTilt() {
  const card = document.getElementById("tilt-login-card");
  if (!card) return;

  // On mobile screens or touch devices, disable 3D tilt to preserve crisp aspect ratio
  if (isMobileDevice()) {
    card.style.transform = "none";
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
    return;
  }

  const handleMouseMove = (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Expand interactive perimeter by 70px around card
    const pad = 70;
    if (
      x >= -pad &&
      x <= rect.width + pad &&
      y >= -pad &&
      y <= rect.height + pad
    ) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Realistic 3D tilt angles based on cursor offset
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      // Specular sheen tracking
      const pctX = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const pctY = Math.max(0, Math.min(100, (y / rect.height) * 100));

      card.style.setProperty("--mouse-x", `${pctX.toFixed(1)}%`);
      card.style.setProperty("--mouse-y", `${pctY.toFixed(1)}%`);
      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
    } else {
      resetTilt();
    }
  };

  const resetTilt = () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.setProperty("--mouse-x", "50%");
    card.style.setProperty("--mouse-y", "50%");
  };

  window.addEventListener("mousemove", handleMouseMove);
  card.addEventListener("mouseleave", resetTilt);
}

// Interactive Audio Feedback (Key clicks, input focus, button hover)
function initInteractiveSounds() {
  // Mechanical typing sounds for inputs
  const inputs = document.querySelectorAll("input, textarea");
  inputs.forEach(input => {
    input.addEventListener("input", () => playSystemSound("typing"));
    input.addEventListener("focus", () => playSystemSound("focus"));
  });

  // Capacitive charge hum on button hover
  const buttons = document.querySelectorAll(
    ".system-btn, .system-btn-secondary, .switch-mode-btn, .system-logout-btn"
  );
  buttons.forEach(btn => {
    btn.addEventListener("mouseenter", () => playSystemSound("hover"));
  });
}

// 6. Cinematic Opening Gate Transition + 3D Text Animation: "WELCOME BACK, SIR"
function trigger3DWelcomeSequence(hunterName) {
  const loginGateway = document.getElementById("login-gateway");
  const gateOverlay = document.getElementById("opening-gate-overlay");
  const stage3D = document.getElementById("cinematic-3d-stage");
  const hudContainer = document.getElementById("hud-container");
  const saluteTag = document.getElementById("cinematic-hunter-name");
  const text3D = document.querySelector(".text-3d-massive");

  // Play synthetic system resonance audio
  playSystemSound("login");
  speakSystemDirective(`Welcome back, Hunter ${hunterName}. The System is online.`);
  setTimeout(() => {
    showSystemHologram("SYSTEM AWAKENED", `Welcome back, Sir. Hunter ${hunterName} authenticated.`);
  }, 1200);

  // Step 1: Hide login gateway
  if (loginGateway) {
    loginGateway.classList.add("hidden");
  }

  // Step 2: Trigger Aperture Shutter Gate Opening Transition
  if (gateOverlay) {
    gateOverlay.classList.remove("hidden", "gate-open");
    // Trigger CSS reflow then animate gate opening
    gateOverlay.offsetHeight;
    setTimeout(() => {
      gateOverlay.classList.add("gate-open");
    }, 50);
  }

  // Step 3: Update hunter name in 3D scene
  if (saluteTag) {
    saluteTag.innerText = `HUNTER // ${hunterName.toUpperCase()}`;
  }

  // Step 4: Re-trigger CSS animation on the 3D element
  if (text3D) {
    text3D.style.animation = "none";
    text3D.offsetHeight; // trigger reflow
    text3D.style.animation = "welcome3dCinema 2.4s cubic-bezier(0.16, 1, 0.3, 1) forwards";
  }

  // Step 5: Show 3D cinematic stage
  if (stage3D) {
    stage3D.classList.remove("hidden");
    stage3D.style.opacity = "1";
  }

  // Step 6: After 2.6s, dissolve 3D stage & gate, then slide-in Split HUD Wings
  setTimeout(() => {
    if (stage3D) {
      stage3D.style.transition = "opacity 0.7s ease-out";
      stage3D.style.opacity = "0";
      
      setTimeout(() => {
        stage3D.classList.add("hidden");
        if (gateOverlay) gateOverlay.classList.add("hidden");

        // Reveal Split Hanging Wings
        if (hudContainer) {
          hudContainer.classList.remove("hidden");
          applyProfile({ name: currentHunterName });
          loadCharacterData();
          loadTasks();
        }
      }, 700);
    }
  }, 2600);
}

// 7. Logout / Re-enter Gateway
function logoutHunter() {
  const loginGateway = document.getElementById("login-gateway");
  const hudContainer = document.getElementById("hud-container");
  const feedbackElem = document.getElementById("login-feedback");

  document.body.classList.remove("ui-hidden");
  if (hudContainer) hudContainer.classList.add("hidden");
  if (feedbackElem) feedbackElem.classList.add("hidden");
  if (loginGateway) {
    loginGateway.classList.remove("hidden");
    loginGateway.style.opacity = "1";
  }
}

// 7. Apply Profile info to HUD
function applyProfile(profile) {
  const greetingElem = document.getElementById("player-greeting");
  const nameElem = document.getElementById("player-name");
  const goalElem = document.getElementById("display-goal");

  const upperName = (profile.name || currentHunterName).toUpperCase();
  if (greetingElem) greetingElem.innerText = `WELCOME BACK, SIR`;
  if (nameElem) nameElem.innerText = upperName;
  if (goalElem) goalElem.innerText = "SHADOW MONARCH";
}

// 8. Load Character Stats from SQLite
async function loadCharacterData() {
  try {
    const res = await fetch(`${BASE_URL}/character/${currentHunterId}`);
    if (!res.ok) return;
    const data = await res.json();
    const char = data.character || data;

    const levelElem = document.getElementById("player-level");
    if (levelElem) {
      levelElem.innerText = char.level < 10 ? `0${char.level}` : char.level;
    }

    if (document.getElementById("stat-str")) document.getElementById("stat-str").innerText = char.strength || 10;
    if (document.getElementById("stat-vit")) document.getElementById("stat-vit").innerText = char.discipline || 10;
    if (document.getElementById("stat-agi")) document.getElementById("stat-agi").innerText = char.focus || 10;
    if (document.getElementById("stat-end")) document.getElementById("stat-end").innerText = char.endurance || 10;

    // Weight and Streak badges in Header
    const weightTag = document.getElementById("hud-weight-tag");
    if (weightTag) weightTag.innerText = `⚖ ${char.current_weight || 75.0} KG`;

    const streakTag = document.getElementById("hud-streak-tag");
    if (streakTag) streakTag.innerText = `🔥 ${char.daily_streak || 0} DAYS`;

    // Sync to mobile system drawer
    const drawerName = document.getElementById("drawer-hunter-name");
    if (drawerName) drawerName.innerText = (char.name || currentHunterName).toUpperCase();
    const drawerStreak = document.getElementById("drawer-streak-val");
    if (drawerStreak) drawerStreak.innerText = `🔥 ${char.daily_streak || 0} DAYS`;
    const drawerWeight = document.getElementById("drawer-weight-val");
    if (drawerWeight) drawerWeight.innerText = `⚖ ${char.current_weight || 75.0} KG`;
    const drawerLevel = document.getElementById("drawer-level-val");
    if (drawerLevel) drawerLevel.innerText = `LV. ${char.level < 10 ? '0' + char.level : char.level}`;

    updateXPBar(char.current_xp, char.xp_for_next_level);
    updateRank(char.level);

    // Check if penalty was applied
    if (char.penalty && char.penalty.penalty_applied) {
      showPenaltyZoneWarning(char.penalty);
    }

    // Check logbook status
    checkTodayLogBookStatus();

    // Check if onboarding is completed
    if (char.onboarding_completed === false) {
      setTimeout(() => {
        openOnboardingModal();
      }, 800);
    }
  } catch (err) {
    console.error("Error loading character data:", err);
  }
}

// 9. Load Active Daily Directives (Min 2 Gym, 2 Academics, 1 ECC)
async function loadTasks() {
  const taskList = document.getElementById("task-list");
  if (!taskList) return;

  try {
    let activeQuestsList = [];
    try {
      const qRes = await fetch(`${BASE_URL}/quests/${currentHunterId}`);
      if (qRes.ok) {
        const qData = await qRes.json();
        activeQuestsList = qData.quests || [];
      }
    } catch (e) {}

    if (!activeQuestsList || activeQuestsList.length === 0) {
      activeQuestsList = [
        { id: "gym-1", category: "gym", name: "[GYM] Today's Split Regimen Adherence", difficulty: "medium", xp_reward: 20 },
        { id: "gym-2", category: "gym", name: "[NUTRITION] Hit Daily Caloric Target & Protein Macro (1.6-2.2g/kg)", difficulty: "medium", xp_reward: 20 },
        { id: "gym-3", category: "gym", name: "[HYDRATION] 3.5L Water Hydration & 8h Recovery Sleep", difficulty: "medium", xp_reward: 20 },
        { id: "acad-1", category: "academics", name: "[ACADEMICS] 2-Hour Degree Focus Block", difficulty: "medium", xp_reward: 20 },
        { id: "acad-2", category: "academics", name: "[ACADEMICS] Coursework Problem Solving & Assignment Prep", difficulty: "medium", xp_reward: 20 },
        { id: "ecc-1", category: "ecc", name: "[ECC SKILL] 45 Min Deliberate Practice on Extra Skill", difficulty: "medium", xp_reward: 20 }
      ];
    }

    window.currentActiveQuests = activeQuestsList;
    taskList.innerHTML = "";

    activeQuestsList.forEach((task, idx) => {
      const isCompleted = task.completed || false;
      const cat = task.category || "gym";
      const badgeText = cat === 'gym' ? 'GYM' : (cat === 'academics' ? 'ACAD' : 'ECC');
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerHTML = `
        <label class="checkbox-container">
          <input 
            type="checkbox" 
            data-task-id="${task.id || idx}" 
            data-task-name="${task.name || 'Daily Quest'}"
            data-area="${cat}" 
            data-difficulty="${task.difficulty || 'medium'}"
            data-xp="${task.xp_reward || 20}"
            onchange="completeTask(this)" 
            ${isCompleted ? 'checked disabled' : ''} 
          />
          <span class="custom-check"></span>
          <span class="task-name" style="${isCompleted ? 'text-decoration: line-through; opacity: 0.5;' : ''}">
            <span class="quest-cat-badge ${cat}">[${badgeText}]</span>
            ${task.name || 'Daily Quest Objective'}
          </span>
        </label>
        <span class="task-reward">+${task.xp_reward || 20} XP</span>
      `;
      taskList.appendChild(li);
    });

  } catch (err) {
    console.error("Error loading tasks:", err);
  }
}

// 10. Complete Task Handler
async function completeTask(checkbox) {
  if (!checkbox.checked) return;

  const taskName = checkbox.dataset.taskName || checkbox.parentElement.querySelector(".task-name").innerText.trim();
  const area = checkbox.dataset.area || "fitness";
  const difficulty = checkbox.dataset.difficulty || "medium";

  // Play quest sound
  playSystemSound("quest");

  try {
    const res = await fetch(`${BASE_URL}/log-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        name: taskName,
        area: area,
        description: taskName,
        difficulty: difficulty
      })
    });

    const result = await res.json();
    checkbox.disabled = true;
    checkbox.parentElement.querySelector(".task-name").style.textDecoration = "line-through";
    checkbox.parentElement.querySelector(".task-name").style.opacity = "0.5";

    await loadCharacterData();

    // Voice and Holographic feedback
    speakSystemDirective("Quest objective confirmed. Experience allocated.");
    showSystemHologram("QUEST CLEARED ⚡", `${taskName} logged (+${checkbox.dataset.xp || 25} XP).`);

    // Check if all daily quests are checked off
    const allCheckboxes = document.querySelectorAll("#task-list input[type='checkbox']");
    const allDone = Array.from(allCheckboxes).every(cb => cb.checked);
    if (allDone && allCheckboxes.length > 0) {
      setTimeout(() => {
        speakSystemDirective("Daily quota complete. The Shadow Monarch's power awakens.");
        showSystemHologram("ARISE PROTOCOL UNLOCKED 🔥", "All daily quests cleared! Shadow extraction is now fully empowered!");
      }, 1500);
    }

    if (result.level_up) {
      setTimeout(() => {
        playSystemSound("levelup");
        speakSystemDirective(`Level up confirmed. You have attained Level ${result.new_level}.`);
        showSystemHologram("LEVEL UP! 👑", `Congratulations! You reached Level ${result.new_level}! All attributes boosted.`);
      }, 700);
    }
  } catch (err) {
    console.error("Failed to log task:", err);
  }
}

// 11. Custom Quest Form Handling
function openCustomQuestModal() {
  const modal = document.getElementById("add-quest-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeCustomQuestModal() {
  const modal = document.getElementById("add-quest-modal");
  if (modal) modal.classList.add("hidden");
}

async function submitCustomQuest(event) {
  event.preventDefault();
  const name = document.getElementById("custom-task-name").value.trim();
  const area = document.getElementById("custom-task-area").value;
  const difficulty = document.getElementById("custom-task-difficulty").value;

  if (!name) return;

  try {
    const res = await fetch(`${BASE_URL}/log-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        name: name,
        area: area,
        description: name,
        difficulty: difficulty
      })
    });

    const result = await res.json();
    closeCustomQuestModal();
    document.getElementById("custom-task-form").reset();
    playSystemSound("quest");

    await loadCharacterData();
    await loadTasks();

    speakSystemDirective("Custom objective registered and logged.");
    showSystemHologram("QUEST ACCEPTED 📜", `Objective: ${name} added to hunter ledger.`);

    if (result.level_up) {
      setTimeout(() => {
        playSystemSound("levelup");
        speakSystemDirective(`Level up confirmed. You have attained Level ${result.new_level}.`);
        showSystemHologram("LEVEL UP! 👑", `You have attained Level ${result.new_level}!`);
      }, 600);
    }
  } catch (err) {
    console.error("Error submitting custom task:", err);
  }
}

// 12. XP Bar & Rank Updates
function updateXPBar(current, needed) {
  const cur = current || 0;
  const req = needed || 100;
  const percentage = Math.min((cur / req) * 100, 100);
  const xpFill = document.getElementById("xp-fill");
  const xpText = document.getElementById("xp-text");
  
  if (xpFill) xpFill.style.width = `${percentage}%`;
  if (xpText) xpText.innerText = `${cur} / ${req} XP`;
}

function updateRank(level) {
  const rankElem = document.getElementById("player-rank");
  const drawerRank = document.getElementById("drawer-hunter-rank");
  if (!rankElem) return;
  let text = "E-RANK HUNTER";
  if (level >= 101) text = "S-RANK HUNTER (SHADOW MONARCH)";
  else if (level >= 91) text = "A-RANK HUNTER";
  else if (level >= 76) text = "B-RANK HUNTER";
  else if (level >= 51) text = "C-RANK HUNTER";
  else if (level >= 26) text = "D-RANK HUNTER";
  else text = "E-RANK HUNTER";

  rankElem.innerText = text;
  if (drawerRank) drawerRank.innerText = text;
}

// =========================================
// 14. MANA FLAME PARTICLE CANVAS ENGINE
// =========================================
let manaCanvas, manaCtx;
let manaParticles = [];

function initManaParticleCanvas() {
  manaCanvas = document.getElementById("mana-particle-canvas");
  if (!manaCanvas) return;
  manaCtx = manaCanvas.getContext("2d");

  function resize() {
    manaCanvas.width = window.innerWidth;
    manaCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // Mouse move subtle mana flame trail
  let lastMove = 0;
  window.addEventListener("mousemove", (e) => {
    const now = performance.now();
    if (now - lastMove < 18) return;
    lastMove = now;

    for (let i = 0; i < 2; i++) {
      manaParticles.push({
        x: e.clientX + (Math.random() - 0.5) * 6,
        y: e.clientY + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.6 - 0.4,
        radius: Math.random() * 2.5 + 1.2,
        alpha: 0.75,
        decay: Math.random() * 0.025 + 0.02,
        color: Math.random() > 0.4 ? "#a855f7" : "#38bdf8"
      });
    }
  });

  // Click spark burst
  window.addEventListener("click", (e) => {
    createManaBurst(e.clientX, e.clientY);
  });

  function renderLoop() {
    if (!manaCtx) return;
    manaCtx.clearRect(0, 0, manaCanvas.width, manaCanvas.height);

    for (let i = manaParticles.length - 1; i >= 0; i--) {
      const p = manaParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        manaParticles.splice(i, 1);
        continue;
      }

      manaCtx.save();
      manaCtx.globalAlpha = p.alpha;
      if (!isMobileDevice()) {
        manaCtx.shadowBlur = 8;
        manaCtx.shadowColor = p.color;
      }
      manaCtx.fillStyle = p.color;
      manaCtx.beginPath();
      manaCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      manaCtx.fill();
      manaCtx.restore();
    }

    requestAnimationFrame(renderLoop);
  }
  requestAnimationFrame(renderLoop);
}

function createManaBurst(x, y) {
  if (!manaCanvas) return;
  const count = isMobileDevice() ? 8 : 16;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = Math.random() * 3.5 + 2;
    manaParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: Math.random() * 3 + 1.5,
      alpha: 1.0,
      decay: Math.random() * 0.035 + 0.025,
      color: Math.random() > 0.5 ? "#d946ef" : "#c084fc"
    });
  }
}

// =========================================
// 15. SYSTEM VOICE SYNTHESIZER (Web Speech API)
// =========================================
let isVoiceEnabled = localStorage.getItem("system_voice_enabled") !== "false";

function speakSystemDirective(text) {
  if (!isVoiceEnabled || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.04;
    utterance.pitch = 0.86;
    utterance.volume = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const roboticVoice = voices.find(v => 
      v.lang.startsWith("en") && (v.name.includes("David") || v.name.includes("Google") || v.name.includes("Natural"))
    ) || voices.find(v => v.lang.startsWith("en"));

    if (roboticVoice) utterance.voice = roboticVoice;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}

function toggleSystemVoice() {
  isVoiceEnabled = !isVoiceEnabled;
  localStorage.setItem("system_voice_enabled", isVoiceEnabled);
  updateVoiceToggleButton();

  if (isVoiceEnabled) {
    speakSystemDirective("System voice communication online.");
    showSystemHologram("SYSTEM AUDIO", "Voice directive synthesis activated.");
  } else {
    showSystemHologram("SYSTEM AUDIO", "Voice directives muted.");
  }
}

function updateVoiceToggleButton() {
  const btn = document.getElementById("voice-toggle-btn");
  if (!btn) return;
  if (isVoiceEnabled) {
    btn.innerHTML = `<span id="voice-icon">🔊</span> VOICE: ON`;
    btn.style.borderColor = "rgba(192, 132, 252, 0.5)";
    btn.style.color = "#f3e8ff";
  } else {
    btn.innerHTML = `<span id="voice-icon">🔇</span> VOICE: OFF`;
    btn.style.borderColor = "rgba(255, 255, 255, 0.2)";
    btn.style.color = "#a78bfa";
  }
}

// =========================================
// 16. HOLOGRAPHIC SYSTEM NOTIFICATION TOASTS
// =========================================
function showSystemHologram(title, message, isRedAlert = false) {
  const container = document.getElementById("system-hologram-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `system-hologram-toast ${isRedAlert ? 'red-toast' : ''}`;
  toast.innerHTML = `
    <div class="toast-header-row">
      <span class="toast-badge">[ SYSTEM NOTIFICATION ]</span>
      <button type="button" class="toast-close-btn" onclick="this.parentElement.parentElement.remove()">✕</button>
    </div>
    <div class="toast-title">${title}</div>
    <div class="toast-body">${message}</div>
  `;

  container.appendChild(toast);
  playSystemSound(isRedAlert ? "levelup" : "quest");

  setTimeout(() => {
    toast.style.transition = "opacity 0.4s ease, transform 0.4s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateX(40px)";
    setTimeout(() => toast.remove(), 400);
  }, 4600);
}

// =========================================
// 17. RED GATE FOCUS DUNGEON ENGINE
// =========================================
let gateTotalSeconds = 25 * 60;
let gateRemainingSeconds = 25 * 60;
let gateTimerInterval = null;
let isGateRunning = false;

function openRedGateModal() {
  const modal = document.getElementById("red-gate-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeRedGateModal() {
  const modal = document.getElementById("red-gate-modal");
  if (modal) modal.classList.add("hidden");
}

function setGateDuration(mins, btnElem) {
  if (isGateRunning) return;
  gateTotalSeconds = mins * 60;
  gateRemainingSeconds = mins * 60;
  updateGateTimerDisplay();

  const presets = document.querySelectorAll(".gate-preset-btn");
  presets.forEach(b => b.classList.remove("active"));
  if (btnElem) btnElem.classList.add("active");
}

function updateGateTimerDisplay() {
  const display = document.getElementById("red-gate-timer-display");
  const hpFill = document.getElementById("boss-hp-fill");
  if (!display) return;

  const minutes = Math.floor(gateRemainingSeconds / 60);
  const seconds = gateRemainingSeconds % 60;
  display.innerText = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  if (hpFill) {
    const hpPct = Math.max(0, (gateRemainingSeconds / gateTotalSeconds) * 100);
    hpFill.style.width = `${hpPct}%`;
  }
}

function startRedGateRaid() {
  if (isGateRunning) return;
  isGateRunning = true;

  document.body.classList.add("in-red-gate");
  document.getElementById("btn-gate-start").classList.add("hidden");
  document.getElementById("btn-gate-pause").classList.remove("hidden");
  document.getElementById("btn-gate-forfeit").classList.remove("hidden");

  speakSystemDirective("Entering Rank-A Red Gate. Survive and conquer.");
  showSystemHologram("RED GATE INITIATED ⛩", "Deep work zone active. The dungeon barrier is locked.", true);

  gateTimerInterval = setInterval(() => {
    gateRemainingSeconds--;
    updateGateTimerDisplay();

    if (gateRemainingSeconds <= 0) {
      completeRedGateRaid();
    }
  }, 1000);
}

function pauseRedGateRaid() {
  if (!isGateRunning) return;
  isGateRunning = false;
  clearInterval(gateTimerInterval);

  const pauseBtn = document.getElementById("btn-gate-pause");
  pauseBtn.innerText = "▶ RESUME";
  pauseBtn.onclick = () => resumeRedGateRaid();
}

function resumeRedGateRaid() {
  if (isGateRunning) return;
  isGateRunning = true;

  const pauseBtn = document.getElementById("btn-gate-pause");
  pauseBtn.innerText = "⏸ PAUSE";
  pauseBtn.onclick = () => pauseRedGateRaid();

  gateTimerInterval = setInterval(() => {
    gateRemainingSeconds--;
    updateGateTimerDisplay();
    if (gateRemainingSeconds <= 0) {
      completeRedGateRaid();
    }
  }, 1000);
}

function forfeitRedGateRaid() {
  isGateRunning = false;
  clearInterval(gateTimerInterval);
  document.body.classList.remove("in-red-gate");

  document.getElementById("btn-gate-start").classList.remove("hidden");
  document.getElementById("btn-gate-pause").classList.add("hidden");
  document.getElementById("btn-gate-forfeit").classList.add("hidden");

  gateRemainingSeconds = gateTotalSeconds;
  updateGateTimerDisplay();
  closeRedGateModal();

  speakSystemDirective("Warning: Red Gate abandoned. Penalty protocol recorded.");
  showSystemHologram("PENALTY ADVISORY 🩸", "Focus dungeon forfeited early. Regain your discipline, Hunter.", true);
}

function completeRedGateRaid() {
  isGateRunning = false;
  clearInterval(gateTimerInterval);
  document.body.classList.remove("in-red-gate");

  document.getElementById("btn-gate-start").classList.remove("hidden");
  document.getElementById("btn-gate-pause").classList.add("hidden");
  document.getElementById("btn-gate-forfeit").classList.add("hidden");

  gateRemainingSeconds = gateTotalSeconds;
  updateGateTimerDisplay();
  closeRedGateModal();

  playSystemSound("levelup");
  speakSystemDirective("Red Gate cleared. Exceptional discipline confirmed.");
  showSystemHologram("GATE CLEARED! 🏆", "You defeated the Deep Work Boss! +50 XP and rare loot awarded!", true);

  // Award XP via API
  fetch(`${BASE_URL}/log-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      character_id: currentHunterId,
      name: "[RED GATE] Focus Sanctuary Cleared",
      area: "discipline",
      description: "25+ minutes of deep work focus",
      difficulty: "hard"
    })
  }).then(() => loadCharacterData());
}

// =========================================
// 18. "ARISE" SHADOW ARMY SYSTEM
// =========================================
const defaultShadowSoldiers = [
  { id: "igris", name: "Igris the Hypertrophy Vanguard", rank: "ELITE KNIGHT", perk: "+15% Gym Quest XP & PR Protection", unlocked: true, icon: "⚔️" },
  { id: "iron", name: "Iron the Discipline Sentinel", rank: "KNIGHT", perk: "Shields habit streaks from breaking on busy days", unlocked: false, icon: "🛡️" },
  { id: "mage", name: "Tusk the Academic Archmage", rank: "ELITE", perk: "+15% Study, Coding & Exam Prep XP", unlocked: false, icon: "📚" },
  { id: "beru", name: "Beru the Monarch of Mastery", rank: "GENERAL", perk: "+25% All Quest XP & GPA/Skill Multiplier", unlocked: false, icon: "👑" }
];

let shadowArmy = defaultShadowSoldiers;

function loadShadowArmy() {
  renderShadowArmy();
  updateShadowCountBadge();
}

function updateShadowCountBadge() {
  const badge = document.getElementById("shadow-count-badge");
  if (!badge) return;
  const count = shadowArmy.filter(s => s.unlocked).length;
  badge.innerText = count;
}

function renderShadowArmy() {
  const grid = document.getElementById("shadow-soldiers-grid");
  if (!grid) return;
  grid.innerHTML = "";

  shadowArmy.forEach(soldier => {
    const card = document.createElement("div");
    card.className = `shadow-card ${soldier.unlocked ? 'unlocked' : 'locked'}`;
    card.innerHTML = `
      <div class="shadow-card-header">
        <span class="shadow-rank">${soldier.rank}</span>
        <span class="shadow-status-dot">${soldier.unlocked ? '● ACTIVE' : '○ LOCKED'}</span>
      </div>
      <div class="shadow-name">${soldier.icon} ${soldier.name}</div>
      <div class="shadow-perk">${soldier.perk}</div>
    `;
    grid.appendChild(card);
  });
}

function openShadowArmyModal() {
  const modal = document.getElementById("shadow-army-modal");
  if (modal) modal.classList.remove("hidden");
  renderShadowArmy();
}

function closeShadowArmyModal() {
  const modal = document.getElementById("shadow-army-modal");
  if (modal) modal.classList.add("hidden");
}

function triggerAriseCinematic() {
  const nextSoldier = shadowArmy.find(s => !s.unlocked);
  const targetSoldier = nextSoldier || shadowArmy[0];

  if (nextSoldier) {
    nextSoldier.unlocked = true;
    localStorage.setItem("shadow_army_soldiers_v2", JSON.stringify(shadowArmy));
  }

  document.getElementById("arise-soldier-rank").innerText = targetSoldier.rank;
  document.getElementById("arise-soldier-name").innerText = targetSoldier.name.toUpperCase();
  document.getElementById("arise-soldier-perk").innerText = `Passive Buff: ${targetSoldier.perk}`;

  closeShadowArmyModal();

  const stage = document.getElementById("arise-cinematic-stage");
  if (stage) stage.classList.remove("hidden");

  playSystemSound("login");
  speakSystemDirective("Arise.");
}

function closeAriseCinematic() {
  const stage = document.getElementById("arise-cinematic-stage");
  if (stage) stage.classList.add("hidden");

  loadShadowArmy();
  showSystemHologram("SHADOW EXTRACTED 👥", "New shadow soldier has joined your cavalry.");
  speakSystemDirective("Shadow soldier registered into your command.");
}

// =========================================
// 19. HOLOGRAPHIC RPG INVENTORY ENGINE
// =========================================
const defaultInventoryItems = [
  { id: "lifting_belt", name: "Shadow Monarch Lever Lifting Belt", icon: "🥋", rarity: "S-RANK", desc: "13mm reinforced leather lever belt forged for monstrous squat and deadlift PRs.", stats: "+10 STR, +5 DIS", equipped: true },
  { id: "anc_headphones", name: "Bose QuietComfort ANC Headphones", icon: "🎧", rarity: "S-RANK", desc: "Active noise cancellation creates a soundproof barrier for uninterrupted 3-hour study blocks.", stats: "+10 INT, Deep Work", equipped: false },
  { id: "creatine", name: "Creapure Creatine Monohydrate", icon: "🧪", rarity: "A-RANK", desc: "Replenishes muscle ATP stores, boosts power output, and enhances cognitive clarity.", stats: "+5 STR, +5 REC", equipped: true },
  { id: "whey_isolate", name: "Gold Standard Whey Isolate", icon: "🥤", rarity: "A-RANK", desc: "Ultra-filtered 24g pure whey protein. Guarantees daily anabolic macro target hit.", stats: "+8 STR, Macro Target", equipped: false },
  { id: "pomodoro_timer", name: "Pomodoro Obsidian Hourglass", icon: "⏳", rarity: "B-RANK", desc: "Ancient focus relic enforcing strict 50/10 unbroken study intervals.", stats: "+8 DIS, +15% Focus", equipped: false },
  { id: "lifting_straps", name: "Titan Figure-8 Lifting Straps", icon: "🎗️", rarity: "B-RANK", desc: "Eliminates grip fatigue during heavy barbell rows and romanian deadlifts.", stats: "+6 STR, Grip Shield", equipped: false },
  { id: "preworkout", name: "Caffeine Anhydrous Pre-Workout Elixir", icon: "⚡", rarity: "B-RANK", desc: "Consumable: Ignites central nervous system drive and explosive workout power.", stats: "Instant Stamina", equipped: false },
  { id: "sleep_ring", name: "Oura Stealth Sleep Ring", icon: "💍", rarity: "SS-RANK", desc: "Biometric ring tracking HRV, sleep stages, and recovery readiness score.", stats: "+10 REC, +5 DIS", equipped: false }
];

let hunterInventory = defaultInventoryItems;
let selectedItemIndex = 0;

function loadInventory() {
  renderInventory();
  selectInventoryItem(0);
}

function renderInventory() {
  const grid = document.getElementById("inventory-grid");
  if (!grid) return;
  grid.innerHTML = "";

  hunterInventory.forEach((item, idx) => {
    const slot = document.createElement("div");
    slot.className = `inv-slot ${idx === selectedItemIndex ? 'selected' : ''} ${item.equipped ? 'equipped' : ''}`;
    slot.onclick = () => selectInventoryItem(idx);
    slot.innerHTML = `
      <span class="inv-slot-icon">${item.icon}</span>
      <span class="inv-slot-name">${item.name}</span>
    `;
    grid.appendChild(slot);
  });
}

function selectInventoryItem(index) {
  selectedItemIndex = index;
  const item = hunterInventory[index];
  if (!item) return;

  const rarityBadge = document.getElementById("inspect-rarity");
  const nameElem = document.getElementById("inspect-name");
  const descElem = document.getElementById("inspect-desc");
  const statsElem = document.getElementById("inspect-stats");
  const actionBtn = document.getElementById("btn-equip-item");

  if (rarityBadge) rarityBadge.innerText = item.rarity;
  if (nameElem) nameElem.innerText = item.name.toUpperCase();
  if (descElem) descElem.innerText = item.desc;
  if (statsElem) {
    statsElem.innerHTML = `<span class="stat-pill">${item.stats}</span>`;
  }

  if (actionBtn) {
    actionBtn.innerText = item.equipped ? "UNEQUIP ARTIFACT" : "EQUIP ARTIFACT ⚡";
    actionBtn.style.background = item.equipped ? "rgba(239, 68, 68, 0.25)" : "";
    actionBtn.style.borderColor = item.equipped ? "#ef4444" : "";
  }

  const slots = document.querySelectorAll(".inv-slot");
  slots.forEach((s, i) => {
    s.classList.toggle("selected", i === index);
  });
}

function openInventoryModal() {
  const modal = document.getElementById("inventory-modal");
  if (modal) modal.classList.remove("hidden");
  loadInventory();
}

function closeInventoryModal() {
  const modal = document.getElementById("inventory-modal");
  if (modal) modal.classList.add("hidden");
}

function useOrEquipSelectedItem() {
  const item = hunterInventory[selectedItemIndex];
  if (!item) return;

  if (item.id === "recovery_elixir" || item.id === "mana_crystal") {
    playSystemSound("levelup");
    speakSystemDirective(`${item.name} consumed. Attributes surged.`);
    showSystemHologram("ITEM CONSUMED ✨", `${item.name} granted energy and bonus XP!`);
    item.equipped = false;
    localStorage.setItem("hunter_inventory_items", JSON.stringify(hunterInventory));
    renderInventory();
    selectInventoryItem(selectedItemIndex);
    loadCharacterData();
    return;
  }

  item.equipped = !item.equipped;
  localStorage.setItem("hunter_inventory_items", JSON.stringify(hunterInventory));
  playSystemSound("quest");

  const statusText = item.equipped ? "equipped" : "unequipped";
  speakSystemDirective(`${item.name} ${statusText}.`);
  showSystemHologram("EQUIPMENT SYNC ⚔️", `${item.name} is now ${statusText}.`);

  renderInventory();
  selectInventoryItem(selectedItemIndex);
}

// =========================================
// 20. FIRST-TIME ONBOARDING WIZARD SYSTEM
// =========================================
const defaultSplitDays = [
  { day: 1, label: "DAY 1 // MON", name: "Push (Chest, Shoulders, Triceps)", is_rest: false, exercises: "Barbell Bench Press, Incline Dumbbell Press, Overhead Press, Tricep Pushdowns" },
  { day: 2, label: "DAY 2 // TUE", name: "Pull (Back, Biceps)", is_rest: false, exercises: "Deadlift, Lat Pulldowns, Barbell Rows, Bicep Curls, Face Pulls" },
  { day: 3, label: "DAY 3 // WED", name: "Legs & Core", is_rest: false, exercises: "Barbell Squats, Romanian Deadlifts, Leg Press, Hanging Leg Raises" },
  { day: 4, label: "DAY 4 // THU", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Hydration Check, 10,000 Steps, Foam Rolling & Mobility" },
  { day: 5, label: "DAY 5 // FRI", name: "Push Hypertrophy", is_rest: false, exercises: "Incline DB Press, Cable Lateral Raises, Dips, Skull Crushers" },
  { day: 6, label: "DAY 6 // SAT", name: "Pull Hypertrophy & Arms", is_rest: false, exercises: "Pull-ups, Seated Cable Rows, Hammer Curls, Rear Delt Flyes" },
  { day: 7, label: "DAY 7 // SUN", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Active Recovery, Sauna / Warm Bath, Macro Meal Prep" }
];

function openOnboardingModal() {
  const modal = document.getElementById("onboarding-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  renderSplitDaysEditor();
  goToOnboardStep(1);
  playSystemSound("quest");
  speakSystemDirective("System Awakening Protocol initialized. Configure your life directives, Hunter.");
}

function closeOnboardingModal() {
  const modal = document.getElementById("onboarding-modal");
  if (modal) modal.classList.add("hidden");
}

function toggleGoalCard(checkbox) {
  const parent = checkbox.closest(".goal-check-card");
  if (parent) {
    parent.classList.toggle("selected", checkbox.checked);
  }
}

function goToOnboardStep(stepNum) {
  for (let i = 1; i <= 3; i++) {
    const tab = document.getElementById(`step-tab-${i}`);
    const step = document.getElementById(`onboard-step-${i}`);
    if (tab) tab.classList.toggle("active", i === stepNum);
    if (step) {
      step.classList.toggle("hidden", i !== stepNum);
      if (i === stepNum) {
        step.scrollTop = 0;
      }
    }
  }
  if (stepNum === 2) {
    const container = document.getElementById("split-days-editor");
    if (container && container.children.length === 0) {
      renderSplitDaysEditor();
    }
  }
  playSystemSound("quest");
}

function renderSplitDaysEditor(customDays) {
  const container = document.getElementById("split-days-editor");
  if (!container) return;
  const daysToRender = customDays || defaultSplitDays;
  container.innerHTML = "";

  daysToRender.forEach(d => {
    const row = document.createElement("div");
    row.className = "split-day-row";
    row.innerHTML = `
      <div class="split-day-top">
        <span class="split-day-title">${d.label || `DAY ${d.day}`}</span>
        <label class="rest-check-label">
          <input type="checkbox" id="split-rest-day-${d.day}" ${d.is_rest ? 'checked' : ''} onchange="toggleRestDayRow(${d.day})" />
          <span>REST RECOVERY DAY</span>
        </label>
      </div>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <input 
          type="text" 
          id="split-name-day-${d.day}" 
          class="split-input-field" 
          value="${d.name || ''}" 
          placeholder="Split Name (e.g. Push, Pull, Legs, Rest)"
        />
        <input 
          type="text" 
          id="split-exercises-day-${d.day}" 
          class="split-input-field" 
          value="${d.exercises || ''}" 
          placeholder="Key Exercises / Recovery tasks (comma separated)"
        />
      </div>
    `;
    container.appendChild(row);
  });
}

function toggleRestDayRow(dayNum) {
  const checkbox = document.getElementById(`split-rest-day-${dayNum}`);
  const nameInput = document.getElementById(`split-name-day-${dayNum}`);
  const exInput = document.getElementById(`split-exercises-day-${dayNum}`);
  if (!checkbox || !nameInput) return;

  if (checkbox.checked) {
    if (!nameInput.value.toLowerCase().includes("rest")) {
      nameInput.dataset.prevName = nameInput.value;
      nameInput.value = "Scheduled Rest Day (Recovery Protocol)";
    }
    if (exInput && (!exInput.value || exInput.value.length < 5)) {
      exInput.value = "Hydration Check, Stretching & Mobility, 8h Sleep";
    }
  } else {
    if (nameInput.dataset.prevName) {
      nameInput.value = nameInput.dataset.prevName;
    } else {
      nameInput.value = `Workout Day ${dayNum}`;
    }
  }
}

function applySplitPreset(type) {
  let preset = [];
  if (type === 'ppl') {
    preset = [
      { day: 1, label: "DAY 1 // MON", name: "Push (Chest, Shoulders, Triceps)", is_rest: false, exercises: "Bench Press, Incline DB Press, Lateral Raises, Tricep Pushdowns" },
      { day: 2, label: "DAY 2 // TUE", name: "Pull (Back, Biceps)", is_rest: false, exercises: "Deadlift, Lat Pulldowns, Barbell Rows, Bicep Curls, Face Pulls" },
      { day: 3, label: "DAY 3 // WED", name: "Legs & Core", is_rest: false, exercises: "Barbell Squats, Romanian Deadlifts, Leg Press, Hanging Leg Raises" },
      { day: 4, label: "DAY 4 // THU", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "10,000 Steps, Foam Rolling & Mobility, Hydration Check" },
      { day: 5, label: "DAY 5 // FRI", name: "Push (Upper Focus)", is_rest: false, exercises: "Incline Bench, DB Shoulder Press, Cable Flyes, Tricep Dips" },
      { day: 6, label: "DAY 6 // SAT", name: "Pull (Back Focus) & Arms", is_rest: false, exercises: "Pull-ups, Seated Cable Rows, Hammer Curls, Rear Delt Flyes" },
      { day: 7, label: "DAY 7 // SUN", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Full Recovery, Sleep Optimization, Meal Prep" }
    ];
  } else if (type === 'upper_lower') {
    preset = [
      { day: 1, label: "DAY 1 // MON", name: "Upper Body Power", is_rest: false, exercises: "Bench Press, Barbell Rows, Overhead Press, Chin-ups" },
      { day: 2, label: "DAY 2 // TUE", name: "Lower Body Power", is_rest: false, exercises: "Squats, Romanian Deadlifts, Leg Press, Standing Calf Raises" },
      { day: 3, label: "DAY 3 // WED", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Light Walking, Static Stretching, Water Intake" },
      { day: 4, label: "DAY 4 // THU", name: "Upper Body Hypertrophy", is_rest: false, exercises: "Incline DB Press, Lat Pulldowns, Cable Lateral Raises, Arm Superset" },
      { day: 5, label: "DAY 5 // FRI", name: "Lower Body Hypertrophy", is_rest: false, exercises: "Front Squats, Walking Lunges, Leg Curls, Core Planks" },
      { day: 6, label: "DAY 6 // SAT", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Cardio Walk, Mobility Flow, Hydration" },
      { day: 7, label: "DAY 7 // SUN", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Deep Sleep, Nutrition Review, System Reset" }
    ];
  } else if (type === 'bro_split') {
    preset = [
      { day: 1, label: "DAY 1 // MON", name: "Chest Destruction", is_rest: false, exercises: "Barbell Bench Press, Incline DB Press, Chest Flyes, Push-ups" },
      { day: 2, label: "DAY 2 // TUE", name: "Back Dominance", is_rest: false, exercises: "Deadlift, Lat Pulldowns, Bent-Over Rows, Seated Cable Rows" },
      { day: 3, label: "DAY 3 // WED", name: "Shoulders Artillery", is_rest: false, exercises: "Overhead Military Press, Lateral Raises, Front Raises, Face Pulls" },
      { day: 4, label: "DAY 4 // THU", name: "Legs Titan Day", is_rest: false, exercises: "Barbell Squats, Leg Press, Hamstring Curls, Calf Raises" },
      { day: 5, label: "DAY 5 // FRI", name: "Arms & Abdominals", is_rest: false, exercises: "Barbell Curls, Tricep Skull Crushers, Hammer Curls, Hanging Leg Raises" },
      { day: 6, label: "DAY 6 // SAT", name: "Active Recovery Day", is_rest: true, exercises: "Light Cardio, Mobility Drills, Hydration Check" },
      { day: 7, label: "DAY 7 // SUN", name: "Scheduled Rest Day (Recovery Protocol)", is_rest: true, exercises: "Complete Rest, Nutrition Meal Prep, 8h+ Sleep" }
    ];
  }

  renderSplitDaysEditor(preset);
  playSystemSound("quest");
  showSystemHologram("SPLIT PRESET LOADED", `Applied ${type.toUpperCase()} split schedule.`);
}

function selectEduType(type) {
  const cardCol = document.getElementById("card-edu-college");
  const cardSch = document.getElementById("card-edu-school");
  const colDetails = document.getElementById("college-details-wrap");
  const schDetails = document.getElementById("school-details-wrap");

  if (type === 'college') {
    cardCol?.classList.add("selected");
    cardSch?.classList.remove("selected");
    colDetails?.classList.remove("hidden");
    schDetails?.classList.add("hidden");
  } else {
    cardSch?.classList.add("selected");
    cardCol?.classList.remove("selected");
    schDetails?.classList.remove("hidden");
    colDetails?.classList.add("hidden");
  }

  updateDirectivesPreview();
}

function updateDirectivesPreview() {
  const isCollege = document.getElementById("card-edu-college")?.classList.contains("selected");
  const degree = document.getElementById("onboard-college-degree")?.value || "Engineering / Degree Core";
  const grade = document.getElementById("onboard-school-grade")?.value || "12th Standard";
  const board = document.getElementById("onboard-school-board")?.value || "CBSE";
  const skill = document.getElementById("onboard-ecc-skill")?.value.trim() || "Web Development & Coding";

  const p1 = document.getElementById("preview-acad-1");
  const p2 = document.getElementById("preview-acad-2");
  const pe = document.getElementById("preview-ecc");

  if (p1) p1.innerText = isCollege ? `2-Hour Degree Focus Block (${degree})` : `Complete Daily School Homework & Board Prep (${grade} - ${board})`;
  if (p2) p2.innerText = isCollege ? `Coursework Problem Solving & Lab Prep` : `2-Hour Core Subject Syllabus Deep Study Block`;
  if (pe) pe.innerText = `45 Min Deliberate Practice on ${skill}`;
}

async function submitOnboardingDirectives() {
  const isCollege = document.getElementById("card-edu-college")?.classList.contains("selected");
  const eduLevel = isCollege ? 'college' : 'school';
  const eduDetail = isCollege 
    ? `${document.getElementById("onboard-college-degree")?.value || 'B.Tech CS'} (${document.getElementById("onboard-college-year")?.value || '2nd Year'})`
    : `${document.getElementById("onboard-school-grade")?.value || '12th Grade'} (${document.getElementById("onboard-school-board")?.value || 'CBSE'})`;
  const eccSkill = document.getElementById("onboard-ecc-skill")?.value.trim() || "Web Development & Coding";

  const workoutSplit = {};
  for (let d = 1; d <= 7; d++) {
    const isRest = document.getElementById(`split-rest-day-${d}`)?.checked || false;
    const name = document.getElementById(`split-name-day-${d}`)?.value.trim() || (isRest ? "Rest Day" : `Workout Day ${d}`);
    const exStr = document.getElementById(`split-exercises-day-${d}`)?.value.trim() || "";
    const exercises = exStr.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    workoutSplit[`day_${d}`] = {
      name: name,
      is_rest: isRest,
      exercises: exercises
    };
  }

  const weightGoalType = document.getElementById("onboard-weight-goal")?.value || "gain";
  const currentWeight = parseFloat(document.getElementById("onboard-current-weight")?.value) || 75.0;
  const targetWeight = parseFloat(document.getElementById("onboard-target-weight")?.value) || 80.0;

  try {
    const res = await fetch(`${BASE_URL}/onboarding/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        education_level: eduLevel,
        education_detail: eduDetail,
        ecc_skill: eccSkill,
        workout_split: workoutSplit,
        weight_goal_type: weightGoalType,
        current_weight: currentWeight,
        target_weight: targetWeight
      })
    });

    if (!res.ok) {
      showSystemHologram("ERROR ⚠", "Failed to save directives. Try again.");
      return;
    }

    closeOnboardingModal();
    playSystemSound("levelup");
    speakSystemDirective("System Awakening Protocol completed. Life directives, workout split, and academic goals registered.");
    showSystemHologram("AWAKENING COMPLETE ⚡", "Discipline Protocol registered. 5+ Daily Objectives active.");

    await loadCharacterData();
    await loadTasks();
  } catch (err) {
    console.error("Failed to save onboarding directives:", err);
  }
}

// =========================================
// 21. SPLIT & ATTENDANCE CALENDAR ENGINE
// =========================================
let currentTodaySplit = null;

function openSplitCalendarModal() {
  const modal = document.getElementById("split-calendar-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  loadTodaySplitAndCalendar();
  playSystemSound("quest");
}

function closeSplitCalendarModal() {
  const modal = document.getElementById("split-calendar-modal");
  if (modal) modal.classList.add("hidden");
}

async function loadTodaySplitAndCalendar() {
  try {
    // 1. Fetch Today's Split
    const splitRes = await fetch(`${BASE_URL}/split/today/${currentHunterId}`);
    if (splitRes.ok) {
      currentTodaySplit = await splitRes.json();
      const s = currentTodaySplit.split || {};
      const isRest = currentTodaySplit.is_rest_day;

      const titleElem = document.getElementById("today-split-title");
      const badgeElem = document.getElementById("today-split-badge");
      const exercisesList = document.getElementById("today-exercises-list");
      const confirmBtn = document.getElementById("btn-confirm-split");

      if (titleElem) titleElem.innerText = s.name || (isRest ? "REST & RECOVERY PROTOCOL" : "ASSIGNED SPLIT WORKOUT");
      if (badgeElem) {
        if (isRest) {
          badgeElem.innerText = "🧘 REST DAY ADHERENCE";
          badgeElem.style.borderColor = "#38bdf8";
          badgeElem.style.color = "#38bdf8";
          badgeElem.style.background = "rgba(56, 189, 248, 0.15)";
        } else {
          badgeElem.innerText = "⚡ WORKOUT ACTIVE";
          badgeElem.style.borderColor = "#22c55e";
          badgeElem.style.color = "#86efac";
          badgeElem.style.background = "rgba(34, 197, 94, 0.15)";
        }
      }

      if (exercisesList) {
        exercisesList.innerHTML = "";
        const exArray = s.exercises || [];
        exArray.forEach(ex => {
          const pill = document.createElement("span");
          pill.className = "exercise-pill";
          pill.innerText = ex;
          exercisesList.appendChild(pill);
        });
      }

      if (confirmBtn) {
        if (currentTodaySplit.already_logged) {
          confirmBtn.disabled = true;
          confirmBtn.style.opacity = "0.6";
          confirmBtn.innerText = isRest ? "✓ REST ADHERENCE CONFIRMED TODAY" : "✓ WORKOUT COMPLETED TODAY";
        } else {
          confirmBtn.disabled = false;
          confirmBtn.style.opacity = "1";
          confirmBtn.innerText = isRest ? "🧘 CONFIRM REST RECOVERY ADHERENCE" : "⚡ CONFIRM WORKOUT ADHERENCE";
        }
      }
    }

    // 2. Fetch Attendance History and Render Calendar Grid
    const attRes = await fetch(`${BASE_URL}/attendance/history/${currentHunterId}`);
    let historyMap = {};
    if (attRes.ok) {
      const attData = await attRes.json();
      (attData.attendance || []).forEach(r => {
        historyMap[r.date] = r;
      });
    }

    // Update 21-day streak tracker
    const streak = currentTodaySplit?.split_streak_21 || 0;
    const streakCountElem = document.getElementById("streak-21-count");
    const streakFillElem = document.getElementById("streak-21-fill");
    if (streakCountElem) streakCountElem.innerText = `${streak} / 21 DAYS`;
    if (streakFillElem) {
      const pct = Math.min((streak / 21) * 100, 100);
      streakFillElem.style.width = `${pct}%`;
    }

    // Render Calendar Grid for Current Month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];

    const monthTitle = document.getElementById("calendar-month-title");
    if (monthTitle) monthTitle.innerText = `${monthNames[currentMonth]} ${currentYear} // ATTENDANCE LEDGER`;

    const calGrid = document.getElementById("calendar-grid");
    if (calGrid) {
      calGrid.innerHTML = "";
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const todayDate = now.getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const cell = document.createElement("div");
        cell.className = "cal-day-cell";
        cell.innerText = day;

        const record = historyMap[dStr];

        if (day === todayDate) {
          cell.classList.add("today");
        }

        if (record) {
          if (record.is_rest_day || record.status === 'rest_adhered') {
            cell.classList.add("rest-done");
            cell.title = `Rest Adhered: ${record.split_day_name || 'Rest Day'}`;
          } else {
            cell.classList.add("workout-done");
            cell.title = `Workout: ${record.split_day_name || 'Completed'}`;
          }
        } else if (day < todayDate) {
          // If in the past and not logged, show missed mark
          cell.classList.add("missed");
          cell.title = "Missed Discipline";
        }

        calGrid.appendChild(cell);
      }
    }

    // 3. Update Weight tracking info
    const charRes = await fetch(`${BASE_URL}/character/${currentHunterId}`);
    if (charRes.ok) {
      const c = await charRes.json();
      const charObj = c.character || c;
      const curW = document.getElementById("cal-current-weight");
      const tgtW = document.getElementById("cal-target-weight");
      if (curW) curW.innerText = `${charObj.current_weight || 75.0} KG`;
      if (tgtW) tgtW.innerText = `${charObj.target_weight || 80.0} KG (${(charObj.weight_goal_type || 'gain').toUpperCase()})`;
    }
  } catch (err) {
    console.error("Failed to load split & calendar data:", err);
  }
}

async function confirmTodaySplitAttendance() {
  try {
    const isRest = currentTodaySplit ? currentTodaySplit.is_rest_day : false;
    const splitName = currentTodaySplit?.split?.name || (isRest ? "Rest Day" : "Workout");

    const res = await fetch(`${BASE_URL}/attendance/mark`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        is_rest_day: isRest,
        split_day_name: splitName
      })
    });

    const result = await res.json();
    if (!res.ok) {
      showSystemHologram("ADHERENCE NOTICE 📅", result.error || "Attendance cannot be updated.", true);
      return;
    }

    if (result.awakening_surge) {
      playSystemSound("levelup");
      speakSystemDirective("Unbroken discipline awakening achieved. 3000 EXP surge awarded to your hunter rank!");
      showSystemHologram("AWAKENING SURGE! 🔥", "21 Consecutive Days of Unbroken Discipline! +3,000 EXP Surge awarded!", true);
    } else {
      playSystemSound("quest");
      speakSystemDirective(isRest ? "Rest protocol verified. Discipline adherence logged." : "Workout regimen cleared. Adherence logged.");
      showSystemHologram("DISCIPLINE MARKED 📅", result.message || "Daily attendance confirmed on ledger.");
    }

    await loadTodaySplitAndCalendar();
    await loadCharacterData();
    await loadTasks();
  } catch (err) {
    console.error("Failed to mark attendance:", err);
  }
}

async function quickLogWeight() {
  const input = document.getElementById("quick-weight-input");
  const val = parseFloat(input?.value);
  if (!val || val <= 0) {
    showSystemHologram("INVALID WEIGHT ⚖️", "Please enter a valid weight in KG.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/weight/log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        weight: val
      })
    });

    if (res.ok) {
      input.value = "";
      playSystemSound("quest");
      speakSystemDirective(`Body composition updated. Current weight logged at ${val.toFixed(1)} kilograms.`);
      showSystemHologram("WEIGHT LOGGED ⚖️", `Current weight recorded at ${val.toFixed(1)} KG.`);
      await loadTodaySplitAndCalendar();
      await loadCharacterData();
    }
  } catch (err) {
    console.error("Failed to log weight:", err);
  }
}

// =========================================
// 22. SYSTEM PENALTY ZONE EMERGENCY OVERLAY
// =========================================
function showPenaltyZoneWarning(penaltyInfo) {
  const stage = document.getElementById("penalty-warning-stage");
  if (!stage) return;

  const narrative = document.getElementById("penalty-narrative-text");
  const deduction = document.getElementById("penalty-deduction-amount");

  const missedDays = penaltyInfo.days_missed || 2;
  const lostXp = penaltyInfo.xp_lost || 150;

  if (narrative) {
    narrative.innerText = `You failed to log your quests for ${missedDays} consecutive days. The System does not tolerate complacency. Your discipline streak has suffered.`;
  }
  if (deduction) {
    deduction.innerText = `-${lostXp} EXP DEDUCTED`;
  }

  stage.classList.remove("hidden");
  playSystemSound("levelup");
  speakSystemDirective("Emergency alert. Penalty zone protocol activated. Disciplinary deduction enforced.");
}

function dismissPenaltyWarning() {
  const stage = document.getElementById("penalty-warning-stage");
  if (stage) stage.classList.add("hidden");
  playSystemSound("quest");
  speakSystemDirective("Penalty acknowledged. Rebuild your discipline, Hunter.");
  showSystemHologram("PENALTY DISMISSED ⚡", "Resume your daily quests and recover your lost standing.");
}

// =========================================
// 23. QUEST MANAGER ENGINE (MIN 2 GYM, 2 ACADEMICS, 1 ECC)
// =========================================
let managerQuests = [];

async function openManageQuestsModal() {
  const modal = document.getElementById("manage-quests-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  playSystemSound("quest");

  try {
    const res = await fetch(`${BASE_URL}/quests/${currentHunterId}`);
    if (res.ok) {
      const data = await res.json();
      managerQuests = data.quests || [];
    } else {
      managerQuests = window.currentActiveQuests ? [...window.currentActiveQuests] : [];
    }
  } catch (err) {
    managerQuests = window.currentActiveQuests ? [...window.currentActiveQuests] : [];
  }

  renderManageQuestsList();
}

function closeManageQuestsModal() {
  const modal = document.getElementById("manage-quests-modal");
  if (modal) modal.classList.add("hidden");
}

function renderManageQuestsList() {
  const container = document.getElementById("manage-quests-list");
  if (!container) return;
  container.innerHTML = "";

  const gymCount = managerQuests.filter(q => q.category === 'gym').length;
  const acadCount = managerQuests.filter(q => q.category === 'academics').length;
  const eccCount = managerQuests.filter(q => q.category === 'ecc').length;
  const totalCount = managerQuests.length;

  const gymVal = document.getElementById("quota-gym-val");
  const acadVal = document.getElementById("quota-acad-val");
  const eccVal = document.getElementById("quota-ecc-val");
  const totalVal = document.getElementById("quota-total-val");

  if (gymVal) {
    gymVal.innerText = `${gymCount} / 2 (MIN)`;
    gymVal.style.color = gymCount >= 2 ? "#86efac" : "#ef4444";
  }
  if (acadVal) {
    acadVal.innerText = `${acadCount} / 2 (MIN)`;
    acadVal.style.color = acadCount >= 2 ? "#7dd3fc" : "#ef4444";
  }
  if (eccVal) {
    eccVal.innerText = `${eccCount} / 1 (MIN)`;
    eccVal.style.color = eccCount >= 1 ? "#fde68a" : "#ef4444";
  }
  if (totalVal) {
    totalVal.innerText = `${totalCount} / 5 (MIN)`;
    totalVal.style.color = totalCount >= 5 ? "#a855f7" : "#ef4444";
  }

  managerQuests.forEach((q, idx) => {
    const row = document.createElement("div");
    const cat = q.category || 'gym';
    row.className = `manage-quest-row cat-${cat}`;

    const catLabel = cat === 'gym' ? 'GYM' : (cat === 'academics' ? 'ACAD' : 'ECC');

    let disableDelete = false;
    let titleMsg = "Remove objective";
    if (totalCount <= 5) {
      disableDelete = true;
      titleMsg = "Cannot delete: Minimum 5 total daily quests required.";
    } else if (cat === 'gym' && gymCount <= 2) {
      disableDelete = true;
      titleMsg = "Cannot delete: Minimum 2 Gym quests required.";
    } else if (cat === 'academics' && acadCount <= 2) {
      disableDelete = true;
      titleMsg = "Cannot delete: Minimum 2 Academics quests required.";
    } else if (cat === 'ecc' && eccCount <= 1) {
      disableDelete = true;
      titleMsg = "Cannot delete: Minimum 1 Extracurricular quest required.";
    }

    row.innerHTML = `
      <div class="quest-row-left">
        <span class="quest-cat-badge ${cat}">[${catLabel}]</span>
        <span class="quest-row-title">${q.name}</span>
      </div>
      <button 
        type="button" 
        class="quest-delete-btn" 
        ${disableDelete ? 'disabled' : ''} 
        title="${titleMsg}"
        onclick="deleteQuestFromManager(${idx})"
      >
        ✕ REMOVE
      </button>
    `;
    container.appendChild(row);
  });
}

function deleteQuestFromManager(idx) {
  const q = managerQuests[idx];
  if (!q) return;

  const gymCount = managerQuests.filter(item => item.category === 'gym').length;
  const acadCount = managerQuests.filter(item => item.category === 'academics').length;
  const eccCount = managerQuests.filter(item => item.category === 'ecc').length;

  if (managerQuests.length <= 5) {
    showSystemHologram("QUOTA LOCK 🔒", "Cannot remove: You must maintain at least 5 daily quests.");
    return;
  }
  if (q.category === 'gym' && gymCount <= 2) {
    showSystemHologram("QUOTA LOCK 🔒", "Cannot remove: Minimum 2 Gym quests required.");
    return;
  }
  if (q.category === 'academics' && acadCount <= 2) {
    showSystemHologram("QUOTA LOCK 🔒", "Cannot remove: Minimum 2 Academics quests required.");
    return;
  }
  if (q.category === 'ecc' && eccCount <= 1) {
    showSystemHologram("QUOTA LOCK 🔒", "Cannot remove: Minimum 1 Extracurricular quest required.");
    return;
  }

  managerQuests.splice(idx, 1);
  playSystemSound("quest");
  renderManageQuestsList();
}

function addNewQuestFromManager() {
  const nameInput = document.getElementById("new-quest-name");
  const catInput = document.getElementById("new-quest-category");
  const name = nameInput?.value.trim();
  const category = catInput?.value || "gym";

  if (!name) {
    showSystemHologram("NOTICE 📜", "Please enter a quest objective title.");
    return;
  }

  const prefix = category === 'gym' ? '[GYM]' : (category === 'academics' ? '[ACADEMICS]' : '[ECC SKILL]');
  const formattedName = name.startsWith("[") ? name : `${prefix} ${name}`;

  managerQuests.push({
    id: `custom-${Date.now()}`,
    category: category,
    name: formattedName,
    description: formattedName,
    difficulty: "medium",
    xp_reward: 20
  });

  nameInput.value = "";
  playSystemSound("quest");
  renderManageQuestsList();
}

async function saveQuestsFromManager() {
  const gymCount = managerQuests.filter(q => q.category === 'gym').length;
  const acadCount = managerQuests.filter(q => q.category === 'academics').length;
  const eccCount = managerQuests.filter(q => q.category === 'ecc').length;

  if (managerQuests.length < 5 || gymCount < 2 || acadCount < 2 || eccCount < 1) {
    showSystemHologram("QUOTA VIOLATION ⚠", "Constraint: Must have at least 5 quests (min 2 Gym, min 2 Academics, min 1 ECC).", true);
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/quests/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        quests: managerQuests
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showSystemHologram("VALIDATION ERROR ⚠", data.error || "Failed to update quests.", true);
      return;
    }

    closeManageQuestsModal();
    playSystemSound("quest");
    speakSystemDirective("Daily directives updated.");
    showSystemHologram("DIRECTIVES UPDATED ⚙️", "Your tailored 5+ daily quests are now active.");
    await loadTasks();
  } catch (err) {
    console.error("Error saving quests:", err);
  }
}

// =========================================
// 24. DAILY LOG BOOK ENGINE (-50 EXP PENALTY MANDATE)
// =========================================
let currentLogRating = 5;

function openLogBookModal() {
  const modal = document.getElementById("logbook-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  playSystemSound("quest");

  switchLogBookTab('today');
  checkAndLoadTodayLog();
  loadLogBookHistory();
}

function closeLogBookModal() {
  const modal = document.getElementById("logbook-modal");
  if (modal) modal.classList.add("hidden");
}

function switchLogBookTab(tab) {
  const tabToday = document.getElementById("tab-log-today");
  const tabHist = document.getElementById("tab-log-history");
  const viewToday = document.getElementById("log-view-today");
  const viewHist = document.getElementById("log-view-history");

  if (tab === 'today') {
    tabToday?.classList.add("active");
    tabHist?.classList.remove("active");
    viewToday?.classList.remove("hidden");
    viewHist?.classList.add("hidden");
  } else {
    tabHist?.classList.add("active");
    tabToday?.classList.remove("active");
    viewHist?.classList.remove("hidden");
    viewToday?.classList.add("hidden");
    loadLogBookHistory();
  }
}

function setLogRating(rating) {
  currentLogRating = rating;
  const input = document.getElementById("log-rating-val");
  if (input) input.value = rating;

  const stars = document.querySelectorAll("#star-rating-box .star");
  stars.forEach((s, idx) => {
    s.classList.toggle("active", idx < rating);
  });
}

async function checkAndLoadTodayLog() {
  try {
    const res = await fetch(`${BASE_URL}/logbook/today/${currentHunterId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.logged && data.log) {
        const l = data.log;
        if (document.getElementById("log-gym")) document.getElementById("log-gym").value = l.gym_summary || "";
        if (document.getElementById("log-academics")) document.getElementById("log-academics").value = l.academics_summary || "";
        if (document.getElementById("log-ecc")) document.getElementById("log-ecc").value = l.ecc_summary || "";
        if (document.getElementById("log-reflection")) document.getElementById("log-reflection").value = l.reflection || "";
        setLogRating(l.rating || 5);

        const dot = document.getElementById("logbook-status-dot");
        if (dot) dot.classList.remove("alert");
        const mobileDot = document.getElementById("mobile-logbook-dot");
        if (mobileDot) mobileDot.classList.remove("alert");
      }
    }
  } catch (err) {
    console.error("Error checking today logbook:", err);
  }
}

async function checkTodayLogBookStatus() {
  try {
    const res = await fetch(`${BASE_URL}/logbook/today/${currentHunterId}`);
    const dot = document.getElementById("logbook-status-dot");
    const mobileDot = document.getElementById("mobile-logbook-dot");
    if (res.ok) {
      const data = await res.json();
      if (data.logged) {
        if (dot) dot.classList.remove("alert");
        if (mobileDot) mobileDot.classList.remove("alert");
      } else {
        if (dot) dot.classList.add("alert");
        if (mobileDot) mobileDot.classList.add("alert");
      }
    }
  } catch (e) {}
}

async function submitDailyLog(event) {
  event.preventDefault();

  const gymSummary = document.getElementById("log-gym")?.value.trim() || "";
  const acadSummary = document.getElementById("log-academics")?.value.trim() || "";
  const eccSummary = document.getElementById("log-ecc")?.value.trim() || "";
  const reflection = document.getElementById("log-reflection")?.value.trim() || "";

  if (!gymSummary && !acadSummary) {
    showSystemHologram("NOTICE ✍", "Please enter at least your gym or academic summary.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/logbook/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        character_id: currentHunterId,
        gym_summary: gymSummary,
        academics_summary: acadSummary,
        ecc_summary: eccSummary,
        reflection: reflection,
        rating: currentLogRating
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showSystemHologram("ERROR ⚠", data.error || "Failed to save chronicle.");
      return;
    }

    playSystemSound("levelup");
    speakSystemDirective("Daily chronicle registered to hunter archives. Experience allocated.");
    showSystemHologram("CHRONICLE SAVED 📖", `Daily log recorded successfully! (+${data.xp_awarded || 30} EXP)`);

    const dot = document.getElementById("logbook-status-dot");
    if (dot) dot.classList.remove("alert");

    closeLogBookModal();
    await loadCharacterData();
  } catch (err) {
    console.error("Error submitting daily log:", err);
  }
}

async function loadLogBookHistory() {
  try {
    const res = await fetch(`${BASE_URL}/logbook/history/${currentHunterId}`);
    if (!res.ok) return;
    const data = await res.json();
    const logs = data.logs || [];

    const countElem = document.getElementById("logbook-count");
    if (countElem) countElem.innerText = logs.length;

    const list = document.getElementById("logbook-history-list");
    if (!list) return;
    list.innerHTML = "";

    if (logs.length === 0) {
      list.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 24px; font-family: 'Share Tech Mono', monospace;">NO ARCHIVED ENTRIES YET. WRITE TODAY'S LOG!</div>`;
      return;
    }

    logs.forEach(l => {
      const card = document.createElement("div");
      card.className = "log-history-card";

      let starsHtml = "";
      for (let i = 0; i < (l.rating || 5); i++) starsHtml += "★";

      card.innerHTML = `
        <div class="log-card-header">
          <span class="log-card-date">📅 ${l.date}</span>
          <span class="log-card-stars">${starsHtml}</span>
        </div>
        <div class="log-card-body">
          ${l.gym_summary ? `<div><span class="log-field-tag">🏋️ GYM:</span> ${l.gym_summary}</div>` : ''}
          ${l.academics_summary ? `<div><span class="log-field-tag">📚 STUDY:</span> ${l.academics_summary}</div>` : ''}
          ${l.ecc_summary ? `<div><span class="log-field-tag">⚡ SKILL:</span> ${l.ecc_summary}</div>` : ''}
          ${l.reflection ? `<div><span class="log-field-tag">💭 MINDSET:</span> ${l.reflection}</div>` : ''}
        </div>
      `;
      list.appendChild(card);
    });
  } catch (err) {
    console.error("Error loading logbook history:", err);
  }
}

// Global Modal Backdrop Click & Escape Key Handler
function initModalOverlayControls() {
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      // If user clicked directly on the dark backdrop (not inside modal-content)
      if (e.target === overlay) {
        overlay.classList.add("hidden");
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const openModals = document.querySelectorAll(".modal-overlay:not(.hidden)");
      if (openModals.length > 0) {
        openModals[openModals.length - 1].classList.add("hidden");
      }
    }
  });
}

// 13. DOM Ready Initialization
document.addEventListener("DOMContentLoaded", () => {
  initBackgroundSlideshow();
  init3DCardTilt();
  initInteractiveSounds();
  initManaParticleCanvas();
  updateVoiceToggleButton();
  loadShadowArmy();
  loadInventory();
  renderSplitDaysEditor();
  checkTodayLogBookStatus();
  updateDirectivesPreview();
  initCreatorIntro();
  initModalOverlayControls();

  // Check if hunter is cached
  const savedProfile = JSON.parse(localStorage.getItem("hunter_profile"));
  if (savedProfile && savedProfile.name) {
    const usernameInput = document.getElementById("login-username");
    if (usernameInput) usernameInput.value = savedProfile.name;
    currentHunterId = savedProfile.id || 1;
    currentHunterName = savedProfile.name;
  }
});

// ==========================================
// 14. 3D CREATOR INTRO POPUP ENGINE
// ==========================================
let creatorIntroTimer = null;

function initCreatorIntro() {
  const stage = document.getElementById("creator-intro-stage");
  const pBar = document.getElementById("creator-progress-bar");
  if (!stage) return;

  // Audio effect
  setTimeout(() => {
    playSystemSound("creatorIntro");
  }, 250);

  // Trigger progress bar animation
  if (pBar) {
    pBar.classList.remove("animate");
    void pBar.offsetWidth; // Force reflow
    pBar.classList.add("animate");
  }

  // Auto-dismiss after 2.9s
  if (creatorIntroTimer) clearTimeout(creatorIntroTimer);
  creatorIntroTimer = setTimeout(() => {
    dismissCreatorIntro();
  }, 2900);

  // Keypress listener for ESC, Space, or Enter to dismiss
  document.addEventListener("keydown", handleCreatorIntroKeydown);
}

function handleCreatorIntroKeydown(e) {
  if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
    const stage = document.getElementById("creator-intro-stage");
    if (stage && !stage.classList.contains("hidden") && !stage.classList.contains("dismissing")) {
      e.preventDefault();
      dismissCreatorIntro();
    }
  }
}

function dismissCreatorIntro() {
  if (creatorIntroTimer) clearTimeout(creatorIntroTimer);
  document.removeEventListener("keydown", handleCreatorIntroKeydown);

  const stage = document.getElementById("creator-intro-stage");
  if (!stage) return;

  stage.classList.add("dismissing");
  playSystemSound("hover");

  setTimeout(() => {
    stage.classList.add("hidden");
    stage.classList.remove("dismissing");
  }, 500);
}

function reopenCreatorIntro() {
  const stage = document.getElementById("creator-intro-stage");
  if (!stage) return;

  stage.classList.remove("hidden", "dismissing");
  initCreatorIntro();
}

// ==========================================
// 15. GOOGLE AUTHENTICATION CLIENT ENGINE
// ==========================================

function triggerGoogleSignIn() {
  playSystemSound("focus");
  const modal = document.getElementById("google-auth-modal");
  if (modal) modal.classList.remove("hidden");
}

function closeGoogleAuthModal() {
  playSystemSound("hover");
  const modal = document.getElementById("google-auth-modal");
  if (modal) modal.classList.add("hidden");
}

async function selectQuickGoogleAccount(name, email) {
  playSystemSound("quest");
  await executeGoogleAuth({
    name: name,
    email: email,
    avatar_url: "/static/images/creator_pfp.jpg",
    google_id: "google_quick_" + btoa(email).substring(0, 16)
  });
}

async function submitCustomGoogleAuth(event) {
  event.preventDefault();
  const nameInput = document.getElementById("google-input-name");
  const emailInput = document.getElementById("google-input-email");
  if (!nameInput || !emailInput) return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  if (!name || !email) return;

  playSystemSound("quest");
  await executeGoogleAuth({
    name: name,
    email: email,
    avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00e5ff&color=0a0e1a&bold=true`,
    google_id: "google_user_" + Date.now()
  });
}

async function executeGoogleAuth(payload) {
  try {
    const res = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      showSystemHologram("AUTH ERROR ⚠", data.error || "Google authentication failed.");
      return;
    }

    closeGoogleAuthModal();

    // Cache profile
    const char = data.character;
    currentHunterId = char.id;
    currentHunterName = char.name;
    localStorage.setItem("hunter_profile", JSON.stringify({
      id: char.id,
      name: char.name,
      level: char.level || 1,
      email: char.email || "",
      avatar_url: char.avatar_url || ""
    }));

    playSystemSound("levelup");
    showSystemHologram("GOOGLE AUTHENTICATED ⚡", `Welcome, Hunter ${char.name}! Google identity verified.`);

    // Trigger the 3D cinematic opening gate
    trigger3DWelcomeSequence(char.name);

    // After welcome sequence finishes, check onboarding & penalties
    setTimeout(async () => {
      if (data.penalty && data.penalty.penalty_applied) {
        handleInactionPenalty(data.penalty);
      }

      if (!char.onboarding_completed) {
        setTimeout(() => openOnboardingModal(), 600);
      }

      await loadCharacterData();
      await loadTodaySplit();
      await checkTodayLogBookStatus();
    }, 1800);

  } catch (err) {
    console.error("Google Auth error:", err);
    showSystemHologram("NETWORK ERROR", "Unable to connect to Google Auth Gateway.");
  }
}

// =========================================================
// 26. MOBILE SYSTEM SLIDE-OUT DRAWER CONTROLLER
// =========================================================

function openMobileDrawer() {
  const drawer = document.getElementById("mobile-system-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  const hamburger = document.getElementById("mobile-hamburger-btn");
  if (!drawer) return;

  // Sync hunter profile info to drawer
  const drawerName = document.getElementById("drawer-hunter-name");
  const drawerRank = document.getElementById("drawer-hunter-rank");
  const drawerStreak = document.getElementById("drawer-streak-val");
  const drawerWeight = document.getElementById("drawer-weight-val");
  const drawerLevel = document.getElementById("drawer-level-val");
  const drawerShadow = document.getElementById("drawer-shadow-badge");

  const playerName = document.getElementById("player-name");
  const playerRank = document.getElementById("player-rank");
  const hudStreak = document.getElementById("hud-streak-tag");
  const hudWeight = document.getElementById("hud-weight-tag");
  const playerLevel = document.getElementById("player-level");
  const shadowBadge = document.getElementById("shadow-count-badge");

  if (drawerName) drawerName.innerText = (playerName ? playerName.innerText : currentHunterName).toUpperCase();
  if (drawerRank && playerRank) drawerRank.innerText = playerRank.innerText;
  if (drawerStreak && hudStreak) drawerStreak.innerText = hudStreak.innerText;
  if (drawerWeight && hudWeight) drawerWeight.innerText = hudWeight.innerText;
  if (drawerLevel && playerLevel) drawerLevel.innerText = `LV. ${playerLevel.innerText}`;
  if (drawerShadow && shadowBadge) drawerShadow.innerText = shadowBadge.innerText;

  syncDrawerVoiceStatus();

  drawer.classList.add("open");
  if (backdrop) backdrop.classList.remove("hidden");
  setTimeout(() => {
    if (backdrop) backdrop.classList.add("active");
  }, 10);
  if (hamburger) hamburger.classList.add("active");

  playSystemSound("menuOpen");
}

function closeMobileDrawer() {
  const drawer = document.getElementById("mobile-system-drawer");
  const backdrop = document.getElementById("mobile-drawer-backdrop");
  const hamburger = document.getElementById("mobile-hamburger-btn");
  if (!drawer) return;

  drawer.classList.remove("open");
  if (hamburger) hamburger.classList.remove("active");
  if (backdrop) {
    backdrop.classList.remove("active");
    setTimeout(() => {
      backdrop.classList.add("hidden");
    }, 300);
  }
  playSystemSound("menuClose");
}

function toggleMobileDrawer() {
  const drawer = document.getElementById("mobile-system-drawer");
  if (!drawer) return;
  if (drawer.classList.contains("open")) {
    closeMobileDrawer();
  } else {
    openMobileDrawer();
  }
}

function syncDrawerVoiceStatus() {
  const voiceStatus = document.getElementById("drawer-voice-status");
  const voiceIcon = document.getElementById("drawer-voice-icon");
  if (voiceStatus) {
    voiceStatus.innerText = isSystemVoiceMuted ? "Voice: OFF" : "Voice: ON";
  }
  if (voiceIcon) {
    voiceIcon.innerText = isSystemVoiceMuted ? "🔇" : "🔊";
  }
}