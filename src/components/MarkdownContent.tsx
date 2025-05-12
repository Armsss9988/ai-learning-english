import React from "react";
import { Typography, List, Divider, Space, Table } from "antd";

const { Title, Paragraph } = Typography;

interface MarkdownContentProps {
  content: string;
}

interface TableColumn {
  title: string;
  dataIndex: string;
  key: string;
  align: "left" | "center" | "right";
}

interface TableData {
  key: number;
  [key: string]: string | number;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  console.log(content);
  const formatText = (text: string) => {
    const formattedText = text
      .split(/(\*\*.*?\*\*|\*.*?\*|\n)/g) // Split by bold, italic, and newline
      .map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        } else if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        } else if (part === '\n') {
          return <br key={index} />;
        } else {
          return part;
        }
      });

    return formattedText;
  };

  const parseTable = (
    lines: string[]
  ): { columns: TableColumn[]; data: TableData[] } => {
    const headers = lines[0]
      .split("|")
      .filter(Boolean)
      .map((h) => h.trim());
    const alignments = lines[1]
      .split("|")
      .filter(Boolean)
      .map((a) => a.trim());

    const columns = headers.map((header, index) => {
      let align: "left" | "center" | "right" = "left";
      const alignment = alignments[index]?.trim();

      if (alignment?.startsWith(":") && alignment?.endsWith(":")) {
        align = "center";
      } else if (alignment?.endsWith(":")) {
        align = "right";
      }

      return {
        title: header,
        dataIndex: header,
        key: header,
        align,
      };
    });

    const data = lines.slice(2).map((line, rowIndex) => {
      const cells = line
        .split("|")
        .filter(Boolean)
        .map((cell) => cell.trim());
      const row: TableData = { key: rowIndex };
      headers.forEach((header, index) => {
        row[header] = cells[index];
      });
      return row;
    });

    return { columns, data };
  };

  const renderContent = () => {
    if (!content) return null;

    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let currentList: string[] = [];
    let currentNumberedList: string[] = [];
    let currentParagraph: string[] = [];
    let currentTable: string[] = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <List
            key={elements.length}
            className="mb-4"
            dataSource={currentList}
            renderItem={(item) => (
              <List.Item className="ml-4">
                <div>{formatText(item)}</div>
              </List.Item>
            )}
          />
        );
        currentList = [];
      }
    };

    const flushNumberedList = () => {
      if (currentNumberedList.length > 0) {
        elements.push(
          <List
            key={elements.length}
            className="mb-4"
            dataSource={currentNumberedList}
            renderItem={(item) => (
              <List.Item className="ml-4">
                <div>{formatText(item)}</div>
              </List.Item>
            )}
          />
        );
        currentNumberedList = [];
      }
    };

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        elements.push(
          <Paragraph key={elements.length} className="mb-4">
            <div>{formatText(currentParagraph.join(" "))}</div>
          </Paragraph>
        );
        currentParagraph = [];
      }
    };

    const flushTable = () => {
      if (currentTable.length > 0) {
        const { columns, data } = parseTable(currentTable);
        elements.push(
          <Table
            key={elements.length}
            columns={columns}
            dataSource={data}
            pagination={false}
            className="mb-4"
            size="small"
            bordered
          />
        );
        currentTable = [];
      }
    };

    lines.forEach((line) => {
      // Handle headers
      if (line.startsWith("# ")) {
        flushList();
        flushNumberedList();
        flushParagraph();
        flushTable();
        elements.push(
          <Title key={elements.length} level={1} className="mt-6 mb-4">
            {line.replace("# ", "")}
          </Title>
        );
      } else if (line.startsWith("## ")) {
        flushList();
        flushNumberedList();
        flushParagraph();
        flushTable();
        elements.push(
          <Title key={elements.length} level={2} className="mt-5 mb-3">
            {line.replace("## ", "")}
          </Title>
        );
      } else if (line.startsWith("### ")) {
        flushList();
        flushNumberedList();
        flushParagraph();
        flushTable();
        elements.push(
          <Title key={elements.length} level={3} className="mt-4 mb-2">
            {line.replace("### ", "")}
          </Title>
        );
      }
      // Handle tables
      else if (line.includes("|")) {
        flushList();
        flushNumberedList();
        flushParagraph();
        currentTable.push(line);
      }
      // Handle bullet points
      else if (line.startsWith("* ")) {
        flushParagraph();
        flushNumberedList();
        flushTable();
        currentList.push(line.replace("* ", ""));
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line)) {
        flushParagraph();
        flushList();
        flushTable();
        currentNumberedList.push(line.replace(/^\d+\.\s/, ""));
      }
      // Handle horizontal rules
      else if (line === "---") {
        flushList();
        flushNumberedList();
        flushParagraph();
        flushTable();
        elements.push(<Divider key={elements.length} className="my-6" />);
      }
      // Handle blockquotes
      else if (line.startsWith("> ")) {
        flushList();
        flushNumberedList();
        flushParagraph();
        flushTable();
        elements.push(
          <Paragraph
            key={elements.length}
            className="border-l-4 border-gray-300 pl-4 my-4 italic"
          >
            {line.replace("> ", "")}
          </Paragraph>
        );
      }
      // Handle empty lines
      else if (line.trim() === "") {
        flushList();
        flushNumberedList();
        flushParagraph();
        flushTable();
      }
      // Handle regular text
      else {
        flushList();
        flushNumberedList();
        flushTable();
        currentParagraph.push(line);
      }
    });

    // Flush any remaining content
    flushList();
    flushNumberedList();
    flushParagraph();
    flushTable();

    return elements;
  };

  return (
    <div className="prose max-w-none">
      <Space direction="vertical" size="middle" className="w-full">
        {renderContent()}
      </Space>
    </div>
  );
};

export default MarkdownContent;
