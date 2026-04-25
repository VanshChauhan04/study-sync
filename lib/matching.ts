import type { ScoreBreakdown, StudentProfile, StudyGroup } from "@/types/studysync";

export function calculateCompatibilityScore(breakdown: ScoreBreakdown) {
  return Math.min(
    100,
    Math.round(
      breakdown.subject +
        breakdown.schedule +
        breakdown.style +
        breakdown.difficulty +
        breakdown.institution
    )
  );
}

export function getRecommendedGroups(profile: StudentProfile, groups: StudyGroup[]) {
  return groups
    .map((group) => ({
      ...group,
      compatibility: calculateCompatibilityScore(group.scoreBreakdown),
      isCoreSubject: profile.subjects.includes(group.subject)
    }))
    .sort((a, b) => b.compatibility - a.compatibility);
}
