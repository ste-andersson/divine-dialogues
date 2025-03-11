
import { useConversation } from "@11labs/react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DataCollectionDisplay, { DataCollection } from "./DataCollectionDisplay";
import TranscriptionDisplay from "./TranscriptionDisplay";
import { supabase } from "@/integrations/supabase/client";

export const ElevenLabsChat = () => {
  const { toast } = useToast();
  const [isStarted, setIsStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [dataCollection, setDataCollection] = useState<DataCollection | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const conversationIdRef = useRef<string | null>(null);
  const [savedToDatabase, setSavedToDatabase] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [transcriptionSaved, setTranscriptionSaved] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to AI assistant");
      toast({
        title: "Connected to AI assistant",
        description: "You can now start a conversation with the assistant",
      });
    },
    onDisconnect: () => {
      console.log("Disconnected from AI assistant");
      setIsStarted(false);
      toast({
        title: "Disconnected from AI assistant",
        description: "The conversation has ended",
      });
      
      if (conversationIdRef.current) {
        console.log(`Conversation ended with ID: ${conversationIdRef.current}, saving data to database...`);
        saveConversationData(conversationIdRef.current);
        saveTranscription(conversationIdRef.current);
      } else {
        console.error("No conversation ID available when disconnected");
      }
    },
    onError: (error) => {
      console.error("Conversation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error connecting to the assistant",
      });
      setIsStarted(false);
    },
    onMessage: (message) => {
      console.log("Received message:", message);
      
      // Fix the message handling to properly set messages for display
      if (message.type === "llm_response" || message.type === "voice_response") {
        console.log("Adding assistant message to UI:", message.text);
        setMessages(prev => [...prev, { role: "assistant", content: message.text || "" }]);
      } else if (message.type === "user_response") {
        console.log("Adding user message to UI:", message.text);
        setMessages(prev => [...prev, { role: "user", content: message.text || "" }]);
      }
    }
  });

  const { status, isSpeaking } = conversation;

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMicrophone = devices.some(device => device.kind === 'audioinput');
        
        if (!hasMicrophone) {
          console.log("No microphone detected");
          setPermissionGranted(false);
          return;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log("Microphone permission granted");
        setPermissionGranted(true);
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        setPermissionGranted(false);
      }
    };

    checkMicrophonePermission();
  }, []);

  const saveToDatabase = async (id: string, data: DataCollection) => {
    console.log("Attempting to save to database:", { id, data });
    try {
      const { error, data: result } = await supabase
        .from('conversation_data')
        .insert({
          conversation_id: id,
          project: data.project || null,
          hours: data.hours || null,
          summary: data.summary || null,
          closed: data.closed !== undefined ? data.closed : null
        });

      if (error) {
        console.error("Supabase error saving to database:", error);
        toast({
          variant: "destructive",
          title: "Database Error",
          description: "Failed to save conversation data to database",
        });
        return false;
      }

      console.log("Successfully saved to database:", result);
      toast({
        title: "Saved to Database",
        description: "Conversation data has been saved successfully",
      });
      return true;
    } catch (error) {
      console.error("Exception in saveToDatabase:", error);
      toast({
        variant: "destructive",
        title: "Database Error",
        description: "An unexpected error occurred while saving data",
      });
      return false;
    }
  };

  const saveTranscription = async (id: string) => {
    if (!messages.length) {
      console.log("No messages to save as transcription");
      return;
    }

    try {
      // Format the transcription as a readable text
      const transcriptText = messages.map(msg => 
        `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}`
      ).join('\n\n');

      console.log("Saving transcription for conversation ID:", id);
      console.log("Transcription content:", transcriptText);
      console.log("Messages to save:", messages);
      
      const { error } = await supabase
        .from('conversation_transcripts')
        .insert({
          conversation_id: id,
          transcript: transcriptText
        });

      if (error) {
        console.error("Error saving transcription:", error);
        toast({
          variant: "destructive",
          title: "Transcription Error",
          description: "Failed to save conversation transcription",
        });
        return;
      }

      console.log("Transcription saved successfully");
      setTranscriptionSaved(true);
      toast({
        title: "Transcription Saved",
        description: "Conversation transcription has been saved to database",
      });
    } catch (error) {
      console.error("Exception saving transcription:", error);
      toast({
        variant: "destructive",
        title: "Transcription Error",
        description: "An unexpected error occurred while saving transcription",
      });
    }
  };

  const extractDataFromMessages = (messages: Array<{ role: string; content: string }>): DataCollection => {
    // This function will extract data from the assistant's messages
    const data: DataCollection = {};
    
    console.log("Extracting data from messages:", messages);
    
    // Get only the assistant's messages as they contain the structured data
    const assistantMessages = messages.filter(m => m.role === "assistant");
    const userMessages = messages.filter(m => m.role === "user");
    
    // Join all assistant and user messages to check for key information
    const assistantText = assistantMessages.map(m => m.content).join(" ");
    const userText = userMessages.map(m => m.content).join(" ");
    const fullText = assistantText + " " + userText;
    
    // Swedish pattern matching
    const projectPatterns = [
      /(?:projekt|uppdrag|jobb)(?:\s+för)?(?:\s+på)?(?:\s+om)?(?:\s+med)?(?:\s+i)?:?\s+([^.,!?]+)/i,
      /([^.,!?]+)(?:\s+café|kafé|restaurang|butik)/i,
      /på\s+([^.,!?]+)(?:\s+är|har)/i
    ];
    
    // Try to find a project name
    for (const pattern of projectPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        let project = match[1].trim();
        // Add "Café" suffix if it looks like a café name
        if (fullText.toLowerCase().includes("café") && !project.toLowerCase().includes("café")) {
          project += " Café";
        }
        data.project = project;
        break;
      }
    }
    
    // Extract hours - look for hour patterns in Swedish
    const hourPatterns = [
      /(?:tog|tar|varade|pågick|tog)\s+(\d+)(?:\s+timmar|\s+timme|\s+timma)/i,
      /(\d+)(?:\s+timmar|\s+timme|\s+timma)/i
    ];
    
    for (const pattern of hourPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        data.hours = match[1] + " timmar";
        break;
      }
    }
    
    // Extract summary - look for summary or description patterns
    const summaryPatterns = [
      /(?:sammanfattning|beskrivning|rapport|summering):?\s+([^.!?]+[.!?])/i,
      /(?:handlade om|gällde|det var)\s+([^.!?]+[.!?])/i
    ];
    
    for (const pattern of summaryPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        data.summary = match[1].trim();
        break;
      }
    }
    
    // Default summary if no pattern matches
    if (!data.summary) {
      // If no specific summary found, try to use the first user message as a summary
      if (userMessages.length > 0) {
        data.summary = userMessages[0].content;
      }
    }
    
    // Check for status keywords
    if (fullText.toLowerCase().includes("slutfört") || 
        fullText.toLowerCase().includes("klart") || 
        fullText.toLowerCase().includes("färdigt")) {
      data.closed = "completed";
    } else if (fullText.toLowerCase().includes("pågående") || 
               fullText.toLowerCase().includes("fortsätter") ||
               fullText.toLowerCase().includes("ej klart")) {
      data.closed = "in progress";
    } else {
      // Default to completed since most tasks being reported are completed
      data.closed = "completed";
    }
    
    // If project is still missing, try to extract from specific phrases
    if (!data.project) {
      const cafeMatch = fullText.match(/(?:på|för|hos|med)\s+([^.,!?]+)(?:\s+café|kafé|restaurang|butik)?/i);
      if (cafeMatch) {
        data.project = cafeMatch[1].trim();
        // Add "Café" suffix if it looks like a café name
        if (fullText.toLowerCase().includes("café") && !data.project.toLowerCase().includes("café")) {
          data.project += " Café";
        }
      } else {
        // Default project name
        data.project = "Voice Conversation";
      }
    }
    
    console.log("Extracted data:", data);
    return data;
  };

  const saveConversationData = async (id: string) => {
    console.log(`Creating data for conversation ID: ${id}`);
    setIsLoadingData(true);
    setDataCollection(null);
    setSavedToDatabase(false);
    
    try {
      // Extract data from the conversation messages
      const conversationData = extractDataFromMessages(messages);
      
      console.log("Extracted conversation data for ID:", id, conversationData);
      const saved = await saveToDatabase(id, conversationData);
      
      if (saved) {
        console.log("Successfully saved data to database for conversation ID:", id);
        setDataCollection(conversationData);
        setSavedToDatabase(true);
        toast({
          title: "Conversation Saved",
          description: `Conversation (ID: ${id.substring(0, 8)}...) has been saved to database.`,
        });
      } else {
        console.error("Failed to save data to database for conversation ID:", id);
        toast({
          variant: "destructive",
          title: "Save Error",
          description: "Failed to save conversation data.",
        });
      }
    } catch (error) {
      console.error("Error in saveConversationData:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process conversation data.",
      });
    } finally {
      setIsLoadingData(false);
    }
  };

  const startConversation = async () => {
    try {
      if (status === "connected") {
        console.log("Ending conversation session");
        // Save the data before ending the session if it hasn't been saved yet
        if (conversationIdRef.current && !savedToDatabase) {
          console.log("Saving data before ending session for ID:", conversationIdRef.current);
          await saveConversationData(conversationIdRef.current);
        }
        
        // Save transcription if not already saved
        if (conversationIdRef.current && !transcriptionSaved && messages.length > 0) {
          await saveTranscription(conversationIdRef.current);
        }
        
        await conversation.endSession();
        setIsStarted(false);
        return;
      }

      console.log("Starting conversation session");
      // Clear previous conversation data
      setDataCollection(null);
      setSavedToDatabase(false);
      setMessages([]);
      setTranscriptionSaved(false);
      conversationIdRef.current = null;
      
      const result = await conversation.startSession({ 
        agentId: "w3YAPXpuEtNWtT2bqpKZ" 
      });
      
      console.log("Conversation started with ID:", result);
      // Store the conversation ID in the ref so it persists across renders
      conversationIdRef.current = result;
      setIsStarted(true);
    } catch (error) {
      console.error("Error starting/ending conversation:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start/end the conversation. Please try again.",
      });
    }
  };

  const toggleMute = async () => {
    try {
      await conversation.setVolume({ volume: isMuted ? 1.0 : 0.0 });
      setIsMuted(!isMuted);
      console.log(`Volume ${isMuted ? 'unmuted' : 'muted'}`);
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  if (permissionGranted === false) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg shadow-sm space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Microphone Access Required</h2>
        <p className="text-gray-600 text-center">
          This feature requires microphone access to function. Please enable microphone access in your browser settings.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 w-full max-w-xl mx-auto">
      <div className="flex flex-col items-center space-y-6 p-6 bg-white rounded-lg shadow-md w-full">
        <div className="w-full flex justify-between items-center">
          <h2 className="text-2xl font-bold">Voice Assistant</h2>
          {status === "connected" && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
          )}
        </div>
        
        <div className={`w-full h-24 rounded-lg flex items-center justify-center transition-colors ${isSpeaking ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 border border-gray-200'}`}>
          {isSpeaking ? (
            <div className="flex items-center space-x-2">
              <span className="animate-pulse text-blue-600">Assistant is speaking...</span>
            </div>
          ) : status === "connected" ? (
            <p className="text-gray-600">Listening for your voice...</p>
          ) : (
            <p className="text-gray-500">Press the button below to start</p>
          )}
        </div>

        <Button 
          className="w-full"
          onClick={startConversation}
          disabled={permissionGranted === null}
          variant={status === "connected" ? "destructive" : "default"}
        >
          {status === "connected" ? (
            <>
              <MicOff className="mr-2 h-5 w-5" /> End Conversation
            </>
          ) : (
            <>
              <Mic className="mr-2 h-5 w-5" /> Start Conversation
            </>
          )}
        </Button>
      </div>

      {/* Always show the TranscriptionDisplay when connected or if there are messages */}
      {(messages.length > 0 || status === "connected") && (
        <TranscriptionDisplay messages={messages} />
      )}

      {(isLoadingData || dataCollection) && (
        <DataCollectionDisplay 
          data={dataCollection} 
          isLoading={isLoadingData}
          savedToDatabase={savedToDatabase} 
        />
      )}
    </div>
  );
};

export default ElevenLabsChat;
