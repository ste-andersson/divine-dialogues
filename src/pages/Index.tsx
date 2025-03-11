
import ElevenLabsChat from "@/components/ElevenLabsChat";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Voice Assistant</h1>
        <p className="text-xl text-gray-600">
          Click the button below to start a conversation with our AI voice assistant. Your conversation will be transcribed in real-time.
        </p>
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <ElevenLabsChat />
      </div>
    </div>
  );
};

export default Index;
