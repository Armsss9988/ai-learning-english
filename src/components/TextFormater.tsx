import { Table } from "antd";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import React from "react";

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

  // Collect short paragraphs for horizontal layout
  let shortParagraphs: React.ReactNode[] = [];

  // Track if current section is Definition
  let isCurrentSectionDefinition = false;

  // Collect card sections to group them in rows
  let collectedCardSections: React.ReactNode[] = [];

  const sectionTitleRegex =
    /^\*\*(Definition|Usage|Formulas\/Rules|Examples|Common Mistakes|Tips|Real-world Applications)\:\*\*/;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    if (sectionTitleRegex.test(trimmedLine)) {
      flushShortParagraphs();
      flushList();
      flushCardSection();
      insideCardSection = true;
      const title = trimmedLine.match(sectionTitleRegex)?.[1] ?? "";

      // Track if this is Definition section
      isCurrentSectionDefinition = title === "Definition";

      cardSectionContent.push(
        <div key={`section-${index}`} className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
          <h2 className="text-stone-800 font-bold text-xl m-0 bg-gradient-to-r from-emerald-700 to-amber-700 bg-clip-text">
            {title}
          </h2>
        </div>
      );

      const restOfLine = trimmedLine.replace(sectionTitleRegex, "").trim();
      if (restOfLine) {
        pushToCurrentSection(
          <p key={`p-${index}`} className="text-stone-700 my-2 leading-relaxed">
            {renderInlineFormatting(restOfLine)}
          </p>
        );
      }
      return;
    }

    if (trimmedLine.startsWith("```")) {
      if (!insideCodeBlock) {
        flushShortParagraphs();
        insideCodeBlock = true;
        codeBlockLanguage = trimmedLine.slice(3).trim();
        codeLines = [];
      } else {
        insideCodeBlock = false;
        const codeBlock = (
          <motion.div
            className="my-4"
            key={`codeblock-${index}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-0.5 rounded-lg">
              <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-stone-100 to-stone-50 px-3 py-1.5 text-xs font-medium text-stone-600 border-b border-stone-200">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    {codeBlockLanguage || "code"}
                  </span>
                </div>
                <SyntaxHighlighter
                  language={codeBlockLanguage || "javascript"}
                  style={oneLight}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    backgroundColor: "#fefefe",
                    fontSize: "0.8rem",
                    lineHeight: "1.4",
                    fontFamily: "JetBrains Mono, Consolas, monospace",
                  }}
                >
                  {codeLines.join("\n")}
                </SyntaxHighlighter>
              </div>
            </div>
          </motion.div>
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
      flushShortParagraphs();
      pushToCurrentSection(
        <div className="my-6 flex justify-center" key={`divider-${index}`}>
          <div className="w-24 h-0.5 bg-gradient-to-r from-emerald-300 via-amber-300 to-emerald-300 rounded-full opacity-60"></div>
        </div>
      );
      return;
    }

    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      flushShortParagraphs();
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
        <motion.div
          className="my-4"
          key={`table-${index}`}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-emerald-50 to-amber-50 p-0.5 rounded-lg">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
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
                  title: (
                    <span className="text-stone-800 font-semibold text-sm">
                      {header}
                    </span>
                  ),
                  dataIndex: header,
                  key: header,
                  render: (text: string) => (
                    <span className="text-stone-700 text-sm">{text}</span>
                  ),
                }))}
                pagination={false}
                bordered={false}
                size="small"
                className="[&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-emerald-50 [&_.ant-table-thead>tr>th]:to-amber-50 [&_.ant-table-thead>tr>th]:border-stone-200 [&_.ant-table-tbody>tr>td]:border-stone-100 [&_.ant-table-tbody>tr:hover>td]:bg-emerald-50/50 [&_.ant-table-thead>tr>th]:py-2 [&_.ant-table-tbody>tr>td]:py-1.5"
              />
            </div>
          </div>
        </motion.div>
      );
      pushToCurrentSection(table);

      tableHeader = [];
      tableRows = [];
      insideTable = false;
      return;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushShortParagraphs();
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      const headingElement = (
        <motion.div
          key={`heading-${index}`}
          className="my-4"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              ${level === 1 ? "w-1 h-8" : level === 2 ? "w-1 h-7" : "w-1 h-6"}
              bg-gradient-to-b from-emerald-500 to-amber-500 rounded-full
            `}
            ></div>
            <h1
              className={`
              text-stone-800 font-bold m-0
              ${level === 1 ? "text-2xl" : level === 2 ? "text-xl" : "text-lg"}
              bg-gradient-to-r from-emerald-700 to-amber-700 bg-clip-text text-transparent
            `}
            >
              {renderInlineFormatting(text)}
            </h1>
          </div>
        </motion.div>
      );

      pushToCurrentSection(headingElement);
      return;
    }

    if (trimmedLine.startsWith(">")) {
      flushShortParagraphs();
      flushList();
      pushToCurrentSection(
        <motion.div
          key={`blockquote-${index}`}
          className="my-4"
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-gradient-to-r from-emerald-50 to-amber-50 p-0.5 rounded-lg">
            <blockquote className="bg-white border-l-3 border-emerald-400 p-4 italic text-stone-700 rounded-lg shadow-sm relative overflow-hidden">
              <div className="absolute top-1 left-1 text-emerald-300 text-2xl font-serif">
                &ldquo;
              </div>
              <div className="pl-4 leading-relaxed">
                {renderInlineFormatting(trimmedLine.slice(1).trim())}
              </div>
            </blockquote>
          </div>
        </motion.div>
      );
      return;
    }

    if (/^(\*|-|\+)\s+/.test(trimmedLine)) {
      flushShortParagraphs();
      const content = renderInlineFormatting(
        trimmedLine.replace(/^(\*|-|\+)\s+/, "")
      );
      if (!isOrderedList && listItems.length > 0) flushList();
      isOrderedList = false;
      listItems.push(content);
      return;
    }

    if (/^\d+\.\s+/.test(trimmedLine)) {
      flushShortParagraphs();
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

      // Check if paragraph is short (less than 80 characters)
      if (trimmedLine.length < 80) {
        shortParagraphs.push(
          <p
            key={`p-${index}`}
            className="text-stone-700 leading-relaxed text-sm"
          >
            {renderInlineFormatting(trimmedLine)}
          </p>
        );
      } else {
        flushShortParagraphs();
        pushToCurrentSection(
          <p key={`p-${index}`} className="text-stone-700 my-2 leading-relaxed">
            {renderInlineFormatting(trimmedLine)}
          </p>
        );
      }
    }
  });

  flushShortParagraphs();
  flushList();
  flushCardSection();
  flushCollectedSections();

  function flushShortParagraphs() {
    if (shortParagraphs.length > 0) {
      pushToCurrentSection(
        <div
          className={`
            grid gap-3 my-3
            ${
              isCurrentSectionDefinition
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6"
            }
          `}
          key={`short-paragraphs-${formattedContent.length}-${Date.now()}`}
        >
          {shortParagraphs.map((para, idx) => (
            <motion.div
              key={`short-para-${idx}`}
              className="bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              {para}
            </motion.div>
          ))}
        </div>
      );
      shortParagraphs = [];
    }
  }

  function flushList() {
    if (listItems.length > 0) {
      pushToCurrentSection(
        <motion.div
          key={`list-${formattedContent.length}-${Date.now()}-${Math.random()}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, staggerChildren: 0.05 }}
        >
          {listItems.map((item, idx) => (
            <motion.div
              key={`card-item-${idx}-${Date.now()}-${Math.random()}`}
              className="group relative"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
            >
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="relative bg-white border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-start gap-3">
                  {isOrderedList ? (
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full mt-1.5"></div>
                  )}
                  <div className="text-stone-700 leading-relaxed flex-1 text-sm">
                    {item}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      );
      listItems = [];
    }
  }

  function flushCardSection() {
    if (insideCardSection && cardSectionContent.length > 0) {
      const cardSection = (
        <motion.div
          key={`card-section-${collectedCardSections.length}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
          className="group relative"
        >
          <div className="absolute inset-0 rounded-xl opacity-40 group-hover:opacity-60 transition-opacity duration-200"></div>
          <div className="relative bg-white/95 backdrop-blur-sm p-5 rounded-xl border border-stone-200 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.005]">
            <div className="absolute top-0 left-0 w-full px-5 h-0.5 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-t-xl"></div>
            {cardSectionContent}
          </div>
        </motion.div>
      );

      // If it's Definition section, render immediately without grouping
      if (isCurrentSectionDefinition) {
        formattedContent.push(
          <div
            key={`definition-section-${formattedContent.length}`}
            className="my-5"
          >
            {cardSection}
          </div>
        );
      } else {
        // Collect non-Definition sections for row grouping
        collectedCardSections.push(cardSection);
      }

      cardSectionContent = [];
      insideCardSection = false;
      isCurrentSectionDefinition = false; // Reset flag
    }
  }

  function flushCollectedSections() {
    if (collectedCardSections.length > 0) {
      // Group sections into rows of 2
      for (let i = 0; i < collectedCardSections.length; i += 2) {
        const sectionsInRow = collectedCardSections.slice(i, i + 2);

        formattedContent.push(
          <div
            key={`sections-row-${i}`}
            className={`grid grid-cols-1 ${
              i >= 2 && " md:grid-cols-2"
            }  gap-4 my-5`}
          >
            {sectionsInRow}
          </div>
        );
      }
      collectedCardSections = [];
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
          className="text-stone-800 font-bold"
        >
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <em
          key={`italic-${lastIndex}-${Math.random()}`}
          className="text-emerald-700 italic"
        >
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      parts.push(
        <strong
          key={`bold-${lastIndex}-${Math.random()}`}
          className="text-stone-800 font-bold"
        >
          {match[4]}
        </strong>
      );
    } else if (match[5]) {
      parts.push(
        <em
          key={`italic-${lastIndex}-${Math.random()}`}
          className="text-emerald-700 italic"
        >
          {match[5]}
        </em>
      );
    } else if (match[6]) {
      parts.push(
        <del
          key={`strikethrough-${lastIndex}-${Math.random()}`}
          className="text-stone-400 line-through"
        >
          {match[6]}
        </del>
      );
    } else if (match[7]) {
      parts.push(
        <code
          key={`code-${lastIndex}-${Math.random()}`}
          className="bg-gradient-to-r from-emerald-50 to-amber-50 text-emerald-800 px-1.5 py-0.5 rounded font-mono text-xs border border-emerald-200"
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
          className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 transition-colors duration-200 hover:bg-emerald-50 px-0.5 rounded"
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
