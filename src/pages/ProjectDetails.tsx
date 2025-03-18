
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProjectDetailsForm from "@/components/ProjectDetailsForm";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectDetails = () => {
  const { conversationId } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    project?: string;
    hours?: string;
    summary?: string;
    closed?: string;
  } | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversationData = async () => {
      if (!conversationId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Conversation ID is missing. Redirecting to home page.",
        });
        navigate("/");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("conversation_data")
          .select("project, hours, summary, closed")
          .eq("conversation_id", conversationId)
          .single();

        if (error) {
          throw error;
        }

        setData(data);
      } catch (error) {
        console.error("Error fetching conversation data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load conversation data. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversationData();
  }, [conversationId, toast, navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Please fill in the details about the project discussed in your conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectDetailsForm conversationId={conversationId || ""} initialData={data || undefined} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetails;
