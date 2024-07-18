import { useEffect, useRef } from "react";
import { useVerge } from "@/hooks/use-verge";
import { Box, Button, Grid } from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { useTranslation } from "react-i18next";
import { BasePage, Notice } from "@/components/base";
import { TestViewer, TestViewerRef } from "@/components/test/test-viewer";
import { TestItem } from "@/components/test/test-item";
import { emit } from "@tauri-apps/api/event";
import { nanoid } from "nanoid";

// test icons
import apple from "@/assets/image/test/apple.svg?raw";
import github from "@/assets/image/test/github.svg?raw";
import google from "@/assets/image/test/google.svg?raw";
import youtube from "@/assets/image/test/youtube.svg?raw";
import qq from "@/assets/image/test/qq.svg?raw";
import { getProfiles, importProfile } from "@/services/cmds";
import { mutate } from "swr";

const TestPage = () => {
  const { t } = useTranslation();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const { verge, mutateVerge, patchVerge } = useVerge();

  // test list
  const testList =  [
    // {
    //   uid: nanoid(),
    //   name: "Apple",
    //   url: "https://www.apple.com",
    //   icon: apple,
    // },
    {
      uid: nanoid(),
      name: "GitHub",
      url: "https://www.github.com",
      icon: github,
    },
    {
      uid: nanoid(),
      name: "Google",
      url: "https://www.google.com",
      icon: google,
    },
    {
      uid: nanoid(),
      name: "Youtube",
      url: "https://www.youtube.com",
      icon: youtube,
    },
    {
      uid: nanoid(),
      name: "QQ群",
      url: "https://ftq.ink/download",
      icon: qq,
      link: "767075820"
    },
  ];

  const onTestListItemChange = (
    uid: string,
    patch?: Partial<IVergeTestItem>
  ) => {
    if (patch) {
      const newList = testList.map((x) => {
        if (x.uid === uid) {
          return { ...x, ...patch };
        }
        return x;
      });
      mutateVerge({ ...verge, test_list: newList }, false);
    } else {
      mutateVerge();
    }
  };

  const onDeleteTestListItem = (uid: string) => {
    const newList = testList.filter((x) => x.uid !== uid);
    patchVerge({ test_list: newList });
    mutateVerge({ ...verge, test_list: newList }, false);
  };

  const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over) {
      if (active.id !== over.id) {
        let old_index = testList.findIndex((x) => x.uid === active.id);
        let new_index = testList.findIndex((x) => x.uid === over.id);
        if (old_index < 0 || new_index < 0) {
          return;
        }
        let newList = reorder(testList, old_index, new_index);
        await mutateVerge({ ...verge, test_list: newList }, false);
        await patchVerge({ test_list: newList });
      }
    }
  };

  useEffect(() => {
    if (!verge) return;
    if (!verge?.test_list) {
      patchVerge({ test_list: testList });
    }
  }, [verge]);

  const viewerRef = useRef<TestViewerRef>(null);

  return (
    <BasePage
      full
      title={t("Test")}
      header={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => emit("verge://test-all")}
          >
            {t("Test All")}
          </Button>
          {/*<Button*/}
          {/*  variant="contained"*/}
          {/*  size="small"*/}
          {/*  onClick={() => viewerRef.current?.create()}*/}
          {/*>*/}
          {/*  {t("New")}*/}
          {/*</Button>*/}
        </Box>
      }
    >
      <Box
        sx={{
          pt: 1.25,
          mb: 0.5,
          px: "10px",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <Box sx={{ mb: 4.5 }}>
            <Grid container spacing={{ xs: 1, lg: 1 }}>
              <SortableContext
                items={testList.map((x) => {
                  return x.uid;
                })}
              >
                {testList.map((item) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={item.uid}>
                    <TestItem
                      id={item.uid}
                      itemData={item}
                    />
                  </Grid>
                ))}
              </SortableContext>
            </Grid>
          </Box>
        </DndContext>
      </Box>
      <TestViewer ref={viewerRef} onChange={onTestListItemChange} />
    </BasePage>
  );
};

export default TestPage;
