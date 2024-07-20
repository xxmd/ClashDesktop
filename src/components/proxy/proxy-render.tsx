import {
  alpha,
  Box,
  ListItemText,
  ListItemButton,
  Typography,
  styled, ListItem, IconButton
} from "@mui/material";
import {
  ExpandLessRounded,
  ExpandMoreRounded,
  InboxRounded, NetworkCheckRounded
} from "@mui/icons-material";
import { HeadState } from "./use-head-state";
import { ProxyHead } from "./proxy-head";
import { ProxyItem } from "./proxy-item";
import { ProxyItemMini } from "./proxy-item-mini";
import type { IRenderItem } from "./use-render-list";
import { useVerge } from "@/hooks/use-verge";
import { useThemeMode } from "@/services/states";
import { useEffect, useMemo, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/tauri";
import { downloadIconCache } from "@/services/cmds";
import CommentIcon from '@mui/icons-material/Comment';
import { useTranslation } from "react-i18next";

interface RenderProps {
  item: IRenderItem;
  indent: boolean;
  onLocation: (group: IProxyGroupItem) => void;
  onCheckAll: (groupName: string) => void;
  onHeadState: (groupName: string, patch: Partial<HeadState>) => void;
  onChangeProxy: (group: IProxyGroupItem, proxy: IProxyItem) => void;
}

export const ProxyRender = (props: RenderProps) => {
  const { indent, item, onLocation, onCheckAll, onHeadState, onChangeProxy } =
    props;
  const { type, group, headState, proxy, proxyCol } = item;
  const { verge } = useVerge();
  const enable_group_icon = verge?.enable_group_icon ?? true;
  const mode = useThemeMode();
  const isDark = mode === "light" ? false : true;
  const itembackgroundcolor = isDark ? "#282A36" : "#ffffff";
  const [iconCachePath, setIconCachePath] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    initIconCachePath();
  }, [group]);

  useEffect(() => {
    console.log("onCheckAll: " + group.name)
    onCheckAll(group.name);
  }, [group.name]);

  async function initIconCachePath() {
    if (group.icon && group.icon.trim().startsWith("http")) {
      const fileName =
        group.name.replaceAll(" ", "") + "-" + getFileName(group.icon);
      const iconPath = await downloadIconCache(group.icon, fileName);
      setIconCachePath(convertFileSrc(iconPath));
    }
  }

  function getFileName(url: string) {
    return url.substring(url.lastIndexOf("/") + 1);
  }

  if (type === 0 && !group.hidden) {
    return (

      <ListItem
        key={group.name}
        secondaryAction={
          <IconButton

            onClick={() => onCheckAll(group.name)}
                      title={t("Delay check")}>
            <NetworkCheckRounded />
          </IconButton>
        }
        disablePadding
      >

        <ListItemButton
          dense
          style={{
            background: itembackgroundcolor,
            height: "100%",
            margin: "8px 16px",
            borderRadius: "8px",
          }}
          onClick={() => onCheckAll(group.name)}
        >
          <ListItemText
            primary={<StyledPrimary>{group.name}</StyledPrimary>}
          />
          {/*{headState?.open ? <ExpandLessRounded /> : <ExpandMoreRounded />}*/}
        </ListItemButton>
      </ListItem>
    );
  }

  // if (type === 1 && !group.hidden) {
  //   return (
  //     <ProxyHead
  //       sx={{ pl: 2, pr: 3, mt: indent ? 1 : 0.5, mb: 1 }}
  //       url={group.testUrl}
  //       groupName={group.name}
  //       headState={headState!}
  //       onLocation={() => onLocation(group)}
  //       onCheckDelay={() => onCheckAll(group.name)}
  //       onHeadState={(p) => onHeadState(group.name, p)}
  //     />
  //   );
  // }

  if (type === 2 && !group.hidden) {
    return (
      <ProxyItem
        group={group}
        proxy={proxy!}
        selected={group.now === proxy?.name}
        showType={headState?.showType}
        sx={{ py: 0, pl: 2 }}
        onClick={() => onChangeProxy(group, proxy!)}
      />
    );
  }

  if (type === 3 && !group.hidden) {
    return (
      <Box
        sx={{
          py: 2,
          pl: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InboxRounded sx={{ fontSize: "2.5em", color: "inherit" }} />
        <Typography sx={{ color: "inherit" }}>No Proxies</Typography>
      </Box>
    );
  }

  if (type === 4 && !group.hidden) {
    const proxyColItemsMemo = useMemo(() => {
      return proxyCol?.map((proxy) => (
        <ProxyItemMini
          key={item.key + proxy.name}
          group={group}
          proxy={proxy!}
          selected={group.now === proxy.name}
          showType={headState?.showType}
          onClick={() => onChangeProxy(group, proxy!)}
        />
      ));
    }, [proxyCol, group, headState]);
    return (
      <Box
        sx={{
          height: 56,
          display: "grid",
          gap: 1,
          pl: 2,
          pr: 2,
          pb: 1,
          gridTemplateColumns: `repeat(${item.col! || 2}, 1fr)`,
        }}
      >
        {proxyColItemsMemo}
      </Box>
    );
  }

  return null;
};

const StyledPrimary = styled("span")`
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const StyledSubtitle = styled("span")`
  font-size: 13px;
  overflow: hidden;
  color: text.secondary;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ListItemTextChild = styled("span")`
  display: block;
`;

const StyledTypeBox = styled(ListItemTextChild)(({ theme }) => ({
  display: "inline-block",
  border: "1px solid #ccc",
  borderColor: alpha(theme.palette.primary.main, 0.5),
  color: alpha(theme.palette.primary.main, 0.8),
  borderRadius: 4,
  fontSize: 10,
  padding: "0 4px",
  lineHeight: 1.5,
  marginRight: "8px",
}));
