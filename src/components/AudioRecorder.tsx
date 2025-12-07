import { Phone, PhoneOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioRecorderProps {
  status: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isStarted: boolean;
  permissionGranted: boolean | null;
  onStart: () => void;
  onToggleMute: () => void;
}

export const AudioRecorder = ({ 
  status, 
  isSpeaking, 
  isMuted, 
  isStarted, 
  permissionGranted, 
  onStart, 
  onToggleMute 
}: AudioRecorderProps) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={onStart}
        disabled={permissionGranted !== true}
        variant={isStarted ? "destructive" : "default"}
        size="lg"
        className={`relative w-20 h-20 rounded-full transition-all duration-300 ${
          isStarted && isConnected
            ? 'bg-destructive hover:bg-destructive/90 animate-pulse-recording shadow-lg' 
            : 'bg-success hover:bg-success/90 hover:scale-105 shadow-md hover:shadow-lg'
        }`}
      >
        {isStarted && isConnected ? (
          <PhoneOff className="w-8 h-8" />
        ) : (
          <Phone className="w-8 h-8" />
        )}
        
        {/* Animerad ring vid inspelning */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full bg-recording/20 animate-ping" />
        )}
      </Button>
      
      {/* Statustext under knappen */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Status: {
            status === 'connected' ? 'Ansluten' :
            status === 'connecting' ? 'Ansluter...' :
            status === 'error' ? 'Fel' : 'Frånkopplad'
          }
        </p>
      </div>
    </div>
  );
};