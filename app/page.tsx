import { HomeExperience } from "@/components/home-experience";
import {
  activeSession,
  dashboardMetrics,
  plannerDays,
  studyGroups,
  studentProfile
} from "@/data/studysync";

export default function Home() {
  return (
    <HomeExperience
      activeSession={activeSession}
      dashboardMetrics={dashboardMetrics}
      groups={studyGroups}
      plannerDays={plannerDays}
      profile={studentProfile}
    />
  );
}
