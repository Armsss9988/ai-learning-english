"use client";
import { Layout, Drawer, FloatButton, Button } from "antd";
import { useState } from "react";
import SavedLearningPaths from "@/components/SavedLearningPaths";
import { useLearningPaths } from "@/hooks/useLearningPath";
import { LearningPath } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { FileTextOutlined, RobotFilled } from "@ant-design/icons";
import LearningPathGenerator from "@/components/LearningPathGenerator";
import { UpOutlined } from "@ant-design/icons";

export default function Drawers() {
  const param = useParams();
  const { pathId } = param;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  //   const [currentLearningPathId, setCurrentLearningPathId] = useState<string>();
  const { data: savedLearningPaths = [], isLoading } = useLearningPaths();
  const router = useRouter();
  const toggleDrawer = () => {
    setDrawerVisible(!drawerVisible);
  };
  const handleSavedLearningPathClick = (path: LearningPath) => {
    setDrawerVisible(false);
    router.push(`/learning-paths/${path.id}`);
  };
  if (isLoading) return;
  return (
    <Layout>
      <FloatButton
        icon={<FileTextOutlined />}
        style={{
          position: "fixed",
          top: 100,
          right: 24,
        }}
        className="!w-35 !h-10"
        onClick={toggleDrawer}
        description="Your Learning Paths"
        shape="square"
      ></FloatButton>
      {!drawerOpen && (
        <FloatButton
          icon={<RobotFilled />}
          style={{
            position: "fixed",
            top: 100,
            left: 24,
          }}
          className="!w-40 !h-10"
          onClick={() => setDrawerOpen(true)}
          description="Generate Learning Path"
          shape="square"
        ></FloatButton>
      )}

      <Drawer
        title="Saved Learning Paths"
        placement="left"
        onClose={toggleDrawer}
        open={drawerVisible}
      >
        <SavedLearningPaths
          learningPaths={savedLearningPaths}
          onLearningPathClick={handleSavedLearningPathClick}
          currentLearningPathId={pathId as string}
        />
      </Drawer>
      <Drawer
        className="container mx-auto"
        title="Tạo lộ trình học mới"
        placement="top"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div style={{ textAlign: "center" }}>
            <Button
              type="default"
              shape="circle"
              icon={<UpOutlined />}
              size="large"
              onClick={() => setDrawerOpen(false)}
            />
          </div>
        }
        height="100vh"
        styles={{
          body: {
            maxHeight: "calc(100vh - 108px)",
            overflowY: "auto",
            paddingBottom: 48,
          },
        }}
      >
        <LearningPathGenerator />
      </Drawer>
    </Layout>
  );
}
