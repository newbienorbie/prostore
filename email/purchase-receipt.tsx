import sampleData from "@/db/sample-data";
import { formatCurrency } from "@/lib/utils";
import { Order } from "@/types";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config();

PurchaseReceiptEmail.PreviewProps = {
  order: {
    id: crypto.randomUUID(),
    userId: "123",
    user: {
      name: "John Doe",
      email: "test@test.com",
    },
    paymentMethod: "PayPal",
    shippingAddress: {
      fullName: "John Doe",
      streetAddress: "123 Main st",
      city: "Subang Jaya",
      state: "Selangor",
      postalCode: "10001",
      country: "MY",
    },
    createdAt: new Date(),
    totalPrice: "100",
    taxPrice: "10",
    shippingPrice: "10",
    itemsPrice: "80",
    orderitems: sampleData.products.map((x) => ({
      name: x.name,
      orderId: "123",
      productId: "123",
      slug: x.slug,
      qty: x.stock,
      image: x.images[0],
      price: x.price.toString(),
    })),
    isDelivered: true,
    deliveredAt: new Date(),
    isPaid: true,
    paidAt: new Date(),
    paymentResult: {
      id: "123",
      status: "succeeded",
      pricePaid: "100",
      email_address: "test@test.com",
    },
  },
} satisfies OrderInformationProps;

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

type OrderInformationProps = {
  order: Order;
};

export default function PurchaseReceiptEmail({ order }: OrderInformationProps) {
  return (
    <Html>
      <Preview>View order receipt</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Purchase Receipt</Heading>

            {/* Order details section */}
            <Section className="mt-4">
              <Row>
                {/* order id */}
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-wrap">
                    Order ID
                  </Text>
                  <Text className="mt-0 mr-4">{order.id.toString()}</Text>
                </Column>

                {/* date */}
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-wrap">
                    Purchase Date
                  </Text>
                  <Text className="mt-0 mr-4">
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>

                {/* price */}
                <Column>
                  <Text className="mb-0 mr-4 text-gray-500 whitespace-nowrap text-wrap">
                    Price Paid
                  </Text>
                  <Text className="mt-0 mr-4">
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Order items section */}
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              {order.orderitems.map((item) => (
                <Row key={item.productId} className="mt-8">
                  <Column className="w-20 mr-2">
                    <Img
                      width={80}
                      alt={item.name}
                      className="rounded"
                      src={
                        item.image.startsWith("/")
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className="w-4"></Column>
                  <Column className="align-top">
                    {item.name} x {item.qty}
                  </Column>
                  <Column align="right" className="align-top">
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}

              {/* Order summary */}
              {[
                { name: "Items", price: order.itemsPrice },
                { name: "Tax", price: order.taxPrice },
                { name: "Shipping", price: order.shippingPrice },
                { name: "Total", price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className="py-1">
                  <Column align="right">{name}: </Column>
                  <Column align="right" width={70} className="align-top">
                    <Text className="m-1">{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
