// import { useState } from "react";
// import { Button, Typography, Card } from "antd";
// import { useDrag, useDrop } from "react-dnd";
// import { CheckOutlined } from "@ant-design/icons";
// import { Question } from "@prisma/client";
// import { JsonObject } from "@prisma/client/runtime/library";

// const { Title } = Typography;

// interface DragDropItem {
//   index: number;
//   text: string;
// }

// const OrderingQuestion = ({ question }: { question: Question }) => {
//   const [orderedItems, setOrderedItems] = useState(question.options || []);
//   const [checked, setChecked] = useState(false);

//   // Function to check if the order is correct
//   const checkOrder = () => {
//     if (JSON.stringify(orderedItems) === JSON.stringify(question.correctAnswer)) {
//       setChecked(true);
//     } else {
//       setChecked(false);
//     }
//   };

//   // Drag and Drop hook
//   const moveItem = (dragIndex: number, hoverIndex: number) => {
//     const newItems = [...orderedItems];
//     const [draggedItem] = newItems.splice(dragIndex, 1);
//     newItems.splice(hoverIndex, 0, draggedItem);
//     setOrderedItems(newItems);
//   };

//   const Item = ({ text, index }: DragDropItem) => {
//     const [, drag] = useDrag({
//       type: "ITEM",
//       item: { index },
//     });

//     const [, drop] = useDrop({
//       accept: "ITEM",
//       hover: (item: { index: number }) => {
//         if (item.index !== index) {
//           moveItem(item.index, index);
//           item.index = index;
//         }
//       },
//     });

//     return (
//       <div
//         ref={(node) => {
//           if (node) drag(drop(node));
//         }}
//         className="drag-item !py-0"
//       >
//         <Card
//           className="drag-card !py-0"
//           style={{
//             marginBottom: 1,
//             backgroundColor: "#e0f7fa", // Light blue background
//             border: "1px solid #0288d1", // Blue border
//             boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Shadow effect
//           }}
//         >
//           {text}
//         </Card>
//       </div>
//     );
//   };

//   return (
//     <div>
//       <Title level={4}>Reorder the items:</Title>
//       <div>
//         {orderedItems.map((item, index) => (
//           <Item key={index} index={index} text={item} /> // Use index as the key
//         ))}
//       </div>
//       <Button
//         type="primary"
//         icon={<CheckOutlined />}
//         onClick={checkOrder}
//         disabled={checked}
//         className={`mt-4 ${checked ? "btn-success" : "btn-primary"}`}
//         style={{
//           backgroundColor: checked ? "#4caf50" : "#1890ff", // Green if correct, blue otherwise
//           borderColor: checked ? "#4caf50" : "#1890ff",
//         }}
//       >
//         {checked ? "Correct!" : "Check Order"}
//       </Button>
//       {checked && <p>Order is correct! 🎯</p>}
//       {!checked && orderedItems && (
//         <p style={{ color: "red" }}>Order is incorrect, please try again.</p>
//       )}
//     </div>
//   );
// };

// export default OrderingQuestion;
