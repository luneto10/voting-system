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
  );
} 