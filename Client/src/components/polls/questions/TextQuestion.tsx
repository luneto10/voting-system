import { MessageSquare } from "lucide-react";

interface TextQuestionProps {
  title: string;
  index: number;
}

export default function TextQuestion({ title, index }: TextQuestionProps) {
  return (
    <div className="space-y-2 p-2.5 sm:p-3 border rounded-lg bg-background/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-start sm:items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground min-w-[1.5rem]">{index + 1}.</span>
          <h3 className="font-medium text-sm sm:text-base text-foreground">
            <span className="line-clamp-2 sm:line-clamp-none">{title}</span>
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-secondary rounded-md flex items-center w-fit ml-4 sm:ml-0">
          <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
          TEXT
        </span>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground ml-4 sm:ml-6">
        Open text response
      </p>
    </div>
  );
} 