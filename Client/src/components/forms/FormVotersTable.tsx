import { Badge } from "../ui/badge";
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "../ui/table";

interface FormVoter {
  id: number;
  user_id: number;
  email: string;
  completed_at: string | null;
  status: string;
  last_modified: string | null;
}

const getStatusBadge = (voter: FormVoter) => {
  if (voter.completed_at) {
    return <Badge variant="default">Completed</Badge>;
  }
  
  switch (voter.status) {
    case 'in_progress':
      return <Badge variant="default">In Progress</Badge>;
    case 'completed':
      return <Badge variant="default">Completed</Badge>;
    default:
      return <Badge variant="default">Available</Badge>;
  }
};

export default function FormVotersTable({ voters }: { voters: FormVoter[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voters.map((voter) => (
            <TableRow key={voter.id}>
              <TableCell>{voter.email}</TableCell>
              <TableCell>{getStatusBadge(voter)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 