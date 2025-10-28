export default function OrderTable() {
  const orders = [
    {
      id: "#2633",
      name: "John McCormick",
      address: "1096 Wiseman Street, CALAMA, AS, 53232",
      date: "01 Aug 2020",
      price: "$35.00",
      status: "cancelled",
    },
    {
      id: "#2634",
      name: "Sandra Pugh",
      address: "1560 Thorn Street, SALE CITY, GA, 89856",
      date: "02 Aug 2020",
      price: "$74.00",
      status: "Completed",
    },
    {
      id: "#2635",
      name: "Valerie Holt",
      address: "3088 Oak Drive, DOVER, DE, 19901",
      date: "02 Aug 2020",
      price: "$22.00",
      status: "Pending",
    },
  ];

  const badgeColor = (status: string) => {
    if (status === "Pending") return "bg-red-100 text-red-600";
    if (status === "Completed") return "bg-green-100 text-green-600";
    return "bg-blue-100 text-blue-600";
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        {["All orders", "cancellled", "Pending", "Completed"].map((tab, i) => (
          <button
            key={i}
            className={`pb-2 text-sm font-medium ${
              i === 0
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-400 hover:text-blue-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="py-2">ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Date</th>
            <th>Price</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b last:border-none hover:bg-blue-50 transition"
            >
              <td className="py-3 font-medium">{order.id}</td>
              <td>{order.name}</td>
              <td>{order.address}</td>
              <td>{order.date}</td>
              <td>{order.price}</td>
              <td>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${badgeColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
