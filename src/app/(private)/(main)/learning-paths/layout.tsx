"use client";
import { Layout, Drawer, FloatButton } from "antd";
import { useState } from "react";
import SavedLearningPaths from "@/components/SavedLearningPaths";
import { useLearningPaths } from "@/hooks/useLearningPath";
import { LearningPath } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { FileTextOutlined } from "@ant-design/icons";

const { Content } = Layout;

export default function LearningPathsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const param = useParams();
  const { pathId } = param;
  const [drawerVisible, setDrawerVisible] = useState(false);
//   const [currentLearningPathId, setCurrentLearningPathId] = useState<string>();
  const { data: savedLearningPaths = [], isLoading } = useLearningPaths();
  const router = useRouter();
console.log(pathId);
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  const handleSavedLearningPathClick = (path: LearningPath) => {
    router.push(`/learning-paths/${path.id}`);
  };
  if (isLoading) return;
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "16px" }}>{children}</Content>
      <Drawer
        title="Saved Learning Paths"
        placement="left"
        onClose={toggleDrawer}
        visible={drawerVisible}
      >
        <SavedLearningPaths
          learningPaths={savedLearningPaths}
          onLearningPathClick={handleSavedLearningPathClick}
          currentLearningPathId={pathId as string}
        />
      </Drawer>
      <FloatButton
        icon={<FileTextOutlined />}
        style={{
          position: "fixed",
          top: 100,
          right: 24,
          //   insetInlineStart: 24
        }}
        className="!w-30 !h-10"
        onClick={toggleDrawer}
        description="Learning Paths"
        shape="square"
      >
        Saved Learning Paths
      </FloatButton>
    </Layout>
  );
}
