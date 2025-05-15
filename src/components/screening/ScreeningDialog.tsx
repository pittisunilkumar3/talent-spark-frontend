import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import WebRTCScreening from './WebRTCScreening';

interface ScreeningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    position: string;
    email: string;
  };
}

const ScreeningDialog: React.FC<ScreeningDialogProps> = ({
  isOpen,
  onClose,
  candidate
}) => {
  const [screeningStarted, setScreeningStarted] = useState(false);
  const [screeningCompleted, setScreeningCompleted] = useState(false);
  const [screeningResults, setScreeningResults] = useState<{
    score: number;
    feedback: string;
  } | null>(null);

  // Start the screening
  const handleStartScreening = () => {
    setScreeningStarted(true);
  };

  // Handle screening completion
  const handleScreeningComplete = (results: { score: number; feedback: string }) => {
    setScreeningResults(results);
    setScreeningCompleted(true);
    setScreeningStarted(false);
    
    toast({
      title: 'Screening Completed',
      description: `Screening for ${candidate.name} has been completed with a score of ${results.score}%.`,
    });
  };

  // Handle screening cancellation
  const handleCancelScreening = () => {
    setScreeningStarted(false);
    
    toast({
      title: 'Screening Cancelled',
      description: 'The screening session has been cancelled.',
    });
  };

  // Close the dialog and reset state
  const handleClose = () => {
    setScreeningStarted(false);
    setScreeningCompleted(false);
    setScreeningResults(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${screeningStarted ? 'sm:max-w-5xl' : 'sm:max-w-md'} h-auto max-h-[90vh] overflow-hidden`}>
        {!screeningStarted && !screeningCompleted && (
          <>
            <DialogHeader>
              <DialogTitle>Start TalentPulse Screening</DialogTitle>
              <DialogDescription>
                You are about to start a live screening session with {candidate.name} for the {candidate.position} position.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Candidate Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Name:</div>
                    <div>{candidate.name}</div>
                    <div className="text-muted-foreground">Position:</div>
                    <div>{candidate.position}</div>
                    <div className="text-muted-foreground">Email:</div>
                    <div>{candidate.email}</div>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Before You Begin</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Ensure your camera and microphone are working</li>
                    <li>Find a quiet environment with good lighting</li>
                    <li>Have the job description and requirements ready</li>
                    <li>Prepare to ask relevant technical and behavioral questions</li>
                    <li>The session will be recorded for review purposes</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleStartScreening}>
                Start Screening
              </Button>
            </DialogFooter>
          </>
        )}
        
        {screeningStarted && (
          <div className="h-[80vh] overflow-hidden">
            <WebRTCScreening
              candidateName={candidate.name}
              position={candidate.position}
              onComplete={handleScreeningComplete}
              onCancel={handleCancelScreening}
            />
          </div>
        )}
        
        {screeningCompleted && screeningResults && (
          <>
            <DialogHeader>
              <DialogTitle>Screening Results</DialogTitle>
              <DialogDescription>
                Review the results of {candidate.name}'s screening for the {candidate.position} position.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Score</h3>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold">{screeningResults.score}%</div>
                    <div className="ml-2 text-sm text-muted-foreground">
                      {screeningResults.score >= 90 ? 'Excellent' : 
                       screeningResults.score >= 80 ? 'Very Good' : 
                       screeningResults.score >= 70 ? 'Good' : 
                       screeningResults.score >= 60 ? 'Satisfactory' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Feedback</h3>
                  <p className="text-sm">{screeningResults.feedback}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Next Steps</h3>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Review the full recording of the screening</li>
                    <li>Share results with the hiring team</li>
                    <li>Decide whether to move forward with the candidate</li>
                    <li>Schedule a follow-up interview if appropriate</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleClose}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ScreeningDialog;
