/**
 * Calculate profile completion percentage using weighted scoring system
 * @param {Object} user - User object
 * @param {number} completedSwaps - Number of completed swaps (optional)
 * @returns {Object} - { percentage, missingSteps }
 */
export const calculateProfileCompletion = (user, completedSwaps = 0) => {
  if (!user) return { percentage: 0, missingSteps: [] };

  let score = 0;
  const missingSteps = [];

  // Name: 10%
  if (user.name && user.name.trim()) {
    score += 10;
  } else {
    missingSteps.push({ text: "Add your name", points: 10 });
  }

  // Email: 10%
  if (user.email && user.email.trim()) {
    score += 10;
  } else {
    missingSteps.push({ text: "Add your email", points: 10 });
  }

  // Bio: 20%
  if (user.bio && user.bio.trim()) {
    score += 20;
  } else {
    missingSteps.push({ text: "Add a bio (+20%)", points: 20 });
  }

  // Skills Offered: 25%
  if (user.skillsOffered && user.skillsOffered.length > 0) {
    score += 25;
  } else {
    missingSteps.push({ text: "Add skills offered (+25%)", points: 25 });
  }

  // Skills Wanted: 15%
  if (user.skillsWanted && user.skillsWanted.length > 0) {
    score += 15;
  } else {
    missingSteps.push({ text: "Add skills wanted (+15%)", points: 15 });
  }

  // Completed Swaps: 10%
  if (completedSwaps > 0) {
    score += 10;
  } else {
    missingSteps.push({ text: "Complete a swap (+10%)", points: 10 });
  }

  return {
    percentage: Math.min(100, Math.round(score)),
    missingSteps
  };
};

