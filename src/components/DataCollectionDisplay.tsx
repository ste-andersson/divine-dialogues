
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export type DataCollection = {
  project?: string;
  hours?: string;
  summary?: string;
  closed?: boolean;
};

interface DataCollectionDisplayProps {
  data: DataCollection | null;
  isLoading: boolean;
}

const DataCollectionDisplay = ({ data, isLoading }: DataCollectionDisplayProps) => {
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto mt-6">
        <CardHeader>
          <CardTitle className="text-xl">
            <Skeleton className="h-6 w-3/4" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-1/2" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Conversation Data</CardTitle>
        <CardDescription>Information collected during your conversation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.project && (
          <div>
            <span className="font-semibold">Project:</span> {data.project}
          </div>
        )}
        {data.hours && (
          <div>
            <span className="font-semibold">Hours:</span> {data.hours}
          </div>
        )}
        {data.summary && (
          <div>
            <span className="font-semibold">Summary:</span> {data.summary}
          </div>
        )}
        {data.closed !== undefined && (
          <div>
            <span className="font-semibold">Status:</span> {data.closed ? "Closed" : "Open"}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataCollectionDisplay;
