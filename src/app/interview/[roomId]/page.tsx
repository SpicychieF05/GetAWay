import { CandidateFlow } from "@/components/interview/CandidateFlow";
import { InterviewerView } from "@/components/interview/InterviewerView";

export default async function InterviewPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { roomId } = await params;
  const { view } = await searchParams;

  if (view === "interviewer") {
    return <InterviewerView roomId={roomId} />;
  }

  // Default to candidate view
  return <CandidateFlow roomId={roomId} />;
}
