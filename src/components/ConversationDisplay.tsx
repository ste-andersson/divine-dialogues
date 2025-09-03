import { useEffect, useRef } from 'react';
import { User, Bot, MessageCircle, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface Message {
  role: string;
  content: string;
}

interface ConversationDisplayProps {
  messages: Message[];
  isProcessing: boolean;
}

export const ConversationDisplay = ({ messages, isProcessing }: ConversationDisplayProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll till botten
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isProcessing]);

  const handlePlayMessage = (text: string) => {
    // TTS-logik här
    console.log('Playing:', text);
  };

  return (
    <Card className="w-full max-w-4xl h-[500px] bg-gradient-to-br from-card to-accent/5 border-2 border-primary/30">
      {/* Header */}
      <div className="p-4 border-b border-primary/20">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
          <MessageCircle className="w-5 h-5 text-primary" />
          Konversation
        </h3>
      </div>
      
      {/* Scrollable meddelanden */}
      <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground ml-12'
                  : 'bg-secondary text-secondary-foreground mr-12'
              }`}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-primary-foreground/20' : 'bg-secondary-foreground/20'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  
                  {/* Meddelandeinnehåll */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs opacity-70">
                        Just nu
                      </span>
                      {message.role === 'assistant' && (
                        <Button 
                          onClick={() => handlePlayMessage(message.content)}
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 hover:bg-secondary-foreground/10"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Processing-indikator */}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-4 bg-secondary text-secondary-foreground mr-12">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-foreground/20 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI processar...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      
      {/* Footer med status */}
      <div className="p-4 border-t border-border/50">
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Status: Ansluten</span>
          <span>{messages.length} meddelanden</span>
        </div>
      </div>
    </Card>
  );
};