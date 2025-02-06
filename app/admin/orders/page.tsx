import { auth } from "@/auth";
import Pagination from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteOrder, getAllOrders } from "@/lib/actions/order.actions";
import { formatId, formatDateTime, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/delete-dialog";

export const metadata: Metadata = {
  title: "Admin Orders",
};

const AdminOrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page = "1" } = await props.searchParams;

  const session = await auth();

  if (session?.user?.role !== "admin")
    throw new Error("User is not authorized");

  const orders = await getAllOrders({
    page: Number(page),
  });

  return (
    <div className="space-y-2">
      <h2 className="h2-bold">Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead className="text-center">DATE</TableHead>
              <TableHead className="text-center">TOTAL</TableHead>
              <TableHead className="text-center">PAID</TableHead>
              <TableHead className="text-center">DELIVERED</TableHead>
              <TableHead className="text-center">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{formatId(order.id)}</TableCell>
                <TableCell className="text-center">
                  {formatDateTime(order.createdAt).dateTime}
                </TableCell>
                <TableCell className="text-center">
                  {formatCurrency(order.totalPrice)}
                </TableCell>
                {order.isPaid && order.paidAt ? (
                  <TableCell className="text-center">
                    {formatDateTime(order.paidAt).dateTime}
                  </TableCell>
                ) : (
                  <TableCell className="text-center text-destructive">
                    Not paid
                  </TableCell>
                )}
                {order.isDelivered && order.deliveredAt ? (
                  <TableCell className="text-center">
                    {formatDateTime(order.deliveredAt).dateTime}
                  </TableCell>
                ) : (
                  <TableCell className="text-center text-destructive">
                    Not delivered
                  </TableCell>
                )}
                <TableCell className="text-center hover:text-muted-foreground">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/order/${order.id}`}>Details</Link>
                  </Button>
                  <DeleteDialog id={order.id} action={deleteOrder} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {orders.totalPages > 1 && (
          <Pagination
            page={Number(page) || 1}
            totalPages={orders?.totalPages}
          />
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
