import { Table } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
const TextFormater = (theory: string) => {
  const lines = theory.split(/\n/);
  const formattedContent: React.ReactNode[] = [];

  let insideCodeBlock = false;
  let codeBlockLanguage = "";
  let codeLines: string[] = [];

  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let insideTable = false;

  let listItems: React.ReactNode[] = [];
  let isOrderedList = false;

  let insideCardSection = false;
  let cardSectionContent: React.ReactNode[] = [];

  const sectionTitleRegex =
    /^\*\*(Definition|Usage|Formulas\/Rules|Examples|Common Mistakes|Tips|Real-world Applications)\:\*\*/;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (sectionTitleRegex.test(trimmedLine)) {
      flushList();
      flushCardSection();
      insideCardSection = true;
      const title = trimmedLine.match(sectionTitleRegex)?.[1] ?? "";
      cardSectionContent.push(
        <h2
          key={`section-${index}`}
          className="text-blue-900 font-bold text-2xl my-2"
        >
          {title}
        </h2>
      );

      const restOfLine = trimmedLine.replace(sectionTitleRegex, "").trim();
      if (restOfLine) {
        pushToCurrentSection(
          <p key={`p-${index}`} className="text-blue-900 my-2">
            {renderInlineFormatting(restOfLine)}
          </p>
        );
      }
      return;
    }

    if (trimmedLine.startsWith("```")) {
      if (!insideCodeBlock) {
        insideCodeBlock = true;
        codeBlockLanguage = trimmedLine.slice(3).trim();
        codeLines = [];
      } else {
        insideCodeBlock = false;
        const codeBlock = (
          <div className="my-4" key={`codeblock-${index}`}>
            <SyntaxHighlighter
              language={codeBlockLanguage || "javascript"}
              style={vscDarkPlus}
              customStyle={{
                borderRadius: "0.5rem",
                padding: "1rem",
                backgroundColor: "#1e293b",
                fontSize: "0.875rem",
              }}
            >
              {codeLines.join("\n")}
            </SyntaxHighlighter>
          </div>
        );
        pushToCurrentSection(codeBlock);
      }
      return;
    }

    if (insideCodeBlock) {
      codeLines.push(line);
      return;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmedLine)) {
      pushToCurrentSection(
        <hr className="my-6 border-blue-900" key={`divider-${index}`} />
      );
      return;
    }

    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      insideTable = true;
      const columns = trimmedLine
        .split("|")
        .slice(1, -1)
        .map((col) => col.trim());

      if (tableHeader.length === 0) {
        tableHeader = columns;
      } else {
        tableRows.push(columns);
      }
      return;
    } else if (insideTable && trimmedLine === "") {
      const table = (
        <div className="my-4 overflow-x-auto" key={`table-${index}`}>
          <Table
            dataSource={tableRows.map((row, i) => {
              const obj: { key: string; [key: string]: string } = {
                key: i.toString(),
              };
              tableHeader.forEach((header, idx) => {
                obj[header] = row[idx];
              });
              return obj;
            })}
            columns={tableHeader.map((header) => ({
              title: <span className="text-blue-900">{header}</span>,
              dataIndex: header,
              key: header,
            }))}
            pagination={false}
            bordered
            size="small"
            className="bg-white rounded-lg"
          />
        </div>
      );
      pushToCurrentSection(table);

      tableHeader = [];
      tableRows = [];
      insideTable = false;
      return;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      pushToCurrentSection(
        <h1
          key={`heading-${index}`}
          className={`text-blue-900 font-bold my-4 ${
            level === 1 ? "text-3xl" : level === 2 ? "text-2xl" : "text-xl"
          }`}
        >
          {renderInlineFormatting(text)}
        </h1>
      );
      return;
    }

    if (trimmedLine.startsWith(">")) {
      flushList();
      pushToCurrentSection(
        <blockquote
          key={`blockquote-${index}`}
          className="border-l-4 border-blue-700 bg-blue-50 p-4 italic text-blue-900 my-4"
        >
          {renderInlineFormatting(trimmedLine.slice(1).trim())}
        </blockquote>
      );
      return;
    }

    if (/^(\*|-|\+)\s+/.test(trimmedLine)) {
      const content = renderInlineFormatting(
        trimmedLine.replace(/^(\*|-|\+)\s+/, "")
      );
      if (!isOrderedList && listItems.length > 0) flushList();
      isOrderedList = false;
      listItems.push(content);
      return;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      const content = renderInlineFormatting(
        trimmedLine.replace(/^\d+\.\s+/, "")
      );
      if (isOrderedList === false && listItems.length > 0) flushList();
      isOrderedList = true;
      listItems.push(content);
      return;
    }

    if (trimmedLine !== "") {
      flushList();
      pushToCurrentSection(
        <p key={`p-${index}`} className="text-blue-900 my-2">
          {renderInlineFormatting(trimmedLine)}
        </p>
      );
    }
  });

  flushList();
  flushCardSection();

  function flushList() {
    if (listItems.length > 0) {
      pushToCurrentSection(
        <div
          className="grid gap-4 my-4"
          key={`list-${formattedContent.length}-${Date.now()}-${Math.random()}`}
        >
          {listItems.map((item, idx) => (
            <div
              key={`card-item-${idx}-${Date.now()}-${Math.random()}`}
              className="p-4 border border-blue-300 rounded-xl bg-white shadow-2xl hover:shadow-md hover:bg-gray-100 transition-shadow text-blue-900"
            >
              {isOrderedList ? (
                <div className="font-bold mb-1">{idx + 1}.</div>
              ) : null}
              <div>{item}</div>
            </div>
          ))}
        </div>
      );
      listItems = [];
    }
  }

  function flushCardSection() {
    if (insideCardSection && cardSectionContent.length > 0) {
      formattedContent.push(
        <motion.div
          key={`card-section-${formattedContent.length}`}
          initial={{ opacity: 0, y: 200 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="bg-gray-50 hover:bg-blue-50 p-6 rounded-2xl border-2 border-blue-900 shadow-sm my-6 hover:scale-105 hover:shadow-xl transition-transform text-blue-900"
        >
          {cardSectionContent}
        </motion.div>
      );
      cardSectionContent = [];
      insideCardSection = false;
    }
  }

  function pushToCurrentSection(node: React.ReactNode) {
    if (insideCardSection) {
      cardSectionContent.push(node);
    } else {
      formattedContent.push(node);
    }
  }

  return formattedContent;
};

const renderInlineFormatting = (text: string): React.ReactNode => {
  const regex =
    /(\*\*(.*?)\*\*|\*(.*?)\*|__(.*?)__|_(.*?)_|~~(.*?)~~|`(.*?)`|\[(.*?)\]\((.*?)\))/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}-${Math.random()}`}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }

    if (match[2]) {
      parts.push(
        <strong
          key={`bold-${lastIndex}-${Math.random()}`}
          className="text-blue-900"
        >
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em
          key={`italic-${lastIndex}-${Math.random()}`}
          className="text-blue-700"
        >
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      parts.push(
        <strong
          key={`bold-${lastIndex}-${Math.random()}`}
          className="text-blue-900"
        >
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      parts.push(
        <em
          key={`italic-${lastIndex}-${Math.random()}`}
          className="text-blue-700"
        >
          {match[5]}
        </em>
      );
    } else if (match[6]) {
      parts.push(
        <del
          key={`strikethrough-${lastIndex}-${Math.random()}`}
          className="text-gray-500"
        >
          {match[6]}
        </del>
      );
    } else if (match[7]) {
      parts.push(
        <code
          key={`code-${lastIndex}-${Math.random()}`}
          className="bg-blue-100 text-blue-900 px-1 rounded"
        >
          {match[7]}
        </code>
      );
    } else if (match[8] && match[9]) {
      parts.push(
        <a
          key={`link-${lastIndex}-${Math.random()}`}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {match[8]}
        </a>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}-${Math.random()}`}>
        {text.slice(lastIndex)}
      </span>
    );
  }

  return parts;
};

export default TextFormater;
