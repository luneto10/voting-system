import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormVoter } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock } from "lucide-react";

interface FormVotersTableProps {
  voters: FormVoter[];
}

export default function FormVotersTable({ voters }: FormVotersTableProps) {
  if (voters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No voters found for this form.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Completed At</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voters.map((voter) => (
            <TableRow key={voter.id}>
              <TableCell className="font-medium">{voter.email}</TableCell>
              <TableCell>
                {voter.completed_at ? formatDate(voter.completed_at) : 'Not completed'}
              </TableCell>
              <TableCell>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  voter.completed_at 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                }`}>
                  {voter.completed_at ? 'Completed' : 'In Progress'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-2">
        {voters.map((voter) => (
          <Card key={voter.id} className="border-none shadow-none bg-muted/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{voter.email}</p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                  {voter.completed_at ? (
                    <Badge variant="outline" className="h-6 px-2 text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="h-6 px-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 