import { Metadata } from "next";
import { getMyOrders } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";

export const metadata: Metadata = {
  title: "My Orders",
};

const OrdersPage = async (props: {
  searchParams: Promise<{ page: string }>;
}) => {
  const { page } = await props.searchParams;

  const orders = await getMyOrders({
    page: Number(page) || 1,
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
                  <Link href={`order/${order.id}`}>
                    <span className="px-2">Details</span>
                  </Link>
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

export default OrdersPage;
