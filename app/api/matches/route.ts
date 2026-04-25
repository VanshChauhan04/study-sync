import { NextResponse } from "next/server";
import { studyGroups, studentProfile } from "@/data/studysync";
import { getRecommendedGroups } from "@/lib/matching";

export function GET() {
  return NextResponse.json({
    profile: studentProfile,
    recommendations: getRecommendedGroups(studentProfile, studyGroups)
  });
}
