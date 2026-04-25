import { NextResponse } from "next/server";
import { studyGroups } from "@/data/studysync";

export function GET() {
  return NextResponse.json({
    groups: studyGroups,
    total: studyGroups.length
  });
}
